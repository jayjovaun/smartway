import React from 'react';
import { motion } from 'framer-motion';
import { FiCheckCircle } from 'react-icons/fi';

interface SummaryViewProps {
  content: string;
}

export const SummaryView: React.FC<SummaryViewProps> = ({ content }) => {
  const sections = content.split('\n\n').filter(section => section.trim());

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="mb-4"
    >
      {sections.map((section, index) => {
        const lines = section.split('\n').filter(line => line.trim());
        const header = lines[0];
        const points = lines.slice(1);
        return (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="card mb-4"
          >
            <h3 className="h5 fw-semibold mb-3 text-accent-indigo">
              {header.replace(/^[•\-\*]\s*/, '')}
            </h3>
            <ul className="list-unstyled mb-0">
              {points.map((point, pointIndex) => (
                <motion.li
                  key={pointIndex}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: (index * 0.1) + (pointIndex * 0.05) }}
                  className="d-flex align-items-start gap-3"
                >
                  <FiCheckCircle className="me-2 text-accent-indigo mt-1 flex-shrink-0" />
                  <span className="text-muted">
                    {point.replace(/^[•\-\*]\s*/, '')}
                  </span>
                </motion.li>
              ))}
            </ul>
          </motion.div>
        );
      })}
    </motion.div>
  );
}; 