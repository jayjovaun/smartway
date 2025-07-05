import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { FiArrowLeft, FiBookOpen, FiLayers, FiTrendingUp } from 'react-icons/fi';
import { Logo } from '@components/Logo';

interface StudyNavigationProps {
  currentPage: 'flashcards' | 'quiz' | 'summary';
  title: string;
  rightContent?: React.ReactNode;
}

export const StudyNavigation: React.FC<StudyNavigationProps> = ({ 
  currentPage, 
  title, 
  rightContent 
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleNavigate = (page: string) => {
    if (page === currentPage) return;
    
    navigate(`/${page}`, { 
      state: location.state,
      replace: false 
    });
  };

  const handleBackToApp = () => {
    navigate('/app', { 
      state: { 
        generatedContent: {
          summary: location.state?.summaryData,
          flashcards: location.state?.flashcards,
          quiz: location.state?.quiz
        }
      },
      replace: false 
    });
  };

  const getPageIcon = (page: string) => {
    switch(page) {
      case 'summary': return <FiBookOpen size={14} />;
      case 'flashcards': return <FiLayers size={14} />;
      case 'quiz': return <FiTrendingUp size={14} />;
      default: return null;
    }
  };

  const getPageEmoji = (page: string) => {
    switch(page) {
      case 'summary': return '📖';
      case 'flashcards': return '📚';
      case 'quiz': return '🧠';
      default: return '';
    }
  };

  return (
    <div className="mb-4">
      {/* Top Row - Logo and Back Button */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="d-flex align-items-center justify-content-between mb-3"
      >
        {/* Logo and Back Button */}
        <div className="d-flex align-items-center gap-3">
          {/* App Logo */}
          <Logo size={36} showText={false} />
          
          {/* Back Button */}
          <button
            onClick={handleBackToApp}
            className="btn btn-outline-light btn-sm d-flex align-items-center gap-2"
            style={{ 
              borderRadius: '8px',
              padding: '6px 12px',
              fontSize: '14px',
              background: 'rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              fontWeight: '500'
            }}
          >
            <FiArrowLeft size={16} />
            <span className="d-none d-sm-inline">Back</span>
          </button>
        </div>

        {/* Right Content */}
        <div className="d-flex align-items-center">
          {rightContent}
        </div>
      </motion.div>

      {/* Second Row - Page Title and Navigation */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="d-flex align-items-center justify-content-between"
      >
        {/* Page Title */}
        <h1 className="gradient-text mb-0 fs-3 fw-bold">
          {title}
        </h1>
        
        {/* Page Switcher */}
        <div className="d-flex align-items-center gap-2">
          {['summary', 'flashcards', 'quiz'].map((page) => (
            <button
              key={page}
              onClick={() => handleNavigate(page)}
              className={`btn btn-sm d-flex align-items-center gap-1 ${
                currentPage === page 
                  ? 'btn-primary' 
                  : 'btn-outline-light'
              }`}
              style={{ 
                borderRadius: '8px',
                padding: '6px 12px',
                fontSize: '13px',
                fontWeight: '500',
                minWidth: '70px',
                background: currentPage === page 
                  ? 'linear-gradient(135deg, #6366F1, #7C3AED)'
                  : 'rgba(255, 255, 255, 0.1)',
                border: currentPage === page 
                  ? 'none' 
                  : '1px solid rgba(255, 255, 255, 0.3)'
              }}
            >
              {getPageIcon(page)}
              <span className="d-none d-md-inline">
                {page.charAt(0).toUpperCase() + page.slice(1)}
              </span>
              <span className="d-inline d-md-none">
                {getPageEmoji(page)}
              </span>
            </button>
          ))}
        </div>
      </motion.div>
    </div>
  );
}; 