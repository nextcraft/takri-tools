import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { OfflineTransliterator, apiTransliterate } from '../lib/transliterator';

const API_DEBOUNCE_MS = 150;

/**
 * Parse Roman text into lines with word tokens and stable positions.
 */
export function parseRomanText(text, engine) {
  if (!text) return [];

  const lineTexts = text.split('\n');
  const lines = [];
  let globalOffset = 0;

  for (let lineIndex = 0; lineIndex < lineTexts.length; lineIndex++) {
    const rawLine = lineTexts[lineIndex];
    const words = [];
    const regex = /\S+/g;
    let match;
    let wordIndex = 0;

    while ((match = regex.exec(rawLine)) !== null) {
      const roman = match[0];
      const start = globalOffset + match.index;
      const end = start + roman.length;

      let devanagari = '';
      let takri = '';
      if (engine) {
        devanagari = engine.transliterate(roman, 'devanagari');
        takri = engine.transliterate(roman, 'takri');
      }

      words.push({
        id: `l${lineIndex}-w${wordIndex}`,
        roman,
        start,
        end,
        devanagari,
        takri,
      });
      wordIndex++;
    }

    lines.push({
      id: `line-${lineIndex}`,
      rawLine,
      words,
    });

    globalOffset += rawLine.length + 1;
  }

  return lines;
}

/**
 * Replace a single word token in the Roman source string.
 */
export function replaceWord(romanText, lineId, wordId, newRoman) {
  const lineIndex = parseInt(lineId.replace('line-', ''), 10);
  const parsed = parseRomanText(romanText, null);
  const line = parsed[lineIndex];
  if (!line) return romanText;

  const word = line.words.find((w) => w.id === wordId);
  if (!word) return romanText;

  return romanText.slice(0, word.start) + newRoman + romanText.slice(word.end);
}

function mergeApiIntoLines(offlineLines, apiDevText, apiTakText) {
  const devLineTexts = apiDevText.split('\n');
  const takLineTexts = apiTakText.split('\n');

  return offlineLines.map((line, lineIdx) => {
    const devWords = (devLineTexts[lineIdx] ?? '').trim().split(/\s+/).filter(Boolean);
    const takWords = (takLineTexts[lineIdx] ?? '').trim().split(/\s+/).filter(Boolean);

    return {
      ...line,
      words: line.words.map((word, wordIdx) => ({
        ...word,
        devanagari: devWords[wordIdx] ?? word.devanagari,
        takri: takWords[wordIdx] ?? word.takri,
      })),
    };
  });
}

export default function useCopyStudio() {
  const [romanText, setRomanText] = useState('');
  const [mode, setMode] = useState('offline');
  const [apiStatus, setApiStatus] = useState('ready');
  const [apiResult, setApiResult] = useState({ text: '', devanagari: '', takri: '' });
  const [activeLineIndex, setActiveLineIndex] = useState(0);

  const engine = useMemo(() => new OfflineTransliterator(), []);
  const debounceRef = useRef(null);
  const apiRequestIdRef = useRef(0);

  const offlineFullDevanagari = useMemo(
    () => (romanText.trim() ? engine.transliterate(romanText, 'devanagari') : ''),
    [romanText, engine]
  );

  const offlineFullTakri = useMemo(
    () => (romanText.trim() ? engine.transliterate(romanText, 'takri') : ''),
    [romanText, engine]
  );

  const apiReady = mode === 'api' && apiResult.text === romanText && apiResult.devanagari;

  const fullDevanagari = apiReady ? apiResult.devanagari : offlineFullDevanagari;
  const fullTakri = apiReady ? apiResult.takri : offlineFullTakri;

  const offlineLines = useMemo(
    () => parseRomanText(romanText, engine),
    [romanText, engine]
  );

  const lines = useMemo(() => {
    if (!apiReady) return offlineLines;
    return mergeApiIntoLines(offlineLines, apiResult.devanagari, apiResult.takri);
  }, [offlineLines, apiReady, apiResult.devanagari, apiResult.takri]);

  const status = useMemo(() => {
    if (!romanText.trim()) return 'ready';
    if (mode === 'offline') return 'offline';
    if (apiStatus === 'loading') return 'loading';
    if (apiStatus === 'error') return 'error';
    if (apiReady) return 'online';
    return 'offline';
  }, [romanText, mode, apiStatus, apiReady]);

  const doAPI = useCallback(async (text, requestId) => {
    setApiStatus('loading');
    try {
      const [dev, tak] = await Promise.all([
        apiTransliterate(text, 'devanagari'),
        apiTransliterate(text, 'takri'),
      ]);
      if (requestId !== apiRequestIdRef.current) return;
      setApiResult({ text, devanagari: dev, takri: tak });
      setApiStatus('online');
    } catch {
      if (requestId !== apiRequestIdRef.current) return;
      setApiStatus('error');
    }
  }, []);

  useEffect(() => {
    clearTimeout(debounceRef.current);

    if (!romanText.trim() || mode === 'offline') {
      return undefined;
    }

    const requestId = ++apiRequestIdRef.current;
    debounceRef.current = setTimeout(() => doAPI(romanText, requestId), API_DEBOUNCE_MS);
    return () => clearTimeout(debounceRef.current);
  }, [romanText, mode, doAPI]);

  const handleSetMode = useCallback((newMode) => {
    setMode(newMode);
    setApiStatus('ready');
    if (newMode === 'offline') {
      setApiResult({ text: '', devanagari: '', takri: '' });
      apiRequestIdRef.current += 1;
      clearTimeout(debounceRef.current);
    } else if (romanText.trim()) {
      const requestId = ++apiRequestIdRef.current;
      clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => doAPI(romanText, requestId), API_DEBOUNCE_MS);
    }
  }, [romanText, doAPI]);

  const handleReplaceWord = useCallback((lineId, wordId, newRoman) => {
    setRomanText((prev) => replaceWord(prev, lineId, wordId, newRoman));
  }, []);

  const wordCount = useMemo(
    () => lines.reduce((sum, line) => sum + line.words.length, 0),
    [lines]
  );

  const charCount = romanText.length;
  const lineCount = lines.length;

  return {
    romanText,
    setRomanText,
    lines,
    fullDevanagari,
    fullTakri,
    mode,
    setMode: handleSetMode,
    status,
    replaceWord: handleReplaceWord,
    activeLineIndex,
    setActiveLineIndex,
    wordCount,
    charCount,
    lineCount,
  };
}
