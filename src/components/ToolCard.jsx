import { Link } from 'react-router';
import { motion } from 'framer-motion';
import './ToolCard.css';

export default function ToolCard({ to, icon, title, takriTitle, description, status }) {
  return (
    <motion.div
      className="tool-card"
      whileHover={{ y: -6, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
    >
      <Link to={to} className="tool-card-link">
        <div className="tool-card-icon">{icon}</div>
        <div className="tool-card-body">
          <div className="tool-card-header">
            <h3 className="tool-card-title">{title}</h3>
            {takriTitle && (
              <span className="tool-card-takri">{takriTitle}</span>
            )}
          </div>
          <p className="tool-card-description">{description}</p>
        </div>
        <div className="tool-card-footer">
          <span className={`tool-card-status tool-card-status--${status}`}>
            {status === 'live' ? '✅ Live' : status === 'coming' ? '🔲 Coming Soon' : status}
          </span>
          <span className="tool-card-arrow">→</span>
        </div>
      </Link>
    </motion.div>
  );
}
