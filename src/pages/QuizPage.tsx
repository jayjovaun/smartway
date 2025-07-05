import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { FiCheck, FiX, FiChevronRight, FiTrendingUp } from 'react-icons/fi';
import { StudyNavigation } from '@components/StudyNavigation';

interface QuizQuestion {
  question: string;
  options: string[];
  answer: string;
  explanation: string;
}

export const QuizPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [answeredQuestions, setAnsweredQuestions] = useState<number[]>([]);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    const data = location.state?.quiz;
    console.log('Quiz data received:', data);
    console.log('Quiz data length:', data?.length);
    console.log('Quiz data type:', Array.isArray(data) ? 'array' : typeof data);
    
    if (data && Array.isArray(data)) {
      setQuizQuestions(data);
      console.log('Quiz questions set:', data.length);
    } else {
      console.log('Invalid quiz data, navigating to /app');
      navigate('/app');
    }
  }, [location.state, navigate]);

  // Add keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (showResult) {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          handleNext();
        }
        return;
      }

      // Handle option selection with number keys
      const optionIndex = parseInt(event.key) - 1;
      if (optionIndex >= 0 && optionIndex < quizQuestions[currentIndex].options.length) {
        event.preventDefault();
        handleAnswerSelect(quizQuestions[currentIndex].options[optionIndex]);
      }
    };

    if (quizQuestions.length > 0 && !isComplete) {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [showResult, currentIndex, isComplete, quizQuestions.length]);

  const handleAnswerSelect = (answer: string) => {
    if (showResult) return;
    
    setSelectedAnswer(answer);
    setShowResult(true);
    
    const isCorrect = answer === quizQuestions[currentIndex].answer;
    if (isCorrect && !answeredQuestions.includes(currentIndex)) {
      setScore(score + 1);
    }
    
    if (!answeredQuestions.includes(currentIndex)) {
      setAnsweredQuestions([...answeredQuestions, currentIndex]);
    }
  };

  const handleNext = () => {
    console.log('handleNext called');
    console.log('currentIndex:', currentIndex);
    console.log('quizQuestions.length:', quizQuestions.length);
    console.log('currentIndex < quizQuestions.length - 1:', currentIndex < quizQuestions.length - 1);
    
    if (currentIndex < quizQuestions.length - 1) {
      // Move to next question
      console.log('Moving to next question:', currentIndex + 1);
      setCurrentIndex(currentIndex + 1);
      setSelectedAnswer(null);
      setShowResult(false);
    } else if (currentIndex === quizQuestions.length - 1) {
      // Complete the quiz - we're at the last question
      console.log('Completing quiz at question:', currentIndex + 1);
      setIsComplete(true);
    }
  };

  const getScoreRating = () => {
    const percentage = (score / quizQuestions.length) * 100;
    if (percentage >= 90) return { text: "Excellent! 🌟", color: "text-success" };
    if (percentage >= 80) return { text: "Great Job! 👍", color: "text-info" };
    if (percentage >= 70) return { text: "Good Work! 👌", color: "text-warning" };
    if (percentage >= 60) return { text: "Not Bad! 📚", color: "text-primary" };
    return { text: "Needs Improvement 💪", color: "text-danger" };
  };

  if (quizQuestions.length === 0) {
    return (
      <div className="min-vh-100 bg-gradient-main d-flex align-items-center justify-content-center">
        <div className="spinner-border text-accent-indigo" style={{ width: 64, height: 64 }} role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (isComplete) {
    const rating = getScoreRating();
    const percentage = Math.round((score / quizQuestions.length) * 100);
    
    return (
      <div className="min-vh-100 bg-gradient-main">
        <div className="container-fluid px-3 py-4">
          <StudyNavigation
            currentPage="quiz"
            title="🧠 Quiz"
            rightContent={
            <div className="text-bright fs-5 d-flex align-items-center gap-2">
              <FiTrendingUp size={20} />
              {score}/{quizQuestions.length}
            </div>
            }
          />

          {/* Modern Modal Backdrop */}
          <div 
            className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
            style={{ 
              background: 'linear-gradient(135deg, rgba(0, 0, 0, 0.8), rgba(30, 30, 60, 0.9))', 
              backdropFilter: 'blur(12px)',
              zIndex: 1050 
            }}
          >
            {/* Floating Particles Background */}
            <div className="position-absolute w-100 h-100 overflow-hidden">
              {[...Array(6)].map((_, i) => (
                <motion.div
                  key={i}
                  className="position-absolute rounded-circle"
                  style={{
                    width: `${20 + i * 10}px`,
                    height: `${20 + i * 10}px`,
                    background: `linear-gradient(135deg, ${percentage >= 70 ? '#10b981' : percentage >= 50 ? '#f59e0b' : '#ef4444'}, rgba(255,255,255,0.2))`,
                    left: `${10 + i * 15}%`,
                    top: `${20 + i * 12}%`,
                  }}
                  animate={{ 
                    y: [0, -20, 0],
                    opacity: [0.3, 0.7, 0.3],
                    scale: [1, 1.2, 1]
                  }}
                  transition={{ 
                    duration: 3 + i * 0.5, 
                    repeat: Infinity,
                    delay: i * 0.3
                  }}
                />
              ))}
            </div>

            {/* Modern Modal Content */}
            <motion.div
              initial={{ opacity: 0, scale: 0.7, rotateY: 10 }}
              animate={{ opacity: 1, scale: 1, rotateY: 0 }}
              className="position-relative"
              style={{ 
                maxWidth: '420px', 
                width: '90%',
                maxHeight: '85vh',
                overflow: 'hidden'
              }}
            >
              <div 
                className="position-relative text-center overflow-hidden"
                style={{
                  background: 'linear-gradient(145deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))',
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: '24px',
                  backdropFilter: 'blur(25px)',
                  boxShadow: '0 25px 80px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.2)',
                  padding: '2rem'
                }}
              >
                {/* Animated Close Button */}
                <motion.button
                  onClick={() => setIsComplete(false)}
                  className="btn position-absolute d-flex align-items-center justify-content-center"
                  style={{ 
                    top: '16px', 
                    right: '16px',
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    background: 'rgba(255,255,255,0.15)',
                    border: '1px solid rgba(255,255,255,0.3)',
                    color: 'white',
                    backdropFilter: 'blur(10px)'
                  }}
                  whileHover={{ 
                    scale: 1.1, 
                    background: 'rgba(255,255,255,0.25)',
                    rotate: 90
                  }}
                  whileTap={{ scale: 0.9 }}
                  transition={{ duration: 0.2 }}
                >
                  ✕
                </motion.button>

                {/* Animated Trophy/Emoji */}
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
                  className="mb-4"
                >
                  <div 
                    className="d-inline-flex align-items-center justify-content-center rounded-circle mb-3"
                    style={{
                      width: '80px',
                      height: '80px',
                      background: `linear-gradient(135deg, ${percentage >= 70 ? '#10b981' : percentage >= 50 ? '#f59e0b' : '#ef4444'}, ${percentage >= 70 ? '#059669' : percentage >= 50 ? '#d97706' : '#dc2626'})`,
                      boxShadow: '0 10px 30px rgba(0,0,0,0.3)'
                    }}
                  >
                    <span className="display-4">
                      {percentage >= 70 ? '🏆' : percentage >= 50 ? '🎯' : '💪'}
                    </span>
                  </div>
                </motion.div>

                {/* Animated Title */}
                <motion.h2
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="text-bright fw-bold mb-3"
                  style={{ fontSize: '1.5rem' }}
                >
                  Quiz Complete!
                </motion.h2>
                
                {/* Animated Score */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5 }}
                  className="mb-4"
                >
                  <motion.div 
                    className="display-5 fw-bold mb-2"
                    style={{ color: percentage >= 70 ? '#10b981' : percentage >= 50 ? '#f59e0b' : '#ef4444' }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                  >
                    {score}/{quizQuestions.length}
                  </motion.div>
                  
                  <motion.div 
                    className="fs-5 text-bright mb-2"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.7 }}
                  >
                    {percentage}% Correct
                  </motion.div>
                  
                  <motion.div 
                    className={`fs-6 fw-bold`}
                    style={{ color: percentage >= 70 ? '#10b981' : percentage >= 50 ? '#f59e0b' : '#ef4444' }}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 }}
                  >
                    {rating.text}
                  </motion.div>
                </motion.div>

                {/* Animated Progress Ring */}
                <motion.div 
                  className="mx-auto mb-4 d-flex align-items-center justify-content-center position-relative"
                  style={{ width: '120px', height: '120px' }}
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.9 }}
                >
                  <svg 
                    width="120" 
                    height="120" 
                    className="position-absolute top-0 start-0"
                    style={{ left: '0', top: '0' }}
                  >
                    <circle
                      cx="60"
                      cy="60"
                      r="50"
                      fill="none"
                      stroke="rgba(255,255,255,0.2)"
                      strokeWidth="8"
                    />
                    <motion.circle
                      cx="60"
                      cy="60"
                      r="50"
                      fill="none"
                      stroke={percentage >= 70 ? '#10b981' : percentage >= 50 ? '#f59e0b' : '#ef4444'}
                      strokeWidth="8"
                      strokeLinecap="round"
                      strokeDasharray={314}
                      initial={{ strokeDashoffset: 314 }}
                      animate={{ strokeDashoffset: 314 - (314 * percentage) / 100 }}
                      transition={{ delay: 1, duration: 1.5, ease: "easeInOut" }}
                      style={{
                        transform: 'rotate(-90deg)',
                        transformOrigin: '60px 60px'
                      }}
                    />
                  </svg>
                  <div 
                    className="d-flex align-items-center justify-content-center text-bright fw-bold position-relative"
                    style={{ 
                      fontSize: '1.2rem',
                      width: '100%',
                      height: '100%',
                      zIndex: 1
                    }}
                  >
                    {percentage}%
                  </div>
                </motion.div>

                {/* Modern Action Buttons */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.2 }}
                  className="d-grid gap-3"
                >
                  <motion.button
                    onClick={() => {
                      setCurrentIndex(0);
                      setSelectedAnswer(null);
                      setShowResult(false);
                      setScore(0);
                      setAnsweredQuestions([]);
                      setIsComplete(false);
                    }}
                    className="btn btn-lg"
                    style={{
                      background: 'linear-gradient(135deg, #6366F1, #7C3AED)',
                      border: 'none',
                      borderRadius: '16px',
                      color: 'white',
                      fontSize: '1rem',
                      padding: '12px 24px',
                      boxShadow: '0 8px 25px rgba(99, 102, 241, 0.4)'
                    }}
                    whileHover={{ 
                      scale: 1.02, 
                      boxShadow: '0 12px 35px rgba(99, 102, 241, 0.5)' 
                    }}
                    whileTap={{ scale: 0.98 }}
                  >
                    🔄 Retake Quiz
                  </motion.button>
                  
                  <div className="row g-2">
                    <div className="col-6">
                      <motion.button
                        onClick={() => navigate('/summary', { state: location.state })}
                        className="btn btn-lg w-100"
                        style={{
                          background: 'rgba(255,255,255,0.15)',
                          border: '1px solid rgba(255,255,255,0.3)',
                          borderRadius: '12px',
                          color: 'white',
                          fontSize: '0.9rem',
                          backdropFilter: 'blur(10px)'
                        }}
                        whileHover={{ 
                          scale: 1.02,
                          background: 'rgba(255,255,255,0.25)' 
                        }}
                        whileTap={{ scale: 0.98 }}
                      >
                        📖 Summary
                      </motion.button>
                    </div>
                    <div className="col-6">
                      <motion.button
                        onClick={() => navigate('/flashcards', { state: location.state })}
                        className="btn btn-lg w-100"
                        style={{
                          background: 'rgba(255,255,255,0.15)',
                          border: '1px solid rgba(255,255,255,0.3)',
                          borderRadius: '12px',
                          color: 'white',
                          fontSize: '0.9rem',
                          backdropFilter: 'blur(10px)'
                        }}
                        whileHover={{ 
                          scale: 1.02,
                          background: 'rgba(255,255,255,0.25)' 
                        }}
                        whileTap={{ scale: 0.98 }}
                      >
                        📚 Cards
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    );
  }

  const currentQuestion = quizQuestions[currentIndex];

  // Add safety check to prevent blank screen - only trigger completion if we have questions and are out of bounds
  if (quizQuestions.length > 0 && currentIndex >= quizQuestions.length && !isComplete) {
    setIsComplete(true);
    return null;
  }

  // Return loading state if we don't have a current question but aren't complete yet
  if (!currentQuestion && !isComplete) {
    return (
      <div className="min-vh-100 bg-gradient-main d-flex align-items-center justify-content-center">
        <div className="spinner-border text-accent-indigo" style={{ width: 64, height: 64 }} role="status">
          <span className="visually-hidden">Loading question...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-vh-100 bg-gradient-main">
      <div className="container-fluid px-3 py-3">
        <StudyNavigation
          currentPage="quiz"
          title="🧠 Quiz"
          rightContent={
          <div className="text-bright fs-5 d-flex align-items-center gap-2">
            <FiTrendingUp size={20} />
            {score}/{answeredQuestions.length}
          </div>
          }
        />

        {/* Score Display - Moved to top and made smaller */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card-glass p-2 text-center mb-3"
          style={{
            maxWidth: '400px',
            margin: '0 auto',
            background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(5, 150, 105, 0.2))',
            border: '2px solid rgba(16, 185, 129, 0.3)'
          }}
        >
          <div className="row g-2 text-center">
            <div className="col-4">
              <div className="text-accent-indigo mb-1 fs-5 fw-bold">
                {score}
              </div>
              <div className="text-bright-muted small">Correct</div>
            </div>
            <div className="col-4">
              <div className="text-accent-purple mb-1 fs-5 fw-bold">
                {answeredQuestions.length}
              </div>
              <div className="text-bright-muted small">Answered</div>
            </div>
            <div className="col-4">
              <div className="text-accent-yellow mb-1 fs-5 fw-bold">
                {answeredQuestions.length > 0 ? Math.round((score / answeredQuestions.length) * 100) : 0}%
              </div>
              <div className="text-bright-muted small">Accuracy</div>
            </div>
          </div>
        </motion.div>

        {/* Navigation Controls - Made more compact */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="d-flex justify-content-between align-items-center mb-3"
        >
          <div className="d-flex align-items-center gap-2">
            <span className="text-bright-muted small">Progress:</span>
            <div className="progress" style={{ width: '180px', height: '6px' }}>
              <div 
                className="progress-bar" 
                style={{ 
                  width: `${((currentIndex + 1) / quizQuestions.length) * 100}%`,
                  background: 'linear-gradient(135deg, #6366F1, #7C3AED)'
                }}
              />
            </div>
            <span className="text-bright-muted small">
              {Math.round(((currentIndex + 1) / quizQuestions.length) * 100)}%
            </span>
          </div>
          <div className="text-bright fw-semibold">
            {currentIndex + 1} / {quizQuestions.length}
          </div>
        </motion.div>

        {/* Quiz Content - Made more compact */}
        <div className="row justify-content-center">
          <div className="col-12 col-lg-10 col-xl-8">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="card-glass p-3 mb-3"
              style={{
                background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(124, 58, 237, 0.2))',
                border: '2px solid rgba(99, 102, 241, 0.3)'
              }}
            >
              <div className="mb-3">
                <h2 className="text-bright fw-bold fs-5 mb-2">
                  Question {currentIndex + 1}
                </h2>
                <p className="text-bright fs-6 lh-base mb-3">
                  {currentQuestion.question}
                </p>
              </div>

              {/* Answer Options - Made more compact */}
              <div className="d-grid gap-2">
                {currentQuestion.options.map((option, index) => {
                  const isSelected = selectedAnswer === option;
                  const isCorrect = option === currentQuestion.answer;
                  
                  let buttonStyle = {
                    borderRadius: '10px',
                    padding: '12px 16px',
                    fontSize: '14px',
                    textAlign: 'left' as const,
                    minHeight: '50px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    transition: 'all 0.3s ease',
                    background: 'rgba(255, 255, 255, 0.1)',
                    border: '2px solid rgba(255, 255, 255, 0.3)',
                    color: '#ffffff'
                  };

                  if (showResult && isSelected && isCorrect) {
                    buttonStyle = {
                      ...buttonStyle,
                      background: 'linear-gradient(135deg, #10b981, #059669)',
                      border: '2px solid #10b981'
                    };
                  } else if (showResult && isSelected && !isCorrect) {
                    buttonStyle = {
                      ...buttonStyle,
                      background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                      border: '2px solid #ef4444'
                    };
                  } else if (showResult && !isSelected && isCorrect) {
                    buttonStyle = {
                      ...buttonStyle,
                      background: 'linear-gradient(135deg, #10b981, #059669)',
                      border: '2px solid #10b981'
                    };
                  }

                  return (
                    <motion.button
                      key={index}
                      onClick={() => handleAnswerSelect(option)}
                      disabled={showResult}
                      style={buttonStyle}
                      className="btn text-start"
                      whileHover={!showResult ? { scale: 1.02, y: -2 } : {}}
                      whileTap={!showResult ? { scale: 0.98 } : {}}
                    >
                      <div className="d-flex align-items-center gap-3">
                        <div 
                          className="d-flex align-items-center justify-content-center"
                          style={{
                            width: '28px',
                            height: '28px',
                            borderRadius: '50%',
                            background: 'rgba(255, 255, 255, 0.2)',
                            fontSize: '12px',
                            fontWeight: 'bold'
                          }}
                        >
                          {String.fromCharCode(65 + index)}
                        </div>
                        <span className="flex-grow-1">{option}</span>
                      </div>
                      {showResult && isSelected && (
                        <div className="ms-2">
                          {isCorrect ? (
                            <FiCheck size={20} color="#ffffff" />
                          ) : (
                            <FiX size={20} color="#ffffff" />
                          )}
                        </div>
                      )}
                      {showResult && !isSelected && isCorrect && (
                        <div className="ms-2">
                          <FiCheck size={20} color="#ffffff" />
                        </div>
                      )}
                    </motion.button>
                  );
                })}
              </div>

              {/* Explanation - Made more compact */}
              {showResult && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-3 p-2 rounded"
                  style={{
                    background: 'rgba(59, 130, 246, 0.2)',
                    border: '1px solid rgba(59, 130, 246, 0.3)',
                    borderRadius: '10px'
                  }}
                >
                  <h5 className="text-bright fw-bold mb-2 d-flex align-items-center gap-2 fs-6">
                    💡 Explanation
                  </h5>
                  <p className="text-bright-muted mb-0 small">
                    {currentQuestion.explanation}
                  </p>
                </motion.div>
              )}

              {/* Next Button - Made more compact */}
              {showResult && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="mt-3 d-flex justify-content-center"
                >
                  <button
                    onClick={handleNext}
                    className="btn btn-primary btn-lg px-4"
                    style={{
                      borderRadius: '10px',
                      background: 'linear-gradient(135deg, #6366F1, #7C3AED)',
                      border: 'none',
                      fontWeight: '600'
                    }}
                  >
                    {currentIndex === quizQuestions.length - 1 ? (
                      <span className="d-flex align-items-center gap-2">
                        Finish Quiz
                        <FiTrendingUp size={18} />
                      </span>
                    ) : (
                      <span className="d-flex align-items-center gap-2">
                        Next Question
                        <FiChevronRight size={18} />
                      </span>
                    )}
                  </button>
                </motion.div>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};
