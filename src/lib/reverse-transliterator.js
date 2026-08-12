import {
  VOWELS,
  VOWEL_SIGNS,
  ALL_CONSONANTS,
  SPECIAL_CONSONANTS,
  SIGNS,
  SYMBOLS,
  NUMERALS,
  TRANSLITERATOR_MAPPINGS,
} from '../data/takri-mappings';
import { graphemes } from './script-utils';

function buildLookupMaps() {
  const toDevanagari = new Map();
  const toRoman = new Map();

  const add = (takri, devanagari, roman) => {
    if (!takri) return;
    if (devanagari !== undefined) toDevanagari.set(takri, devanagari);
    if (roman !== undefined) toRoman.set(takri, roman);
  };

  for (const char of [...VOWELS, ...VOWEL_SIGNS, ...ALL_CONSONANTS, ...SPECIAL_CONSONANTS]) {
    add(char.takri, char.devanagari, char.roman);
  }

  for (const sign of Object.values(SIGNS)) {
    add(sign.takri, sign.devanagari, sign.roman);
  }

  for (const symbol of Object.values(SYMBOLS)) {
    add(symbol.takri, symbol.devanagari, symbol.roman);
  }

  for (const numeral of NUMERALS) {
    add(numeral.takri, numeral.devanagari, String(numeral.value));
  }

  const tak = TRANSLITERATOR_MAPPINGS.takri;
  const dev = TRANSLITERATOR_MAPPINGS.devanagari;
  const rom = TRANSLITERATOR_MAPPINGS.roman;

  tak.persoarabic.forEach((glyph, index) => {
    add(glyph, dev.persoarabic[index], rom.persoarabic[index]);
  });

  tak.south.forEach((glyph, index) => {
    add(glyph, dev.south[index], rom.south[index]);
  });

  add(tak.anusvara, dev.anusvara, rom.ayogavaha.anusvara);
  add(tak.visarga, dev.visarga, rom.ayogavaha.visarga);
  add(tak.virama, dev.virama);
  add(tak.nukta, dev.nukta, rom.nukta);
  add(tak.symbols.om, dev.symbols.om, rom.symbols.om);
  add(tak.symbols.danda, dev.symbols.danda, rom.symbols.danda);
  add(tak.symbols.doubleDanda, dev.symbols.doubleDanda, rom.symbols.doubleDanda);
  add(tak.symbols.avagraha, dev.symbols.avagraha, rom.symbols.avagraha);

  return { toDevanagari, toRoman };
}

const LOOKUP = buildLookupMaps();

export class OfflineReverseTransliterator {
  transliterate(input, target = 'devanagari') {
    if (!input) return '';

    const map = target === 'roman' ? LOOKUP.toRoman : LOOKUP.toDevanagari;
    const segments = graphemes(input, 'und-Takr');
    let output = '';

    for (const segment of segments) {
      output += map.get(segment) ?? segment;
    }

    return output;
  }
}

export function getCharLookup(takriGlyph) {
  return {
    devanagari: LOOKUP.toDevanagari.get(takriGlyph) ?? '',
    roman: LOOKUP.toRoman.get(takriGlyph) ?? '',
  };
}
