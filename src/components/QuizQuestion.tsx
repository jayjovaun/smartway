import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiAward, FiShuffle, FiCheck, FiX } from 'react-icons/fi';

export interface QuizData {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
}

interface QuizQuestionProps {
  content: QuizData[];
}

export const QuizQuestion: React.FC<QuizQuestionProps> = ({ content }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [questions, setQuestions] = useState<QuizData[]>(content);
  const [showExplanation, setShowExplanation] = useState(false);

  useEffect(() => {
    setQuestions(content);
  }, [content]);

  const shuffleQuestions = () => {
    const shuffled = [...questions].sort(() => Math.random() - 0.5);
    setQuestions(shuffled);
    setCurrentQuestion(0);
    setSelectedAnswers([]);
    setShowResults(false);
    setShowExplanation(false);
  };

  const handleAnswerSelect = (answerIndex: number) => {
    if (showResults) return;
    const newAnswers = [...selectedAnswers];
    newAnswers[currentQuestion] = answerIndex;
    setSelectedAnswers(newAnswers);
    setShowExplanation(true);
  };

  const nextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setShowExplanation(false);
    } else {
      setShowResults(true);
    }
  };

  const calculateScore = () => {
    return selectedAnswers.filter((answer, index) =>
      answer === questions[index]?.correctAnswer
    ).length;
  };

  const getScorePercentage = () => {
    return Math.round((calculateScore() / questions.length) * 100);
  };

  const getScoreColor = (percentage: number) => {
    if (percentage >= 80) return 'text-success';
    if (percentage >= 60) return 'text-warning';
    return 'text-danger';
  };

  if (!questions || questions.length === 0) {
    return (
      <div className="text-center text-text-muted py-8">
        No quiz questions generated. Please try again.
      </div>
    );
  }

  if (showResults) {
    const score = calculateScore();
    const percentage = getScorePercentage();
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center space-y-6"
      >
        <div className="card bg-gradient-card shadow-lg p-4 mb-4">
          <FiAward className="w-16 h-16 text-accent-indigo mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2 text-bright">Quiz Complete!</h2>
          <p className="text-text-muted mb-4">
            You scored <span className="text-accent-indigo fw-bold">{score}</span> out of {questions.length} questions
          </p>
          <div className={`text-4xl font-bold mb-2 ${getScoreColor(percentage)}`}>
            {percentage}%
          </div>
          <div className="text-bright-muted">
            {percentage >= 80 ? 'Excellent! 🎉' : 
             percentage >= 60 ? 'Good job! 👍' : 
             'Keep practicing! 💪'}
          </div>
        </div>
        <div className="d-flex justify-content-center gap-2">
          <motion.button
            onClick={() => {
              setCurrentQuestion(0);
              setSelectedAnswers([]);
              setShowResults(false);
              setShowExplanation(false);
            }}
            className="btn btn-primary"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Try Again
          </motion.button>
          <motion.button
            onClick={shuffleQuestions}
            className="btn btn-outline-secondary"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <FiShuffle className="me-2" />
            Shuffle & Retry
          </motion.button>
        </div>
      </motion.div>
    );
  }

  const currentQ = questions[currentQuestion];
  const selectedAnswer = selectedAnswers[currentQuestion];


  return (
    <motion.div
      key={currentQuestion}
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="mb-4"
    >
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div className="text-center text-bright-muted">
          Question {currentQuestion + 1} of {questions.length}
        </div>
        <motion.button
          onClick={shuffleQuestions}
          className="btn btn-outline-secondary btn-sm"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          title="Shuffle questions"
        >
          <FiShuffle />
        </motion.button>
      </div>
      
      {/* Progress bar */}
      <div className="progress mb-3" style={{ height: 4 }}>
        <div 
          className="progress-bar bg-accent-indigo" 
          style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
        />
      </div>

      <div className="card mb-3 bg-gradient-card shadow-lg p-4">
        <h3 className="h5 fw-bold mb-4 text-accent-indigo text-bright">
          {currentQ.question}
        </h3>
        <div className="mb-3">
          {currentQ.options.map((option, index) => (
            <motion.button
              key={index}
              onClick={() => handleAnswerSelect(index)}
              disabled={selectedAnswer !== undefined}
              className={`btn w-100 text-start mb-2 ${
                selectedAnswer === index
                  ? index === currentQ.correctAnswer
                    ? 'btn-success text-white'
                    : 'btn-danger text-white'
                  : selectedAnswer !== undefined && index === currentQ.correctAnswer
                    ? 'btn-success text-white'
                    : 'btn-outline-secondary text-bright'
              }`}
              whileHover={{ scale: selectedAnswer === undefined ? 1.02 : 1 }}
              whileTap={{ scale: selectedAnswer === undefined ? 0.98 : 1 }}
              aria-label={`Select option ${String.fromCharCode(65 + index)}`}
            >
              <div className="d-flex align-items-center gap-2">
                <span className="badge bg-secondary me-2">
                  {String.fromCharCode(65 + index)}
                </span>
                <span className="text-bright">{option}</span>
                {selectedAnswer !== undefined && index === currentQ.correctAnswer && (
                  <FiCheck className="ms-auto" />
                )}
                {selectedAnswer === index && index !== currentQ.correctAnswer && (
                  <FiX className="ms-auto" />
                )}
              </div>
            </motion.button>
          ))}
        </div>
        
        {showExplanation && currentQ.explanation && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="alert alert-info mt-3"
          >
            <strong>Explanation:</strong> {currentQ.explanation}
          </motion.div>
        )}
      </div>
      
      {selectedAnswer !== undefined && (
        <motion.button
          onClick={nextQuestion}
          className="btn btn-primary w-100"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {currentQuestion === questions.length - 1 ? 'Finish Quiz' : 'Next Question'}
        </motion.button>
      )}
    </motion.div>
  );
}; 