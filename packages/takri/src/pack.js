import { fromDevanagari } from './from-deva.js';
import { fromRoman } from './from-roman.js';

const KINDS = new Set(['caption', 'proverb-card', 'readme-heading', 'generic']);
const LANGS = new Set(['dogri', 'kangri', 'pahari', 'hi', 'und']);

export function pack(input = {}) {
  const kind = KINDS.has(input.kind) ? input.kind : 'generic';
  const language = LANGS.has(input.language) ? input.language : 'und';
  const english = input.english ?? '';

  let converted;
  if (input.devanagari?.trim()) {
    converted = fromDevanagari(input.devanagari);
  } else if (input.roman?.trim()) {
    converted = fromRoman(input.roman);
  } else {
    converted = {
      roman: input.roman ?? '',
      devanagari: input.devanagari ?? '',
      takri: '',
      warnings: ['pack requires --deva or --roman'],
    };
  }

  return {
    version: 1,
    kind,
    language,
    devanagari: converted.devanagari,
    takri: converted.takri,
    roman: converted.roman,
    english,
  };
}
