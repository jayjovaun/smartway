import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { InputForm } from '@components/InputForm';
import { Logo } from '@components/Logo';
import { ErrorModal } from '@components/ErrorModal';
import type { StudyPackResult } from '@api/generate';

export const AppPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<StudyPackResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [lastSubmissionData, setLastSubmissionData] = useState<{ notes?: string; file?: File; fileURL?: string } | null>(null);

  // Handle back navigation from study pages
  useEffect(() => {
    if (location.state?.generatedContent) {
      setGeneratedContent(location.state.generatedContent);
      // Clear the state to avoid setting it again
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const handleSubmit = async (data: { notes?: string; file?: File; fileURL?: string }) => {
    try {
      setIsLoading(true);
      setError(null);
      setLastSubmissionData(data);
      
      let response;
      
      if (data.fileURL) {
        // Handle file URL from Firebase Storage
        response = await fetch('/api/generate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ fileURL: data.fileURL })
        });
      } else if (data.notes) {
        // Handle text input
        response = await fetch('/api/generate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ notes: data.notes })
        });
      } else {
        throw new Error('No content provided');
      }

      // Check if response is HTML (error page) instead of JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Server returned an invalid response. Please try again.');
      }

      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
        } catch {
          throw new Error('Unable to process the request. Please check your file and try again.');
        }
        throw new Error(errorData.error || 'Failed to generate study pack');
      }

      const result = await response.json();
      
      if (!result.summary || !result.flashcards || !result.quiz) {
        throw new Error('Invalid response format from server');
      }

      setGeneratedContent(result);
      setError(null);
    } catch (error) {
      console.error('Error generating study pack:', error);
      
      let errorMessage = 'Failed to generate study pack. ';
      
      if (error instanceof Error) {
        if (error.message.includes('Invalid file type')) {
          errorMessage = 'Please upload a PDF, Word document (.docx, .doc), or text file.';
        } else if (error.message.includes('file size')) {
          errorMessage = 'File size must be less than 10MB. Please upload a smaller file.';
        } else if (error.message.includes('No content found')) {
          errorMessage = 'No text content could be extracted from the document. Please check the file and try again.';
        } else if (error.message.includes('Gemini API')) {
          errorMessage = 'AI service is temporarily unavailable. Please try again in a moment.';
        } else if (error.message.includes('Server returned an invalid response')) {
          errorMessage = 'Server encountered an error. Please try again or contact support if the issue persists.';
        } else if (error.message.includes('Failed to fetch')) {
          errorMessage = 'Network error. Please check your connection and try again.';
        } else {
          errorMessage = error.message;
        }
      }
      
      setError(errorMessage);
      setShowErrorModal(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetry = () => {
    setShowErrorModal(false);
    if (lastSubmissionData) {
      handleSubmit(lastSubmissionData);
    }
  };

  const handleCloseError = () => {
    setShowErrorModal(false);
    setError(null);
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
        {/* Top Navigation with Logo */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <Logo size={48} showText={true} />
          <div></div> {/* Spacer for alignment */}
        </div>

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
            Transform your notes into comprehensive study materials instantly
          </p>
        </motion.div>

        {/* Input Form */}
        <InputForm onSubmit={handleSubmit} isLoading={isLoading} />

        {/* Loading State */}
        {isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="d-flex flex-column align-items-center justify-content-center my-5"
            style={{ minHeight: 200 }}
          >
            <div className="spinner-border text-accent-indigo mb-3" style={{ width: 64, height: 64 }} role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <div className="text-bright fs-5 mb-2">Generating your study pack...</div>
            <div className="text-bright-muted">This may take a moment</div>
          </motion.div>
        )}

        {/* Success State - Navigation Options */}
        {generatedContent && !isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-5"
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-center mb-4"
            >
              <h2 className="text-bright fw-bold fs-3 mb-2">🎉 Study Pack Ready!</h2>
              <p className="text-bright-muted">Choose how you'd like to study your material</p>
            </motion.div>

            <div className="row g-4 justify-content-center">
              {/* Summary Card */}
              <div className="col-lg-4 col-md-6 col-12">
                <motion.div
                  className="card-glass h-100 text-center p-4 interactive-card"
                  whileHover={{ scale: 1.02, y: -3 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleNavigateToSummary}
                  style={{ 
                    cursor: 'pointer',
                    minHeight: '280px',
                    background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(124, 58, 237, 0.2))',
                    border: '2px solid rgba(99, 102, 241, 0.3)',
                    borderRadius: '16px'
                  }}
                >
                  <div className="mb-3">
                    <span className="display-4">📖</span>
                  </div>
                  <h3 className="h5 fw-bold text-bright mb-3">Smart Summary</h3>
                  <p className="text-bright-muted mb-4">
                    Organized overview with key points, definitions, and important concepts
                  </p>
                  <div className="mt-auto">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleNavigateToSummary();
                      }}
                      className="btn btn-primary btn-lg w-100"
                      style={{
                        borderRadius: '12px',
                        fontWeight: '600',
                        background: 'linear-gradient(135deg, #6366F1, #7C3AED)',
                        border: 'none'
                      }}
                    >
                      View Summary
                    </button>
                  </div>
                </motion.div>
              </div>

              {/* Flashcards Card */}
              <div className="col-lg-4 col-md-6 col-12">
                <motion.div
                  className="card-glass h-100 text-center p-4 interactive-card"
                  whileHover={{ scale: 1.02, y: -3 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleNavigateToFlashcards}
                  style={{ 
                    cursor: 'pointer',
                    minHeight: '280px',
                    background: 'linear-gradient(135deg, rgba(124, 58, 237, 0.2), rgba(99, 102, 241, 0.2))',
                    border: '2px solid rgba(124, 58, 237, 0.3)',
                    borderRadius: '16px'
                  }}
                >
                  <div className="mb-3">
                    <span className="display-4">📚</span>
                  </div>
                  <h3 className="h5 fw-bold text-bright mb-3">Interactive Flashcards</h3>
                  <p className="text-bright-muted mb-4">
                    {generatedContent.flashcards?.length || 15} flashcards with flip animations to test your knowledge
                  </p>
                  <div className="mt-auto">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleNavigateToFlashcards();
                      }}
                      className="btn btn-primary btn-lg w-100"
                      style={{
                        borderRadius: '12px',
                        fontWeight: '600',
                        background: 'linear-gradient(135deg, #7C3AED, #6366F1)',
                        border: 'none'
                      }}
                    >
                      Study Flashcards
                    </button>
                  </div>
                </motion.div>
              </div>

              {/* Quiz Card */}
              <div className="col-lg-4 col-md-6 col-12">
                <motion.div
                  className="card-glass h-100 text-center p-4 interactive-card"
                  whileHover={{ scale: 1.02, y: -3 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleNavigateToQuiz}
                  style={{ 
                    cursor: 'pointer',
                    minHeight: '280px',
                    background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.2), rgba(251, 191, 36, 0.2))',
                    border: '2px solid rgba(245, 158, 11, 0.3)',
                    borderRadius: '16px'
                  }}
                >
                  <div className="mb-3">
                    <span className="display-4">🧠</span>
                  </div>
                  <h3 className="h5 fw-bold text-bright mb-3">Interactive Quiz</h3>
                  <p className="text-bright-muted mb-4">
                    {generatedContent.quiz?.length || 20} questions with instant feedback and scoring
                  </p>
                  <div className="mt-auto">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleNavigateToQuiz();
                      }}
                      className="btn btn-primary btn-lg w-100"
                      style={{
                        borderRadius: '12px',
                        fontWeight: '600',
                        background: 'linear-gradient(135deg, #F59E0B, #EAB308)',
                        border: 'none'
                      }}
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
              transition={{ delay: 0.7 }}
              className="text-center mt-4"
            >
              <button
                onClick={() => {
                  setGeneratedContent(null);
                  setError(null);
                }}
                className="btn btn-outline-light btn-lg px-4"
                style={{
                  borderRadius: '12px',
                  fontWeight: '600',
                  borderColor: 'rgba(255, 255, 255, 0.3)',
                  color: '#ffffff'
                }}
              >
                📝 Generate Another Study Pack
              </button>
            </motion.div>
          </motion.div>
        )}
      </div>

      {/* Error Modal */}
      <ErrorModal
        show={showErrorModal}
        onClose={handleCloseError}
        message={error || ''}
        onRetry={lastSubmissionData ? handleRetry : undefined}
      />
    </div>
  );
}; 