import { useState, useCallback, useRef, useEffect } from 'react';
import {
  BLITZ_START_SECONDS,
  CARD_QUEUE_SIZE,
  DECK_PRESETS,
  fillCardQueue,
  fillPickQueue,
  getClaimForCard,
  getStreakMilestone,
  getTrainableChars,
  gradeSwipe,
  gradePick,
  loadStats,
  recordGlyphResult,
  saveStats,
  scoreCorrect,
  shouldGrantTimeBonus,
  applyTimeBonus,
  summarizeRound,
} from '../lib/glyph-trainer';
import { showToast } from '../lib/script-utils';

const STREAK_MESSAGES = {
  3: 'Nice streak!',
  5: 'On fire!',
  8: 'Unstoppable!',
  12: 'Legendary!',
};

export default function useGlyphTrainer() {
  const [phase, setPhase] = useState('lobby');
  const [gameMode, setGameMode] = useState('blitz');
  const [playStyle, setPlayStyle] = useState('swipe');
  const [claimScript, setClaimScript] = useState('devanagari');
  const [deckPreset, setDeckPreset] = useState('core');
  const [includeAdvanced, setIncludeAdvanced] = useState(false);

  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreakRun, setBestStreakRun] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [timeLeft, setTimeLeft] = useState(BLITZ_START_SECONDS);
  const [cardQueue, setCardQueue] = useState([]);
  const [currentCard, setCurrentCard] = useState(null);
  const [isLocked, setIsLocked] = useState(false);
  const [lastResult, setLastResult] = useState(null);
  const [lastPickSide, setLastPickSide] = useState(null);
  const [roundSummary, setRoundSummary] = useState(null);
  const [stats, setStats] = useState(() => loadStats());

  const poolRef = useRef([]);
  const playStyleRef = useRef('swipe');
  const seedRef = useRef(0);
  const timerRef = useRef(null);
  const endRoundRef = useRef(() => {});
  const roundRef = useRef({ score: 0, correctCount: 0, totalCount: 0, bestStreakRun: 0, gameMode: 'blitz' });

  useEffect(() => {
    roundRef.current = { score, correctCount, totalCount, bestStreakRun, gameMode };
  }, [score, correctCount, totalCount, bestStreakRun, gameMode]);

  const activePreset = DECK_PRESETS.find((p) => p.id === deckPreset) || DECK_PRESETS[0];

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const endRound = useCallback(() => {
    clearTimer();
    setPhase('results');
    setIsLocked(true);

    const { score: s, correctCount: c, totalCount: t, bestStreakRun: b, gameMode: m } = roundRef.current;

    const summary = summarizeRound({
      score: s,
      streak: b,
      correct: c,
      total: t,
      mode: m,
    });

    setStats((prev) => {
      const next = {
        ...prev,
        gamesPlayed: prev.gamesPlayed + 1,
        bestBlitzScore: m === 'blitz' ? Math.max(prev.bestBlitzScore, s) : prev.bestBlitzScore,
        bestStreak: Math.max(prev.bestStreak, b),
      };
      saveStats(next);
      return next;
    });

    setRoundSummary(summary);
  }, [clearTimer]);

  useEffect(() => {
    endRoundRef.current = endRound;
  }, [endRound]);

  const fillQueue = useCallback((pool, size, seed) => {
    if (playStyleRef.current === 'pick') {
      return fillPickQueue(pool, size, seed);
    }
    return fillCardQueue(pool, size, seed);
  }, []);

  const refillQueue = useCallback((pool, existing = []) => {
    const needed = CARD_QUEUE_SIZE - existing.length;
    if (needed <= 0) return existing;
    const fresh = fillQueue(pool, needed, seedRef.current++);
    return [...existing, ...fresh];
  }, [fillQueue]);

  const startRound = useCallback(() => {
    const pool = getTrainableChars({
      groupIds: activePreset.groupIds,
      includeAdvanced,
    });

    if (pool.length < 4) {
      showToast('Need at least 4 characters in deck');
      return;
    }

    poolRef.current = pool;
    playStyleRef.current = playStyle;
    seedRef.current = Date.now();
    clearTimer();

    const queue = fillQueue(pool, CARD_QUEUE_SIZE, seedRef.current++);
    const [first, ...rest] = queue;

    setScore(0);
    setStreak(0);
    setBestStreakRun(0);
    setCorrectCount(0);
    setTotalCount(0);
    setTimeLeft(BLITZ_START_SECONDS);
    setCardQueue(rest);
    setCurrentCard(first);
    setLastResult(null);
    setLastPickSide(null);
    setRoundSummary(null);
    setIsLocked(false);
    setPhase('playing');

    if (gameMode === 'blitz') {
      timerRef.current = setInterval(() => {
        setTimeLeft((t) => {
          if (t <= 1) {
            clearTimer();
            queueMicrotask(() => endRoundRef.current());
            return 0;
          }
          return t - 1;
        });
      }, 1000);
    }
  }, [activePreset.groupIds, includeAdvanced, gameMode, playStyle, clearTimer, fillQueue]);

  useEffect(() => () => clearTimer(), [clearTimer]);

  const advanceCard = useCallback(() => {
    setCardQueue((prev) => {
      let queue = prev;
      if (queue.length < 3) {
        queue = refillQueue(poolRef.current, queue);
      }
      const [next, ...rest] = queue.length ? queue : refillQueue(poolRef.current, []);
      setCurrentCard(next || null);
      return rest;
    });
  }, [refillQueue]);

  const processAnswer = useCallback((correct, glyphChar) => {
    setIsLocked(true);
    setLastResult(correct ? 'correct' : 'wrong');
    setTotalCount((n) => n + 1);

    setStats((prev) => {
      const next = recordGlyphResult(prev, glyphChar, correct);
      saveStats(next);
      return next;
    });

    if (correct) {
      setCorrectCount((n) => n + 1);
      setStreak((s) => {
        const newStreak = s + 1;
        setBestStreakRun((best) => Math.max(best, newStreak));
        setScore((sc) => sc + scoreCorrect(newStreak));

        const milestone = getStreakMilestone(newStreak);
        if (milestone && STREAK_MESSAGES[milestone]) {
          showToast(STREAK_MESSAGES[milestone]);
        }

        if (gameMode === 'blitz' && shouldGrantTimeBonus(newStreak)) {
          setTimeLeft((t) => applyTimeBonus(t));
          showToast('+3 seconds!');
        }

        return newStreak;
      });
    } else {
      setStreak(0);
    }

    setTimeout(() => {
      setLastResult(null);
      setLastPickSide(null);
      advanceCard();
      setIsLocked(false);
    }, 280);

    return { correct };
  }, [gameMode, advanceCard]);

  const commitSwipe = useCallback((direction) => {
    if (phase !== 'playing' || isLocked || !currentCard || currentCard.kind !== 'swipe') {
      return null;
    }

    const { correct } = gradeSwipe(currentCard, direction);
    return processAnswer(correct, currentCard.promptChar);
  }, [phase, isLocked, currentCard, processAnswer]);

  const commitPick = useCallback((side) => {
    if (phase !== 'playing' || isLocked || !currentCard || currentCard.kind !== 'pick') {
      return null;
    }

    setLastPickSide(side);
    const { correct } = gradePick(currentCard, side);
    return processAnswer(correct, currentCard.answerChar);
  }, [phase, isLocked, currentCard, processAnswer]);

  const endFlowRound = useCallback(() => {
    if (phase === 'playing' && gameMode === 'flow') {
      endRound();
    }
  }, [phase, gameMode, endRound]);

  const backToLobby = useCallback(() => {
    clearTimer();
    setPhase('lobby');
    setIsLocked(false);
    setCurrentCard(null);
    setCardQueue([]);
    setLastPickSide(null);
  }, [clearTimer]);

  const applyLobbyFromParams = useCallback((groupId) => {
    if (!groupId) return;
    const preset = DECK_PRESETS.find((p) => p.groupIds.includes(groupId));
    if (preset) setDeckPreset(preset.id);
    else if (groupId === 'vowel-signs' || groupId === 'special') {
      setIncludeAdvanced(true);
    }
  }, []);

  return {
    phase,
    gameMode,
    setGameMode,
    playStyle,
    setPlayStyle,
    claimScript,
    setClaimScript,
    deckPreset,
    setDeckPreset,
    includeAdvanced,
    setIncludeAdvanced,
    activePreset,
    score,
    streak,
    bestStreakRun,
    correctCount,
    totalCount,
    timeLeft,
    currentCard,
    cardQueue,
    isLocked,
    lastResult,
    lastPickSide,
    roundSummary,
    stats,
    getClaim: (card) => getClaimForCard(card, claimScript),
    startRound,
    commitSwipe,
    commitPick,
    endFlowRound,
    backToLobby,
    applyLobbyFromParams,
  };
}
