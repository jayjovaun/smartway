import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { FiArrowLeft, FiBookOpen, FiStar, FiList } from 'react-icons/fi';

interface SummaryData {
  overview: string;
  keyPoints: string[];
  definitions: Array<{ term: string; definition: string }>;
  importantConcepts: string[];
}

export const SummaryPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [summaryData, setSummaryData] = useState<SummaryData | null>(null);

  useEffect(() => {
    const data = location.state?.summaryData;
    if (data) {
      setSummaryData(data);
    } else {
      // Redirect to app if no data
      navigate('/app');
    }
  }, [location.state, navigate]);

  if (!summaryData) {
    return (
      <div className="min-vh-100 bg-gradient-main d-flex align-items-center justify-content-center">
        <div className="spinner-border text-accent-indigo" style={{ width: 64, height: 64 }} role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

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
            <FiBookOpen className="me-2" />
            Study Summary
          </h1>
          <div style={{ width: '140px' }}></div> {/* Spacer for alignment */}
        </motion.div>

        {/* Content */}
        <div className="row g-4">
          {/* Overview Section */}
          <div className="col-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="card-glass h-100"
            >
              <div className="card-body p-4">
                <h2 className="h4 fw-bold text-bright mb-3 d-flex align-items-center">
                  <FiBookOpen className="me-2 text-accent-indigo" />
                  Overview
                </h2>
                <p className="text-bright fs-5 mb-0 lh-base">
                  {summaryData.overview}
                </p>
              </div>
            </motion.div>
          </div>

          {/* Key Points Section */}
          <div className="col-lg-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="card-glass h-100"
            >
              <div className="card-body p-4">
                <h2 className="h4 fw-bold text-bright mb-3 d-flex align-items-center">
                  <FiList className="me-2 text-accent-purple" />
                  Key Points
                </h2>
                <ul className="list-unstyled mb-0">
                  {summaryData.keyPoints.map((point, index) => (
                    <motion.li
                      key={index}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 + index * 0.1 }}
                      className="d-flex align-items-start gap-3 mb-3"
                    >
                      <div 
                        className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
                        style={{ 
                          width: '28px', 
                          height: '28px', 
                          background: 'linear-gradient(135deg, #6366F1, #7C3AED)',
                          fontSize: '14px',
                          fontWeight: 'bold',
                          color: 'white'
                        }}
                      >
                        {index + 1}
                      </div>
                      <span className="text-bright lh-base">{point}</span>
                    </motion.li>
                  ))}
                </ul>
              </div>
            </motion.div>
          </div>

          {/* Important Concepts Section */}
          <div className="col-lg-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="card-glass h-100"
            >
              <div className="card-body p-4">
                <h2 className="h4 fw-bold text-bright mb-3 d-flex align-items-center">
                  <FiStar className="me-2 text-accent-yellow" />
                  Important Concepts
                </h2>
                <div className="d-flex flex-wrap gap-2">
                  {summaryData.importantConcepts.map((concept, index) => (
                    <motion.span
                      key={index}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.5 + index * 0.1 }}
                      className="badge fs-6 px-3 py-2"
                      style={{
                        background: 'linear-gradient(135deg, #6366F1, #7C3AED)',
                        color: 'white',
                        borderRadius: '12px',
                        fontWeight: '500'
                      }}
                    >
                      {concept}
                    </motion.span>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>

          {/* Definitions Section */}
          <div className="col-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="card-glass"
            >
              <div className="card-body p-4">
                <h2 className="h4 fw-bold text-bright mb-4 d-flex align-items-center">
                  <span className="me-2">📚</span>
                  Key Definitions
                </h2>
                <div className="row g-3">
                  {summaryData.definitions.map((def, index) => (
                    <div key={index} className="col-md-6 col-lg-4">
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.7 + index * 0.1 }}
                        className="p-3 rounded-3"
                        style={{
                          background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(124, 58, 237, 0.1))',
                          border: '1px solid rgba(99, 102, 241, 0.3)',
                          backdropFilter: 'blur(10px)'
                        }}
                      >
                        <h5 className="gradient-text fw-bold mb-2 fs-6">
                          {def.term}
                        </h5>
                        <p className="text-bright-muted mb-0 small">
                          {def.definition}
                        </p>
                      </motion.div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="d-flex justify-content-center gap-3 mt-5"
        >
          <button
            onClick={() => navigate('/flashcards', { state: location.state })}
            className="btn btn-primary btn-lg px-4 d-flex align-items-center gap-2"
          >
            📚 Study Flashcards
          </button>
          <button
            onClick={() => navigate('/quiz', { state: location.state })}
            className="btn btn-accent-purple btn-lg px-4 d-flex align-items-center gap-2"
          >
            🧠 Take Quiz
          </button>
        </motion.div>
      </div>
    </div>
  );
}; 