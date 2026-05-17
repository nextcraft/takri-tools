import { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { HERO_CHARS } from '../data/takri-mappings';

/**
 * Large, semi-transparent Takri characters that float across the hero.
 * Each one drifts slowly at a different speed, size, and rotation.
 */
export default function FloatingChars() {
  const [dimensions, setDimensions] = useState({
    w: typeof window !== 'undefined' ? window.innerWidth : 1200,
    h: typeof window !== 'undefined' ? window.innerHeight : 800,
  });

  useEffect(() => {
    const onResize = () => setDimensions({ w: window.innerWidth, h: window.innerHeight });
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const chars = useMemo(() => {
    return HERO_CHARS.map((char, i) => {
      const size = 2.5 + Math.random() * 5;
      return {
        id: i,
        char,
        size,
        x: Math.random() * 90 + 5,
        y: Math.random() * 80 + 10,
        opacity: 0.03 + Math.random() * 0.06,
        duration: 18 + Math.random() * 25,
        delay: Math.random() * 5,
        rotate: Math.random() * 30 - 15,
        driftX: (Math.random() - 0.5) * 100,
        driftY: (Math.random() - 0.5) * 60,
      };
    });
  }, []);

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        overflow: 'hidden',
        pointerEvents: 'none',
        zIndex: 1,
      }}
    >
      {chars.map((c) => (
        <motion.div
          key={c.id}
          style={{
            position: 'absolute',
            left: `${c.x}%`,
            top: `${c.y}%`,
            fontSize: `${c.size}rem`,
            fontFamily: "'Noto Sans Takri', sans-serif",
            color: `rgba(240, 165, 0, ${c.opacity})`,
            userSelect: 'none',
            willChange: 'transform',
          }}
          initial={{
            x: 0,
            y: 0,
            rotate: c.rotate,
            opacity: 0,
          }}
          animate={{
            x: [0, c.driftX, -c.driftX * 0.5, c.driftX * 0.3, 0],
            y: [0, c.driftY, -c.driftY * 0.6, c.driftY * 0.4, 0],
            rotate: [c.rotate, c.rotate + 10, c.rotate - 8, c.rotate + 5, c.rotate],
            opacity: [c.opacity * 0.5, c.opacity, c.opacity * 0.7, c.opacity, c.opacity * 0.5],
          }}
          transition={{
            duration: c.duration,
            repeat: Infinity,
            ease: 'linear',
            delay: c.delay,
          }}
        >
          {c.char}
        </motion.div>
      ))}
    </div>
  );
}
