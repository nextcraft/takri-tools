/* ========================================
   Takri Tools — Shared Takri/Devanagari/Roman Mappings
   Unicode Block U+11680–U+116C9
   Source: Unicode Standard + Aksharamukha
   ======================================== */

// ============================================================
// Complete Takri character data from the Unicode block
// Every tool imports from here — single source of truth.
// ============================================================

export const VOWELS = [
  { takri: '\u{11680}', devanagari: '\u0905', roman: 'a',  name: 'A',  code: 'U+11680' },
  { takri: '\u{11681}', devanagari: '\u0906', roman: 'aa', name: 'Aa', code: 'U+11681' },
  { takri: '\u{11682}', devanagari: '\u0907', roman: 'i',  name: 'I',  code: 'U+11682' },
  { takri: '\u{11683}', devanagari: '\u0908', roman: 'ii', name: 'Ii', code: 'U+11683' },
  { takri: '\u{11684}', devanagari: '\u0909', roman: 'u',  name: 'U',  code: 'U+11684' },
  { takri: '\u{11685}', devanagari: '\u090A', roman: 'uu', name: 'Uu', code: 'U+11685' },
  { takri: '\u{11686}', devanagari: '\u090F', roman: 'e',  name: 'E',  code: 'U+11686' },
  { takri: '\u{11687}', devanagari: '\u0910', roman: 'ai', name: 'Ai', code: 'U+11687' },
  { takri: '\u{11688}', devanagari: '\u0913', roman: 'o',  name: 'O',  code: 'U+11688' },
  { takri: '\u{11689}', devanagari: '\u0914', roman: 'au', name: 'Au', code: 'U+11689' },
];

export const VOWEL_SIGNS = [
  { takri: '\u{116AD}', devanagari: '\u093E', roman: 'aa', name: 'Sign Aa', code: 'U+116AD' },
  { takri: '\u{116AE}', devanagari: '\u093F', roman: 'i',  name: 'Sign I',  code: 'U+116AE' },
  { takri: '\u{116AF}', devanagari: '\u0940', roman: 'ii', name: 'Sign Ii', code: 'U+116AF' },
  { takri: '\u{116B0}', devanagari: '\u0941', roman: 'u',  name: 'Sign U',  code: 'U+116B0' },
  { takri: '\u{116B1}', devanagari: '\u0942', roman: 'uu', name: 'Sign Uu', code: 'U+116B1' },
  { takri: '\u{116B2}', devanagari: '\u0947', roman: 'e',  name: 'Sign E',  code: 'U+116B2' },
  { takri: '\u{116B3}', devanagari: '\u0948', roman: 'ai', name: 'Sign Ai', code: 'U+116B3' },
  { takri: '\u{116B4}', devanagari: '\u094B', roman: 'o',  name: 'Sign O',  code: 'U+116B4' },
  { takri: '\u{116B5}', devanagari: '\u094C', roman: 'au', name: 'Sign Au', code: 'U+116B5' },
];

export const CONSONANT_GROUPS = [
  {
    name: 'Velars (क-row)',
    nameShort: 'ka-row',
    consonants: [
      { takri: '\u{1168A}', devanagari: '\u0915', roman: 'ka',  name: 'Ka',  code: 'U+1168A' },
      { takri: '\u{1168B}', devanagari: '\u0916', roman: 'kha', name: 'Kha', code: 'U+1168B' },
      { takri: '\u{1168C}', devanagari: '\u0917', roman: 'ga',  name: 'Ga',  code: 'U+1168C' },
      { takri: '\u{1168D}', devanagari: '\u0918', roman: 'gha', name: 'Gha', code: 'U+1168D' },
      { takri: '\u{1168E}', devanagari: '\u0919', roman: 'nga', name: 'Nga', code: 'U+1168E' },
    ],
  },
  {
    name: 'Palatals (च-row)',
    nameShort: 'ca-row',
    consonants: [
      { takri: '\u{1168F}', devanagari: '\u091A', roman: 'ca',  name: 'Ca',  code: 'U+1168F' },
      { takri: '\u{11690}', devanagari: '\u091B', roman: 'cha', name: 'Cha', code: 'U+11690' },
      { takri: '\u{11691}', devanagari: '\u091C', roman: 'ja',  name: 'Ja',  code: 'U+11691' },
      { takri: '\u{11692}', devanagari: '\u091D', roman: 'jha', name: 'Jha', code: 'U+11692' },
      { takri: '\u{11693}', devanagari: '\u091E', roman: 'nya', name: 'Nya', code: 'U+11693' },
    ],
  },
  {
    name: 'Retroflex (ट-row)',
    nameShort: 'tta-row',
    consonants: [
      { takri: '\u{11694}', devanagari: '\u091F', roman: 'tta',  name: 'Tta',  code: 'U+11694' },
      { takri: '\u{11695}', devanagari: '\u0920', roman: 'ttha', name: 'Ttha', code: 'U+11695' },
      { takri: '\u{11696}', devanagari: '\u0921', roman: 'dda',  name: 'Dda',  code: 'U+11696' },
      { takri: '\u{11697}', devanagari: '\u0922', roman: 'ddha', name: 'Ddha', code: 'U+11697' },
      { takri: '\u{11698}', devanagari: '\u0923', roman: 'nna',  name: 'Nna',  code: 'U+11698' },
    ],
  },
  {
    name: 'Dental (त-row)',
    nameShort: 'ta-row',
    consonants: [
      { takri: '\u{11699}', devanagari: '\u0924', roman: 'ta',  name: 'Ta',  code: 'U+11699' },
      { takri: '\u{1169A}', devanagari: '\u0925', roman: 'tha', name: 'Tha', code: 'U+1169A' },
      { takri: '\u{1169B}', devanagari: '\u0926', roman: 'da',  name: 'Da',  code: 'U+1169B' },
      { takri: '\u{1169C}', devanagari: '\u0927', roman: 'dha', name: 'Dha', code: 'U+1169C' },
      { takri: '\u{1169D}', devanagari: '\u0928', roman: 'na',  name: 'Na',  code: 'U+1169D' },
    ],
  },
  {
    name: 'Labial (प-row)',
    nameShort: 'pa-row',
    consonants: [
      { takri: '\u{1169E}', devanagari: '\u092A', roman: 'pa',  name: 'Pa',  code: 'U+1169E' },
      { takri: '\u{1169F}', devanagari: '\u092B', roman: 'pha', name: 'Pha', code: 'U+1169F' },
      { takri: '\u{116A0}', devanagari: '\u092C', roman: 'ba',  name: 'Ba',  code: 'U+116A0' },
      { takri: '\u{116A1}', devanagari: '\u092D', roman: 'bha', name: 'Bha', code: 'U+116A1' },
      { takri: '\u{116A2}', devanagari: '\u092E', roman: 'ma',  name: 'Ma',  code: 'U+116A2' },
    ],
  },
  {
    name: 'Semi-vowels',
    nameShort: 'semi-vowels',
    consonants: [
      { takri: '\u{116A3}', devanagari: '\u092F', roman: 'ya',  name: 'Ya',  code: 'U+116A3' },
      { takri: '\u{116A4}', devanagari: '\u0930', roman: 'ra',  name: 'Ra',  code: 'U+116A4' },
      { takri: '\u{116A5}', devanagari: '\u0932', roman: 'la',  name: 'La',  code: 'U+116A5' },
      { takri: '\u{116A6}', devanagari: '\u0935', roman: 'va',  name: 'Va',  code: 'U+116A6' },
    ],
  },
  {
    name: 'Sibilants & Ha',
    nameShort: 'sibilants',
    consonants: [
      { takri: '\u{116A7}', devanagari: '\u0936', roman: 'sha', name: 'Sha', code: 'U+116A7' },
      { takri: '\u{116A8}', devanagari: '\u0938', roman: 'sa',  name: 'Sa',  code: 'U+116A8' },
      { takri: '\u{116A9}', devanagari: '\u0939', roman: 'ha',  name: 'Ha',  code: 'U+116A9' },
    ],
  },
];

export const SPECIAL_CONSONANTS = [
  { takri: '\u{116AA}', devanagari: '\u0931', roman: 'rra', name: 'Rra', code: 'U+116AA' },
  { takri: '\u{116B8}', devanagari: '\u0916', roman: 'kha (archaic)', name: 'Archaic Kha', code: 'U+116B8' },
];

export const SIGNS = {
  anusvara: { takri: '\u{116AB}', devanagari: '\u0902', roman: "m'", name: 'Anusvara', code: 'U+116AB' },
  visarga:  { takri: '\u{116AC}', devanagari: '\u0903', roman: "h'", name: 'Visarga',  code: 'U+116AC' },
  virama:   { takri: '\u{116B6}', devanagari: '\u094D', roman: '×',  name: 'Virama',   code: 'U+116B6' },
  nukta:    { takri: '\u{116B7}', devanagari: '\u093C', roman: 'Q',  name: 'Nukta',    code: 'U+116B7' },
  abbreviation: { takri: '\u{116B9}', devanagari: '', roman: '', name: 'Abbreviation Sign', code: 'U+116B9' },
};

export const SYMBOLS = {
  danda:       { takri: '\u0964', devanagari: '\u0964', roman: '.',    name: 'Danda' },
  doubleDanda: { takri: '\u0965', devanagari: '\u0965', roman: '..',   name: 'Double Danda' },
  om:          { takri: '\u{11688}\u{116AB}', devanagari: '\u0950', roman: "oom'", name: 'Om' },
  avagraha:    { takri: '\u093D', devanagari: '\u093D', roman: 'a;',   name: 'Avagraha' },
};

export const NUMERALS = [
  { takri: '\u{116C0}', devanagari: '\u0966', value: 0, code: 'U+116C0' },
  { takri: '\u{116C1}', devanagari: '\u0967', value: 1, code: 'U+116C1' },
  { takri: '\u{116C2}', devanagari: '\u0968', value: 2, code: 'U+116C2' },
  { takri: '\u{116C3}', devanagari: '\u0969', value: 3, code: 'U+116C3' },
  { takri: '\u{116C4}', devanagari: '\u096A', value: 4, code: 'U+116C4' },
  { takri: '\u{116C5}', devanagari: '\u096B', value: 5, code: 'U+116C5' },
  { takri: '\u{116C6}', devanagari: '\u096C', value: 6, code: 'U+116C6' },
  { takri: '\u{116C7}', devanagari: '\u096D', value: 7, code: 'U+116C7' },
  { takri: '\u{116C8}', devanagari: '\u096E', value: 8, code: 'U+116C8' },
  { takri: '\u{116C9}', devanagari: '\u096F', value: 9, code: 'U+116C9' },
];

// Flatten all consonants into a single array for convenience
export const ALL_CONSONANTS = CONSONANT_GROUPS.flatMap(g => g.consonants);

// All characters for practice sheets etc.
export const ALL_CHARACTERS = [
  ...VOWELS,
  ...ALL_CONSONANTS,
  ...SPECIAL_CONSONANTS,
];


// ============================================================
// TRANSLITERATION ENGINE MAPPINGS
// These use the Aksharamukha RomanReadable scheme for input,
// mapped positionally to Devanagari and Takri output.
// ============================================================

export const TRANSLITERATOR_MAPPINGS = {
  roman: {
    vowels: ['a','aa','i','ii','u','uu','ee','ai','oo','au','e','o'],
    vowelSigns: ['aa','i','ii','u','uu','ee','ai','oo','au','e','o'],
    consonants: [
      'k','kh','g','gh','ng\'',
      'ch','chh','j','jh','nj\'',
      't\'','t\'h','d\'','d\'h','n\'',
      't','th','d','dh','n',
      'p','ph','b','bh','m',
      'y','r','l','v',
      'sh','shh','s','h'
    ],
    persoarabic: ['q','qh','g;','z','d;','d;h','f','y;'],
    south: ['l\'','zh','r\'','n;'],
    ayogavaha: { anusvara: 'm\'', visarga: 'h\'' },
    nukta: 'Q',
    virama: '\u00D7',
    symbols: { avagraha: 'a;', danda: '.', doubleDanda: '..', om: 'oom\'' }
  },

  devanagari: {
    vowels: ['\u0905','\u0906','\u0907','\u0908','\u0909','\u090A','\u090F','\u0910','\u0913','\u0914','\u090F','\u0913'],
    vowelSigns: ['\u093E','\u093F','\u0940','\u0941','\u0942','\u0947','\u0948','\u094B','\u094C','\u0947','\u094B'],
    consonants: [
      '\u0915','\u0916','\u0917','\u0918','\u0919',
      '\u091A','\u091B','\u091C','\u091D','\u091E',
      '\u091F','\u0920','\u0921','\u0922','\u0923',
      '\u0924','\u0925','\u0926','\u0927','\u0928',
      '\u092A','\u092B','\u092C','\u092D','\u092E',
      '\u092F','\u0930','\u0932','\u0935',
      '\u0936','\u0937','\u0938','\u0939'
    ],
    persoarabic: ['\u0958','\u0959','\u095A','\u095B','\u095C','\u095D','\u095E','\u095F'],
    south: ['\u0933','\u0934','\u0931','\u0929'],
    anusvara: '\u0902',
    visarga: '\u0903',
    virama: '\u094D',
    nukta: '\u093C',
    symbols: { avagraha: '\u093D', danda: '\u0964', doubleDanda: '\u0965', om: '\u0950' },
    numerals: ['\u0966','\u0967','\u0968','\u0969','\u096A','\u096B','\u096C','\u096D','\u096E','\u096F']
  },

  takri: {
    vowels: ['\u{11680}','\u{11681}','\u{11682}','\u{11683}','\u{11684}','\u{11685}','\u{11686}','\u{11687}','\u{11688}','\u{11689}','\u{11686}','\u{11688}'],
    vowelSigns: ['\u{116AD}','\u{116AE}','\u{116AF}','\u{116B0}','\u{116B1}','\u{116B2}','\u{116B3}','\u{116B4}','\u{116B5}','\u{116B2}','\u{116B4}'],
    consonants: [
      '\u{1168A}','\u{1168B}','\u{1168C}','\u{1168D}','\u{1168E}',
      '\u{1168F}','\u{11690}','\u{11691}','\u{11692}','\u{11693}',
      '\u{11694}','\u{11695}','\u{11696}','\u{11697}','\u{11698}',
      '\u{11699}','\u{1169A}','\u{1169B}','\u{1169C}','\u{1169D}',
      '\u{1169E}','\u{1169F}','\u{116A0}','\u{116A1}','\u{116A2}',
      '\u{116A3}','\u{116A4}','\u{116A5}','\u{116A6}',
      '\u{116A7}','\u{1168B}','\u{116A8}','\u{116A9}'
    ],
    persoarabic: [
      '\u{1168A}\u{116B7}','\u{1168B}\u{116B7}','\u{1168C}\u{116B7}','\u{11691}\u{116B7}',
      '\u{116AA}','\u{11697}\u{116B7}','\u{1169F}\u{116B7}','\u{116A3}\u{116B7}'
    ],
    south: ['\u{116A5}\u{116B7}','\u{116A5}\u{116B7}','\u{116A4}\u{116B7}','\u{1169D}\u{116B7}'],
    anusvara: '\u{116AB}',
    visarga: '\u{116AC}',
    virama: '\u{116B6}',
    nukta: '\u{116B7}',
    symbols: { avagraha: '\u093D', danda: '\u0964', doubleDanda: '\u0965', om: '\u{11688}\u{116AB}' },
    numerals: ['\u{116C0}','\u{116C1}','\u{116C2}','\u{116C3}','\u{116C4}','\u{116C5}','\u{116C6}','\u{116C7}','\u{116C8}','\u{116C9}']
  }
};

// Characters used for floating hero animation
export const HERO_CHARS = ['𑚀','𑚊','𑚔','𑚙','𑚞','𑚧','𑚁','𑚏','𑚣','𑚥','𑚩','𑚇'];
