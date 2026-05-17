import { useState, useRef, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { TRANSLITERATOR_MAPPINGS } from '../data/takri-mappings';
import './Transliterator.css';

// ============================================================
// Offline Transliteration Engine (from original app.js)
// ============================================================

class OfflineTransliterator {
  constructor() {
    this.tokens = this._buildTokenList();
  }

  _buildTokenList() {
    const rom = TRANSLITERATOR_MAPPINGS.roman;
    const tokens = [];

    rom.consonants.forEach((r, i) => {
      tokens.push({ roman: r, type: 'consonant', index: i });
    });
    rom.persoarabic.forEach((r, i) => {
      tokens.push({ roman: r, type: 'persoarabic', index: i });
    });
    rom.south.forEach((r, i) => {
      tokens.push({ roman: r, type: 'south', index: i });
    });
    rom.vowels.forEach((r, i) => {
      tokens.push({ roman: r, type: 'vowel', index: i });
    });
    tokens.push({ roman: rom.ayogavaha.anusvara, type: 'anusvara', index: 0 });
    tokens.push({ roman: rom.ayogavaha.visarga, type: 'visarga', index: 0 });
    tokens.push({ roman: rom.symbols.om, type: 'om', index: 0 });
    tokens.push({ roman: rom.symbols.doubleDanda, type: 'doubleDanda', index: 0 });
    tokens.push({ roman: rom.symbols.danda, type: 'danda', index: 0 });
    tokens.push({ roman: rom.symbols.avagraha, type: 'avagraha', index: 0 });

    tokens.sort((a, b) => b.roman.length - a.roman.length);
    return tokens;
  }

  tokenize(input) {
    const result = [];
    let pos = 0;
    const lower = input.toLowerCase();

    while (pos < lower.length) {
      let matched = false;

      for (const token of this.tokens) {
        if (lower.startsWith(token.roman, pos)) {
          const endPos = pos + token.roman.length;

          if (token.type === 'consonant' || token.type === 'persoarabic' || token.type === 'south') {
            const rest = lower.slice(endPos);
            let vowelSign = null;
            let vowelLen = 0;

            for (const vt of this.tokens) {
              if (vt.type === 'vowel' && vt.index > 0 && rest.startsWith(vt.roman)) {
                if (!vowelSign || vt.roman.length > vowelLen) {
                  vowelSign = vt;
                  vowelLen = vt.roman.length;
                }
              }
            }

            if (vowelSign) {
              result.push(token);
              result.push({ ...vowelSign, type: 'vowelSign', index: vowelSign.index - 1 });
              pos = endPos + vowelLen;
            } else if (rest.startsWith('a') && !rest.startsWith('aa') && !rest.startsWith('ai') && !rest.startsWith('au') && !rest.startsWith('a;')) {
              result.push(token);
              pos = endPos + 1;
            } else {
              const isEndOrNonAlpha = rest.length === 0 || /^[^a-z;']/.test(rest) || rest.startsWith(' ');
              let nextIsConsonant = false;
              for (const nt of this.tokens) {
                if ((nt.type === 'consonant' || nt.type === 'persoarabic' || nt.type === 'south') && rest.startsWith(nt.roman)) {
                  nextIsConsonant = true;
                  break;
                }
              }
              const nextIsAyogavaha = rest.startsWith(TRANSLITERATOR_MAPPINGS.roman.ayogavaha.anusvara) ||
                                     rest.startsWith(TRANSLITERATOR_MAPPINGS.roman.ayogavaha.visarga);

              if (nextIsConsonant) {
                result.push(token);
                result.push({ type: 'virama', index: 0 });
                pos = endPos;
              } else if (isEndOrNonAlpha) {
                result.push(token);
                result.push({ type: 'virama', index: 0 });
                pos = endPos;
              } else if (nextIsAyogavaha) {
                result.push(token);
                pos = endPos;
              } else {
                result.push(token);
                pos = endPos;
              }
            }
          } else {
            result.push(token);
            pos = endPos;
          }
          matched = true;
          break;
        }
      }

      if (!matched) {
        result.push({ type: 'passthrough', char: input[pos] });
        pos++;
      }
    }

    return result;
  }

  render(tokens, script) {
    const map = TRANSLITERATOR_MAPPINGS[script];
    let output = '';

    for (const token of tokens) {
      switch (token.type) {
        case 'consonant': output += map.consonants[token.index]; break;
        case 'persoarabic': output += map.persoarabic[token.index]; break;
        case 'south': output += map.south[token.index]; break;
        case 'vowel': output += map.vowels[token.index]; break;
        case 'vowelSign': output += map.vowelSigns[token.index]; break;
        case 'virama': output += map.virama; break;
        case 'anusvara': output += map.anusvara; break;
        case 'visarga': output += map.visarga; break;
        case 'om': output += map.symbols.om; break;
        case 'danda': output += map.symbols.danda; break;
        case 'doubleDanda': output += map.symbols.doubleDanda; break;
        case 'avagraha': output += map.symbols.avagraha; break;
        case 'passthrough':
          if (/[0-9]/.test(token.char) && map.numerals) {
            output += map.numerals[parseInt(token.char)];
          } else {
            output += token.char;
          }
          break;
        default: break;
      }
    }
    return output;
  }

  transliterate(input, script) {
    if (!input.trim()) return '';
    const tokens = this.tokenize(input);
    return this.render(tokens, script);
  }
}

// ============================================================
// API Transliteration
// ============================================================

const API_BASE = 'https://aksharamukha.appspot.com/api/public';

async function apiTransliterate(text, targetScript) {
  const target = targetScript === 'devanagari' ? 'Devanagari' : 'Takri';
  const url = `${API_BASE}?source=RomanReadable&target=${target}&text=${encodeURIComponent(text)}`;
  const response = await fetch(url);
  if (!response.ok) throw new Error(`API error: ${response.status}`);
  return await response.text();
}

// ============================================================
// Utility
// ============================================================

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function showToast(message) {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2500);
}

// ============================================================
// Reference chart data
// ============================================================

function buildRefGroups() {
  const M = TRANSLITERATOR_MAPPINGS;
  return [
    {
      title: 'Vowels',
      items: M.roman.vowels.map((r, i) => ({
        roman: r, dev: M.devanagari.vowels[i], tak: M.takri.vowels[i],
      })),
    },
    ...['Velars (क-row)', 'Palatals (च-row)', 'Retroflex (ट-row)', 'Dental (त-row)', 'Labial (प-row)'].map((title, gi) => ({
      title: `Consonants — ${title}`,
      items: M.roman.consonants.slice(gi * 5, gi * 5 + 5).map((r, i) => ({
        roman: r + 'a',
        dev: M.devanagari.consonants[gi * 5 + i],
        tak: M.takri.consonants[gi * 5 + i],
      })),
    })),
    {
      title: 'Semi-vowels & Sibilants',
      items: M.roman.consonants.slice(25).map((r, i) => ({
        roman: r + 'a',
        dev: M.devanagari.consonants[25 + i],
        tak: M.takri.consonants[25 + i],
      })),
    },
    {
      title: 'Signs & Symbols',
      items: [
        { roman: "m'", dev: M.devanagari.anusvara, tak: M.takri.anusvara },
        { roman: "h'", dev: M.devanagari.visarga, tak: M.takri.visarga },
        { roman: '.', dev: M.devanagari.symbols.danda, tak: M.takri.symbols.danda },
        { roman: '..', dev: M.devanagari.symbols.doubleDanda, tak: M.takri.symbols.doubleDanda },
        { roman: "oom'", dev: M.devanagari.symbols.om, tak: M.takri.symbols.om },
      ],
    },
  ];
}

// ============================================================
// React Component
// ============================================================

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export default function Transliterator() {
  const [input, setInput] = useState('');
  const [devOutput, setDevOutput] = useState('');
  const [takOutput, setTakOutput] = useState('');
  const [mode, setMode] = useState('api');
  const [status, setStatus] = useState('ready');
  const [refOpen, setRefOpen] = useState(false);
  const engineRef = useRef(null);
  const debounceRef = useRef(null);

  // Init engine once
  useEffect(() => {
    engineRef.current = new OfflineTransliterator();
  }, []);

  const doOffline = useCallback((text) => {
    if (!engineRef.current) return;
    try {
      setDevOutput(engineRef.current.transliterate(text, 'devanagari'));
      setTakOutput(engineRef.current.transliterate(text, 'takri'));
      if (mode === 'offline') setStatus('offline');
    } catch (e) {
      console.error('Offline error:', e);
    }
  }, [mode]);

  const doAPI = useCallback(async (text) => {
    setStatus('loading');
    try {
      const [dev, tak] = await Promise.all([
        apiTransliterate(text, 'devanagari'),
        apiTransliterate(text, 'takri'),
      ]);
      setDevOutput(dev);
      setTakOutput(tak);
      setStatus('online');
    } catch (e) {
      console.error('API error:', e);
      setStatus('error');
    }
  }, []);

  const handleInput = useCallback((text) => {
    setInput(text);
    clearTimeout(debounceRef.current);

    if (!text.trim()) {
      setDevOutput('');
      setTakOutput('');
      return;
    }

    doOffline(text);

    if (mode === 'api') {
      debounceRef.current = setTimeout(() => doAPI(text), 350);
    }
  }, [mode, doOffline, doAPI]);

  const handleModeChange = (newMode) => {
    setMode(newMode);
    setStatus('ready');
    if (input.trim()) {
      if (newMode === 'offline') {
        doOffline(input);
      } else {
        doOffline(input);
        doAPI(input);
      }
    }
  };

  const handleCopy = async (script) => {
    const text = script === 'devanagari' ? devOutput : takOutput;
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      showToast(`${script === 'devanagari' ? 'Devanagari' : 'Takri'} text copied to clipboard`);
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
    }
  };

  const statusDotClass = status === 'offline' ? 'offline' : status === 'error' ? 'error' : '';
  const statusLabel = {
    ready: mode === 'api' ? 'API mode — ready' : 'Offline mode — ready',
    online: 'API — connected',
    offline: 'Offline engine — active',
    loading: 'Fetching from API…',
    error: 'API error — using offline fallback',
  }[status] || '';

  const refGroups = buildRefGroups();

  return (
    <motion.div
      className="transliterator-page"
      initial="hidden"
      animate="visible"
      variants={fadeIn}
    >
      <div className="transliterator-container">
        {/* Header */}
        <header className="trans-header">
          <h1>𑚔𑚭𑚊𑚤𑚯 · Takri Transliterator</h1>
          <p>Type in Roman → see Devanagari & Takri side by side</p>
        </header>

        {/* Mode Toggle */}
        <div className="mode-toggle-wrapper">
          <button
            className={`mode-btn ${mode === 'api' ? 'active' : ''}`}
            onClick={() => handleModeChange('api')}
          >
            ⚡ API Mode
          </button>
          <button
            className={`mode-btn ${mode === 'offline' ? 'active' : ''}`}
            onClick={() => handleModeChange('offline')}
          >
            📴 Offline Mode
          </button>
        </div>

        {/* Status */}
        <div className="mode-indicator">
          <span className={`status-dot ${statusDotClass}`} />
          <span>{statusLabel}</span>
        </div>

        {/* Input */}
        <section className="input-section">
          <label htmlFor="roman-input">Roman Input (Aksharamukha Readable)</label>
          <textarea
            id="roman-input"
            className="input-area"
            placeholder="Type here… e.g. namaste bhaarata"
            autoComplete="off"
            spellCheck="false"
            value={input}
            onChange={(e) => handleInput(e.target.value)}
          />
        </section>

        {/* Output Grid */}
        <div className="output-grid">
          {/* Devanagari */}
          <div className="output-panel devanagari">
            <div className="panel-header">
              <div className="panel-title">
                <span className="script-dot" />
                Devanagari
              </div>
              <button className="copy-btn" onClick={() => handleCopy('devanagari')} title="Copy Devanagari text">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                </svg>
                <span className="copy-label">Copy</span>
              </button>
            </div>
            <div className="panel-body devanagari-body">
              {devOutput || <span className="placeholder-text">Devanagari output will appear here…</span>}
            </div>
          </div>

          {/* Takri */}
          <div className="output-panel takri">
            <div className="panel-header">
              <div className="panel-title">
                <span className="script-dot" />
                Takri
              </div>
              <button className="copy-btn" onClick={() => handleCopy('takri')} title="Copy Takri text">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                </svg>
                <span className="copy-label">Copy</span>
              </button>
            </div>
            <div className="panel-body takri-body">
              {takOutput || <span className="placeholder-text">Takri output will appear here…</span>}
            </div>
          </div>
        </div>

        {/* Reference Chart */}
        <section className="reference-section">
          <button className="reference-toggle" onClick={() => setRefOpen(!refOpen)}>
            <span className={`chevron ${refOpen ? 'open' : ''}`}>▼</span>
            <span>Keyboard Mapping Reference</span>
          </button>
          {refOpen && (
            <motion.div
              className="reference-chart"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              {refGroups.map((group) => (
                <div key={group.title} className="chart-group">
                  <div className="chart-group-title">{group.title}</div>
                  <div className="chart-grid">
                    {group.items.map((item, i) => (
                      <div key={i} className="chart-cell">
                        <span className="roman">{escapeHtml(item.roman)}</span>
                        <span className="scripts">
                          <span className="dev">{item.dev}</span>
                          <span className="tak">{item.tak}</span>
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </motion.div>
          )}
        </section>

        {/* Footer */}
        <footer className="trans-footer">
          <p>
            Transliteration powered by{' '}
            <a href="https://aksharamukha.appspot.com/" target="_blank" rel="noopener">Aksharamukha</a>
            {' · '}Mappings from{' '}
            <a href="https://github.com/virtualvinodh/aksharamukha" target="_blank" rel="noopener">virtualvinodh/aksharamukha</a>
          </p>
        </footer>
      </div>
    </motion.div>
  );
}
