import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { FiArrowLeft, FiRotateCw, FiChevronLeft, FiChevronRight } from 'react-icons/fi';

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
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="d-flex align-items-center justify-content-between mb-4"
        >
          <button
            onClick={() => navigate('/app')}
            className="btn btn-outline-light btn-lg d-flex align-items-center gap-2"
          >
            <FiArrowLeft size={20} />
            Back to App
          </button>
          <h1 className="gradient-text mb-0 fs-2 fw-bold">
            📚 Flashcards
          </h1>
          <div className="text-bright fs-5">
            {currentIndex + 1} / {flashcards.length}
          </div>
        </motion.div>

        <div className="d-flex justify-content-center mb-4">
          <div 
            className="flashcard-container position-relative"
            style={{ 
              width: '100%', 
              maxWidth: '600px', 
              height: '400px',
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
              transition={{ duration: 0.6, ease: 'easeInOut' }}
              onClick={handleFlip}
              whileHover={{ scale: 1.02 }}
            >
              <div
                className="flashcard-side position-absolute w-100 h-100 d-flex align-items-center justify-content-center p-4"
                style={{
                  backfaceVisibility: 'hidden',
                  background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15), rgba(124, 58, 237, 0.15))',
                  border: '2px solid rgba(99, 102, 241, 0.3)',
                  borderRadius: '20px',
                  backdropFilter: 'blur(10px)'
                }}
              >
                <div className="text-center">
                  <div className="mb-3 text-accent-indigo">
                    <span className="fs-1">❓</span>
                  </div>
                  <h3 className="text-bright fw-bold mb-3">Question</h3>
                  <p className="text-bright fs-4 lh-base mb-4">
                    {currentCard.question}
                  </p>
                  <div className="d-flex align-items-center justify-content-center gap-2 text-bright-muted">
                    <FiRotateCw size={16} />
                    <span className="small">Click to reveal answer</span>
                  </div>
                </div>
              </div>

              <div
                className="flashcard-side position-absolute w-100 h-100 d-flex align-items-center justify-content-center p-4"
                style={{
                  backfaceVisibility: 'hidden',
                  transform: 'rotateY(180deg)',
                  background: 'linear-gradient(135deg, rgba(124, 58, 237, 0.15), rgba(99, 102, 241, 0.15))',
                  border: '2px solid rgba(124, 58, 237, 0.3)',
                  borderRadius: '20px',
                  backdropFilter: 'blur(10px)'
                }}
              >
                <div className="text-center">
                  <div className="mb-3 text-accent-purple">
                    <span className="fs-1">💡</span>
                  </div>
                  <h3 className="text-bright fw-bold mb-3">Answer</h3>
                  <p className="text-bright fs-4 lh-base mb-4">
                    {currentCard.answer}
                  </p>
                  <div className="d-flex align-items-center justify-content-center gap-2 text-bright-muted">
                    <FiRotateCw size={16} />
                    <span className="small">Click to see question</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="d-flex justify-content-center align-items-center gap-4 mb-4"
        >
          <button
            onClick={handlePrevious}
            disabled={currentIndex === 0}
            className="btn btn-outline-light btn-lg d-flex align-items-center gap-2"
            style={{ minWidth: '120px' }}
          >
            <FiChevronLeft size={20} />
            Previous
          </button>

          <button
            onClick={handleFlip}
            className="btn btn-primary btn-lg px-4 d-flex align-items-center gap-2"
          >
            <FiRotateCw size={20} />
            Flip Card
          </button>

          <button
            onClick={handleNext}
            disabled={currentIndex === flashcards.length - 1}
            className="btn btn-outline-light btn-lg d-flex align-items-center gap-2"
            style={{ minWidth: '120px' }}
          >
            Next
            <FiChevronRight size={20} />
          </button>
        </motion.div>
      </div>
    </div>
  );
};
