import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { FiArrowLeft, FiCheck, FiX, FiChevronRight, FiTrendingUp } from 'react-icons/fi';

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
    if (data && Array.isArray(data)) {
      setQuizQuestions(data);
    } else {
      navigate('/app');
    }
  }, [location.state, navigate]);

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
    if (currentIndex < quizQuestions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setSelectedAnswer(null);
      setShowResult(false);
    } else {
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
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <div className="card-glass mx-auto p-5" style={{ maxWidth: '600px' }}>
              <h1 className="gradient-text mb-4 fs-1">🎉 Quiz Complete!</h1>
              
              <div className="mb-4">
                <div 
                  className="display-3 fw-bold mb-2"
                  style={{ color: percentage >= 70 ? '#22c55e' : percentage >= 50 ? '#f59e0b' : '#ef4444' }}
                >
                  {score}/{quizQuestions.length}
                </div>
                <div className="fs-4 text-bright mb-2">{percentage}% Correct</div>
                <div className={`fs-3 ${rating.color}`}>{rating.text}</div>
              </div>

              <div className="progress mb-4" style={{ height: '20px' }}>
                <motion.div
                  className="progress-bar"
                  style={{
                    background: percentage >= 70 ? 'linear-gradient(90deg, #22c55e, #16a34a)' : 
                               percentage >= 50 ? 'linear-gradient(90deg, #f59e0b, #d97706)' : 
                               'linear-gradient(90deg, #ef4444, #dc2626)'
                  }}
                  initial={{ width: 0 }}
                  animate={{ width: `${percentage}%` }}
                  transition={{ duration: 1.5, ease: 'easeOut' }}
                />
              </div>

              <div className="d-flex justify-content-center gap-3 mt-4">
                <button
                  onClick={() => {
                    setCurrentIndex(0);
                    setSelectedAnswer(null);
                    setShowResult(false);
                    setScore(0);
                    setAnsweredQuestions([]);
                    setIsComplete(false);
                  }}
                  className="btn btn-primary btn-lg px-4"
                >
                  🔄 Retake Quiz
                </button>
                <button
                  onClick={() => navigate('/summary', { state: location.state })}
                  className="btn btn-accent-indigo btn-lg px-4"
                >
                  📖 View Summary
                </button>
                <button
                  onClick={() => navigate('/flashcards', { state: location.state })}
                  className="btn btn-accent-purple btn-lg px-4"
                >
                  📚 Study Flashcards
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  const currentQuestion = quizQuestions[currentIndex];
  const isCorrect = selectedAnswer === currentQuestion.answer;

  return (
    <div className="min-vh-100 bg-gradient-main">
      <div className="container-fluid px-3 py-4">
        {/* Header */}
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
            🧠 Quiz
          </h1>
          <div className="text-bright fs-5 d-flex align-items-center gap-2">
            <FiTrendingUp size={20} />
            {score}/{answeredQuestions.length}
          </div>
        </motion.div>

        {/* Progress */}
        <motion.div
          initial={{ opacity: 0, scaleX: 0 }}
          animate={{ opacity: 1, scaleX: 1 }}
          className="mb-4"
        >
          <div className="d-flex justify-content-between align-items-center mb-2">
            <span className="text-bright">Question {currentIndex + 1} of {quizQuestions.length}</span>
            <span className="text-bright">Score: {score}/{quizQuestions.length}</span>
          </div>
          <div className="progress" style={{ height: '8px' }}>
            <div
              className="progress-bar"
              style={{
                width: `${((currentIndex + 1) / quizQuestions.length) * 100}%`,
                background: 'linear-gradient(90deg, #6366F1, #7C3AED)'
              }}
            />
          </div>
        </motion.div>

        {/* Question */}
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="card-glass mb-4"
        >
          <div className="card-body p-4">
            <h2 className="text-bright fs-3 fw-bold mb-4">
              {currentQuestion.question}
            </h2>

            <div className="row g-3">
              {currentQuestion.options.map((option, optionIndex) => {
                let buttonClass = 'btn btn-outline-light btn-lg w-100 text-start p-3';
                let iconElement = null;

                if (showResult) {
                  if (option === currentQuestion.answer) {
                    buttonClass = 'btn btn-success btn-lg w-100 text-start p-3';
                    iconElement = <FiCheck size={20} className="float-end mt-1" />;
                  } else if (option === selectedAnswer && option !== currentQuestion.answer) {
                    buttonClass = 'btn btn-danger btn-lg w-100 text-start p-3';
                    iconElement = <FiX size={20} className="float-end mt-1" />;
                  }
                }

                return (
                  <div key={optionIndex} className="col-12">
                    <motion.button
                      onClick={() => handleAnswerSelect(option)}
                      disabled={showResult}
                      className={buttonClass}
                      whileHover={!showResult ? { scale: 1.02 } : {}}
                      whileTap={!showResult ? { scale: 0.98 } : {}}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: optionIndex * 0.1 }}
                    >
                      <div className="d-flex align-items-center justify-content-between">
                        <span className="fw-semibold">
                          {String.fromCharCode(65 + optionIndex)}. {option}
                        </span>
                        {iconElement}
                      </div>
                    </motion.button>
                  </div>
                );
              })}
            </div>
          </div>
        </motion.div>

        {/* Explanation */}
        <AnimatePresence>
          {showResult && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="card-glass mb-4"
            >
              <div className="card-body p-4">
                <div className={`d-flex align-items-center gap-3 mb-3 ${isCorrect ? 'text-success' : 'text-danger'}`}>
                  {isCorrect ? <FiCheck size={24} /> : <FiX size={24} />}
                  <h3 className="mb-0 fs-4 fw-bold">
                    {isCorrect ? 'Correct!' : 'Incorrect'}
                  </h3>
                </div>
                <p className="text-bright fs-5 mb-0">
                  <strong>Explanation:</strong> {currentQuestion.explanation}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Next Button */}
        {showResult && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="d-flex justify-content-center"
          >
            <button
              onClick={handleNext}
              className="btn btn-primary btn-lg px-5 d-flex align-items-center gap-2"
            >
              {currentIndex === quizQuestions.length - 1 ? 'Finish Quiz' : 'Next Question'}
              <FiChevronRight size={20} />
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
};
