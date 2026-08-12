/**
 * Curated Takri reading samples for the Takri Reader library.
 * Takri text generated via OfflineTransliterator; roman/devanagari verified for display.
 */

export const SAMPLE_CATEGORIES = [
  { id: 'all', label: 'All' },
  { id: 'greetings', label: 'Greetings' },
  { id: 'proverbs', label: 'Proverbs' },
  { id: 'folk', label: 'Folk & Culture' },
  { id: 'practice', label: 'Practice' },
];

export const SAMPLE_DIFFICULTIES = [
  { id: 'all', label: 'All levels' },
  { id: 'beginner', label: 'Beginner' },
  { id: 'intermediate', label: 'Intermediate' },
];

export const SAMPLE_LANGUAGES = [
  { id: 'all', label: 'All languages' },
  { id: 'dogri', label: 'Dogri' },
  { id: 'kangri', label: 'Kangri' },
  { id: 'general', label: 'General' },
];

/** Shown on the empty reading state for quick starts */
export const FEATURED_SAMPLE_IDS = [
  'greeting-namaste',
  'proverb-chaah-raah',
  'folk-dogri-zindabad',
];

export const READING_MODE_STORAGE_KEY = 'takri-reader-reading-mode';

export const SAMPLE_TEXTS = [
  {
    id: 'greeting-namaste',
    title: 'Namaste',
    titleTakri: '𑚔𑚭𑚢𑚭𑚨𑚙𑚯',
    category: 'greetings',
    difficulty: 'beginner',
    language: 'dogri',
    takri: '𑚝𑚢𑚨𑚶𑚙𑚲।',
    roman: 'namaste.',
    devanagari: 'नमस्ते।',
    translation: 'Namaste — a respectful greeting.',
    attribution: 'Common greeting across Pahari communities',
    glossary: {
      '𑚝𑚢𑚨𑚶𑚙𑚲': { roman: 'namaste', meaning: 'Greeting — I bow to you' },
    },
  },
  {
    id: 'greeting-subh-prabhaat',
    title: 'Good Morning',
    titleTakri: '𑚨𑚰𑚡𑚶𑚞𑚶𑚤𑚡𑚭𑚙𑚶',
    category: 'greetings',
    difficulty: 'beginner',
    language: 'dogri',
    takri: '𑚨𑚰𑚡𑚶𑚞𑚶𑚤𑚡𑚭𑚙𑚶।',
    roman: 'subh prabhaat.',
    devanagari: 'सुभ प्रभात।',
    translation: 'Good morning.',
    attribution: 'Everyday greeting',
    glossary: {
      '𑚨𑚰𑚡𑚶': { roman: 'subh', meaning: 'Auspicious, good' },
      '𑚞𑚶𑚤𑚡𑚭𑚙𑚶': { roman: 'prabhaat', meaning: 'Morning, dawn' },
    },
  },
  {
    id: 'greeting-svaagat',
    title: 'Welcome',
    titleTakri: '𑚨𑚶𑚦𑚭𑚌𑚙𑚶',
    category: 'greetings',
    difficulty: 'beginner',
    language: 'dogri',
    takri: '𑚨𑚶𑚦𑚭𑚌𑚙𑚶 𑚩𑚳।',
    roman: 'svaagat hai.',
    devanagari: 'स्वागत है।',
    translation: 'You are welcome.',
    attribution: 'Common hospitality phrase',
    glossary: {
      '𑚨𑚶𑚦𑚭𑚌𑚙𑚶': { roman: 'svaagat', meaning: 'Welcome' },
      '𑚩𑚳': { roman: 'hai', meaning: 'Is — emphatic welcome' },
    },
  },
  {
    id: 'greeting-dhanyavaad',
    title: 'Thank You',
    titleTakri: '𑚜𑚝𑚶𑚣𑚦𑚭𑚛𑚶',
    category: 'greetings',
    difficulty: 'beginner',
    language: 'general',
    takri: '𑚜𑚝𑚶𑚣𑚦𑚭𑚛𑚶।',
    roman: 'dhanyavaad.',
    devanagari: 'धन्यवाद।',
    translation: 'Thank you.',
    attribution: 'Shared across North Indian languages',
    glossary: {
      '𑚜𑚝𑚶𑚣𑚦𑚭𑚛𑚶': { roman: 'dhanyavaad', meaning: 'Gratitude — thank you' },
    },
  },
  {
    id: 'practice-dogri-bhasha',
    title: 'Dogri Language',
    titleTakri: '𑚙𑚭𑚚𑚤𑚯 𑚡𑚭𑚨𑚭',
    category: 'practice',
    difficulty: 'beginner',
    language: 'dogri',
    takri: '𑚛𑚴𑚌𑚶𑚤𑚮 𑚡𑚭𑚨𑚭।',
    roman: 'dogri bhaashaa.',
    devanagari: 'दोगरी भाषा।',
    translation: 'The Dogri language.',
    attribution: 'Practice sentence',
    glossary: {
      '𑚛𑚴𑚌𑚶𑚤𑚮': { roman: 'dogri', meaning: 'Dogri — language of the Jammu hills' },
      '𑚡𑚭𑚨𑚭': { roman: 'bhaashaa', meaning: 'Language, speech' },
    },
  },
  {
    id: 'practice-jai-dogri',
    title: 'Victory to Dogri',
    titleTakri: '𑚑𑚳 𑚙𑚭𑚚𑚤𑚯',
    category: 'practice',
    difficulty: 'beginner',
    language: 'dogri',
    takri: '𑚑𑚳 𑚛𑚴𑚌𑚶𑚤𑚮।',
    roman: 'jai dogri.',
    devanagari: 'जय दोगरी।',
    translation: 'Victory to Dogri!',
    attribution: 'Cultural affirmation',
    glossary: {
      '𑚑𑚳': { roman: 'jai', meaning: 'Victory, hail' },
      '𑚛𑚴𑚌𑚶𑚤𑚮': { roman: 'dogri', meaning: 'Dogri language and culture' },
    },
  },
  {
    id: 'practice-takri-lipi',
    title: 'Takri Script',
    titleTakri: '𑚙𑚊𑚶𑚤𑚮 𑚥𑚮𑚞𑚮',
    category: 'practice',
    difficulty: 'beginner',
    language: 'general',
    takri: '𑚙𑚊𑚶𑚤𑚮 𑚥𑚮𑚞𑚮।',
    roman: 'takri lipi.',
    devanagari: 'तकरी लिपि।',
    translation: 'The Takri script.',
    attribution: 'Script learning',
    glossary: {
      '𑚙𑚊𑚶𑚤𑚮': { roman: 'takri', meaning: 'Takri — the script itself' },
      '𑚥𑚮𑚞𑚮': { roman: 'lipi', meaning: 'Script, writing system' },
    },
  },
  {
    id: 'proverb-chaah-raah',
    title: 'Where There Is a Will',
    titleTakri: '𑚑𑚩𑚭𑚝𑚶 𑚏𑚭𑚩𑚶',
    category: 'proverbs',
    difficulty: 'intermediate',
    language: 'general',
    takri: '𑚑𑚩𑚭𑚝𑚶 𑚏𑚭𑚩𑚶, 𑚦𑚩𑚭𑚝𑚶 𑚤𑚭𑚩𑚶।',
    roman: 'jahaan chaah, vahaan raah.',
    devanagari: 'जहाँ चाह, वहाँ राह।',
    translation: 'Where there is a will, there is a way.',
    attribution: 'Hindi-Urdu proverb, widely used in Pahari speech',
    glossary: {
      '𑚑𑚩𑚭𑚝𑚶': { roman: 'jahaan', meaning: 'Where' },
      '𑚏𑚭𑚩𑚶': { roman: 'chaah', meaning: 'Desire, will' },
      '𑚦𑚩𑚭𑚝𑚶': { roman: 'vahaan', meaning: 'There' },
      '𑚤𑚭𑚩𑚶': { roman: 'raah', meaning: 'Path, way' },
    },
  },
  {
    id: 'folk-ek-raaja',
    title: 'Once Upon a Time',
    titleTakri: '𑚆𑚊𑚶 𑚛𑚮𑚝𑚶',
    category: 'folk',
    difficulty: 'intermediate',
    language: 'dogri',
    takri: '𑚆𑚊𑚶 𑚛𑚮𑚝𑚶 𑚆𑚊𑚶 𑚤𑚭𑚑 𑚚𑚭।',
    roman: 'ek din ek raaja thaa.',
    devanagari: 'एक दिन एक राजा था।',
    translation: 'One day there was a king. (Opening of a folk tale)',
    attribution: 'Traditional story opening',
    glossary: {
      '𑚆𑚊𑚶': { roman: 'ek', meaning: 'One' },
      '𑚛𑚮𑚝𑚶': { roman: 'din', meaning: 'Day' },
      '𑚤𑚭𑚑': { roman: 'raaja', meaning: 'King' },
      '𑚚𑚭': { roman: 'thaa', meaning: 'Was (past tense)' },
    },
  },
  {
    id: 'folk-pahaadi-boli',
    title: 'Language of the Hills',
    titleTakri: '𑚞𑚩𑚭𑚛𑚮 𑚠𑚴𑚥𑚮',
    category: 'folk',
    difficulty: 'intermediate',
    language: 'kangri',
    takri: '𑚞𑚩𑚭𑚛𑚮 𑚠𑚴𑚥𑚮।',
    roman: 'pahaadi boli.',
    devanagari: 'पहाड़ी बोली।',
    translation: 'The language of the hills.',
    attribution: 'Kangri / Pahari cultural phrase',
    glossary: {
      '𑚞𑚩𑚭𑚛𑚮': { roman: 'pahaadi', meaning: 'Of the mountains, hill-dwelling' },
      '𑚠𑚴𑚥𑚮': { roman: 'boli', meaning: 'Speech, dialect' },
    },
  },
  {
    id: 'folk-dogri-zindabad',
    title: 'Long Live Dogri',
    titleTakri: '𑚛𑚴𑚌𑚭𑚤𑚯 𑚑𑚷𑚮𑚝𑚶𑚛𑚠𑚭𑚛𑚶',
    category: 'folk',
    difficulty: 'intermediate',
    language: 'dogri',
    takri: '𑚛𑚴𑚌𑚶𑚤𑚮 𑚑𑚷𑚮𑚝𑚶𑚛𑚠𑚭𑚛𑚶।',
    roman: 'dogri zindabaad.',
    devanagari: 'दोगरी ज़िन्दाबाद।',
    translation: 'Long live Dogri!',
    attribution: 'Cultural slogan',
    glossary: {
      '𑚛𑚴𑚌𑚶𑚤𑚮': { roman: 'dogri', meaning: 'Dogri language and identity' },
      '𑚑𑚷𑚮𑚝𑚶𑚛𑚠𑚭𑚛𑚶': { roman: 'zindabaad', meaning: 'Long live! (Urdu-origin cheer)' },
    },
  },
  {
    id: 'proverb-kaam-karo',
    title: 'Work Speaks',
    titleTakri: '𑚊𑚭𑚢𑚶 𑚊𑚭𑚢𑚶',
    category: 'proverbs',
    difficulty: 'intermediate',
    language: 'dogri',
    takri: '𑚊𑚭𑚢𑚶 𑚊𑚭𑚢𑚶, 𑚜𑚭𑚝𑚭 𑚊𑚭𑚢𑚶।',
    roman: 'kaam kaam, daana kaam.',
    devanagari: 'काम काम, दाना काम।',
    translation: 'Work is worship — deeds matter more than words.',
    attribution: 'Dogri proverb on diligence',
    glossary: {
      '𑚊𑚭𑚢𑚶': { roman: 'kaam', meaning: 'Work, deed, labour' },
      '𑚜𑚭𑚝𑚭': { roman: 'daana', meaning: 'Charity, giving' },
    },
  },
  {
    id: 'folk-bas-dogri',
    title: 'Speak Only Dogri',
    titleTakri: '𑚡𑚭𑚨𑚭 𑚛𑚴𑚌𑚭𑚤𑚯',
    category: 'folk',
    difficulty: 'intermediate',
    language: 'dogri',
    takri: '𑚡𑚭𑚨𑚭 𑚛𑚴𑚌𑚭𑚤𑚯 𑚡𑚴𑚥𑚮।',
    roman: 'bhaashaa dogriya boli.',
    devanagari: 'भाषा दोगरीय बोली।',
    translation: 'The language is Dogri speech.',
    attribution: 'Cultural phrase encouraging mother-tongue use',
    glossary: {
      '𑚡𑚭𑚨𑚭': { roman: 'bhaashaa', meaning: 'Language' },
      '𑚛𑚴𑚌𑚭𑚤𑚯': { roman: 'dogriya', meaning: 'Of Dogri, Dogri-style' },
      '𑚡𑚴𑚥𑚮': { roman: 'boli', meaning: 'Speech, spoken word' },
    },
  },
  {
    id: 'practice-mitra',
    title: 'Friend, Friend, Friend',
    titleTakri: '𑚢𑚮𑚙𑚶𑚤𑚭',
    category: 'practice',
    difficulty: 'intermediate',
    language: 'general',
    takri: '𑚢𑚮𑚙𑚶𑚤𑚭, 𑚢𑚮𑚙𑚶𑚤𑚭, 𑚢𑚮𑚙𑚶𑚤𑚭।',
    roman: 'mitraa, mitraa, mitraa.',
    devanagari: 'मित्रा, मित्रा, मित्रा।',
    translation: 'Friend, friend, friend. (Repetition practice)',
    attribution: 'Writing practice — repeated conjuncts',
    glossary: {
      '𑚢𑚮𑚙𑚶𑚤𑚭': { roman: 'mitraa', meaning: 'Friend (Sanskrit-origin, used in formal speech)' },
    },
  },
];

export function getSampleById(id) {
  return SAMPLE_TEXTS.find((sample) => sample.id === id) ?? null;
}

export function filterSamples({
  category = 'all',
  difficulty = 'all',
  language = 'all',
  search = '',
} = {}) {
  const query = search.trim().toLowerCase();

  return SAMPLE_TEXTS.filter((sample) => {
    if (category !== 'all' && sample.category !== category) return false;
    if (difficulty !== 'all' && sample.difficulty !== difficulty) return false;
    if (language !== 'all' && sample.language !== language) return false;
    if (!query) return true;

    const haystack = [
      sample.title,
      sample.titleTakri,
      sample.roman,
      sample.translation,
      sample.attribution,
      sample.language,
      sample.category,
      ...Object.values(sample.glossary ?? {}).flatMap((entry) => [entry.roman, entry.meaning]),
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();

    return haystack.includes(query);
  });
}

export function groupSamplesByCategory(samples) {
  const groups = SAMPLE_CATEGORIES.filter((cat) => cat.id !== 'all').map((cat) => ({
    ...cat,
    samples: samples.filter((sample) => sample.category === cat.id),
  }));

  return groups.filter((group) => group.samples.length > 0);
}

export function getFeaturedSamples() {
  return FEATURED_SAMPLE_IDS
    .map((id) => getSampleById(id))
    .filter(Boolean);
}

export function getGlossaryEntries(sample) {
  if (!sample?.glossary) return [];

  return Object.entries(sample.glossary).map(([takri, entry]) => ({
    takri,
    roman: entry.roman ?? '',
    devanagari: entry.devanagari ?? '',
    meaning: entry.meaning ?? '',
  }));
}

export function getCategoryLabel(categoryId) {
  return SAMPLE_CATEGORIES.find((cat) => cat.id === categoryId)?.label ?? categoryId;
}
