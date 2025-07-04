import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { InputForm } from '@components/InputForm';
import { generateStudyPack } from '@api/generate';
import type { StudyPackResult } from '@api/generate';

export const AppPage: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<StudyPackResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (input: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await generateStudyPack(input);
      setGeneratedContent(result);
    } catch (err: any) {
      setError(err.message || 'Failed to generate study pack.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleNavigateToSummary = () => {
    if (generatedContent) {
      navigate('/summary', {
        state: {
          summaryData: generatedContent.summary,
          flashcards: generatedContent.flashcards,
          quiz: generatedContent.quiz
        }
      });
    }
  };

  const handleNavigateToFlashcards = () => {
    if (generatedContent) {
      navigate('/flashcards', {
        state: {
          flashcards: generatedContent.flashcards,
          summaryData: generatedContent.summary,
          quiz: generatedContent.quiz
        }
      });
    }
  };

  const handleNavigateToQuiz = () => {
    if (generatedContent) {
      navigate('/quiz', {
        state: {
          quiz: generatedContent.quiz,
          summaryData: generatedContent.summary,
          flashcards: generatedContent.flashcards
        }
      });
    }
  };

  return (
    <div className="min-vh-100 bg-gradient-main">
      <div className="container-fluid px-3 py-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-4"
        >
          <h1 className="display-4 fw-bold mb-2 gradient-text">
            SmartWay Study Tool
          </h1>
          <p className="text-bright-muted lead">
            Paste your notes and generate comprehensive study materials instantly
          </p>
        </motion.div>

        {/* Input Form */}
        <InputForm onSubmit={handleSubmit} isLoading={isLoading} />

        {/* Loading State */}
        {isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="d-flex flex-column align-items-center justify-content-center my-4"
            style={{ minHeight: 200 }}
          >
            <div className="spinner-border text-accent-indigo mb-3" style={{ width: 64, height: 64 }} role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <div className="text-bright fs-5 mb-2">Generating your study pack...</div>
            <div className="text-bright-muted">This may take a moment</div>
          </motion.div>
        )}

        {/* Error State */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="alert alert-danger text-center my-4"
          >
            <strong>Error:</strong> {error}
          </motion.div>
        )}

        {/* Success State - Navigation Options */}
        {generatedContent && !isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4"
          >
            <div className="text-center mb-4">
              <h2 className="gradient-text fs-3 fw-bold mb-2">
                ✅ Study Pack Generated Successfully!
              </h2>
              <p className="text-bright-muted fs-5">
                Choose how you'd like to study your material:
              </p>
            </div>

            <div className="row g-3 justify-content-center">
              {/* Summary Card */}
              <div className="col-lg-4 col-md-6">
                <motion.div
                  className="card-glass h-100 text-center p-4 interactive-card"
                  whileHover={{ scale: 1.02, y: -5 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleNavigateToSummary}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="mb-3">
                    <span className="fs-1">📖</span>
                  </div>
                  <h3 className="h5 fw-bold text-bright mb-3">Detailed Summary</h3>
                  <p className="text-bright-muted mb-4">
                    Structured overview with key points, definitions, and important concepts
                  </p>
                  <div className="mt-auto">
                    <button
                      onClick={handleNavigateToSummary}
                      className="btn btn-primary btn-lg w-100"
                    >
                      View Summary
                    </button>
                  </div>
                </motion.div>
              </div>

              {/* Flashcards Card */}
              <div className="col-lg-4 col-md-6">
                <motion.div
                  className="card-glass h-100 text-center p-4 interactive-card"
                  whileHover={{ scale: 1.02, y: -5 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleNavigateToFlashcards}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="mb-3">
                    <span className="fs-1">📚</span>
                  </div>
                  <h3 className="h5 fw-bold text-bright mb-3">Interactive Flashcards</h3>
                  <p className="text-bright-muted mb-4">
                    15 flashcards with flip animations to test your knowledge
                  </p>
                  <div className="mt-auto">
                    <button
                      onClick={handleNavigateToFlashcards}
                      className="btn btn-accent-purple btn-lg w-100"
                    >
                      Study Flashcards
                    </button>
                  </div>
                </motion.div>
              </div>

              {/* Quiz Card */}
              <div className="col-lg-4 col-md-6">
                <motion.div
                  className="card-glass h-100 text-center p-4 interactive-card"
                  whileHover={{ scale: 1.02, y: -5 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleNavigateToQuiz}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="mb-3">
                    <span className="fs-1">🧠</span>
                  </div>
                  <h3 className="h5 fw-bold text-bright mb-3">Interactive Quiz</h3>
                  <p className="text-bright-muted mb-4">
                    20 questions with instant feedback and scoring
                  </p>
                  <div className="mt-auto">
                    <button
                      onClick={handleNavigateToQuiz}
                      className="btn btn-accent-indigo btn-lg w-100"
                    >
                      Take Quiz
                    </button>
                  </div>
                </motion.div>
              </div>
            </div>

            {/* Additional Info */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-center mt-4"
            >
              <div className="card-glass p-4">
                <h4 className="text-bright fw-bold mb-3">📊 What's Inside Your Study Pack</h4>
                <div className="row g-3 text-center">
                  <div className="col-md-4">
                    <div className="text-accent-indigo mb-2">
                      <strong>{generatedContent.summary?.keyPoints?.length || 5}</strong>
                    </div>
                    <div className="text-bright-muted small">Key Points</div>
                  </div>
                  <div className="col-md-4">
                    <div className="text-accent-purple mb-2">
                      <strong>{generatedContent.flashcards?.length || 15}</strong>
                    </div>
                    <div className="text-bright-muted small">Flashcards</div>
                  </div>
                  <div className="col-md-4">
                    <div className="text-accent-yellow mb-2">
                      <strong>{generatedContent.quiz?.length || 20}</strong>
                    </div>
                    <div className="text-bright-muted small">Quiz Questions</div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Generate New Pack */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="text-center mt-4"
            >
              <button
                onClick={() => {
                  setGeneratedContent(null);
                  setError(null);
                }}
                className="btn btn-outline-light btn-lg px-4"
              >
                📝 Generate Another Study Pack
              </button>
            </motion.div>
          </motion.div>
        )}
      </div>
    </div>
  );
}; 