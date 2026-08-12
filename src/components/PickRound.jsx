import { motion } from 'framer-motion';
import './PickRound.css';

export default function PickRound({
  round,
  isLocked,
  lastResult,
  lastPickSide,
  onPick,
}) {
  if (!round || round.kind !== 'pick') return null;

  const { answerChar } = round;
  const romanLabel = answerChar.roman || answerChar.name || '';

  const sideClass = (side) => {
    if (!lastResult) return '';
    if (side === round.correctSide) return 'pick-choice--correct';
    if (side === lastPickSide && lastResult === 'wrong') return 'pick-choice--wrong';
    return '';
  };

  return (
    <div className="pick-round">
      <motion.button
        type="button"
        className={`pick-choice pick-choice--side ${sideClass('left')}`}
        onClick={() => onPick('left')}
        disabled={isLocked}
        aria-label={`Choose left Takri${round.leftChar.name ? `: ${round.leftChar.name}` : ''}`}
        key={`${round.id}-left`}
        initial={{ opacity: 0, x: -12 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.2 }}
      >
        <span className="pick-choice-glyph">{round.leftChar.takri}</span>
      </motion.button>

      <motion.div
        className="pick-prompt-card"
        key={`${round.id}-prompt`}
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.22 }}
      >
        <span className="pick-prompt-label">Match this</span>
        {answerChar.devanagari && (
          <span className="pick-prompt-text pick-prompt-text--dev">
            {answerChar.devanagari}
          </span>
        )}
        {romanLabel && (
          <span className="pick-prompt-roman">{romanLabel}</span>
        )}
      </motion.div>

      <motion.button
        type="button"
        className={`pick-choice pick-choice--side ${sideClass('right')}`}
        onClick={() => onPick('right')}
        disabled={isLocked}
        aria-label={`Choose right Takri${round.rightChar.name ? `: ${round.rightChar.name}` : ''}`}
        key={`${round.id}-right`}
        initial={{ opacity: 0, x: 12 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.2 }}
      >
        <span className="pick-choice-glyph">{round.rightChar.takri}</span>
      </motion.button>
    </div>
  );
}
