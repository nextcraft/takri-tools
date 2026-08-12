import { useState, useMemo, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { motion, AnimatePresence } from 'framer-motion';
import { REFERENCE_SECTIONS, ALL_REFERENCE_CHARS } from '../data/takri-mappings';
import { showToast } from '../lib/script-utils';
import { saveReaderImport, savePracticeSheetsImport } from '../lib/tool-bridge';
import { TAKRI_SNAP_FORMAL_NAME } from '../data/takri-snap';
import './CharacterReference.css';

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

function matchesSearch(char, query) {
  const q = query.toLowerCase().trim();
  if (!q) return true;
  const fields = [
    char.takri,
    char.devanagari,
    char.roman,
    char.name,
    char.code,
    char.code?.replace('U+', ''),
  ].filter(Boolean);
  return fields.some(f => f.toLowerCase().includes(q));
}

function normalizeCodeParam(param) {
  if (!param) return null;
  const cleaned = param.trim().toUpperCase().replace(/^U\+?/, '');
  return cleaned ? `U+${cleaned}` : null;
}

function findCharByCodeParam(param) {
  const normalized = normalizeCodeParam(param);
  if (!normalized) return null;
  return ALL_REFERENCE_CHARS.find(c => c.code?.toUpperCase() === normalized) ?? null;
}

function CharacterCard({ char, onClick }) {
  return (
    <button type="button" className="ref-char-card" onClick={() => onClick(char)}>
      <span className="ref-char-takri">{char.takri}</span>
      {char.devanagari && (
        <span className="ref-char-dev">{char.devanagari}</span>
      )}
      <span className="ref-char-label">{char.roman || char.name}</span>
      {char.code && <span className="ref-char-code">{char.code}</span>}
    </button>
  );
}

function DetailPanel({ char, onClose }) {
  const navigate = useNavigate();

  const handleCopy = useCallback(async (text, label) => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      showToast(`Copied ${label}`);
    } catch {
      showToast('Copy failed');
    }
  }, []);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const handleReadInReader = useCallback(() => {
    saveReaderImport({ takri: char.takri, title: char.name });
    navigate('/reader');
    onClose();
  }, [char.takri, char.name, navigate, onClose]);

  const handlePracticeCharacter = useCallback(() => {
    if (!char.sectionId) {
      showToast('No practice group for this character');
      return;
    }
    savePracticeSheetsImport({
      groupIds: [char.sectionId],
      title: char.name,
    });
    navigate('/practice-sheets');
    onClose();
  }, [char.sectionId, char.name, navigate, onClose]);

  const handleTrainGlyph = useCallback(() => {
    const params = char.sectionId ? `?group=${char.sectionId}` : '';
    navigate(`/trainer${params}`);
    onClose();
  }, [char.sectionId, navigate, onClose]);

  return (
    <motion.div
      className="ref-detail-backdrop"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="ref-detail-panel"
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 16, scale: 0.97 }}
        transition={{ duration: 0.25 }}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="ref-detail-title"
      >
        <button type="button" className="ref-detail-close" onClick={onClose} aria-label="Close">
          ×
        </button>

        <div className="ref-detail-glyphs">
          <span className="ref-detail-takri">{char.takri}</span>
          {char.devanagari && (
            <span className="ref-detail-dev">{char.devanagari}</span>
          )}
        </div>

        <h2 id="ref-detail-title" className="ref-detail-name">{char.name}</h2>
        <p className="ref-detail-section">{char.sectionLabel}</p>

        <dl className="ref-detail-meta">
          {char.roman && (
            <>
              <dt>Roman</dt>
              <dd>{char.roman}</dd>
            </>
          )}
          {char.code && (
            <>
              <dt>Unicode</dt>
              <dd className="ref-detail-unicode">{char.code}</dd>
            </>
          )}
        </dl>

        <div className="ref-detail-actions">
          <button type="button" className="ref-copy-btn" onClick={() => handleCopy(char.takri, 'Takri')}>
            Copy Takri
          </button>
          {char.devanagari && (
            <button type="button" className="ref-copy-btn" onClick={() => handleCopy(char.devanagari, 'Devanagari')}>
              Copy Devanagari
            </button>
          )}
          {char.code && (
            <button type="button" className="ref-copy-btn" onClick={() => handleCopy(char.code, 'Unicode')}>
              Copy Unicode
            </button>
          )}
        </div>

        <div className="ref-detail-connect">
          <button type="button" className="ref-connect-btn" onClick={handleReadInReader}>
            Read in Reader
          </button>
          {char.sectionId && (
            <button type="button" className="ref-connect-btn" onClick={handlePracticeCharacter}>
              Practice this character
            </button>
          )}
          <button type="button" className="ref-connect-btn" onClick={handleTrainGlyph}>
            Train in {TAKRI_SNAP_FORMAL_NAME}
          </button>
        </div>

        <a
          className="ref-unicode-link"
          href="https://www.unicode.org/charts/PDF/U11680.pdf"
          target="_blank"
          rel="noopener noreferrer"
        >
          View official Unicode chart →
        </a>
      </motion.div>
    </motion.div>
  );
}

export default function CharacterReference() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [selectedCharOverride, setSelectedCharOverride] = useState(null);

  const charParam = searchParams.get('char');

  const selectedCharFromUrl = useMemo(
    () => (charParam ? findCharByCodeParam(charParam) : null),
    [charParam],
  );

  const selectedChar = selectedCharFromUrl ?? selectedCharOverride;

  useEffect(() => {
    if (!charParam) return;
    if (selectedCharFromUrl) return;
    showToast('Character not found');
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.delete('char');
      return next;
    }, { replace: true });
  }, [charParam, selectedCharFromUrl, setSearchParams]);

  const openChar = useCallback((char) => {
    setSelectedCharOverride(null);
    if (char.code) {
      const code = char.code.replace(/^U\+/i, '');
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        next.set('char', code);
        return next;
      });
    } else {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        next.delete('char');
        return next;
      }, { replace: true });
      setSelectedCharOverride(char);
    }
  }, [setSearchParams]);

  const closeChar = useCallback(() => {
    setSelectedCharOverride(null);
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.delete('char');
      return next;
    }, { replace: true });
  }, [setSearchParams]);

  const filteredChars = useMemo(
    () => ALL_REFERENCE_CHARS.filter(c => matchesSearch(c, search)),
    [search],
  );

  const visibleSections = useMemo(() => {
    if (activeTab === 'all') {
      return REFERENCE_SECTIONS.map(section => ({
        ...section,
        chars: section.chars.filter(c =>
          filteredChars.some(fc => fc.takri === c.takri && fc.code === c.code),
        ),
      })).filter(s => s.chars.length > 0);
    }
    const section = REFERENCE_SECTIONS.find(s => s.id === activeTab);
    if (!section) return [];
    return [{
      ...section,
      chars: section.chars.filter(c =>
        filteredChars.some(fc => fc.takri === c.takri && fc.code === c.code),
      ),
    }].filter(s => s.chars.length > 0);
  }, [activeTab, filteredChars]);

  const totalVisible = visibleSections.reduce((n, s) => n + s.chars.length, 0);

  return (
    <motion.div
      className="ref-page"
      initial="hidden"
      animate="visible"
      variants={fadeIn}
    >
      <div className="ref-container">
        <header className="ref-header">
          <h1>𑚦𑚤𑚶𑚘 𑚨𑚫𑚛𑚤𑚶𑚡 · Character Reference</h1>
          <p>Browse the complete Takri Unicode block (U+11680–U+116CF) with Devanagari equivalents</p>
        </header>

        <div className="ref-search-wrapper">
          <input
            type="search"
            className="ref-search"
            placeholder="Search by Roman, Devanagari, Takri, name, or Unicode (e.g. ka, क, 1168A)…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            spellCheck="false"
            autoComplete="off"
          />
          {search && (
            <span className="ref-search-count">
              {totalVisible} match{totalVisible !== 1 ? 'es' : ''}
            </span>
          )}
        </div>

        <div className="ref-tabs" role="tablist">
          <button
            type="button"
            role="tab"
            className={`ref-tab ${activeTab === 'all' ? 'active' : ''}`}
            onClick={() => setActiveTab('all')}
            aria-selected={activeTab === 'all'}
          >
            All
          </button>
          {REFERENCE_SECTIONS.map(section => (
            <button
              key={section.id}
              type="button"
              role="tab"
              className={`ref-tab ${activeTab === section.id ? 'active' : ''}`}
              onClick={() => setActiveTab(section.id)}
              aria-selected={activeTab === section.id}
            >
              {section.label}
            </button>
          ))}
        </div>

        <div className="ref-content">
          {totalVisible === 0 ? (
            <p className="ref-empty">No characters match your search.</p>
          ) : (
            visibleSections.map(section => (
              <section key={section.id} className="ref-section">
                {activeTab === 'all' && (
                  <h2 className="ref-section-title">{section.label}</h2>
                )}
                <div className="ref-grid">
                  {section.chars.map(char => (
                    <CharacterCard
                      key={`${char.code || char.takri}-${char.name}`}
                      char={{ ...char, sectionLabel: section.label }}
                      onClick={openChar}
                    />
                  ))}
                </div>
              </section>
            ))
          )}
        </div>

        <footer className="ref-footer">
          <p>
            Unicode block U+11680–U+116CF · Takri glyphs rendered with{' '}
            <a href="https://fonts.google.com/noto/specimen/Noto+Sans+Takri" target="_blank" rel="noopener noreferrer">
              Noto Sans Takri
            </a>
          </p>
        </footer>
      </div>

      <AnimatePresence>
        {selectedChar && (
          <DetailPanel char={selectedChar} onClose={closeChar} />
        )}
      </AnimatePresence>
    </motion.div>
  );
}
