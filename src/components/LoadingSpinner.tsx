import React from 'react';
import { motion } from 'framer-motion';

export const LoadingSpinner: React.FC = () => {
  return (
    <div className="d-flex flex-column align-items-center justify-content-center py-5">
      <motion.div
        className="d-flex align-items-center justify-content-center mb-4"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div className="spinner-border text-primary" style={{ width: '3rem', height: '3rem' }} role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </motion.div>
      
      <motion.h4
        className="text-bright fw-semibold mb-3"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        ✨ Creating Your Study Pack
      </motion.h4>
      
      <motion.p
        className="text-bright-muted text-center"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.2 }}
      >
        Our AI is analyzing your content and generating personalized study materials...
      </motion.p>
      
      <motion.div
        className="mt-4"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.3 }}
      >
        <div className="text-center text-bright-muted small">
          <div>📝 Creating summary</div>
          <div>🔄 Generating flashcards</div>
          <div>❓ Preparing quiz questions</div>
        </div>
      </motion.div>
    </div>
  );
}; 