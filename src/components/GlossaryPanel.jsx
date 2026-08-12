import { getGlossaryEntries } from '../data/sample-texts';

function findWordIdByTakri(lines, takriKey) {
  const keyBase = takriKey.replace(/[।,.!?]/g, '');

  for (const line of lines) {
    for (const word of line.words) {
      const wordBase = word.takri.replace(/[।,.!?]/g, '');
      if (wordBase === keyBase || wordBase.includes(keyBase) || keyBase.includes(wordBase)) {
        return word.id;
      }
    }
  }

  return null;
}

export default function GlossaryPanel({ sample, lines, selectedWordId, onSelectWord }) {
  if (!sample) return null;

  const entries = getGlossaryEntries(sample);
  if (entries.length === 0) return null;

  return (
    <aside className="tr-glossary-panel">
      <div className="tr-glossary-header">
        <h3>Glossary</h3>
        <span className="tr-glossary-count">{entries.length} words</span>
      </div>
      <ul className="tr-glossary-list">
        {entries.map((entry) => {
          const wordId = findWordIdByTakri(lines, entry.takri);
          const isActive = wordId && selectedWordId === wordId;

          return (
            <li key={entry.takri}>
              <button
                type="button"
                className={`tr-glossary-item ${isActive ? 'active' : ''}`}
                onClick={() => wordId && onSelectWord(wordId)}
                disabled={!wordId}
              >
                <span className="tr-glossary-takri">{entry.takri}</span>
                <span className="tr-glossary-readings">
                  {entry.devanagari && <span className="tr-glossary-dev">{entry.devanagari}</span>}
                  <span className="tr-glossary-roman">{entry.roman}</span>
                </span>
                {entry.meaning && <span className="tr-glossary-meaning">{entry.meaning}</span>}
              </button>
            </li>
          );
        })}
      </ul>
    </aside>
  );
}
