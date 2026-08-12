import { ALL_REFERENCE_CHARS } from '../data/takri-mappings';
import { graphemes } from './script-utils';

export const COPY_STUDIO_IMPORT_KEY = 'takri-tools-copy-studio-import';
export const READER_IMPORT_KEY = 'takri-tools-reader-import';
export const PRACTICE_SHEETS_IMPORT_KEY = 'takri-tools-practice-sheets-import';

/**
 * @typedef {Object} ToolImportPayload
 * @property {number} version
 * @property {string} [source]
 * @property {string} [title]
 * @property {string} [roman]
 * @property {string} [takri]
 * @property {string[]} [groupIds]
 */

export function parseToolImport(raw) {
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw);
    if (parsed && parsed.version === 1) return parsed;
  } catch {
    // fall through for legacy plain-text imports
  }

  return { version: 1, source: 'legacy', roman: raw };
}

export function saveCopyStudioImport({ roman, takri, title, source = 'reader' }) {
  const payload = {
    version: 1,
    source,
    roman: roman ?? '',
    takri: takri ?? '',
    title: title ?? '',
  };
  sessionStorage.setItem(COPY_STUDIO_IMPORT_KEY, JSON.stringify(payload));
}

export function consumeCopyStudioImport() {
  const raw = sessionStorage.getItem(COPY_STUDIO_IMPORT_KEY);
  if (!raw) return null;
  sessionStorage.removeItem(COPY_STUDIO_IMPORT_KEY);
  return parseToolImport(raw);
}

export function saveReaderImport({ takri, title, sampleId }) {
  const payload = {
    version: 1,
    source: 'tool-bridge',
    takri: takri ?? '',
    title: title ?? '',
    sampleId: sampleId ?? null,
  };
  sessionStorage.setItem(READER_IMPORT_KEY, JSON.stringify(payload));
}

export function consumeReaderImport() {
  const raw = sessionStorage.getItem(READER_IMPORT_KEY);
  if (!raw) return null;
  sessionStorage.removeItem(READER_IMPORT_KEY);
  try {
    const parsed = JSON.parse(raw);
    if (parsed?.version === 1) return parsed;
  } catch {
    // legacy plain takri string
    return { version: 1, takri: raw };
  }
  return null;
}

export function savePracticeSheetsImport({ groupIds, title }) {
  const payload = {
    version: 1,
    source: 'reader',
    groupIds: groupIds ?? [],
    title: title ?? '',
  };
  sessionStorage.setItem(PRACTICE_SHEETS_IMPORT_KEY, JSON.stringify(payload));
}

export function consumePracticeSheetsImport() {
  const raw = sessionStorage.getItem(PRACTICE_SHEETS_IMPORT_KEY);
  if (!raw) return null;
  sessionStorage.removeItem(PRACTICE_SHEETS_IMPORT_KEY);
  try {
    const parsed = JSON.parse(raw);
    if (parsed?.version === 1) return parsed;
  } catch {
    return null;
  }
  return null;
}

export function getCharCodeParam(glyph) {
  const first = graphemes(glyph, 'und-Takr')[0];
  if (!first) return null;
  const code = first.codePointAt(0);
  return code ? code.toString(16).toUpperCase() : null;
}

export function getGraphemeLinks(text) {
  return graphemes(text, 'und-Takr')
    .filter((segment) => segment.trim() && !/^[।,.!?]+$/.test(segment))
    .map((segment) => {
      const refChar = ALL_REFERENCE_CHARS.find((char) => char.takri === segment);
      return {
        grapheme: segment,
        code: refChar?.code?.replace(/^U\+/i, '') ?? getCharCodeParam(segment),
        name: refChar?.name ?? null,
        roman: refChar?.roman ?? null,
      };
    });
}

export function getPracticeGroupIdsForText(takriText) {
  const groupIds = new Set();

  for (const segment of graphemes(takriText, 'und-Takr')) {
    if (/^[।,.!?\s]+$/.test(segment)) continue;

    const refChar = ALL_REFERENCE_CHARS.find((char) => char.takri === segment);
    if (refChar?.sectionId) {
      groupIds.add(refChar.sectionId);
    }
  }

  return [...groupIds];
}

export function getWordText(word, script) {
  if (script === 'takri') return word.takri;
  if (script === 'devanagari') return word.devanagari;
  return word.roman ?? '';
}

export function getLineText(line, script) {
  return line.words.map((word) => getWordText(word, script)).join(' ');
}

export function getFullText(lines, script) {
  return lines.map((line) => getLineText(line, script)).join('\n');
}

export function getGraphemeSegmentsForCopy(word, script) {
  const isPunctuation = (segment) => /^[।,.!?\s]+$/.test(segment);

  if (script === 'takri') {
    return graphemes(word.takri, 'und-Takr').filter((segment) => !isPunctuation(segment));
  }

  if (script === 'devanagari') {
    return graphemes(word.devanagari || '', 'und-Deva').filter((segment) => !isPunctuation(segment));
  }

  return getGraphemeLinks(word.takri).map((item) => item.roman || item.grapheme);
}
