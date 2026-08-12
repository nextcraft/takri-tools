import {
  VOWELS,
  NUMERALS,
  VOWEL_SIGNS,
  SPECIAL_CONSONANTS,
  REFERENCE_SECTIONS,
} from '../data/takri-mappings';

export const STATS_STORAGE_KEY = 'takri-glyph-trainer-v1';

export const MATCH_RATE = 0.55;
export const BASE_SCORE = 10;
export const BLITZ_START_SECONDS = 45;
export const MAX_CLOCK_SECONDS = 60;
export const TIME_BONUS_INTERVAL = 5;
export const TIME_BONUS_SECONDS = 3;
export const STREAK_MULTIPLIER_STEP = 3;
export const CARD_QUEUE_SIZE = 8;

export const GAME_MODES = [
  { id: 'blitz', label: 'Blitz', desc: '45 seconds — streaks earn bonus time' },
  { id: 'flow', label: 'Flow', desc: 'No clock — end when you want' },
];

export const PLAY_STYLES = [
  {
    id: 'swipe',
    label: 'Swipe',
    desc: 'Takri vs claimed pair — fling right if they match',
  },
  {
    id: 'pick',
    label: 'Pick',
    desc: 'Devanagari or Roman in the middle — tap the matching Takri',
  },
];

export const CLAIM_SCRIPTS = [
  { id: 'devanagari', label: 'Devanagari' },
  { id: 'roman', label: 'Roman' },
];

/** Deck presets aligned with Practice Sheets groups */
const CONSONANT_GROUP_IDS = [
  'ka-row', 'ca-row', 'tta-row', 'ta-row', 'pa-row', 'semi-vowels', 'sibilants',
];

export const DECK_PRESETS = [
  { id: 'core', label: 'Core letters', groupIds: ['vowels', ...CONSONANT_GROUP_IDS] },
  { id: 'vowels', label: 'Vowels only', groupIds: ['vowels'] },
  { id: 'consonants', label: 'All consonants', groupIds: CONSONANT_GROUP_IDS },
  { id: 'numerals', label: 'Numerals', groupIds: ['numerals'] },
];

export const ADVANCED_GROUP_IDS = ['vowel-signs', 'special'];

function mulberry32(seed) {
  let t = seed >>> 0;
  return () => {
    t += 0x6D2B79F5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

function charKey(char) {
  return char.code || char.takri;
}

function getClaimText(char, script) {
  if (script === 'roman') return char.roman || char.name || '';
  return char.devanagari || '';
}

function buildCharPool(groupIds, includeAdvanced) {
  const ids = new Set(groupIds);
  if (includeAdvanced) {
    ADVANCED_GROUP_IDS.forEach((id) => ids.add(id));
  }

  const pool = [];

  const withSection = (chars, sectionId) =>
    chars.map((c) => ({ ...c, sectionId }));

  if (ids.has('vowels')) pool.push(...withSection(VOWELS, 'vowels'));
  if (ids.has('vowel-signs')) pool.push(...withSection(VOWEL_SIGNS, 'vowel-signs'));
  if (ids.has('special')) pool.push(...withSection(SPECIAL_CONSONANTS, 'special'));

  for (const section of REFERENCE_SECTIONS) {
    if (ids.has(section.id) && section.chars?.length) {
      if (['vowels', 'vowel-signs', 'special', 'signs', 'symbols', 'numerals'].includes(section.id)) {
        continue;
      }
      pool.push(...withSection(section.chars, section.id));
    }
  }

  if (ids.has('numerals')) {
    pool.push(...withSection(NUMERALS.map((n) => ({
      ...n,
      roman: String(n.value),
      name: `Digit ${n.value}`,
    })), 'numerals'));
  }

  const seen = new Set();
  return pool.filter((char) => {
    const key = charKey(char);
    if (!char.takri || !getClaimText(char, 'devanagari') || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function getTrainableChars({ groupIds, includeAdvanced = false }) {
  return buildCharPool(groupIds, includeAdvanced);
}

function pickDistractor(promptChar, pool, rng) {
  const sameSection = pool.filter(
    (c) => c.sectionId === promptChar.sectionId && charKey(c) !== charKey(promptChar)
  );
  const candidates = sameSection.length > 1 ? sameSection : pool.filter((c) => charKey(c) !== charKey(promptChar));
  if (!candidates.length) return promptChar;
  return candidates[Math.floor(rng() * candidates.length)];
}

export function nextCard(pool, rng = Math.random) {
  if (!pool.length) return null;

  const promptChar = pool[Math.floor(rng() * pool.length)];
  const isMatch = rng() < MATCH_RATE;
  const claimChar = isMatch ? promptChar : pickDistractor(promptChar, pool, rng);

  return {
    id: `${charKey(promptChar)}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    kind: 'swipe',
    promptChar,
    claimChar,
    isMatch,
    correctClaim: getClaimText(promptChar, 'devanagari'),
    correctRoman: promptChar.roman || promptChar.name || '',
  };
}

export function nextPickRound(pool, rng = Math.random) {
  if (pool.length < 2) return null;

  const answerChar = pool[Math.floor(rng() * pool.length)];
  let distractor = pickDistractor(answerChar, pool, rng);
  if (charKey(distractor) === charKey(answerChar)) {
    distractor = pool.find((c) => charKey(c) !== charKey(answerChar)) ?? answerChar;
  }

  const correctOnLeft = rng() < 0.5;

  return {
    id: `pick-${charKey(answerChar)}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    kind: 'pick',
    answerChar,
    leftChar: correctOnLeft ? answerChar : distractor,
    rightChar: correctOnLeft ? distractor : answerChar,
    correctSide: correctOnLeft ? 'left' : 'right',
  };
}

export function fillPickQueue(pool, size = CARD_QUEUE_SIZE, seed = Date.now()) {
  const rng = mulberry32(seed);
  const queue = [];
  for (let i = 0; i < size; i += 1) {
    const round = nextPickRound(pool, rng);
    if (round) queue.push(round);
  }
  return queue;
}

export function gradePick(round, side) {
  const correct = side === round.correctSide;
  return { correct, side };
}

export function getPromptForPickRound(round, script) {
  return getClaimText(round.answerChar, script);
}

export function isPickRound(round) {
  return round?.kind === 'pick';
}

export function isSwipeRound(round) {
  return round?.kind === 'swipe';
}

export function fillCardQueue(pool, size = CARD_QUEUE_SIZE, seed = Date.now()) {
  const rng = mulberry32(seed);
  const queue = [];
  for (let i = 0; i < size; i += 1) {
    const card = nextCard(pool, rng);
    if (card) queue.push(card);
  }
  return queue;
}

export function getStreakMultiplier(streak) {
  return 1 + Math.floor(streak / STREAK_MULTIPLIER_STEP);
}

export function scoreCorrect(streak) {
  return BASE_SCORE * getStreakMultiplier(streak);
}

export function shouldGrantTimeBonus(streak) {
  return streak > 0 && streak % TIME_BONUS_INTERVAL === 0;
}

export function applyTimeBonus(currentSeconds) {
  return Math.min(MAX_CLOCK_SECONDS, currentSeconds + TIME_BONUS_SECONDS);
}

export function gradeSwipe(card, direction) {
  const swipedMatch = direction === 'match';
  const correct = swipedMatch === card.isMatch;
  return { correct, swipedMatch };
}

export function getClaimForCard(card, script) {
  if (script === 'roman') {
    return card.claimChar.roman || card.claimChar.name || '';
  }
  return card.claimChar.devanagari || '';
}

export function getStreakMilestone(streak) {
  if ([3, 5, 8, 12].includes(streak)) return streak;
  return null;
}

export function defaultStats() {
  return {
    version: 1,
    bestBlitzScore: 0,
    bestStreak: 0,
    gamesPlayed: 0,
    glyphs: {},
  };
}

export function loadStats() {
  try {
    const raw = localStorage.getItem(STATS_STORAGE_KEY);
    if (!raw) return defaultStats();
    const parsed = JSON.parse(raw);
    if (parsed?.version !== 1) return defaultStats();
    return { ...defaultStats(), ...parsed, glyphs: parsed.glyphs || {} };
  } catch {
    return defaultStats();
  }
}

export function saveStats(stats) {
  localStorage.setItem(STATS_STORAGE_KEY, JSON.stringify(stats));
}

export function recordGlyphResult(stats, char, correct) {
  const key = charKey(char);
  const entry = stats.glyphs[key] || {
    takri: char.takri,
    devanagari: char.devanagari,
    roman: char.roman || char.name,
    code: char.code,
    sectionId: char.sectionId,
    seen: 0,
    hits: 0,
    misses: 0,
  };
  entry.seen += 1;
  if (correct) entry.hits += 1;
  else entry.misses += 1;
  stats.glyphs[key] = entry;
  return stats;
}

export function getWeakGlyphs(stats, minSeen = 2, limit = 8) {
  return Object.values(stats.glyphs)
    .filter((g) => g.seen >= minSeen && g.misses > 0)
    .map((g) => ({
      ...g,
      missRate: g.misses / g.seen,
    }))
    .sort((a, b) => b.missRate - a.missRate || b.misses - a.misses)
    .slice(0, limit);
}

export function summarizeRound({ score, streak, correct, total, mode }) {
  const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0;
  return { score, streak, correct, total, accuracy, mode };
}
