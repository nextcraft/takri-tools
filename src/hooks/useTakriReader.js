import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { apiReverseTransliterate } from '../lib/transliterator';
import { OfflineReverseTransliterator } from '../lib/reverse-transliterator';
import { getSampleById, READING_MODE_STORAGE_KEY } from '../data/sample-texts';

const API_DEBOUNCE_MS = 200;

/**
 * Parse Takri text into lines with word tokens.
 */
export function parseTakriText(text, engine, sample = null) {
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
      const takri = match[0];
      const takriKey = takri.replace(/[।,.!?]+$/g, '');
      const start = globalOffset + match.index;
      const end = start + takri.length;
      const glossary = sample?.glossary?.[takri] ?? sample?.glossary?.[takriKey];

      let devanagari = '';
      let roman = '';
      if (glossary?.roman) {
        roman = glossary.roman;
      }
      if (engine) {
        devanagari = engine.transliterate(takri, 'devanagari');
        if (!roman) roman = engine.transliterate(takri, 'roman');
      }

      words.push({
        id: `l${lineIndex}-w${wordIndex}`,
        takri,
        start,
        end,
        devanagari: glossary?.devanagari ?? devanagari,
        roman: glossary?.roman ?? roman,
        meaning: glossary?.meaning ?? null,
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

function mergeApiIntoLines(offlineLines, apiDevText, apiRomanText, sample = null) {
  const devLineTexts = apiDevText.split('\n');
  const romanLineTexts = apiRomanText.split('\n');

  return offlineLines.map((line, lineIdx) => {
    const devWords = (devLineTexts[lineIdx] ?? '').trim().split(/\s+/).filter(Boolean);
    const romanWords = (romanLineTexts[lineIdx] ?? '').trim().split(/\s+/).filter(Boolean);

    return {
      ...line,
      words: line.words.map((word, wordIdx) => {
        const glossary = sample?.glossary?.[word.takri]
          ?? sample?.glossary?.[word.takri.replace(/[।,.!?]+$/g, '')];
        return {
          ...word,
          devanagari: glossary?.devanagari ?? devWords[wordIdx] ?? word.devanagari,
          roman: glossary?.roman ?? romanWords[wordIdx] ?? word.roman,
          meaning: glossary?.meaning ?? word.meaning,
        };
      }),
    };
  });
}

function mergeSampleLines(offlineLines, sample) {
  if (!sample?.roman && !sample?.devanagari) return offlineLines;

  const romanLineTexts = (sample.roman ?? '').split('\n');
  const devLineTexts = (sample.devanagari ?? '').split('\n');

  return offlineLines.map((line, lineIdx) => {
    const romanWords = (romanLineTexts[lineIdx] ?? '').trim().split(/\s+/).filter(Boolean);
    const devWords = (devLineTexts[lineIdx] ?? '').trim().split(/\s+/).filter(Boolean);

    return {
      ...line,
      words: line.words.map((word, wordIdx) => {
        const glossary = sample.glossary?.[word.takri]
          ?? sample.glossary?.[word.takri.replace(/[।,.!?]+$/g, '')];
        return {
          ...word,
          roman: glossary?.roman ?? romanWords[wordIdx] ?? word.roman,
          devanagari: glossary?.devanagari ?? devWords[wordIdx] ?? word.devanagari,
          meaning: glossary?.meaning ?? word.meaning,
        };
      }),
    };
  });
}

export default function useTakriReader(initialSampleId = null) {
  const initialSample = initialSampleId ? getSampleById(initialSampleId) : null;
  const [takriText, setTakriText] = useState(initialSample?.takri ?? '');
  const [activeSampleId, setActiveSampleId] = useState(initialSampleId);
  const [mode, setMode] = useState('api');
  const [readingMode, setReadingModeState] = useState(() => {
    try {
      const stored = localStorage.getItem(READING_MODE_STORAGE_KEY);
      if (stored === 'study' || stored === 'guided' || stored === 'fluent') return stored;
    } catch {
      // ignore storage errors
    }
    return 'guided';
  });
  const [apiStatus, setApiStatus] = useState('ready');
  const [apiResult, setApiResult] = useState({ text: '', devanagari: '', roman: '' });
  const [selectedWordId, setSelectedWordId] = useState(null);
  const [revealedWordIds, setRevealedWordIds] = useState(() => new Set());

  const engine = useMemo(() => new OfflineReverseTransliterator(), []);
  const debounceRef = useRef(null);
  const apiRequestIdRef = useRef(0);

  const activeSample = useMemo(
    () => (activeSampleId ? getSampleById(activeSampleId) : null),
    [activeSampleId],
  );

  const offlineFullDevanagari = useMemo(
    () => (takriText.trim() ? engine.transliterate(takriText, 'devanagari') : ''),
    [takriText, engine],
  );

  const offlineFullRoman = useMemo(
    () => (takriText.trim() ? engine.transliterate(takriText, 'roman') : ''),
    [takriText, engine],
  );

  const apiReady = mode === 'api' && apiResult.text === takriText && apiResult.devanagari;

  const fullDevanagari = apiReady
    ? apiResult.devanagari
    : activeSample?.devanagari ?? offlineFullDevanagari;

  const fullRoman = apiReady
    ? apiResult.roman
    : activeSample?.roman ?? offlineFullRoman;

  const offlineLines = useMemo(
    () => parseTakriText(takriText, engine, activeSample),
    [takriText, engine, activeSample],
  );

  const lines = useMemo(() => {
    let result = offlineLines;
    if (activeSample) {
      result = mergeSampleLines(result, activeSample);
    }
    if (apiReady) {
      result = mergeApiIntoLines(result, apiResult.devanagari, apiResult.roman, activeSample);
    }
    return result;
  }, [offlineLines, activeSample, apiReady, apiResult.devanagari, apiResult.roman]);

  const selectedWord = useMemo(() => {
    if (!selectedWordId) return null;
    for (const line of lines) {
      const word = line.words.find((item) => item.id === selectedWordId);
      if (word) return word;
    }
    return null;
  }, [lines, selectedWordId]);

  const status = useMemo(() => {
    if (!takriText.trim()) return 'ready';
    if (mode === 'offline') return 'offline';
    if (apiStatus === 'loading') return 'loading';
    if (apiStatus === 'error') return 'error';
    if (apiReady) return 'online';
    return 'offline';
  }, [takriText, mode, apiStatus, apiReady]);

  const doAPI = useCallback(async (text, requestId) => {
    setApiStatus('loading');
    try {
      const [dev, roman] = await Promise.all([
        apiReverseTransliterate(text, 'devanagari'),
        apiReverseTransliterate(text, 'roman'),
      ]);
      if (requestId !== apiRequestIdRef.current) return;
      setApiResult({ text, devanagari: dev, roman });
      setApiStatus('online');
    } catch {
      if (requestId !== apiRequestIdRef.current) return;
      setApiStatus('error');
    }
  }, []);

  useEffect(() => {
    clearTimeout(debounceRef.current);

    if (!takriText.trim() || mode === 'offline') {
      return undefined;
    }

    const requestId = ++apiRequestIdRef.current;
    debounceRef.current = setTimeout(() => doAPI(takriText, requestId), API_DEBOUNCE_MS);
    return () => clearTimeout(debounceRef.current);
  }, [takriText, mode, doAPI]);

  const handleSetMode = useCallback((newMode) => {
    setMode(newMode);
    setApiStatus('ready');
    if (newMode === 'offline') {
      setApiResult({ text: '', devanagari: '', roman: '' });
      apiRequestIdRef.current += 1;
      clearTimeout(debounceRef.current);
    } else if (takriText.trim()) {
      const requestId = ++apiRequestIdRef.current;
      clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => doAPI(takriText, requestId), API_DEBOUNCE_MS);
    }
  }, [takriText, doAPI]);

  const setReadingMode = useCallback((mode) => {
    setReadingModeState(mode);
    try {
      localStorage.setItem(READING_MODE_STORAGE_KEY, mode);
    } catch {
      // ignore storage errors
    }
  }, []);

  const clearRevealedWords = useCallback(() => {
    setRevealedWordIds(new Set());
  }, []);

  const revealWord = useCallback((wordId) => {
    setRevealedWordIds((prev) => new Set(prev).add(wordId));
    setSelectedWordId(wordId);
  }, []);

  const loadSample = useCallback((sample) => {
    setActiveSampleId(sample.id);
    setTakriText(sample.takri);
    setSelectedWordId(null);
    setRevealedWordIds(new Set());
  }, []);

  const loadPaste = useCallback((text) => {
    setActiveSampleId(null);
    setTakriText(text);
    setSelectedWordId(null);
    setRevealedWordIds(new Set());
  }, []);

  const clearText = useCallback(() => {
    setActiveSampleId(null);
    setTakriText('');
    setSelectedWordId(null);
    setRevealedWordIds(new Set());
  }, []);

  const wordCount = useMemo(
    () => lines.reduce((sum, line) => sum + line.words.length, 0),
    [lines],
  );

  return {
    takriText,
    setTakriText: loadPaste,
    activeSample,
    activeSampleId,
    loadSample,
    loadPaste,
    clearText,
    lines,
    fullDevanagari,
    fullRoman,
    mode,
    setMode: handleSetMode,
    readingMode,
    setReadingMode,
    status,
    selectedWordId,
    setSelectedWordId,
    selectedWord,
    revealedWordIds,
    revealWord,
    clearRevealedWords,
    wordCount,
    charCount: takriText.length,
    lineCount: lines.length,
  };
}
