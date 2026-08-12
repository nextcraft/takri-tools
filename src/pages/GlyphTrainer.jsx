import { useEffect, useCallback, useState } from 'react';
import { useSearchParams } from 'react-router';
import { motion } from 'framer-motion';
import useGlyphTrainer from '../hooks/useGlyphTrainer';
import SwipeCard from '../components/SwipeCard';
import PickRound from '../components/PickRound';
import TrainerResults from '../components/TrainerResults';
import {
  DECK_PRESETS,
  GAME_MODES,
  PLAY_STYLES,
  CLAIM_SCRIPTS,
  BLITZ_START_SECONDS,
} from '../lib/glyph-trainer';
import {
  TAKRI_SNAP_FORMAL_NAME,
  TAKRI_SNAP_TITLE_TAKRI,
  TAKRI_SNAP_TAGLINE,
} from '../data/takri-snap';
import './GlyphTrainer.css';

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

function formatTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export default function GlyphTrainer() {
  const [searchParams] = useSearchParams();
  const trainer = useGlyphTrainer();
  const [sessionMisses, setSessionMisses] = useState([]);
  const [reduceMotion] = useState(
    () => typeof window !== 'undefined'
      && window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  );

  const {
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
    score,
    streak,
    timeLeft,
    currentCard,
    cardQueue,
    isLocked,
    lastResult,
    lastPickSide,
    roundSummary,
    stats,
    getClaim,
    startRound,
    commitSwipe,
    commitPick,
    endFlowRound,
    backToLobby,
    applyLobbyFromParams,
  } = trainer;

  useEffect(() => {
    const group = searchParams.get('group');
    applyLobbyFromParams(group);
  }, [searchParams, applyLobbyFromParams]);

  const handleSwipe = useCallback((direction) => {
    const result = commitSwipe(direction);
    if (result && !result.correct && currentCard?.kind === 'swipe') {
      setSessionMisses((prev) => [...prev, {
        takri: currentCard.promptChar.takri,
        devanagari: currentCard.promptChar.devanagari,
        roman: currentCard.promptChar.roman || currentCard.promptChar.name,
        code: currentCard.promptChar.code,
        sectionId: currentCard.promptChar.sectionId,
      }]);
    }
  }, [commitSwipe, currentCard]);

  const handlePick = useCallback((side) => {
    if (isLocked || !currentCard) return;
    const result = commitPick(side);
    if (result && !result.correct && currentCard?.kind === 'pick') {
      setSessionMisses((prev) => [...prev, {
        takri: currentCard.answerChar.takri,
        devanagari: currentCard.answerChar.devanagari,
        roman: currentCard.answerChar.roman || currentCard.answerChar.name,
        code: currentCard.answerChar.code,
        sectionId: currentCard.answerChar.sectionId,
      }]);
    }
  }, [isLocked, currentCard, commitPick]);

  const handleButtonSwipe = useCallback((direction) => {
    if (isLocked || !currentCard) return;
    handleSwipe(direction);
  }, [isLocked, currentCard, handleSwipe]);

  useEffect(() => {
    if (phase !== 'playing') return undefined;

    const onKey = (e) => {
      if (isLocked) return;

      if (playStyle === 'pick') {
        if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
          e.preventDefault();
          handlePick('left');
        } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
          e.preventDefault();
          handlePick('right');
        }
        return;
      }

      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        e.preventDefault();
        handleButtonSwipe('nope');
      } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        e.preventDefault();
        handleButtonSwipe('match');
      }
    };

    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [phase, isLocked, handleButtonSwipe, playStyle, handlePick]);

  const handleStart = () => {
    setSessionMisses([]);
    startRound();
  };

  const timerPercent = gameMode === 'blitz'
    ? (timeLeft / BLITZ_START_SECONDS) * 100
    : 100;

  return (
    <motion.div
      className="trainer-page"
      initial="hidden"
      animate="visible"
      variants={fadeIn}
    >
      <div className="trainer-bg-blobs" aria-hidden>
        <span className="trainer-blob trainer-blob--1" />
        <span className="trainer-blob trainer-blob--2" />
        <span className="trainer-blob trainer-blob--3" />
      </div>

      <div className={`trainer-container ${playStyle === 'pick' ? 'trainer-container--pick' : ''}`}>
        <header className="trainer-header">
          <span className="trainer-badge">Arcade mode</span>
          <h1 className="trainer-title-takri" lang="und-Takr">
            {TAKRI_SNAP_TITLE_TAKRI}
          </h1>
          <p className="trainer-tagline">{TAKRI_SNAP_TAGLINE}</p>
          <p className="trainer-title-english">{TAKRI_SNAP_FORMAL_NAME}</p>
        </header>

        {phase === 'lobby' && (
          <div className="trainer-lobby">
            <div className="trainer-lobby-card">
              <p className="trainer-howto">
                {playStyle === 'pick' ? (
                  <>
                    A <strong>Devanagari and Roman</strong> pair appears in the center.
                    Tap the <strong>matching Takri</strong> on the left or right.
                  </>
                ) : (
                  <>
                    Each card pits a Takri letter against a claimed pair.
                    Fling <strong>right</strong> if they&apos;re a real match (YEP!),{' '}
                    <strong>left</strong> if it&apos;s a fake (NAH).
                  </>
                )}
              </p>

              <div className="trainer-config">
                <div className="trainer-config-section">
                  <h3>Play style</h3>
                  <div className="trainer-pills">
                    {PLAY_STYLES.map((style) => (
                      <button
                        key={style.id}
                        type="button"
                        className={`trainer-pill ${playStyle === style.id ? 'trainer-pill--active' : ''}`}
                        onClick={() => setPlayStyle(style.id)}
                      >
                        <span className="trainer-pill-label">{style.label}</span>
                        <span className="trainer-pill-desc">{style.desc}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="trainer-config-section">
                  <h3>Timer</h3>
                  <div className="trainer-pills">
                    {GAME_MODES.map((mode) => (
                      <button
                        key={mode.id}
                        type="button"
                        className={`trainer-pill ${gameMode === mode.id ? 'trainer-pill--active' : ''}`}
                        onClick={() => setGameMode(mode.id)}
                      >
                        <span className="trainer-pill-label">{mode.label}</span>
                        <span className="trainer-pill-desc">{mode.desc}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {playStyle === 'swipe' && (
                <div className="trainer-config-section">
                  <h3>Claim script</h3>
                  <div className="trainer-chip-row">
                    {CLAIM_SCRIPTS.map((s) => (
                      <button
                        key={s.id}
                        type="button"
                        className={`trainer-chip ${claimScript === s.id ? 'trainer-chip--active' : ''}`}
                        onClick={() => setClaimScript(s.id)}
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                </div>
                )}

                <div className="trainer-config-section">
                  <h3>Deck</h3>
                  <div className="trainer-chip-row trainer-chip-row--wrap">
                    {DECK_PRESETS.map((preset) => (
                      <button
                        key={preset.id}
                        type="button"
                        className={`trainer-chip ${deckPreset === preset.id ? 'trainer-chip--active' : ''}`}
                        onClick={() => setDeckPreset(preset.id)}
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                  <label className="trainer-checkbox">
                    <input
                      type="checkbox"
                      checked={includeAdvanced}
                      onChange={(e) => setIncludeAdvanced(e.target.checked)}
                    />
                    Include vowel signs &amp; special consonants
                  </label>
                </div>
              </div>

              {stats.gamesPlayed > 0 && (
                <p className="trainer-lobby-stats">
                  {stats.gamesPlayed} games played
                  {stats.bestBlitzScore > 0 && (
                    <> · Best Blitz: <strong>{stats.bestBlitzScore}</strong></>
                  )}
                </p>
              )}

              <button type="button" className="trainer-btn trainer-btn--primary trainer-start-btn" onClick={handleStart}>
                Let&apos;s go 🎮
              </button>
            </div>
          </div>
        )}

        {phase === 'playing' && (
          <div className="trainer-round">
            <div className="trainer-hud">
              <div className="trainer-hud-stat">
                <span className="trainer-hud-value">{score}</span>
                <span className="trainer-hud-label">Score</span>
              </div>
              <div className="trainer-hud-stat">
                <span className="trainer-hud-value trainer-hud-streak">
                  {streak > 0 ? `×${1 + Math.floor(streak / 3)}` : '—'}
                </span>
                <span className="trainer-hud-label">Streak {streak > 0 ? `(${streak})` : ''}</span>
              </div>
              {gameMode === 'blitz' ? (
                <div className="trainer-hud-stat trainer-hud-timer">
                  <span className={`trainer-hud-value ${timeLeft <= 10 ? 'trainer-hud-value--urgent' : ''}`}>
                    {formatTime(timeLeft)}
                  </span>
                  <span className="trainer-hud-label">Time</span>
                </div>
              ) : (
                <button
                  type="button"
                  className="trainer-end-btn"
                  onClick={endFlowRound}
                >
                  End round
                </button>
              )}
            </div>

            {gameMode === 'blitz' && (
              <div className="trainer-timer-bar">
                <div
                  className="trainer-timer-fill"
                  style={{ width: `${Math.min(100, timerPercent)}%` }}
                />
              </div>
            )}

            {playStyle === 'pick' ? (
              currentCard?.kind === 'pick' && (
                <PickRound
                  round={currentCard}
                  isLocked={isLocked}
                  lastResult={lastResult}
                  lastPickSide={lastPickSide}
                  onPick={handlePick}
                />
              )
            ) : (
              <>
                <div className="trainer-stack">
                  {cardQueue[0]?.kind === 'swipe' && (
                    <SwipeCard
                      key={cardQueue[0].id}
                      card={cardQueue[0]}
                      claimText={getClaim(cardQueue[0])}
                      claimScript={claimScript}
                      isTop={false}
                      isLocked
                      lastResult={null}
                      onSwipe={() => {}}
                      reduceMotion={reduceMotion}
                    />
                  )}
                  {currentCard?.kind === 'swipe' && (
                    <SwipeCard
                      key={currentCard.id}
                      card={currentCard}
                      claimText={getClaim(currentCard)}
                      claimScript={claimScript}
                      isTop
                      isLocked={isLocked}
                      lastResult={lastResult}
                      onSwipe={handleSwipe}
                      reduceMotion={reduceMotion}
                    />
                  )}
                </div>

                <div className="trainer-swipe-legend">
                  <span className="trainer-legend-nah">← NAH</span>
                  <span className="trainer-legend-yep">YEP →</span>
                </div>

                <div className="trainer-actions">
                  <button
                    type="button"
                    className="trainer-action-btn trainer-action-btn--nope"
                    onClick={() => handleButtonSwipe('nope')}
                    disabled={isLocked}
                    aria-label="NAH — fake pair"
                  >
                    <span className="trainer-action-emoji">✕</span>
                    <span className="trainer-action-label">NAH</span>
                  </button>
                  <button
                    type="button"
                    className="trainer-action-btn trainer-action-btn--match"
                    onClick={() => handleButtonSwipe('match')}
                    disabled={isLocked}
                    aria-label="YEP — they match"
                  >
                    <span className="trainer-action-emoji">♥</span>
                    <span className="trainer-action-label">YEP</span>
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        {phase === 'results' && (
          <TrainerResults
            summary={roundSummary}
            stats={stats}
            sessionMisses={sessionMisses}
            onPlayAgain={handleStart}
            onLobby={backToLobby}
          />
        )}
      </div>
    </motion.div>
  );
}
