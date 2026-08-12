import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'framer-motion';
import useCopyStudio from '../hooks/useCopyStudio';
import { useCopyStack } from '../hooks/useCopyStack';
import CopyStackPanel from './CopyStackPanel';
import { OfflineTransliterator } from '../lib/transliterator';
import {
  graphemes,
  showToast,
  renderTextToPng,
  downloadPng,
  copyToClipboard,
} from '../lib/script-utils';
import { consumeCopyStudioImport, saveReaderImport } from '../lib/tool-bridge';
import './CopyStudio.css';

const TAKRI_FONT = "'Noto Sans Takri', sans-serif";

const MODE_OPTIONS = [
  { id: 'api', label: 'API', desc: 'Highest accuracy via Aksharamukha' },
  { id: 'offline', label: 'Offline', desc: 'Instant, no network' },
];

const COPY_GRANULARITIES = [
  { id: 'sentence', label: 'Sentence', desc: 'Click preview to copy full text' },
  { id: 'line', label: 'Line', desc: 'Click a line to copy it' },
  { id: 'word', label: 'Word', desc: 'Click a word to copy it' },
  { id: 'character', label: 'Character', desc: 'Click a grapheme to copy it' },
];

const SCRIPT_OPTIONS = [
  { id: 'takri', label: 'Takri', desc: 'Copy output in Takri script' },
  { id: 'devanagari', label: 'Devanagari', desc: 'Copy output in Devanagari script' },
];

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

/* ── Icons ── */

function IconApi() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  );
}

function IconOffline() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="1" y1="1" x2="23" y2="23" />
      <path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55" />
      <path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.39" />
      <path d="M10.71 5.05A16 16 0 0 1 22.56 9" />
      <path d="M1.42 9a15.91 15.91 0 0 1 4.7-2.88" />
      <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
      <line x1="12" y1="20" x2="12.01" y2="20" />
    </svg>
  );
}

function IconSentence() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 7h16M4 12h10M4 17h14" />
    </svg>
  );
}

function IconLine() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 12h16" />
    </svg>
  );
}

function IconWord() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="M7 12h4M13 12h4" />
    </svg>
  );
}

function IconCharacter() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 4v16M8 8h8M8 16h8" />
    </svg>
  );
}

function IconTakri() {
  return <span className="cs-rail-script-icon">𑚔</span>;
}

function IconDevanagari() {
  return <span className="cs-rail-script-icon">द</span>;
}

function IconSize() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 3l-6 6M3 21l6-6" />
      <path d="M9 3H3v6M21 15v6h-6" />
    </svg>
  );
}

function IconExport() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  );
}

function IconChevron({ expanded }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      {expanded ? (
        <polyline points="15 18 9 12 15 6" />
      ) : (
        <polyline points="9 18 15 12 9 6" />
      )}
    </svg>
  );
}

function IconEdit() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  );
}

function IconStack() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2L2 7l10 5 10-5-10-5z" />
      <path d="M2 17l10 5 10-5" />
      <path d="M2 12l10 5 10-5" />
    </svg>
  );
}

function IconTrash() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </svg>
  );
}

const GRANULARITY_ICONS = {
  sentence: IconSentence,
  line: IconLine,
  word: IconWord,
  character: IconCharacter,
};

function ClearStackConfirmModal({ count, onConfirm, onCancel }) {
  const itemWord = count === 1 ? 'item' : 'items';

  return (
    <motion.div
      className="cs-modal-backdrop"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onCancel}
    >
      <motion.div
        className="cs-modal"
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        onClick={(e) => e.stopPropagation()}
        role="alertdialog"
        aria-labelledby="cs-clear-stack-title"
        aria-describedby="cs-clear-stack-desc"
      >
        <h3 className="cs-modal-title" id="cs-clear-stack-title">Clear copy stack?</h3>
        <p className="cs-modal-message" id="cs-clear-stack-desc">
          This removes all {count} copy history {itemWord} from this browser. This cannot be undone.
        </p>
        <div className="cs-modal-actions">
          <button type="button" className="cs-btn cs-btn--ghost" onClick={onCancel}>
            Cancel
          </button>
          <button type="button" className="cs-btn cs-btn--destructive" onClick={onConfirm}>
            Clear stack
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

function WordEditModal({ word, onSave, onCancel }) {
  const [value, setValue] = useState(word.roman);
  const engine = useMemo(() => new OfflineTransliterator(), []);

  const previewTakri = value.trim() ? engine.transliterate(value, 'takri') : '';
  const previewDev = value.trim() ? engine.transliterate(value, 'devanagari') : '';

  return (
    <motion.div
      className="cs-modal-backdrop"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onCancel}
    >
      <motion.div
        className="cs-modal"
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="cs-modal-title">Edit Word</h3>
        <label className="cs-modal-label">Roman transliteration</label>
        <input
          type="text"
          className="cs-modal-input"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          autoFocus
          spellCheck={false}
        />
        <div className="cs-modal-preview">
          <span className="cs-modal-preview-label">Preview</span>
          <span className="cs-modal-preview-takri">{previewTakri || '—'}</span>
          <span className="cs-modal-preview-dev">{previewDev || '—'}</span>
        </div>
        <div className="cs-modal-actions">
          <button type="button" className="cs-btn cs-btn--ghost" onClick={onCancel}>
            Cancel
          </button>
          <button
            type="button"
            className="cs-btn cs-btn--primary"
            onClick={() => onSave(value.trim())}
            disabled={!value.trim()}
          >
            Save
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

function GraphemeStrip({ text, script, onCopy, copiedId, idPrefix }) {
  const locale = script === 'takri' ? 'und-Takr' : 'und-Deva';
  const clusters = graphemes(text, locale);

  return (
    <div className="cs-grapheme-strip">
      {clusters.map((g, i) => {
        const gid = `${idPrefix}-g${i}`;
        return (
          <button
            key={i}
            type="button"
            className={`cs-grapheme-btn ${script} ${copiedId === gid ? 'copied' : ''}`}
            onClick={(e) => {
              e.stopPropagation();
              onCopy(g, i, gid);
            }}
            title={`Copy ${script} grapheme ${i + 1}`}
          >
            {g}
          </button>
        );
      })}
    </div>
  );
}

function InteractivePreview({
  lines,
  panelScript,
  fontSize,
  granularity,
  copyScript,
  hasContent,
  copiedId,
  onCopy,
}) {
  const scriptLabel = copyScript === 'takri' ? 'Takri' : 'Devanagari';

  const getWordText = useCallback(
    (word) => (copyScript === 'takri' ? word.takri : word.devanagari),
    [copyScript]
  );

  const getLineText = useCallback(
    (line) => line.words.map((w) => getWordText(w)).join(' '),
    [getWordText]
  );

  const fullText = useMemo(
    () => lines.map((l) => getLineText(l)).join('\n'),
    [lines, getLineText]
  );

  const handleSentenceClick = () => {
    if (!hasContent) return;
    onCopy(fullText, `Copied full ${scriptLabel} text`, 'preview-sentence');
  };

  const handleLineClick = (lineIdx, line) => {
    const text = getLineText(line);
    if (!text) return;
    onCopy(text, `Copied line ${lineIdx + 1} (${scriptLabel})`, `preview-line-${lineIdx}`);
  };

  const handleWordClick = (word, lineIdx, wordIdx) => {
    const text = getWordText(word);
    if (!text) return;
    onCopy(text, `Copied ${scriptLabel} word`, `preview-w-${lineIdx}-${wordIdx}`, {
      romanHint: word.roman,
    });
  };

  const handleGraphemeClick = (word, lineIdx, wordIdx, gIdx) => {
    const copyText = getWordText(word);
    const locale = copyScript === 'takri' ? 'und-Takr' : 'und-Deva';
    const clusters = graphemes(copyText, locale);
    const g = clusters[gIdx] ?? clusters[0];
    if (!g) return;
    onCopy(g, `Copied ${scriptLabel} grapheme`, `preview-g-${lineIdx}-${wordIdx}-${gIdx}`);
  };

  if (!hasContent) {
    return (
      <span className="cs-placeholder">
        {panelScript === 'takri' ? 'Takri' : 'Devanagari'} preview…
      </span>
    );
  }

  const isSentenceMode = granularity === 'sentence';
  const panelWords = (word) => (panelScript === 'takri' ? word.takri : word.devanagari);

  return (
    <div
      className={`cs-interactive-preview ${isSentenceMode ? 'cs-interactive-preview--sentence' : ''}`}
      onClick={isSentenceMode ? handleSentenceClick : undefined}
      role={isSentenceMode ? 'button' : undefined}
      tabIndex={isSentenceMode ? 0 : undefined}
      onKeyDown={isSentenceMode ? (e) => e.key === 'Enter' && handleSentenceClick() : undefined}
    >
      {lines.map((line, lineIdx) => (
        <div
          key={line.id}
          className={`cs-preview-line ${granularity === 'line' ? 'cs-preview-line--clickable' : ''} ${copiedId === `preview-line-${lineIdx}` ? 'copied' : ''}`}
          onClick={
            granularity === 'line'
              ? (e) => {
                  e.stopPropagation();
                  handleLineClick(lineIdx, line);
                }
              : undefined
          }
          title={granularity === 'line' ? `Click to copy line ${lineIdx + 1}` : undefined}
        >
          {line.words.map((word, wordIdx) => {
            const text = panelWords(word);
            const wordId = `preview-w-${lineIdx}-${wordIdx}`;

            if (granularity === 'character') {
              const locale = panelScript === 'takri' ? 'und-Takr' : 'und-Deva';
              const clusters = graphemes(text, locale);
              return (
                <span key={word.id} className="cs-preview-word">
                  {clusters.map((g, gIdx) => (
                    <button
                      key={gIdx}
                      type="button"
                      className={`cs-preview-grapheme ${copiedId === `preview-g-${lineIdx}-${wordIdx}-${gIdx}` ? 'copied' : ''}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleGraphemeClick(word, lineIdx, wordIdx, gIdx);
                      }}
                      title={`Click to copy ${scriptLabel} grapheme`}
                    >
                      {g}
                    </button>
                  ))}
                  {wordIdx < line.words.length - 1 ? ' ' : ''}
                </span>
              );
            }

            return (
              <button
                key={word.id}
                type="button"
                className={`cs-preview-word-btn ${copiedId === wordId ? 'copied' : ''} ${granularity === 'word' ? 'cs-preview-word-btn--active' : ''}`}
                onClick={
                  granularity === 'word'
                    ? (e) => {
                        e.stopPropagation();
                        handleWordClick(word, lineIdx, wordIdx);
                      }
                    : undefined
                }
                title={
                  granularity === 'word'
                    ? `Click to copy ${scriptLabel} word`
                    : undefined
                }
                disabled={granularity !== 'word'}
              >
                {text}
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
}

const MODE_ICONS = { api: IconApi, offline: IconOffline };
const SCRIPT_ICONS = { takri: IconTakri, devanagari: IconDevanagari };

function RailToolButton({ expanded, active, disabled, onClick, icon: Icon, label, desc, title, ariaLabel, ariaPressed }) {
  return (
    <button
      type="button"
      className={`cs-rail-btn ${expanded ? 'cs-rail-btn--expanded' : ''} ${active ? 'active' : ''}`}
      onClick={onClick}
      disabled={disabled}
      title={title ?? (desc ? `${label} — ${desc}` : label)}
      aria-label={ariaLabel ?? label}
      aria-pressed={ariaPressed}
    >
      <span className="cs-rail-btn-icon">
        <Icon />
      </span>
      {expanded && (
        <span className="cs-rail-btn-text">
          <span className="cs-rail-btn-label">{label}</span>
          {desc && <span className="cs-rail-btn-desc">{desc}</span>}
        </span>
      )}
    </button>
  );
}

function ToolsRail({
  expanded,
  onToggleExpanded,
  mode,
  setMode,
  status,
  statusDotClass,
  copyGranularity,
  setCopyGranularity,
  copyScript,
  setCopyScript,
  fontSize,
  setFontSize,
  showSizeFlyout,
  setShowSizeFlyout,
  hasContent,
  onExportPng,
  stackCount,
  onRequestClearStack,
}) {
  const sizeFlyoutRef = useRef(null);

  return (
    <aside
      className={`cs-tools-rail ${expanded ? 'cs-tools-rail--expanded' : ''}`}
      aria-label="Studio tools"
    >
      <div className="cs-rail-scroll">
        {/* Mode group */}
        <div className="cs-rail-group">
          {expanded && <span className="cs-rail-section-title">Mode</span>}
          {MODE_OPTIONS.map(({ id, label, desc }) => (
            <RailToolButton
              key={id}
              expanded={expanded}
              active={mode === id}
              onClick={() => setMode(id)}
              icon={MODE_ICONS[id]}
              label={label}
              desc={desc}
              ariaPressed={mode === id}
            />
          ))}
          <span className={`cs-rail-status-dot ${statusDotClass}`} title={status} />
        </div>

        <div className="cs-rail-divider" />

        {/* Copy tool — granularity */}
        <div className="cs-rail-group">
          {expanded ? (
            <span className="cs-rail-section-title">Copy granularity</span>
          ) : (
            <span className="cs-rail-group-label" title="Copy granularity">Copy</span>
          )}
          {COPY_GRANULARITIES.map(({ id, label, desc }) => (
            <RailToolButton
              key={id}
              expanded={expanded}
              active={copyGranularity === id}
              onClick={() => setCopyGranularity(id)}
              icon={GRANULARITY_ICONS[id]}
              label={label}
              desc={desc}
              ariaPressed={copyGranularity === id}
            />
          ))}
        </div>

        <div className="cs-rail-divider" />

        {/* Script selection */}
        <div className="cs-rail-group">
          {expanded ? (
            <span className="cs-rail-section-title">Script</span>
          ) : (
            <span className="cs-rail-group-label" title="Copy script">Script</span>
          )}
          {SCRIPT_OPTIONS.map(({ id, label, desc }) => (
            <RailToolButton
              key={id}
              expanded={expanded}
              active={copyScript === id}
              onClick={() => setCopyScript(id)}
              icon={SCRIPT_ICONS[id]}
              label={label}
              desc={desc}
              ariaPressed={copyScript === id}
            />
          ))}
        </div>

        <div className="cs-rail-divider" />

        {/* Preview size */}
        <div className="cs-rail-group cs-rail-group--size">
          {expanded ? (
            <div className="cs-rail-size-expanded">
              <div className="cs-rail-size-header">
                <span className="cs-rail-btn-icon"><IconSize /></span>
                <span className="cs-rail-btn-text">
                  <span className="cs-rail-btn-label">Preview size</span>
                  <span className="cs-rail-btn-desc">{fontSize}px</span>
                </span>
              </div>
              <input
                type="range"
                min="24"
                max="96"
                value={fontSize}
                onChange={(e) => setFontSize(Number(e.target.value))}
                className="cs-slider cs-slider--rail"
                aria-label="Preview font size"
              />
            </div>
          ) : (
            <>
              <button
                type="button"
                className={`cs-rail-btn ${showSizeFlyout ? 'active' : ''}`}
                onClick={() => setShowSizeFlyout((v) => !v)}
                title={`Preview size: ${fontSize}px`}
                aria-label="Preview size"
                aria-expanded={showSizeFlyout}
              >
                <span className="cs-rail-btn-icon"><IconSize /></span>
              </button>
              <AnimatePresence>
                {showSizeFlyout && (
                  <motion.div
                    ref={sizeFlyoutRef}
                    className="cs-size-flyout"
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -8 }}
                  >
                    <span className="cs-size-flyout-label">Preview</span>
                    <input
                      type="range"
                      min="24"
                      max="96"
                      value={fontSize}
                      onChange={(e) => setFontSize(Number(e.target.value))}
                      className="cs-slider cs-slider--vertical"
                      aria-label="Preview font size"
                    />
                    <span className="cs-size-flyout-value">{fontSize}px</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </>
          )}
        </div>

        <div className="cs-rail-divider" />

        {/* Export */}
        <div className="cs-rail-group">
          <RailToolButton
            expanded={expanded}
            disabled={!hasContent}
            onClick={onExportPng}
            icon={IconExport}
            label="Export"
            desc="Download full Takri as PNG"
            ariaLabel="Export PNG"
          />
        </div>

        <div className="cs-rail-divider" />

        {/* Data */}
        {expanded && (
          <div className="cs-rail-group">
            <span className="cs-rail-section-title">Data</span>
            <button
              type="button"
              className="cs-rail-btn cs-rail-btn--expanded cs-rail-btn--destructive"
              onClick={onRequestClearStack}
              disabled={stackCount === 0}
              title={`Clear stack (${stackCount} items)`}
              aria-label={`Clear stack (${stackCount} items)`}
            >
              <span className="cs-rail-btn-icon">
                <IconTrash />
              </span>
              <span className="cs-rail-btn-text">
                <span className="cs-rail-btn-label">Clear stack ({stackCount} items)</span>
              </span>
            </button>
          </div>
        )}
      </div>

      <div className="cs-rail-bottom">
        {!expanded && (
          <button
            type="button"
            className="cs-rail-clear-icon"
            onClick={onRequestClearStack}
            disabled={stackCount === 0}
            title="Clear copy stack"
            aria-label={`Clear copy stack (${stackCount} items)`}
          >
            <IconTrash />
          </button>
        )}
        <button
          type="button"
          className="cs-rail-toggle"
          onClick={onToggleExpanded}
          aria-label={expanded ? 'Collapse tools panel' : 'Expand tools panel'}
          aria-expanded={expanded}
          title={expanded ? 'Collapse panel' : 'Expand panel'}
        >
          <IconChevron expanded={expanded} />
        </button>
      </div>
    </aside>
  );
}

export default function CopyStudio() {
  const navigate = useNavigate();
  const {
    romanText,
    setRomanText,
    lines,
    fullTakri,
    mode,
    setMode,
    status,
    replaceWord,
    activeLineIndex,
    setActiveLineIndex,
    wordCount,
    charCount,
    lineCount,
  } = useCopyStudio();

  const [fontSize, setFontSize] = useState(72);
  const [copyGranularity, setCopyGranularity] = useState('word');
  const [copyScript, setCopyScript] = useState('takri');
  const [railExpanded, setRailExpanded] = useState(false);
  const [showSizeFlyout, setShowSizeFlyout] = useState(false);
  const [expandedWordId, setExpandedWordId] = useState(null);
  const [editingWord, setEditingWord] = useState(null);
  const [copiedId, setCopiedId] = useState(null);
  const [lastCopied, setLastCopied] = useState('');
  const [stackOpen, setStackOpen] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const { stack, pushCopy, clearStack, count: stackCount } = useCopyStack();

  useEffect(() => {
    const imported = consumeCopyStudioImport();
    if (!imported) return;
    if (imported.roman) setRomanText(imported.roman);
    showToast(
      imported.title
        ? `Imported: ${imported.title}`
        : 'Text imported from Takri Reader',
    );
  }, [setRomanText]);

  const handleReadInReader = useCallback(() => {
    if (!fullTakri.trim()) {
      showToast('Generate Takri text first');
      return;
    }
    saveReaderImport({
      takri: fullTakri,
      title: 'From Copy Studio',
    });
    navigate('/reader');
  }, [fullTakri, navigate]);

  const hasContent = romanText.trim().length > 0;
  const scriptLabel = copyScript === 'takri' ? 'Takri' : 'Devanagari';

  const getWordText = useCallback(
    (word) => (copyScript === 'takri' ? word.takri : word.devanagari),
    [copyScript]
  );

  const getLineText = useCallback(
    (line) => line.words.map((w) => getWordText(w)).join(' '),
    [getWordText]
  );

  const fullCopyText = useMemo(
    () => lines.map((l) => getLineText(l)).join('\n'),
    [lines, getLineText]
  );

  const graphemeCount = useMemo(() => {
    let count = 0;
    const locale = copyScript === 'takri' ? 'und-Takr' : 'und-Deva';
    for (const line of lines) {
      for (const word of line.words) {
        const text = copyScript === 'takri' ? word.takri : word.devanagari;
        count += graphemes(text, locale).length;
      }
    }
    return count;
  }, [lines, copyScript]);

  const flashCopied = useCallback((id) => {
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 600);
  }, []);

  const performCopy = useCallback(async (text, label, id, options = {}) => {
    if (!text) return;
    const ok = await copyToClipboard(text);
    if (ok) {
      showToast(label);
      setLastCopied(text);
      if (id) flashCopied(id);
      pushCopy({
        text,
        script: options.script ?? copyScript,
        granularity: options.granularity ?? copyGranularity,
        label,
        ...(options.romanHint ? { romanHint: options.romanHint } : {}),
      });
    }
  }, [flashCopied, pushCopy, copyScript, copyGranularity]);

  const handleDownloadPng = useCallback(() => {
    if (!fullTakri) return;
    const { dataUrl } = renderTextToPng(fullTakri, {
      fontFamily: TAKRI_FONT,
      fontSize,
      color: '#f0a500',
    });
    downloadPng(dataUrl, 'takri-copy-studio.png');
    showToast('Downloaded takri-copy-studio.png');
  }, [fullTakri, fontSize]);

  const handleRequestClearStack = useCallback(() => {
    if (stackCount === 0) return;
    setShowClearConfirm(true);
  }, [stackCount]);

  const handleConfirmClearStack = useCallback(() => {
    clearStack();
    setShowClearConfirm(false);
    showToast('Copy stack cleared');
  }, [clearStack]);

  const handleWordChipClick = useCallback((word, line, lineIdx) => {
    if (copyGranularity === 'sentence') {
      performCopy(fullCopyText, `Copied full ${scriptLabel} text`, word.id);
      return;
    }
    if (copyGranularity === 'line') {
      const text = getLineText(line);
      performCopy(text, `Copied line ${lineIdx + 1} (${scriptLabel})`, `line-${lineIdx}`);
      return;
    }
    if (copyGranularity === 'word') {
      const text = getWordText(word);
      performCopy(text, `Copied ${scriptLabel}: ${text}`, word.id, { romanHint: word.roman });
      return;
    }
    // character mode
    if (expandedWordId !== word.id) {
      setExpandedWordId(word.id);
      return;
    }
    const text = getWordText(word);
    const locale = copyScript === 'takri' ? 'und-Takr' : 'und-Deva';
    const clusters = graphemes(text, locale);
    if (clusters[0]) {
      performCopy(clusters[0], `Copied ${scriptLabel} grapheme: ${clusters[0]}`, `${word.id}-g0`);
    }
  }, [
    copyGranularity,
    copyScript,
    scriptLabel,
    fullCopyText,
    getLineText,
    getWordText,
    expandedWordId,
    performCopy,
  ]);

  const handleLineRowClick = useCallback((line, lineIdx) => {
    setActiveLineIndex(lineIdx);
    if (copyGranularity === 'line') {
      const text = getLineText(line);
      performCopy(text, `Copied line ${lineIdx + 1} (${scriptLabel})`, `ws-line-${lineIdx}`);
    } else if (copyGranularity === 'sentence') {
      performCopy(fullCopyText, `Copied full ${scriptLabel} text`, 'ws-sentence');
    }
  }, [copyGranularity, getLineText, fullCopyText, scriptLabel, performCopy, setActiveLineIndex]);

  const statusDotClass = status === 'offline' ? 'offline' : status === 'error' ? 'error' : '';

  const handleEditSave = (newRoman) => {
    if (editingWord) {
      replaceWord(editingWord.lineId, editingWord.word.id, newRoman);
      showToast(`Updated word: ${newRoman}`);
      setEditingWord(null);
    }
  };

  const granularityLabel = COPY_GRANULARITIES.find((g) => g.id === copyGranularity)?.label ?? copyGranularity;
  const truncatedLast = lastCopied.length > 28 ? `${lastCopied.slice(0, 28)}…` : lastCopied;

  return (
    <motion.div
      className={`copy-studio-page ${railExpanded ? 'rail-expanded' : ''}`}
      initial="hidden"
      animate="visible"
      variants={fadeIn}
    >
      <header className="cs-header">
        <div className="cs-header-brand">
          <span className="cs-header-mark">𑚔𑚭𑚊𑚤𑚯</span>
          <div>
            <h1>Copy Studio</h1>
            <p className="cs-header-tag">Pahari script workshop · click to copy</p>
          </div>
        </div>
        <div className="cs-header-hint">
          {fullTakri.trim() && (
            <button type="button" className="cs-header-link-btn" onClick={handleReadInReader}>
              Read in Reader
            </button>
          )}
          <span className="cs-header-tool-badge">{granularityLabel}</span>
          <span className="cs-header-tool-badge">{scriptLabel}</span>
        </div>
      </header>

      <ToolsRail
        expanded={railExpanded}
        onToggleExpanded={() => setRailExpanded((v) => !v)}
        mode={mode}
        setMode={setMode}
        status={status}
        statusDotClass={statusDotClass}
        copyGranularity={copyGranularity}
        setCopyGranularity={setCopyGranularity}
        copyScript={copyScript}
        setCopyScript={setCopyScript}
        fontSize={fontSize}
        setFontSize={setFontSize}
        showSizeFlyout={showSizeFlyout}
        setShowSizeFlyout={setShowSizeFlyout}
        hasContent={hasContent}
        onExportPng={handleDownloadPng}
        stackCount={stackCount}
        onRequestClearStack={handleRequestClearStack}
      />

      <div className="cs-body">
        <div className="cs-content">
          <section className="cs-section">
            <label className="cs-section-label" htmlFor="cs-compose">
              Compose (Roman — Aksharamukha Readable)
            </label>
            <textarea
              id="cs-compose"
              className="cs-compose"
              placeholder="Type your text here…&#10;e.g. namaste bhaarata&#10;dodri bhaasha"
              value={romanText}
              onChange={(e) => setRomanText(e.target.value)}
              spellCheck={false}
            />
            {!hasContent && (
              <p className="cs-empty-hint">
                Type Roman text above. Pick a copy tool in the rail, then click words in the preview.
              </p>
            )}
          </section>

          <section className="cs-section">
            <h2 className="cs-section-label">
              Interactive Preview
              <span className="cs-section-sublabel">
                {copyGranularity === 'sentence' && '— click anywhere to copy'}
                {copyGranularity === 'line' && '— click a line to copy'}
                {copyGranularity === 'word' && '— click a word to copy'}
                {copyGranularity === 'character' && '— click a grapheme to copy'}
              </span>
            </h2>
            <div className="cs-preview-grid">
              <div className="cs-preview-panel devanagari">
                <div className="cs-preview-header">
                  <span className="cs-preview-dot" />
                  Devanagari
                </div>
                <div
                  className="cs-preview-body devanagari-body"
                  style={{ fontSize: `${fontSize}px` }}
                >
                  <InteractivePreview
                    lines={lines}
                    panelScript="devanagari"
                    fontSize={fontSize}
                    granularity={copyGranularity}
                    copyScript={copyScript}
                    hasContent={hasContent}
                    copiedId={copiedId}
                    onCopy={performCopy}
                  />
                </div>
              </div>
              <div className="cs-preview-panel takri">
                <div className="cs-preview-header">
                  <span className="cs-preview-dot" />
                  Takri
                </div>
                <div
                  className="cs-preview-body takri-body"
                  style={{ fontSize: `${fontSize}px` }}
                >
                  <InteractivePreview
                    lines={lines}
                    panelScript="takri"
                    fontSize={fontSize}
                    granularity={copyGranularity}
                    copyScript={copyScript}
                    hasContent={hasContent}
                    copiedId={copiedId}
                    onCopy={performCopy}
                  />
                </div>
              </div>
            </div>
          </section>

          <section className="cs-section">
            <h2 className="cs-section-label">Word Workspace</h2>
            {!hasContent ? (
              <div className="cs-workspace-empty">
                <p>Word chips appear here — single-click to copy, double-click to edit</p>
              </div>
            ) : (
              <div className="cs-word-lines">
                {lines.map((line, lineIdx) => (
                  <div
                    key={line.id}
                    className={`cs-word-line ${activeLineIndex === lineIdx ? 'active' : ''} ${copyGranularity === 'line' ? 'cs-word-line--copyable' : ''} ${copiedId === `ws-line-${lineIdx}` ? 'copied' : ''}`}
                    onClick={() => handleLineRowClick(line, lineIdx)}
                  >
                    <div className="cs-line-header">
                      <span className="cs-line-num">Line {lineIdx + 1}</span>
                    </div>

                    {line.words.length === 0 ? (
                      <div className="cs-line-empty" />
                    ) : (
                      <div className="cs-word-chips">
                        {line.words.map((word) => {
                          const isExpanded = expandedWordId === word.id;
                          const isCopied = copiedId === word.id;

                          return (
                            <div key={word.id} className="cs-word-chip-wrap">
                              <div
                                className={`cs-word-chip ${isExpanded ? 'expanded' : ''} ${isCopied ? 'copied' : ''} ${copyGranularity === 'character' ? 'cs-word-chip--char-mode' : ''}`}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleWordChipClick(word, line, lineIdx);
                                }}
                                onDoubleClick={(e) => {
                                  e.stopPropagation();
                                  setEditingWord({ lineId: line.id, word });
                                }}
                                role="button"
                                tabIndex={0}
                                title={
                                  copyGranularity === 'character' && !isExpanded
                                    ? 'Click to expand graphemes'
                                    : `Click to copy (${granularityLabel})`
                                }
                              >
                                <span className="cs-chip-takri">{word.takri || word.roman}</span>
                                <span className="cs-chip-roman">{word.roman}</span>
                                <button
                                  type="button"
                                  className="cs-chip-edit"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setEditingWord({ lineId: line.id, word });
                                  }}
                                  title="Edit word"
                                  aria-label="Edit word"
                                >
                                  <IconEdit />
                                </button>
                              </div>

                              <AnimatePresence>
                                {isExpanded && copyGranularity === 'character' && (
                                  <motion.div
                                    className="cs-expanded-word"
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                  >
                                    <GraphemeStrip
                                      text={word.takri}
                                      script="takri"
                                      copiedId={copiedId}
                                      idPrefix={`${word.id}-t`}
                                      onCopy={(g, i, gid) =>
                                        performCopy(g, `Copied Takri grapheme: ${g}`, gid, {
                                          script: 'takri',
                                          granularity: 'character',
                                        })
                                      }
                                    />
                                    <GraphemeStrip
                                      text={word.devanagari}
                                      script="devanagari"
                                      copiedId={copiedId}
                                      idPrefix={`${word.id}-d`}
                                      onCopy={(g, i, gid) =>
                                        performCopy(g, `Copied Devanagari grapheme: ${g}`, gid, {
                                          script: 'devanagari',
                                          granularity: 'character',
                                        })
                                      }
                                    />
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>

      <CopyStackPanel
        isOpen={stackOpen}
        onClose={() => setStackOpen(false)}
        stack={stack}
        onRequestClear={handleRequestClearStack}
        previewFontSize={Math.min(fontSize, 32)}
      />

      <footer className="cs-footer">
        <div className="cs-footer-stats">
          <span className="cs-stat"><strong>{wordCount}</strong> words</span>
          <span className="cs-stat"><strong>{charCount}</strong> chars</span>
          <span className="cs-stat"><strong>{lineCount}</strong> lines</span>
          <span className="cs-stat"><strong>{graphemeCount}</strong> graphemes</span>
          <span className="cs-stat cs-stat--tool">
            Tool: <strong>{granularityLabel}</strong>
          </span>
          <span className="cs-stat cs-stat--tool">
            Script: <strong>{scriptLabel}</strong>
          </span>
          {lastCopied && (
            <span className="cs-stat cs-stat--last" title={lastCopied}>
              Last: <em>{truncatedLast}</em>
            </span>
          )}
          <button
            type="button"
            className={`cs-footer-stack-btn ${stackOpen ? 'open' : ''}`}
            onClick={() => setStackOpen((v) => !v)}
            aria-expanded={stackOpen}
            aria-label={`Copy stack, ${stackCount} items`}
          >
            <IconStack />
            <span className="cs-footer-stack-btn-label">Stack</span>
            <span className="cs-footer-stack-btn-badge">{stackCount}</span>
          </button>
        </div>
      </footer>

      <AnimatePresence>
        {editingWord && (
          <WordEditModal
            word={editingWord.word}
            onSave={handleEditSave}
            onCancel={() => setEditingWord(null)}
          />
        )}
        {showClearConfirm && (
          <ClearStackConfirmModal
            count={stackCount}
            onConfirm={handleConfirmClearStack}
            onCancel={() => setShowClearConfirm(false)}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}
