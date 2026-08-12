import { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  SAMPLE_CATEGORIES,
  SAMPLE_DIFFICULTIES,
  SAMPLE_LANGUAGES,
  filterSamples,
  groupSamplesByCategory,
} from '../data/sample-texts';

function SampleCard({ sample, isActive, onSelect }) {
  const preview = sample.takri.replace(/\n/g, ' ').slice(0, 48);

  return (
    <button
      type="button"
      className={`tr-sample-card ${isActive ? 'active' : ''}`}
      onClick={() => onSelect(sample)}
    >
      <span className="tr-sample-takri">{sample.titleTakri}</span>
      <span className="tr-sample-title">{sample.title}</span>
      {sample.translation && (
        <span className="tr-sample-preview">{sample.translation}</span>
      )}
      <span className="tr-sample-snippet">{preview}{sample.takri.length > 48 ? '…' : ''}</span>
      <span className="tr-sample-meta">
        <span className={`tr-badge tr-badge--${sample.difficulty}`}>{sample.difficulty}</span>
        <span className="tr-badge">{sample.language}</span>
      </span>
    </button>
  );
}

export default function SampleLibrary({
  open,
  onClose,
  activeSampleId,
  categoryFilter,
  difficultyFilter,
  languageFilter,
  searchQuery,
  onCategoryChange,
  onDifficultyChange,
  onLanguageChange,
  onSearchChange,
  onSelectSample,
  pasteOpen,
  onTogglePaste,
  pasteDraft,
  onPasteDraftChange,
  onPasteSubmit,
  onPasteClear,
}) {
  const filteredSamples = useMemo(
    () => filterSamples({
      category: categoryFilter,
      difficulty: difficultyFilter,
      language: languageFilter,
      search: searchQuery,
    }),
    [categoryFilter, difficultyFilter, languageFilter, searchQuery],
  );

  const groupedSamples = useMemo(
    () => groupSamplesByCategory(filteredSamples),
    [filteredSamples],
  );

  const showGrouped = categoryFilter === 'all' && !searchQuery.trim();

  return (
    <aside className={`tr-library ${open ? 'tr-library--open' : ''}`}>
      <div className="tr-library-header">
        <div>
          <h2>Library</h2>
          <p className="tr-library-count">{filteredSamples.length} texts</p>
        </div>
        <button
          type="button"
          className="tr-library-toggle"
          onClick={onClose}
          aria-label="Close library"
        >
          ‹
        </button>
      </div>

      <div className="tr-library-actions">
        <button
          type="button"
          className={`tr-paste-btn ${pasteOpen ? 'active' : ''}`}
          onClick={onTogglePaste}
        >
          Paste your own
        </button>
      </div>

      <AnimatePresence>
        {pasteOpen && (
          <motion.div
            className="tr-paste-panel"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <textarea
              className="tr-paste-input"
              placeholder="Paste Takri text here…"
              value={pasteDraft}
              onChange={(e) => onPasteDraftChange(e.target.value)}
              spellCheck={false}
            />
            <div className="tr-paste-actions">
              <button type="button" className="tr-btn tr-btn--primary" onClick={onPasteSubmit}>
                Read
              </button>
              <button type="button" className="tr-btn" onClick={onPasteClear}>
                Clear
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="tr-library-filters">
        <input
          type="search"
          className="tr-search"
          placeholder="Search titles, meanings, Roman…"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
        />

        <div className="tr-filter-pills" role="tablist" aria-label="Category">
          {SAMPLE_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              type="button"
              role="tab"
              aria-selected={categoryFilter === cat.id}
              className={`tr-pill ${categoryFilter === cat.id ? 'active' : ''}`}
              onClick={() => onCategoryChange(cat.id)}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <div className="tr-filter-row">
          <select
            className="tr-select"
            value={difficultyFilter}
            onChange={(e) => onDifficultyChange(e.target.value)}
            aria-label="Filter by difficulty"
          >
            {SAMPLE_DIFFICULTIES.map((level) => (
              <option key={level.id} value={level.id}>{level.label}</option>
            ))}
          </select>
          <select
            className="tr-select"
            value={languageFilter}
            onChange={(e) => onLanguageChange(e.target.value)}
            aria-label="Filter by language"
          >
            {SAMPLE_LANGUAGES.map((lang) => (
              <option key={lang.id} value={lang.id}>{lang.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="tr-sample-list">
        {filteredSamples.length === 0 ? (
          <p className="tr-empty-hint">No texts match your filters.</p>
        ) : showGrouped ? (
          groupedSamples.map((group) => (
            <section key={group.id} className="tr-sample-group">
              <h3 className="tr-sample-group-title">{group.label}</h3>
              <div className="tr-sample-group-list">
                {group.samples.map((sample) => (
                  <SampleCard
                    key={sample.id}
                    sample={sample}
                    isActive={activeSampleId === sample.id}
                    onSelect={onSelectSample}
                  />
                ))}
              </div>
            </section>
          ))
        ) : (
          filteredSamples.map((sample) => (
            <SampleCard
              key={sample.id}
              sample={sample}
              isActive={activeSampleId === sample.id}
              onSelect={onSelectSample}
            />
          ))
        )}
      </div>
    </aside>
  );
}
