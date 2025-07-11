import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { StudyNavigation } from '@components/StudyNavigation';
import { TabSelector } from '@components/TabSelector';
import { SummaryView } from '@components/SummaryView';

interface KeyPoint {
  title: string;
  explanation: string;
}

interface SummaryData {
  overview: string;
  keyPoints: KeyPoint[] | string[]; // Support both new and legacy formats
  definitions: Record<string, string> | Array<{ term: string; definition: string }>;
  keyConcepts?: string[];
}

export const SummaryPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [summaryData, setSummaryData] = useState<SummaryData | null>(null);

  useEffect(() => {
    // Try different possible data structures
    const data = location.state?.summaryData || location.state?.summary;
    console.log('Summary page received:', location.state);
    if (data) {
      // Convert API format to component format
      const convertedData: SummaryData = {
        overview: data.overview || 'No overview available',
        keyPoints: data.keyPoints || [],
        definitions: data.definitions || [],
        keyConcepts: data.keyConcepts || data.importantConcepts || []
      };
      setSummaryData(convertedData);
    } else {
      // Redirect to app if no data
      navigate('/app');
    }
  }, [location.state, navigate]);

  if (!summaryData) {
    return (
      <div className="min-vh-100 bg-gradient-main d-flex align-items-center justify-content-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div 
            className="spinner-border text-accent-indigo mb-3" 
            style={{ width: 64, height: 64 }} 
            role="status"
          >
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="text-bright-muted">Loading your study summary...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-vh-100 bg-gradient-main">
      <div className="container-fluid px-3 py-3">
        <StudyNavigation
          title="📖 Study Summary"
        />

        {/* Add Tab Navigation */}
        <TabSelector 
          activeTab="summary"
          totalFlashcards={location.state?.flashcards?.length || 0}
          totalQuestions={location.state?.quiz?.length || 0}
        />

        {/* Main Content - Improved spacing and layout */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="row justify-content-center"
        >
          <div className="col-12">
            <SummaryView summaryData={summaryData} />
          </div>
        </motion.div>

        {/* Enhanced Action Buttons - More prominent and better spaced */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="row justify-content-center g-3 mt-4 summary-action-buttons"
        >
          <div className="col-12 col-sm-6 col-md-5 col-lg-4">
            <motion.button
              onClick={() => navigate('/flashcards', { state: location.state })}
              className="btn btn-primary btn-lg w-100 d-flex align-items-center justify-content-center gap-3 action-btn"
              style={{
                borderRadius: '20px',
                background: 'linear-gradient(135deg, #6366F1, #7C3AED)',
                border: 'none',
                boxShadow: '0 8px 24px rgba(99, 102, 241, 0.4)',
                padding: '18px 24px',
                minHeight: '72px'
              }}
              whileHover={{ scale: 1.05, y: -3, boxShadow: '0 12px 32px rgba(99, 102, 241, 0.5)' }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="fs-2">📚</span>
              <div className="text-start">
                <div className="fw-bold fs-6">Study Flashcards</div>
                <small className="opacity-75">
                  {location.state?.flashcards?.length || 0} cards ready
                </small>
              </div>
            </motion.button>
          </div>
          
          <div className="col-12 col-sm-6 col-md-5 col-lg-4">
            <motion.button
              onClick={() => navigate('/quiz', { state: location.state })}
              className="btn btn-lg w-100 d-flex align-items-center justify-content-center gap-3 action-btn"
              style={{
                borderRadius: '20px',
                background: 'linear-gradient(135deg, #7C3AED, #6366F1)',
                border: 'none',
                color: 'white',
                boxShadow: '0 8px 24px rgba(124, 58, 237, 0.4)',
                padding: '18px 24px',
                minHeight: '72px'
              }}
              whileHover={{ scale: 1.05, y: -3, boxShadow: '0 12px 32px rgba(124, 58, 237, 0.5)' }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="fs-2">🧠</span>
              <div className="text-start">
                <div className="fw-bold fs-6">Take Quiz</div>
                <small className="opacity-75">
                  {location.state?.quiz?.length || 0} questions
                </small>
              </div>
            </motion.button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}; 