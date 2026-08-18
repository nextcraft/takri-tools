import {
  VOWELS,
  VOWEL_SIGNS,
  ALL_CONSONANTS,
  SPECIAL_CONSONANTS,
  SIGNS,
  SYMBOLS,
  NUMERALS,
  TRANSLITERATOR_MAPPINGS,
} from './mappings.js';
import { decode } from './decode.js';

function isDevanagariChar(ch) {
  const cp = ch.codePointAt(0);
  return cp >= 0x0900 && cp <= 0x097f;
}

function buildDevaToTakri() {
  const toTakri = new Map();

  const add = (deva, takri) => {
    if (!deva || !takri) return;
    if (!toTakri.has(deva)) toTakri.set(deva, takri);
  };

  for (const char of [...VOWELS, ...VOWEL_SIGNS, ...ALL_CONSONANTS, ...SPECIAL_CONSONANTS]) {
    add(char.devanagari, char.takri);
  }

  for (const sign of Object.values(SIGNS)) {
    add(sign.devanagari, sign.takri);
  }

  for (const symbol of Object.values(SYMBOLS)) {
    add(symbol.devanagari, symbol.takri);
  }

  for (const numeral of NUMERALS) {
    add(numeral.devanagari, numeral.takri);
  }

  const tak = TRANSLITERATOR_MAPPINGS.takri;
  const dev = TRANSLITERATOR_MAPPINGS.devanagari;

  const zip = (fromList, toList) => {
    fromList.forEach((glyph, index) => add(glyph, toList[index]));
  };

  zip(dev.vowels, tak.vowels);
  zip(dev.vowelSigns, tak.vowelSigns);
  zip(dev.consonants, tak.consonants);
  zip(dev.persoarabic, tak.persoarabic);
  zip(dev.south, tak.south);
  zip(dev.numerals, tak.numerals);

  add(dev.anusvara, tak.anusvara);
  add(dev.visarga, tak.visarga);
  add(dev.virama, tak.virama);
  add(dev.nukta, tak.nukta);
  add(dev.symbols.om, tak.symbols.om);
  add(dev.symbols.danda, tak.symbols.danda);
  add(dev.symbols.doubleDanda, tak.symbols.doubleDanda);
  add(dev.symbols.avagraha, tak.symbols.avagraha);

  return toTakri;
}

const DEVA_TO_TAKRI = buildDevaToTakri();

export function fromDevanagari(text) {
  const input = text ?? '';
  if (!input) {
    return { roman: '', devanagari: '', takri: '', warnings: [] };
  }

  const warnings = [];
  let takri = '';

  for (const ch of input) {
    if (DEVA_TO_TAKRI.has(ch)) {
      takri += DEVA_TO_TAKRI.get(ch);
    } else {
      takri += ch;
      if (isDevanagariChar(ch) && ch !== '\u200c' && ch !== '\u200d') {
        warnings.push(`Unmapped Devanagari code point U+${ch.codePointAt(0).toString(16).toUpperCase()}`);
      }
    }
  }

  const decoded = decode(takri);
  return {
    roman: decoded.roman,
    devanagari: input,
    takri,
    warnings,
  };
}
