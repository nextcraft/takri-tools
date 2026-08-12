import { useMemo } from 'react';
import { useNavigate } from 'react-router';
import { motion } from 'framer-motion';
import { getWeakGlyphs } from '../lib/glyph-trainer';
import { TAKRI_SNAP_FORMAL_NAME } from '../data/takri-snap';
import { savePracticeSheetsImport } from '../lib/tool-bridge';
import './TrainerResults.css';

export default function TrainerResults({
  summary,
  stats,
  sessionMisses,
  onPlayAgain,
  onLobby,
}) {
  const navigate = useNavigate();

  const weakGlyphs = useMemo(() => {
    const fromSession = sessionMisses.filter(
      (g, i, arr) => arr.findIndex((x) => x.takri === g.takri) === i
    );
    if (fromSession.length) return fromSession.slice(0, 8);
    return getWeakGlyphs(stats, 2, 8);
  }, [sessionMisses, stats]);

  const handlePracticeGroups = () => {
    const groupIds = [...new Set(weakGlyphs.map((g) => g.sectionId).filter(Boolean))];
    if (!groupIds.length) return;
    savePracticeSheetsImport({ groupIds, title: `${TAKRI_SNAP_FORMAL_NAME} review` });
    navigate('/practice-sheets');
  };

  const handleOpenChar = (glyph) => {
    const code = glyph.code?.replace(/^U\+/i, '');
    if (code) navigate(`/character-reference?char=${code}`);
  };

  if (!summary) return null;

  return (
    <motion.div
      className="trainer-results"
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <h2 className="trainer-results-title">Round complete!</h2>

      <div className="trainer-results-stats">
        <div className="trainer-stat-card trainer-stat-card--hero">
          <span className="trainer-stat-value">{summary.score}</span>
          <span className="trainer-stat-label">Score</span>
        </div>
        <div className="trainer-stat-card">
          <span className="trainer-stat-value">{summary.accuracy}%</span>
          <span className="trainer-stat-label">Accuracy</span>
        </div>
        <div className="trainer-stat-card">
          <span className="trainer-stat-value">{summary.streak}</span>
          <span className="trainer-stat-label">Best streak</span>
        </div>
        <div className="trainer-stat-card">
          <span className="trainer-stat-value">{summary.correct}/{summary.total}</span>
          <span className="trainer-stat-label">Correct</span>
        </div>
      </div>

      {stats.bestBlitzScore > 0 && summary.mode === 'blitz' && (
        <p className="trainer-results-record">
          All-time best Blitz: <strong>{stats.bestBlitzScore}</strong>
          {stats.bestStreak > 0 && (
            <> · Best streak: <strong>{stats.bestStreak}</strong></>
          )}
        </p>
      )}

      {weakGlyphs.length > 0 && (
        <div className="trainer-weak-section">
          <h3>Glyphs to review</h3>
          <ul className="trainer-weak-list">
            {weakGlyphs.map((g) => (
              <li key={g.takri || g.code}>
                <button
                  type="button"
                  className="trainer-weak-item"
                  onClick={() => handleOpenChar(g)}
                >
                  <span className="trainer-weak-takri">{g.takri}</span>
                  <span className="trainer-weak-dev">{g.devanagari}</span>
                  <span className="trainer-weak-roman">{g.roman}</span>
                </button>
              </li>
            ))}
          </ul>
          <button
            type="button"
            className="trainer-btn trainer-btn--secondary"
            onClick={handlePracticeGroups}
          >
            Practice missed groups →
          </button>
        </div>
      )}

      <div className="trainer-results-actions">
        <button type="button" className="trainer-btn trainer-btn--primary" onClick={onPlayAgain}>
          Again! 🔁
        </button>
        <button type="button" className="trainer-btn trainer-btn--ghost" onClick={onLobby}>
          Change deck
        </button>
      </div>
    </motion.div>
  );
}
