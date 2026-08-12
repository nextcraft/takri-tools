import { useState, useCallback } from 'react';
import { copyToClipboard, graphemes, showToast } from '../lib/script-utils';
import {
  getWordText,
  getLineText,
  getFullText,
  getGraphemeSegmentsForCopy,
} from '../lib/tool-bridge';

const GRANULARITIES = [
  { id: 'sentence', label: 'Sentence', hint: 'Click anywhere in the text to copy all' },
  { id: 'line', label: 'Line', hint: 'Click a line to copy it' },
  { id: 'word', label: 'Word', hint: 'Click a word to copy it' },
  { id: 'character', label: 'Character', hint: 'Click a word, then a grapheme' },
];

const SCRIPTS = [
  { id: 'takri', label: 'Takri' },
  { id: 'devanagari', label: 'Devanagari' },
  { id: 'roman', label: 'Roman' },
];

export default function ReaderCopyToolbar({
  granularity,
  script,
  onGranularityChange,
  onScriptChange,
}) {
  return (
    <div className="tr-copy-toolbar">
      <div className="tr-copy-toolbar-group">
        <span className="tr-control-label">Copy</span>
        <div className="tr-mode-toggle">
          {GRANULARITIES.map((option) => (
            <button
              key={option.id}
              type="button"
              className={`tr-mode-btn ${granularity === option.id ? 'active' : ''}`}
              onClick={() => onGranularityChange(option.id)}
              title={option.hint}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>
      <div className="tr-copy-toolbar-group">
        <span className="tr-control-label">Script</span>
        <div className="tr-mode-toggle">
          {SCRIPTS.map((option) => (
            <button
              key={option.id}
              type="button"
              className={`tr-mode-btn tr-mode-btn--script tr-mode-btn--${option.id} ${script === option.id ? 'active' : ''}`}
              onClick={() => onScriptChange(option.id)}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>
      <p className="tr-copy-hint">
        {GRANULARITIES.find((g) => g.id === granularity)?.hint}
        {' · '}
        Click a word to inspect its reading
      </p>
    </div>
  );
}

export function useReaderCopy({ lines, granularity, script }) {
  const [expandedWordId, setExpandedWordId] = useState(null);
  const [lastCopiedId, setLastCopiedId] = useState(null);

  const scriptLabel = SCRIPTS.find((s) => s.id === script)?.label ?? 'Text';

  const performCopy = useCallback(async (text, label, id) => {
    if (!text?.trim()) {
      showToast('Nothing to copy');
      return;
    }
    const ok = await copyToClipboard(text);
    if (ok) {
      showToast(label);
      if (id) {
        setLastCopiedId(id);
        setTimeout(() => setLastCopiedId(null), 600);
      }
    }
  }, []);

  const copySentence = useCallback(() => {
    const text = getFullText(lines, script);
    performCopy(text, `Copied full ${scriptLabel} text`, 'sentence');
  }, [lines, script, scriptLabel, performCopy]);

  const handleLineClick = useCallback((line, lineIdx) => {
    if (granularity === 'sentence') {
      copySentence();
      return;
    }
    if (granularity !== 'line') return;
    const text = getLineText(line, script);
    performCopy(text, `Copied line ${lineIdx + 1} (${scriptLabel})`, line.id);
  }, [granularity, script, scriptLabel, performCopy, copySentence]);

  const handleWordClick = useCallback((word, line, lineIdx) => {
    if (granularity === 'sentence') {
      copySentence();
      return;
    }
    if (granularity === 'line') {
      handleLineClick(line, lineIdx);
      return;
    }
    if (granularity === 'word') {
      const text = getWordText(word, script);
      performCopy(text, `Copied ${scriptLabel}: ${text}`, word.id);
      return;
    }
    if (expandedWordId !== word.id) {
      setExpandedWordId(word.id);
    }
  }, [granularity, script, scriptLabel, performCopy, copySentence, handleLineClick, expandedWordId]);

  const handleGraphemeClick = useCallback((word, graphemeIdx) => {
    const segments = getGraphemeSegmentsForCopy(word, script);
    const text = segments[graphemeIdx];
    if (!text) return;
    performCopy(text, `Copied ${scriptLabel} grapheme`, `${word.id}-g${graphemeIdx}`);
  }, [granularity, script, scriptLabel, performCopy]);

  const resetCharacterMode = useCallback(() => {
    setExpandedWordId(null);
  }, []);

  const getWordGraphemes = useCallback((word) => {
    if (script === 'roman') {
      return getGraphemeSegmentsForCopy(word, script);
    }
    return graphemes(
      script === 'devanagari' ? (word.devanagari || '') : word.takri,
      script === 'devanagari' ? 'und-Deva' : 'und-Takr',
    ).filter((segment) => !/^[।,.!?\s]+$/.test(segment));
  }, [script]);

  return {
    expandedWordId,
    lastCopiedId,
    handleLineClick,
    handleWordClick,
    handleGraphemeClick,
    copySentence,
    resetCharacterMode,
    getWordGraphemes,
  };
}

export { GRANULARITIES, SCRIPTS };
