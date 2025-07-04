import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiRotateCcw, FiChevronLeft, FiChevronRight, FiShuffle, FiGrid, FiList } from 'react-icons/fi';

export interface FlashcardData {
  question: string;
  answer: string;
}

interface FlashcardProps {
  content: FlashcardData[];
}

export const Flashcard: React.FC<FlashcardProps> = ({ content }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [flashcards, setFlashcards] = useState<FlashcardData[]>(content);
  const [showAllCards, setShowAllCards] = useState(false);

  useEffect(() => {
    setFlashcards(content);
  }, [content]);

  const shuffleCards = () => {
    const shuffled = [...flashcards].sort(() => Math.random() - 0.5);
    setFlashcards(shuffled);
    setCurrentIndex(0);
    setIsFlipped(false);
  };

  const nextCard = () => {
    if (currentIndex < flashcards.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setIsFlipped(false);
    }
  };

  const prevCard = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setIsFlipped(false);
    }
  };

  const flipCard = () => {
    setIsFlipped(!isFlipped);
  };

  const goToCard = (index: number) => {
    setCurrentIndex(index);
    setIsFlipped(false);
  };

  if (!flashcards || flashcards.length === 0) {
    return (
      <div className="text-center text-text-muted py-8">
        No flashcards generated. Please try again.
      </div>
    );
  }

  if (showAllCards) {
    return (
      <div className="mb-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h4 className="text-bright mb-0">All Flashcards ({flashcards.length})</h4>
          <motion.button
            onClick={() => setShowAllCards(false)}
            className="btn btn-outline-secondary"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <FiList className="me-2" />
            Study Mode
          </motion.button>
        </div>
        <div className="row g-3">
          {flashcards.map((card, index) => (
            <div key={index} className="col-md-6 col-lg-4">
                              <motion.div
                  className="card bg-gradient-card shadow-sm h-100"
                  style={{ minHeight: 120, cursor: 'pointer' }}
                  whileHover={{ scale: 1.02 }}
                  onClick={() => {
                    setShowAllCards(false);
                    goToCard(index);
                  }}
                >
                <div className="card-body d-flex flex-column">
                  <h6 className="card-title text-accent-indigo text-bright mb-2">Card {index + 1}</h6>
                  <p className="card-text text-bright flex-grow-1">{card.question}</p>
                  <small className="text-bright-muted">Click to study this card</small>
                </div>
              </motion.div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mb-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div className="text-center text-bright-muted">
          Card {currentIndex + 1} of {flashcards.length}
        </div>
        <div className="d-flex gap-2">
          <motion.button
            onClick={shuffleCards}
            className="btn btn-outline-secondary btn-sm"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            title="Shuffle cards"
          >
            <FiShuffle />
          </motion.button>
          <motion.button
            onClick={() => setShowAllCards(true)}
            className="btn btn-outline-secondary btn-sm"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            title="View all cards"
          >
            <FiGrid />
          </motion.button>
        </div>
      </div>
      
      {/* Progress bar */}
      <div className="progress mb-3" style={{ height: 4 }}>
        <div 
          className="progress-bar bg-accent-indigo" 
          style={{ width: `${((currentIndex + 1) / flashcards.length) * 100}%` }}
        />
      </div>

      <div className="position-relative mb-3 d-flex justify-content-center">
        <motion.div
          className="card h-100 interactive-card bg-gradient-card shadow-lg"
          style={{ minWidth: 320, maxWidth: 420, minHeight: 180, cursor: 'pointer', border: '2px solid #6366F1' }}
          onClick={flipCard}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.98 }}
          tabIndex={0}
          aria-label={isFlipped ? 'Show question' : 'Show answer'}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={`${currentIndex}-${isFlipped}`}
              initial={{ rotateY: isFlipped ? -90 : 90, opacity: 0 }}
              animate={{ rotateY: 0, opacity: 1 }}
              exit={{ rotateY: isFlipped ? 90 : -90, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="h-100 d-flex align-items-center justify-content-center text-center p-4"
            >
              <div>
                <h3 className="h6 fw-bold mb-2 text-accent-indigo text-bright">
                  {isFlipped ? 'Answer' : 'Question'}
                </h3>
                <p className="fs-5 text-bright" style={{ minHeight: 48 }}>
                  {isFlipped ? flashcards[currentIndex].answer : flashcards[currentIndex].question}
                </p>
                <div className="mt-2 text-bright-muted small">(Click card or rotate icon to flip)</div>
              </div>
            </motion.div>
          </AnimatePresence>
        </motion.div>
      </div>
      <div className="d-flex justify-content-center gap-2">
        <motion.button
          onClick={prevCard}
          disabled={currentIndex === 0}
          className="btn btn-outline-secondary rounded-circle"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          aria-label="Previous card"
        >
          <FiChevronLeft />
        </motion.button>
        <motion.button
          onClick={flipCard}
          className="btn btn-accent-indigo rounded-circle text-white"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          aria-label="Flip card"
        >
          <FiRotateCcw />
        </motion.button>
        <motion.button
          onClick={nextCard}
          disabled={currentIndex === flashcards.length - 1}
          className="btn btn-outline-secondary rounded-circle"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          aria-label="Next card"
        >
          <FiChevronRight />
        </motion.button>
      </div>
    </div>
  );
}; 