import { useState, useEffect, useCallback, useMemo } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router';
import { motion, AnimatePresence } from 'framer-motion';
import useTakriReader from '../hooks/useTakriReader';
import SampleLibrary from '../components/SampleLibrary';
import GlossaryPanel from '../components/GlossaryPanel';
import ReaderCopyToolbar, { useReaderCopy } from '../components/ReaderCopyToolbar';
import WordDetailPanel from '../components/WordDetailPanel';
import ReaderConnectionsBar from '../components/ReaderConnectionsBar';
import {
  getSampleById,
  getFeaturedSamples,
  getCategoryLabel,
} from '../data/sample-texts';
import {
  consumeReaderImport,
  getPracticeGroupIdsForText,
  saveCopyStudioImport,
} from '../lib/tool-bridge';
import { copyToClipboard, showToast } from '../lib/script-utils';
import './TakriReader.css';

const READING_MODES = [
  { id: 'study', label: 'Study', desc: 'Tap words to reveal Roman and Devanagari' },
  { id: 'guided', label: 'Guided', desc: 'Translation and readings shown below' },
  { id: 'fluent', label: 'Fluent', desc: 'Takri only — tap words for help' },
];

const MODE_OPTIONS = [
  { id: 'api', label: 'API', desc: 'Highest accuracy via Aksharamukha' },
  { id: 'offline', label: 'Offline', desc: 'Instant, no network' },
];

const VALID_READING_MODES = new Set(['study', 'guided', 'fluent']);

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

function buildReaderUrl({ textId, readingMode }) {
  const params = new URLSearchParams();
  if (textId) params.set('text', textId);
  if (readingMode && readingMode !== 'guided') params.set('mode', readingMode);
  const query = params.toString();
  return `${window.location.origin}${window.location.pathname}#/reader${query ? `?${query}` : ''}`;
}

function FeaturedTexts({ samples, onSelect }) {
  return (
    <div className="tr-featured">
      <h3>Start here</h3>
      <div className="tr-featured-grid">
        {samples.map((sample) => (
          <button
            key={sample.id}
            type="button"
            className="tr-featured-card"
            onClick={() => onSelect(sample)}
          >
            <span className="tr-featured-takri">{sample.titleTakri}</span>
            <span className="tr-featured-title">{sample.title}</span>
            <span className="tr-featured-translation">{sample.translation}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

export default function TakriReader() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const sampleParam = searchParams.get('text');
  const modeParam = searchParams.get('mode');

  const reader = useTakriReader(sampleParam);
  const {
    loadSample,
    loadPaste,
    clearText,
    setReadingMode,
    setSelectedWordId,
    revealWord,
    takriText,
    activeSample,
    activeSampleId,
    lines,
    fullRoman,
    readingMode,
    mode,
    setMode,
    status,
    selectedWordId,
    selectedWord,
    revealedWordIds,
    wordCount,
    lineCount,
    charCount,
  } = reader;
  const [libraryOpen, setLibraryOpen] = useState(true);
  const [glossaryOpen, setGlossaryOpen] = useState(true);
  const [pasteOpen, setPasteOpen] = useState(false);
  const [pasteDraft, setPasteDraft] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [difficultyFilter, setDifficultyFilter] = useState('all');
  const [languageFilter, setLanguageFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [copyGranularity, setCopyGranularity] = useState('sentence');
  const [copyScript, setCopyScript] = useState('takri');

  const copy = useReaderCopy({
    lines,
    granularity: copyGranularity,
    script: copyScript,
  });

  const featuredSamples = useMemo(() => getFeaturedSamples(), []);

  const practiceGroupCount = useMemo(
    () => getPracticeGroupIdsForText(takriText).length,
    [takriText],
  );

  useEffect(() => {
    const imported = consumeReaderImport();
    if (!imported?.takri) return;

    if (imported.sampleId) {
      const sample = getSampleById(imported.sampleId);
      if (sample) {
        loadSample(sample);
        showToast(imported.title ? `Opened: ${imported.title}` : 'Text opened in Reader');
        return;
      }
    }

    loadPaste(imported.takri);
    showToast(imported.title ? `Opened: ${imported.title}` : 'Text opened in Reader');
  }, [loadSample, loadPaste]);

  // Sync library selection from URL (deep links, back/forward)
  useEffect(() => {
    if (!sampleParam) return;
    const sample = getSampleById(sampleParam);
    if (sample) loadSample(sample);
  }, [sampleParam, loadSample]);

  useEffect(() => {
    if (!modeParam || !VALID_READING_MODES.has(modeParam)) return;
    if (modeParam !== readingMode) setReadingMode(modeParam);
  }, [modeParam, readingMode, setReadingMode]);

  useEffect(() => {
    copy.resetCharacterMode();
  }, [copyGranularity, copyScript, takriText, copy.resetCharacterMode]);

  const syncSearchParams = useCallback((updates) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      Object.entries(updates).forEach(([key, value]) => {
        if (value === null || value === undefined) next.delete(key);
        else next.set(key, value);
      });
      return next;
    });
  }, [setSearchParams]);

  const handleReadingModeChange = useCallback((mode) => {
    setReadingMode(mode);
    syncSearchParams({ mode: mode === 'guided' ? null : mode });
  }, [setReadingMode, syncSearchParams]);

  const handleSelectSample = useCallback((sample) => {
    loadSample(sample);
    setPasteOpen(false);
    syncSearchParams({
      text: sample.id,
      mode: readingMode === 'guided' ? null : readingMode,
    });
  }, [loadSample, syncSearchParams, readingMode]);

  const handlePasteSubmit = useCallback(() => {
    if (!pasteDraft.trim()) return;
    loadPaste(pasteDraft);
    setPasteOpen(false);
    syncSearchParams({ text: null });
  }, [pasteDraft, loadPaste, syncSearchParams]);

  const handleClear = useCallback(() => {
    clearText();
    setPasteDraft('');
    syncSearchParams({ text: null });
  }, [clearText, syncSearchParams]);

  const handleCopy = useCallback(async (text, label) => {
    const ok = await copyToClipboard(text);
    if (ok) showToast(`${label} copied to clipboard`);
  }, []);

  const handleShareLink = useCallback(async () => {
    const url = buildReaderUrl({
      textId: activeSampleId,
      readingMode,
    });
    const ok = await copyToClipboard(url);
    if (ok) showToast('Reader link copied to clipboard');
  }, [activeSampleId, readingMode]);

  const handleOpenInCopyStudio = useCallback(() => {
    saveCopyStudioImport({
      roman: fullRoman || activeSample?.roman || '',
      takri: takriText,
      title: activeSample?.title ?? 'Reader text',
      source: 'reader',
    });
    navigate('/copy-studio');
  }, [fullRoman, activeSample, takriText, navigate]);

  const handleWordClick = useCallback((word, line, lineIdx) => {
    if (readingMode === 'study') {
      revealWord(word.id);
    } else {
      setSelectedWordId(word.id);
    }

    if (copyGranularity === 'word' || copyGranularity === 'character') {
      copy.handleWordClick(word, line, lineIdx);
    }
  }, [readingMode, revealWord, setSelectedWordId, copyGranularity, copy]);

  const handleWordDoubleClick = useCallback((wordId) => {
    setSelectedWordId((prev) => (prev === wordId ? null : wordId));
  }, [setSelectedWordId]);

  const handleGlossarySelect = useCallback((wordId) => {
    if (readingMode === 'study') {
      revealWord(wordId);
      return;
    }
    setSelectedWordId(wordId);
  }, [readingMode, revealWord, setSelectedWordId]);

  const handleTextBlockClick = useCallback(() => {
    if (copyGranularity === 'sentence') copy.copySentence();
  }, [copyGranularity, copy]);

  const statusDotClass = status === 'offline' ? 'offline' : status === 'error' ? 'error' : '';
  const statusLabel = {
    ready: mode === 'api' ? 'API mode — ready' : 'Offline mode — ready',
    online: 'API — connected',
    offline: 'Offline engine — active',
    loading: 'Fetching from API…',
    error: 'API error — using offline fallback',
  }[status] || '';

  const showGuidedReadings = readingMode === 'guided' && takriText.trim();
  const showTranslation = activeSample?.translation
    && takriText.trim()
    && readingMode !== 'fluent';
  const showStudyHint = readingMode === 'study' && takriText.trim();
  const hasGlossary = Boolean(activeSample?.glossary);
  const isCopyLineMode = copyGranularity === 'line';
  const isCopyCharMode = copyGranularity === 'character';

  const isWordRevealed = useCallback((wordId) => {
    if (readingMode !== 'study') return false;
    return revealedWordIds.has(wordId) || selectedWordId === wordId;
  }, [readingMode, revealedWordIds, selectedWordId]);

  return (
    <motion.div
      className={`takri-reader-page ${libraryOpen ? 'library-open' : ''} ${glossaryOpen && hasGlossary ? 'glossary-open' : ''}`}
      initial="hidden"
      animate="visible"
      variants={fadeIn}
    >
      <SampleLibrary
        open={libraryOpen}
        onClose={() => setLibraryOpen(false)}
        activeSampleId={activeSampleId}
        categoryFilter={categoryFilter}
        difficultyFilter={difficultyFilter}
        languageFilter={languageFilter}
        searchQuery={searchQuery}
        onCategoryChange={setCategoryFilter}
        onDifficultyChange={setDifficultyFilter}
        onLanguageChange={setLanguageFilter}
        onSearchChange={setSearchQuery}
        onSelectSample={handleSelectSample}
        pasteOpen={pasteOpen}
        onTogglePaste={() => setPasteOpen((open) => !open)}
        pasteDraft={pasteDraft}
        onPasteDraftChange={setPasteDraft}
        onPasteSubmit={handlePasteSubmit}
        onPasteClear={() => setPasteDraft('')}
      />

      {!libraryOpen && (
        <button
          type="button"
          className="tr-library-reopen"
          onClick={() => setLibraryOpen(true)}
          aria-label="Open library"
        >
          Library ›
        </button>
      )}

      <main className="tr-main">
        <header className="tr-header">
          <div className="tr-header-brand">
            <span className="tr-header-mark">𑚏𑚫𑚛𑚤</span>
            <div>
              <h1>Takri Reader</h1>
              <p className="tr-header-tag">Read Takri with Roman, Devanagari, and curated texts</p>
            </div>
          </div>
          <div className="tr-header-actions">
            {takriText.trim() && (
              <>
                {activeSampleId && (
                  <button type="button" className="tr-btn" onClick={handleShareLink}>
                    Share link
                  </button>
                )}
                {hasGlossary && (
                  <button
                    type="button"
                    className={`tr-btn ${glossaryOpen ? 'active' : ''}`}
                    onClick={() => setGlossaryOpen((open) => !open)}
                  >
                    Glossary
                  </button>
                )}
                <button type="button" className="tr-btn tr-btn--ghost" onClick={handleClear}>
                  Clear
                </button>
              </>
            )}
          </div>
        </header>

        <div className="tr-controls">
          <div className="tr-control-group">
            <span className="tr-control-label">Reading</span>
            <div className="tr-mode-toggle">
              {READING_MODES.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  className={`tr-mode-btn ${readingMode === option.id ? 'active' : ''}`}
                  onClick={() => handleReadingModeChange(option.id)}
                  title={option.desc}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <div className="tr-control-group">
            <span className="tr-control-label">Engine</span>
            <div className="tr-mode-toggle">
              {MODE_OPTIONS.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  className={`tr-mode-btn ${mode === option.id ? 'active' : ''}`}
                  onClick={() => setMode(option.id)}
                  title={option.desc}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <div className="tr-status">
            <span className={`tr-status-dot ${statusDotClass}`} />
            <span>{statusLabel}</span>
          </div>
        </div>

        {takriText.trim() && (
          <>
            <ReaderCopyToolbar
              granularity={copyGranularity}
              script={copyScript}
              onGranularityChange={setCopyGranularity}
              onScriptChange={setCopyScript}
            />
            <ReaderConnectionsBar
              takriText={takriText}
              romanText={fullRoman || activeSample?.roman}
              title={activeSample?.title}
              sampleId={activeSampleId}
              practiceGroupCount={practiceGroupCount}
            />
          </>
        )}

        <div className="tr-content-row">
          <section className="tr-reading-area">
            {!takriText.trim() ? (
              <div className="tr-empty-state">
                <span className="tr-empty-glyphs">𑚔𑚭𑚊𑚤𑚯 𑚏𑚫𑚛𑚤</span>
                <h2>Select a text from the library</h2>
                <p>Or paste your own Takri to read with Roman and Devanagari support.</p>
                <FeaturedTexts samples={featuredSamples} onSelect={handleSelectSample} />
              </div>
            ) : (
              <>
                {activeSample && (
                  <div className="tr-sample-header">
                    <div>
                      <h2>{activeSample.title}</h2>
                      {activeSample.attribution && (
                        <p className="tr-attribution">{activeSample.attribution}</p>
                      )}
                    </div>
                    <div className="tr-sample-badges">
                      <span className="tr-badge">{getCategoryLabel(activeSample.category)}</span>
                      <span className={`tr-badge tr-badge--${activeSample.difficulty}`}>
                        {activeSample.difficulty}
                      </span>
                      <span className="tr-badge">{activeSample.language}</span>
                    </div>
                  </div>
                )}

                {showTranslation && (
                  <p className="tr-translation">{activeSample.translation}</p>
                )}

                {showStudyHint && (
                  <p className="tr-study-hint">Tap any word to reveal its Roman and Devanagari reading.</p>
                )}

                <div
                  className={`tr-takri-block ${copyGranularity === 'sentence' ? 'tr-takri-block--copy-sentence' : ''}`}
                  onClick={handleTextBlockClick}
                  onKeyDown={(e) => e.key === 'Enter' && handleTextBlockClick()}
                  role={copyGranularity === 'sentence' ? 'button' : undefined}
                  tabIndex={copyGranularity === 'sentence' ? 0 : undefined}
                >
                  {lines.map((line, lineIdx) => (
                    <div
                      key={line.id}
                      className={`tr-line ${isCopyLineMode ? 'tr-line--copyable' : ''}`}
                      onClick={(e) => {
                        if (!isCopyLineMode) return;
                        e.stopPropagation();
                        copy.handleLineClick(line, lineIdx);
                      }}
                    >
                      <div className="tr-takri-line">
                        {line.words.map((word) => {
                          const revealed = isWordRevealed(word.id);
                          const isExpanded = copy.expandedWordId === word.id;
                          const graphemeSegments = isExpanded ? copy.getWordGraphemes(word) : [];

                          return (
                            <span key={word.id} className="tr-word-wrap">
                              <button
                                type="button"
                                className={`tr-word ${selectedWordId === word.id ? 'active' : ''} ${revealed ? 'revealed' : ''} ${copy.lastCopiedId === word.id ? 'copied' : ''}`}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleWordClick(word, line, lineIdx);
                                }}
                                onDoubleClick={(e) => {
                                  e.stopPropagation();
                                  handleWordDoubleClick(word.id);
                                }}
                              >
                                {word.takri}
                              </button>
                              {readingMode === 'guided' && word.roman && (
                                <span className="tr-word-roman-inline">{word.roman}</span>
                              )}
                              {readingMode === 'study' && revealed && (
                                <span className="tr-word-study-reveal">
                                  {word.devanagari && <span className="tr-word-study-dev">{word.devanagari}</span>}
                                  {word.roman && <span className="tr-word-study-roman">{word.roman}</span>}
                                </span>
                              )}
                              {isCopyCharMode && isExpanded && (
                                <span className="tr-word-graphemes">
                                  {graphemeSegments.map((segment, graphemeIdx) => (
                                    <button
                                      key={`${word.id}-g-${graphemeIdx}`}
                                      type="button"
                                      className={`tr-grapheme-copy-chip ${copy.lastCopiedId === `${word.id}-g${graphemeIdx}` ? 'copied' : ''}`}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        copy.handleGraphemeClick(word, graphemeIdx);
                                      }}
                                    >
                                      {segment}
                                    </button>
                                  ))}
                                </span>
                              )}
                            </span>
                          );
                        })}
                      </div>

                      {showGuidedReadings && (
                        <div className="tr-guided-line">
                          <span className="tr-dev-line">
                            {line.words.map((word) => word.devanagari).join(' ')}
                          </span>
                          <span className="tr-roman-line">
                            {line.words.map((word) => word.roman).join(' ')}
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <AnimatePresence>
                  {selectedWord && (
                    <WordDetailPanel
                      word={selectedWord}
                      onClose={() => setSelectedWordId(null)}
                      onCopy={handleCopy}
                      onOpenCopyStudio={handleOpenInCopyStudio}
                    />
                  )}
                </AnimatePresence>

                <div className="tr-stats">
                  <span>{wordCount} words</span>
                  <span>{lineCount} lines</span>
                  <span>{charCount} characters</span>
                  {readingMode === 'study' && (
                    <span>{revealedWordIds.size} revealed</span>
                  )}
                </div>
              </>
            )}
          </section>

          {hasGlossary && glossaryOpen && takriText.trim() && (
            <GlossaryPanel
              sample={activeSample}
              lines={lines}
              selectedWordId={selectedWordId}
              onSelectWord={handleGlossarySelect}
            />
          )}
        </div>

        <footer className="tr-footer">
          <p>
            Reverse transliteration via{' '}
            <a href="https://aksharamukha.appspot.com/" target="_blank" rel="noopener noreferrer">
              Aksharamukha
            </a>
            {' · '}
            <Link to="/character-reference">Character Reference</Link>
            {' · '}
            <Link to="/copy-studio">Copy Studio</Link>
            {' · '}
            <Link to="/practice-sheets">Practice Sheets</Link>
          </p>
        </footer>
      </main>
    </motion.div>
  );
}
