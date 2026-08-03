import { motion } from 'framer-motion';
import ParticleCanvas from './ParticleCanvas';
import FloatingChars from './FloatingChars';
import './HeroSection.css';

// Split by grapheme clusters (not code points) so Takri base+matra
// units like 𑚔𑚭 and 𑚤𑚯 stay intact — same rule as Devanagari.
function graphemes(text) {
  if (typeof Intl !== 'undefined' && Intl.Segmenter) {
    return [...new Intl.Segmenter('und-Takr', { granularity: 'grapheme' }).segment(text)].map(
      (s) => s.segment
    );
  }
  // Fallback: hard-coded orthographic clusters for this title
  return ['𑚔𑚭', '𑚊', '𑚤𑚯'];
}

const titleChars = graphemes('𑚔𑚭𑚊𑚤𑚯');

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.12, delayChildren: 0.3 },
  },
};

const charVariants = {
  hidden: { opacity: 0, y: 40, scale: 0.8 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  },
};

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (delay = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] },
  }),
};

export default function HeroSection() {
  return (
    <section className="hero">
      {/* Layer 1: Particle canvas */}
      <ParticleCanvas />

      {/* Layer 2: Floating Takri chars */}
      <FloatingChars />

      {/* Layer 3: Decorative border lines */}
      <div className="hero-border-top" />
      <div className="hero-border-bottom" />

      {/* Layer 4: Title block */}
      <div className="hero-content">
        {/* Takri title with stagger animation */}
        <motion.div
          className="hero-takri-title"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {titleChars.map((ch, i) => (
            <motion.span key={i} variants={charVariants} className="hero-takri-char">
              {ch}
            </motion.span>
          ))}
        </motion.div>

        {/* Latin subtitle */}
        <motion.h1
          className="hero-subtitle"
          variants={fadeUp}
          custom={0.8}
          initial="hidden"
          animate="visible"
        >
          Takri Tools
        </motion.h1>

        {/* Description */}
        <motion.p
          className="hero-description"
          variants={fadeUp}
          custom={1.1}
          initial="hidden"
          animate="visible"
        >
          Preserving and teaching the ancient Takri script
          <br />
          through modern digital tools
        </motion.p>

        {/* Scroll indicator */}
        <motion.div
          className="hero-scroll-indicator"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2, duration: 1 }}
        >
          <motion.div
            className="scroll-arrow"
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
          >
            ↓
          </motion.div>
          <span>Explore Tools</span>
        </motion.div>
      </div>
    </section>
  );
}
