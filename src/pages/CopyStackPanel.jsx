import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { copyToClipboard, showToast } from '../lib/script-utils';

const GRANULARITY_LABELS = {
  sentence: 'Sentence',
  line: 'Line',
  word: 'Word',
  character: 'Character',
};

const SCRIPT_META = {
  takri: { icon: '𑚔', label: 'Takri', className: 'takri' },
  devanagari: { icon: 'द', label: 'Dev', className: 'devanagari' },
  roman: { icon: 'Aa', label: 'Roman', className: 'roman' },
};

function truncateText(text) {
  const isMulti = text.includes('\n') || text.trim().includes(' ');
  const max = isMulti ? 36 : 48;
  if (text.length <= max) return text;
  return `${text.slice(0, max)}…`;
}

function formatRelativeTime(timestamp) {
  const diff = Date.now() - timestamp;
  const sec = Math.floor(diff / 1000);
  if (sec < 60) return 'just now';
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const day = Math.floor(hr / 24);
  return `${day}d ago`;
}

function IconClose() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

function StackItemRow({ entry, previewFontSize, onReCopy }) {
  const [hover, setHover] = useState(false);
  const rowRef = useRef(null);
  const truncated = truncateText(entry.text);
  const needsPreview = entry.text.length > 48;
  const scriptMeta = SCRIPT_META[entry.script] ?? SCRIPT_META.takri;

  const handleClick = async () => {
    const ok = await copyToClipboard(entry.text);
    if (ok) {
      showToast('Copied from stack');
      onReCopy?.(entry);
    }
  };

  return (
    <div
      ref={rowRef}
      className="cs-stack-item-wrap"
      onMouseEnter={() => needsPreview && setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <button type="button" className="cs-stack-item" onClick={handleClick}>
        <div className="cs-stack-item-meta">
          <span className={`cs-stack-script-badge ${scriptMeta.className}`}>
            <span className="cs-stack-script-icon">{scriptMeta.icon}</span>
            {scriptMeta.label}
          </span>
          <span className="cs-stack-granularity-pill">
            {GRANULARITY_LABELS[entry.granularity] ?? entry.granularity}
          </span>
          <span className="cs-stack-time">{formatRelativeTime(entry.copiedAt)}</span>
        </div>
        <div className="cs-stack-item-text-block">
          <span className={`cs-stack-item-text ${scriptMeta.className}`}>{truncated}</span>
          {entry.romanHint && entry.script !== 'roman' && (
            <span className="cs-stack-roman-hint">{entry.romanHint}</span>
          )}
        </div>
      </button>

      <AnimatePresence>
        {hover && needsPreview && (
          <motion.div
            className="cs-stack-preview-popover"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            transition={{ duration: 0.15 }}
            style={{ fontSize: `${previewFontSize}px` }}
          >
            <span className={`cs-stack-preview-text ${scriptMeta.className}`}>{entry.text}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function CopyStackPanel({
  isOpen,
  onClose,
  stack,
  onRequestClear,
  previewFontSize = 32,
}) {
  const panelRef = useRef(null);

  const handleBackdropClick = useCallback(
    (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        onClose();
      }
    },
    [onClose]
  );

  useEffect(() => {
    if (!isOpen) return undefined;

    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="cs-stack-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleBackdropClick}
            aria-hidden="true"
          />
          <motion.div
            ref={panelRef}
            className="cs-stack-panel"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 320 }}
            role="dialog"
            aria-label="Copy Stack"
          >
            <header className="cs-stack-header">
              <div className="cs-stack-header-title">
                <h2>Copy Stack</h2>
                <span className="cs-stack-header-count">{stack.length}</span>
              </div>
              <div className="cs-stack-header-actions">
                {stack.length > 0 && (
                  <button type="button" className="cs-stack-clear-btn" onClick={onRequestClear}>
                    Clear all
                  </button>
                )}
                <button
                  type="button"
                  className="cs-stack-close-btn"
                  onClick={onClose}
                  aria-label="Close stack"
                >
                  <IconClose />
                </button>
              </div>
            </header>

            <div className="cs-stack-list">
              {stack.length === 0 ? (
                <p className="cs-stack-empty">
                  No copies yet — use the copy tool to build your stack
                </p>
              ) : (
                stack.map((entry) => (
                  <StackItemRow
                    key={entry.id}
                    entry={entry}
                    previewFontSize={previewFontSize}
                  />
                ))
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
