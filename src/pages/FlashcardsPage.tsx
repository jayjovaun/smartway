import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { FiRotateCw, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { StudyNavigation } from '@components/StudyNavigation';

interface Flashcard {
  question: string;
  answer: string;
}

export const FlashcardsPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  useEffect(() => {
    const data = location.state?.flashcards;
    if (data && Array.isArray(data)) {
      setFlashcards(data);
    } else {
      navigate('/app');
    }
  }, [location.state, navigate]);

  // Add keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      switch (event.key) {
        case 'ArrowLeft':
          event.preventDefault();
          if (currentIndex > 0) {
            handlePrevious();
          }
          break;
        case 'ArrowRight':
          event.preventDefault();
          if (currentIndex < flashcards.length - 1) {
            handleNext();
          }
          break;
        case ' ':
        case 'Enter':
          event.preventDefault();
          handleFlip();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, flashcards.length]);

  const handleNext = () => {
    if (currentIndex < flashcards.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setIsFlipped(false);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setIsFlipped(false);
    }
  };

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  if (flashcards.length === 0) {
    return (
      <div className="min-vh-100 bg-gradient-main d-flex align-items-center justify-content-center">
        <div className="spinner-border text-accent-indigo" style={{ width: 64, height: 64 }} role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  const currentCard = flashcards[currentIndex];

  return (
    <div className="min-vh-100 bg-gradient-main">
      <div className="container-fluid px-3 py-4">
        <StudyNavigation
          currentPage="flashcards"
          title="📚 Flashcards"
          rightContent={
            <div className="text-bright fs-5 fw-semibold">
              {currentIndex + 1} / {flashcards.length}
            </div>
          }
        />

        <div className="d-flex justify-content-center mb-4">
          <div 
            className="flashcard-container position-relative"
            style={{ 
              width: '100%', 
              maxWidth: '650px', 
              height: '450px',
              perspective: '1000px'
            }}
          >
            <motion.div
              className="flashcard position-relative w-100 h-100"
              style={{
                transformStyle: 'preserve-3d',
                cursor: 'pointer'
              }}
              animate={{ rotateY: isFlipped ? 180 : 0 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              onClick={handleFlip}
              whileHover={{ scale: 1.03, y: -5 }}
              whileTap={{ scale: 0.98 }}
            >
              {/* Front Side - Question */}
              <div
                className="flashcard-side position-absolute w-100 h-100 d-flex align-items-center justify-content-center p-4"
                style={{
                  backfaceVisibility: 'hidden',
                  background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.3), rgba(124, 58, 237, 0.3))',
                  border: '2px solid rgba(99, 102, 241, 0.5)',
                  borderRadius: '24px',
                  backdropFilter: 'blur(20px)',
                  boxShadow: '0 16px 48px rgba(99, 102, 241, 0.4)',
                  zIndex: isFlipped ? 1 : 2
                }}
              >
                <div className="text-center w-100">
                  <div className="mb-4 text-accent-indigo">
                    <span className="display-4">❓</span>
                  </div>
                  <h3 className="text-bright fw-bold mb-4 fs-3">Question</h3>
                  <p className="text-bright fs-4 lh-base mb-4 px-3" style={{ 
                    minHeight: '120px',
                    color: '#ffffff !important',
                    textShadow: '0 2px 6px rgba(0,0,0,0.7)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    {currentCard.question}
                  </p>
                  <div className="d-flex align-items-center justify-content-center gap-2 text-bright">
                    <FiRotateCw size={18} />
                    <span className="small fw-medium" style={{ color: '#e5e7eb' }}>
                      Click to reveal answer
                    </span>
                  </div>
                </div>
              </div>

              {/* Back Side - Answer */}
              <div
                className="flashcard-side position-absolute w-100 h-100 d-flex align-items-center justify-content-center p-4"
                style={{
                  backfaceVisibility: 'hidden',
                  transform: 'rotateY(180deg)',
                  background: 'linear-gradient(135deg, rgba(124, 58, 237, 0.3), rgba(99, 102, 241, 0.3))',
                  border: '2px solid rgba(124, 58, 237, 0.5)',
                  borderRadius: '24px',
                  backdropFilter: 'blur(20px)',
                  boxShadow: '0 16px 48px rgba(124, 58, 237, 0.4)',
                  zIndex: isFlipped ? 2 : 1
                }}
              >
                <div className="text-center w-100">
                  <div className="mb-4 text-accent-purple">
                    <span className="display-4">💡</span>
                  </div>
                  <h3 className="text-bright fw-bold mb-4 fs-3">Answer</h3>
                  <p className="text-bright fs-4 lh-base mb-4 px-3" style={{ 
                    minHeight: '120px',
                    color: '#ffffff !important',
                    textShadow: '0 2px 6px rgba(0,0,0,0.7)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    {currentCard.answer}
                  </p>
                  <div className="d-flex align-items-center justify-content-center gap-2 text-bright">
                    <FiRotateCw size={18} />
                    <span className="small fw-medium" style={{ color: '#e5e7eb' }}>
                      Click to see question
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Navigation Controls */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="d-flex justify-content-center align-items-center gap-4 mb-4"
        >
          <motion.button
            onClick={handlePrevious}
            disabled={currentIndex === 0}
            className="btn btn-outline-light btn-lg d-flex align-items-center gap-2"
            style={{
              borderRadius: '12px',
              padding: '12px 24px',
              minWidth: '120px'
            }}
            whileHover={currentIndex > 0 ? { scale: 1.05 } : {}}
            whileTap={currentIndex > 0 ? { scale: 0.95 } : {}}
          >
            <FiChevronLeft size={20} />
            Previous
          </motion.button>

          <motion.button
            onClick={handleFlip}
            className="btn btn-primary btn-lg d-flex align-items-center gap-2"
            style={{
              borderRadius: '12px',
              padding: '12px 24px',
              minWidth: '120px',
              background: 'linear-gradient(135deg, #6366F1, #7C3AED)',
              border: 'none'
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <FiRotateCw size={20} />
            Flip
          </motion.button>

          <motion.button
            onClick={handleNext}
            disabled={currentIndex === flashcards.length - 1}
            className="btn btn-outline-light btn-lg d-flex align-items-center gap-2"
            style={{
              borderRadius: '12px',
              padding: '12px 24px',
              minWidth: '120px'
            }}
            whileHover={currentIndex < flashcards.length - 1 ? { scale: 1.05 } : {}}
            whileTap={currentIndex < flashcards.length - 1 ? { scale: 0.95 } : {}}
          >
            Next
            <FiChevronRight size={20} />
          </motion.button>
        </motion.div>

        {/* Progress Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-4"
        >
          <div className="progress" style={{ height: '8px', borderRadius: '4px' }}>
            <div 
              className="progress-bar" 
              style={{ 
                width: `${((currentIndex + 1) / flashcards.length) * 100}%`,
                background: 'linear-gradient(135deg, #6366F1, #7C3AED)'
              }}
            />
          </div>
          <div className="text-center mt-2">
            <span className="text-bright-muted small">
              Progress: {Math.round(((currentIndex + 1) / flashcards.length) * 100)}%
            </span>
          </div>
        </motion.div>

        {/* Study Tips */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="card-glass p-4 text-center"
          style={{
            maxWidth: '600px',
            margin: '0 auto',
            background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(5, 150, 105, 0.2))',
            border: '2px solid rgba(16, 185, 129, 0.3)'
          }}
        >
          <h4 className="text-bright fw-bold mb-3 fs-5">📚 Study Tips</h4>
          <div className="row g-3 text-center">
            <div className="col-md-4 col-12">
              <div className="text-bright-muted small">
                <strong>⌨️ Keyboard:</strong><br />
                ← → Arrow keys to navigate<br />
                Space/Enter to flip
              </div>
            </div>
            <div className="col-md-4 col-12">
              <div className="text-bright-muted small">
                <strong>💡 Study Method:</strong><br />
                Read question carefully<br />
                Think before flipping
              </div>
            </div>
            <div className="col-md-4 col-12">
              <div className="text-bright-muted small">
                <strong>🎯 Best Practice:</strong><br />
                Review multiple times<br />
                Focus on difficult ones
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
