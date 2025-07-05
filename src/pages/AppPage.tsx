import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { InputForm } from '../components/InputForm';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorModal } from '../components/ErrorModal';

interface GeneratedContent {
  summary: any;
  flashcards: any[];
  quiz: any[];
}

export const AppPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [lastSubmissionData, setLastSubmissionData] = useState<{ notes?: string; file?: File; extractedText?: string } | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async (data: { notes?: string; file?: File; extractedText?: string }) => {
    try {
      setIsLoading(true);
      setError(null);
      setLastSubmissionData(data);
      
      let response;
      
      if (data.extractedText) {
        // Handle extracted text from uploaded file
        response = await fetch('/api/generate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ extractedText: data.extractedText })
        });
      } else if (data.notes) {
        // Handle direct text input
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
    } catch (error: any) {
      console.error('Error generating study pack:', error);
      
      let errorMessage = 'Failed to generate study pack. ';
      
      if (error instanceof Error) {
        if (error.message.includes('Invalid file type')) {
          errorMessage = 'Please upload a PDF, Word document (.docx, .doc), or text file.';
        } else if (error.message.includes('file size')) {
          errorMessage = 'File size must be less than 4MB. Please upload a smaller file.';
        } else if (error.message.includes('No content found')) {
          errorMessage = 'No text content could be extracted from the document. Please check the file and try again.';
        } else if (error.message.includes('Gemini API')) {
          errorMessage = 'AI service is temporarily unavailable. Please try again in a moment.';
        } else if (error.message.includes('Server returned an invalid response')) {
          errorMessage = 'Server encountered an error. Please try again or contact support if the issue persists.';
        } else if (error.message.includes('Failed to fetch')) {
          errorMessage = 'Network error. Please check your connection and try again.';
        } else if (error.message.includes('copy and paste')) {
          errorMessage = error.message;
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

  return (
    <div className="min-vh-100" style={{ 
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      paddingTop: '2rem',
      paddingBottom: '2rem'
    }}>
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-5"
        >
          <h1 className="display-4 fw-bold text-white mb-3">
            🎓 SmartWay
          </h1>
          <p className="lead text-white opacity-90">
            Transform your study material into interactive learning experiences
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <InputForm onSubmit={handleSubmit} isLoading={isLoading} />
        </motion.div>

        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="mt-5"
          >
            <LoadingSpinner />
          </motion.div>
        )}

        {generatedContent && !isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mt-5"
          >
            <div className="card-glass p-4 text-center">
              <h3 className="text-bright fw-bold mb-3">
                ✨ Study Pack Generated Successfully!
              </h3>
              <p className="text-bright-muted mb-4">
                Your personalized study materials are ready. Start learning with summaries, flashcards, and quizzes.
              </p>
              <motion.button
                onClick={handleNavigateToSummary}
                className="btn btn-primary btn-lg px-5 py-3 fw-semibold"
                style={{
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                  border: 'none',
                  fontSize: '18px'
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                🚀 Start Learning
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* Error Modal */}
        <ErrorModal
          show={showErrorModal}
          error={error}
          onRetry={handleRetry}
          onClose={handleCloseError}
        />
      </div>
    </div>
  );
}; 