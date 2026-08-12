import { useRef, useEffect, useCallback, useState } from 'react';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import './SwipeCard.css';

const SWIPE_THRESHOLD = 120;
const VELOCITY_THRESHOLD = 500;
const EXIT_X = 340;

export default function SwipeCard({
  card,
  claimText,
  claimScript,
  isTop,
  isLocked,
  lastResult,
  onSwipe,
  reduceMotion = false,
}) {
  const x = useMotionValue(0);
  const committedRef = useRef(false);
  const [isExiting, setIsExiting] = useState(false);
  const rotate = useTransform(x, [-200, 0, 200], [-12, 0, 12]);

  useEffect(() => {
    committedRef.current = false;
    x.set(0);
  }, [card?.id, x]);

  const flyOut = useCallback((decision) => {
    if (committedRef.current) return;
    committedRef.current = true;
    setIsExiting(true);

    const exitX = decision === 'match' ? EXIT_X : -EXIT_X;

    if (reduceMotion) {
      onSwipe(decision);
      return;
    }

    onSwipe(decision);
    animate(x, exitX, {
      duration: 0.24,
      ease: [0.32, 0.72, 0, 1],
    });
  }, [onSwipe, reduceMotion, x]);

  const handleDragEnd = useCallback((_, info) => {
    if (!isTop || isLocked || committedRef.current) return;

    const offset = info.offset.x;
    const velocity = info.velocity.x;

    if (offset > SWIPE_THRESHOLD || velocity > VELOCITY_THRESHOLD) {
      flyOut('match');
    } else if (offset < -SWIPE_THRESHOLD || velocity < -VELOCITY_THRESHOLD) {
      flyOut('nope');
    } else {
      animate(x, 0, { type: 'spring', stiffness: 400, damping: 30 });
    }
  }, [isTop, isLocked, flyOut, x]);

  if (!card) return null;

  const resultClass = lastResult === 'correct'
    ? 'swipe-card--correct'
    : lastResult === 'wrong'
      ? 'swipe-card--wrong'
      : '';

  const canDrag = isTop && !isLocked && !isExiting && !reduceMotion;

  return (
    <motion.div
      className={`swipe-card ${isTop ? 'swipe-card--top' : 'swipe-card--behind'} ${resultClass}`}
      style={isTop && !reduceMotion ? { x, rotate } : undefined}
      drag={canDrag ? 'x' : false}
      dragMomentum={false}
      dragElastic={0.9}
      dragConstraints={{ left: 0, right: 0 }}
      onDragEnd={handleDragEnd}
      initial={false}
      animate={
        isTop
          ? { scale: 1, y: 0, opacity: 1 }
          : { scale: 0.94, y: 14, opacity: 0.88, rotate: -2 }
      }
      transition={{ type: 'spring', stiffness: 320, damping: 26 }}
    >
      <div className="swipe-card-sparkle swipe-card-sparkle--a" aria-hidden>✦</div>
      <div className="swipe-card-sparkle swipe-card-sparkle--b" aria-hidden>★</div>

      <div className="swipe-card-body">
        <div className="swipe-card-prompt">
          <span className="swipe-card-prompt-tag">Takri</span>
          <span className="swipe-card-takri">{card.promptChar.takri}</span>
          {card.promptChar.name && (
            <span className="swipe-card-name">{card.promptChar.name}</span>
          )}
        </div>

        <div className="swipe-card-divider" aria-hidden>
          <span className="swipe-card-divider-line" />
          <span className="swipe-card-vs">vs</span>
          <span className="swipe-card-divider-line" />
        </div>

        <div className="swipe-card-claim">
          <span className="swipe-card-claim-label">
            {claimScript === 'roman' ? 'Roman claim' : 'Devanagari claim'}
          </span>
          <span
            className={
              claimScript === 'roman'
                ? 'swipe-card-claim-text'
                : 'swipe-card-claim-text swipe-card-claim-text--dev'
            }
          >
            {claimText}
          </span>
        </div>
      </div>
    </motion.div>
  );
}
