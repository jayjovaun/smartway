import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiRefreshCcw } from 'react-icons/fi';
import { Logo } from './Logo';

interface StudyNavigationProps {
  title: string;
  currentPage?: string;
  rightContent?: React.ReactNode;
}

export const StudyNavigation: React.FC<StudyNavigationProps> = ({ 
  title, 
  rightContent 
}) => {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="d-flex align-items-center justify-content-between mb-3 mb-md-4 flex-wrap gap-3"
    >
      {/* Left side - Logo and Back button */}
      <div className="d-flex align-items-center gap-2 gap-md-3">
        <motion.button
          onClick={() => navigate(-1)}
          className="btn btn-link text-bright-muted p-2"
          style={{ border: 'none', background: 'none' }}
          whileHover={{ scale: 1.1, x: -2 }}
          whileTap={{ scale: 0.95 }}
        >
          <FiArrowLeft size={20} />
        </motion.button>
        <Logo size={32} showText={true} />
      </div>

      {/* Center - Title */}
      <motion.h1
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="h5 h4-md fw-bold text-bright mb-0 text-center flex-grow-1 order-3 order-md-2"
        style={{ minWidth: '200px' }}
      >
        {title}
      </motion.h1>

      {/* Right side - Content or Generate New Study Pack button */}
      <div className="d-flex align-items-center gap-2 order-2 order-md-3">
        {rightContent && (
          <div className="me-2 me-md-3">
            {rightContent}
          </div>
        )}
        
        {/* Generate New Study Pack button - responsive sizing */}
        <motion.button
          onClick={() => navigate('/app')}
          className="btn d-flex align-items-center gap-1 gap-md-2 px-2 px-md-4 py-2 fw-semibold"
          style={{ 
            background: 'linear-gradient(135deg, #10B981, #059669)',
            border: 'none',
            borderRadius: '12px',
            color: 'white',
            boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
            fontSize: '12px',
            whiteSpace: 'nowrap'
          }}
          whileHover={{ 
            scale: 1.05, 
            y: -2,
            boxShadow: '0 6px 20px rgba(16, 185, 129, 0.4)'
          }}
          whileTap={{ scale: 0.95 }}
        >
          <FiRefreshCcw size={14} />
          <span className="d-none d-sm-inline">Generate New Study Pack</span>
          <span className="d-inline d-sm-none">New Pack</span>
        </motion.button>
      </div>
    </motion.div>
  );
}; 