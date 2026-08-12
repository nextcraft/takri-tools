import { Link, useNavigate } from 'react-router';
import { motion } from 'framer-motion';
import { getGraphemeLinks, saveCopyStudioImport } from '../lib/tool-bridge';

export default function WordDetailPanel({ word, onClose, onCopy, onOpenCopyStudio }) {
  const navigate = useNavigate();
  const graphemeLinks = getGraphemeLinks(word.takri);

  const handleOpenWordInCopyStudio = () => {
    saveCopyStudioImport({
      roman: word.roman ?? '',
      takri: word.takri,
      title: word.roman || word.takri,
      source: 'reader-word',
    });
    navigate('/copy-studio');
  };

  return (
    <motion.div
      className="tr-word-popup"
      initial={{ opacity: 0, y: 8, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 4, scale: 0.98 }}
      transition={{ duration: 0.18 }}
    >
      <button type="button" className="tr-popup-close" onClick={onClose} aria-label="Close">
        ×
      </button>
      <div className="tr-popup-takri">{word.takri}</div>
      <div className="tr-popup-readings">
        {word.devanagari && <span className="tr-popup-dev">{word.devanagari}</span>}
        {word.roman && <span className="tr-popup-roman">{word.roman}</span>}
      </div>
      {word.meaning && <p className="tr-popup-meaning">{word.meaning}</p>}

      {graphemeLinks.length > 0 && (
        <div className="tr-grapheme-row">
          <span className="tr-grapheme-label">Characters</span>
          <div className="tr-grapheme-chips">
            {graphemeLinks.map((item) => (
              item.code ? (
                <Link
                  key={`${item.grapheme}-${item.code}`}
                  to={`/character-reference?char=${item.code}`}
                  className="tr-grapheme-chip"
                  title={item.name ?? item.roman ?? item.grapheme}
                >
                  {item.grapheme}
                </Link>
              ) : (
                <span key={item.grapheme} className="tr-grapheme-chip tr-grapheme-chip--static">
                  {item.grapheme}
                </span>
              )
            ))}
          </div>
        </div>
      )}

      <div className="tr-popup-actions">
        <button type="button" className="tr-popup-btn" onClick={() => onCopy(word.takri, 'Takri')}>
          Copy Takri
        </button>
        {word.devanagari && (
          <button type="button" className="tr-popup-btn" onClick={() => onCopy(word.devanagari, 'Devanagari')}>
            Copy Devanagari
          </button>
        )}
        {word.roman && (
          <button type="button" className="tr-popup-btn" onClick={() => onCopy(word.roman, 'Roman')}>
            Copy Roman
          </button>
        )}
        <button type="button" className="tr-popup-btn" onClick={handleOpenWordInCopyStudio}>
          Edit in Copy Studio
        </button>
        {onOpenCopyStudio && (
          <button type="button" className="tr-popup-btn tr-popup-btn--ghost" onClick={onOpenCopyStudio}>
            Full text in Copy Studio
          </button>
        )}
      </div>
    </motion.div>
  );
}
