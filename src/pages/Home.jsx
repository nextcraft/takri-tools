import { motion } from 'framer-motion';
import HeroSection from '../hero/HeroSection';
import ToolCard from '../components/ToolCard';
import { TAKRI_SNAP_FORMAL_NAME, TAKRI_SNAP_TITLE_TAKRI } from '../data/takri-snap';
import './Home.css';

const sectionVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
  },
};

export default function Home() {
  return (
    <div className="home">
      <HeroSection />

      {/* Tools Grid */}
      <motion.section
        className="tools-section"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={sectionVariants}
      >
        <div className="section-container">
          <div className="section-header">
            <h2 className="section-title">Tools</h2>
            <p className="section-subtitle">
              Digital instruments for working with the Takri script
            </p>
          </div>

          <div className="tools-grid">
            <ToolCard
              to="/transliterator"
              icon="⚡"
              title="Transliterator"
              takriTitle="𑚔𑚭𑚊𑚤𑚯"
              description="Type in Roman script and instantly see the output in both Devanagari and Takri side by side. Verify via Devanagari, use the Takri."
              status="live"
            />
            <ToolCard
              to="/practice-sheets"
              icon="📝"
              title="Practice Sheets"
              takriTitle="𑚀𑚡𑚭𑚣𑚭𑚨"
              description="Generate printable PDF worksheets for learning to write Takri characters with Devanagari associations and guided practice rows."
              status="live"
            />
            <ToolCard
              to="/character-reference"
              icon="📖"
              title="Character Reference"
              takriTitle="𑚦𑚤𑚶𑚘 𑚨𑚫𑚛𑚤𑚶𑚡"
              description="Browse the complete Takri Unicode alphabet with Devanagari equivalents, search, and one-click copy."
              status="live"
            />
            <ToolCard
              to="/copy-studio"
              icon="📋"
              title="Copy Studio"
              takriTitle="𑚔𑚭𑚊𑚤𑚯"
              description="Compose Takri text for Canva and Express. Edit words individually, copy sentence/line/word/character, or export PNG when fonts break."
              status="live"
            />
            <ToolCard
              to="/reader"
              icon="📚"
              title="Takri Reader"
              takriTitle="𑚏𑚫𑚛𑚤"
              description="Read Takri with Roman and Devanagari support. Browse curated Dogri and Kangri texts, or paste your own to decode word by word."
              status="live"
            />
            <ToolCard
              to="/trainer"
              icon="🔥"
              title={TAKRI_SNAP_FORMAL_NAME}
              takriTitle={TAKRI_SNAP_TITLE_TAKRI}
              description="Swipe to match Takri letters with Devanagari — YEP or NAH. Blitz mode with streak bonuses and extra time on hot runs."
              status="live"
            />
            <ToolCard
              to="/agents-kit"
              icon="🤖"
              title="Agents Kit"
              takriTitle="𑚔𑚭𑚊𑚤𑚯"
              description="CLI, MCP, and skills so Cursor, Claude Code, Cline, OpenCode, Codex, and Kilo produce real Unicode Takri — never invented glyphs."
              status="live"
            />
          </div>
        </div>
      </motion.section>

      {/* About Section */}
      <motion.section
        className="about-section"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={sectionVariants}
      >
        <div className="section-container">
          <div className="about-content">
            <h2 className="section-title">About Takri</h2>
            <p className="about-text">
              Takri (𑚔𑚭𑚊𑚤𑚯) is a historical Brahmic script used for writing Dogri, Kangri,
              and other Pahari languages of northern India. Encoded in the Unicode block
              U+11680–U+116CF, Takri is closely related to Devanagari and shares a near
              one-to-one character correspondence with it.
            </p>
            <p className="about-text">
              This project aims to create practical digital tools that make it easier
              to produce content in Takri, learn the script, and preserve this important
              part of cultural heritage.
            </p>
            <div className="about-meta">
              <span className="about-badge">Unicode 6.1+</span>
              <span className="about-badge">Block U+11680</span>
              <span className="about-badge">Open Source</span>
            </div>
          </div>
        </div>
      </motion.section>

      {/* Footer */}
      <footer className="home-footer">
        <div className="section-container">
          <p>
            Built with care for the Takri script community · Transliteration data from{' '}
            <a href="https://aksharamukha.appspot.com/" target="_blank" rel="noopener noreferrer">
              Aksharamukha
            </a>{' '}
            · Unicode character data from the{' '}
            <a href="https://www.unicode.org/charts/PDF/U11680.pdf" target="_blank" rel="noopener noreferrer">
              Unicode Consortium
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}
