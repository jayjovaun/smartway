import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiBookOpen, FiTarget, FiHelpCircle, FiX, FiChevronRight, FiTag, FiInfo, FiZap, FiStar } from 'react-icons/fi';

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

interface SummaryViewProps {
  summaryData: SummaryData;
}

export const SummaryView: React.FC<SummaryViewProps> = ({ summaryData }) => {
  const [selectedKeyPoint, setSelectedKeyPoint] = useState<KeyPoint | null>(null);
  const [selectedDefinition, setSelectedDefinition] = useState<{ term: string; definition: string } | null>(null);
  const [hoveredPoint, setHoveredPoint] = useState<number | null>(null);

  const formatDefinitions = () => {
    if (!summaryData.definitions) return [];
    
    if (Array.isArray(summaryData.definitions)) {
      return summaryData.definitions;
    } else {
      return Object.entries(summaryData.definitions).map(([term, definition]) => ({
        term,
        definition
      }));
    }
  };

  const formatKeyPoints = (): KeyPoint[] => {
    if (!summaryData.keyPoints) return [];
    
    // If it's already the new format (array of objects with title and explanation)
    if (Array.isArray(summaryData.keyPoints) && summaryData.keyPoints.length > 0 && 
        typeof summaryData.keyPoints[0] === 'object' && 'title' in summaryData.keyPoints[0]) {
      return (summaryData.keyPoints as KeyPoint[]).map((point, index) => {
        // If the title is generic, try to create a better one from the explanation
        if (point.title.match(/^Key Point \d+$/i) || point.title.match(/^Point \d+$/i) || point.title.match(/^Concept \d+$/i)) {
          // Extract meaningful words from the beginning of explanation to create a better title
          const explanation = point.explanation || '';
          const sentences = explanation.split(/[.!?]+/);
          const firstSentence = sentences[0]?.trim() || '';
          
          // Try to extract key terms or concepts from the first sentence
          let betterTitle = '';
          
          // Look for patterns like "X is", "X refers to", "The concept of X"
          const conceptMatch = firstSentence.match(/(?:The concept of|The idea of|The principle of)\s+([^,]+)/i);
          const isMatch = firstSentence.match(/^([A-Z][^,]+?)\s+(?:is|are|refers to|involves)/);
          const subjectMatch = firstSentence.match(/^([A-Z][^.]{10,50}?)(?:\s+involves|\s+includes|\s+encompasses|\s+represents)/);
          
          if (conceptMatch) {
            betterTitle = conceptMatch[1].trim();
          } else if (isMatch) {
            betterTitle = isMatch[1].trim();
          } else if (subjectMatch) {
            betterTitle = subjectMatch[1].trim();
          } else {
            // Fallback: take first 3-5 meaningful words
            const words = firstSentence.split(' ').slice(0, 5);
            betterTitle = words.join(' ');
          }
          
          // Clean up the title
          betterTitle = betterTitle.replace(/^(The|A|An)\s+/i, '').trim();
          
          return {
            ...point,
            title: betterTitle.length > 3 ? betterTitle : `Learning Concept ${index + 1}`
          };
        }
        return point;
      });
    }
    
    // If it's the legacy format (array of strings), convert to new format
    if (Array.isArray(summaryData.keyPoints)) {
      return summaryData.keyPoints.map((point, index) => {
        const pointText = typeof point === 'string' ? point : String(point);
        
        // Try to extract a meaningful title from the content
        const sentences = pointText.split(/[.!?]+/);
        const firstSentence = sentences[0]?.trim() || '';
        
        // Extract a meaningful title
        let title = '';
        const conceptMatch = firstSentence.match(/(?:The concept of|The idea of|The principle of)\s+([^,]+)/i);
        const isMatch = firstSentence.match(/^([A-Z][^,]+?)\s+(?:is|are|refers to|involves)/);
        
        if (conceptMatch) {
          title = conceptMatch[1].trim();
        } else if (isMatch) {
          title = isMatch[1].trim();
        } else if (firstSentence.length > 5 && firstSentence.length < 60) {
          title = firstSentence;
        } else {
          // Fallback: take first few meaningful words
          const words = firstSentence.split(' ').slice(0, 4);
          title = words.join(' ');
        }
        
        // Clean up the title
        title = title.replace(/^(The|A|An)\s+/i, '').trim();
        
        return {
          title: title.length > 3 ? title : `Learning Concept ${index + 1}`,
          explanation: pointText
        };
      });
    }
    
    return [];
  };

  const definitions = formatDefinitions();
  const keyPoints = formatKeyPoints();

  const openKeyPointModal = (keyPoint: KeyPoint) => {
    setSelectedKeyPoint(keyPoint);
  };

  const openDefinitionModal = (term: string, definition: string) => {
    setSelectedDefinition({ term, definition });
  };

  return (
    <div className="summary-container">
      {/* Hero Overview Section */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="overview-hero mb-4"
      >
        <div 
          className="position-relative overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(124, 58, 237, 0.15))',
            borderRadius: '24px',
            border: '1px solid rgba(99, 102, 241, 0.2)',
            backdropFilter: 'blur(20px)'
          }}
        >
          {/* Floating background elements */}
          <div className="position-absolute w-100 h-100">
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={i}
                className="position-absolute rounded-circle"
                style={{
                  width: `${40 + i * 20}px`,
                  height: `${40 + i * 20}px`,
                  background: `linear-gradient(135deg, rgba(99, 102, 241, 0.${3 - i}), rgba(124, 58, 237, 0.${2 - i}))`,
                  right: `${10 + i * 15}%`,
                  top: `${20 + i * 10}%`,
                }}
                animate={{ 
                  y: [0, -10, 0],
                  opacity: [0.3, 0.6, 0.3],
                  scale: [1, 1.1, 1]
                }}
                transition={{ 
                  duration: 4 + i, 
                  repeat: Infinity,
                  delay: i * 0.5
                }}
              />
            ))}
          </div>

          <div className="position-relative p-4 p-md-5">
            <div className="d-flex align-items-center gap-3 mb-4">
              <motion.div 
                className="rounded-circle d-flex align-items-center justify-content-center"
                style={{ 
                  width: '56px', 
                  height: '56px',
                  background: 'linear-gradient(135deg, #6366F1, #7C3AED)',
                  color: 'white',
                  boxShadow: '0 8px 24px rgba(99, 102, 241, 0.4)'
                }}
                whileHover={{ scale: 1.1, rotate: 5 }}
              >
                <FiBookOpen size={24} />
              </motion.div>
              <div>
                <h2 className="h4 fw-bold text-bright mb-1">📖 Study Overview</h2>
                <p className="text-bright-muted mb-0 small">Comprehensive content summary</p>
              </div>
            </div>
            
            <div 
              className="p-4 rounded-3"
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)'
              }}
            >
              <p className="text-bright mb-0 lh-lg" style={{ fontSize: '1.1rem', textAlign: 'justify' }}>
                {summaryData.overview}
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Interactive Key Points Grid */}
      {keyPoints.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-4"
        >
          <div className="d-flex align-items-center gap-3 mb-4">
            <div 
              className="rounded-circle d-flex align-items-center justify-content-center"
              style={{ 
                width: '48px', 
                height: '48px',
                background: 'linear-gradient(135deg, #F59E0B, #EAB308)',
                color: 'white'
              }}
            >
              <FiTarget size={20} />
            </div>
            <div>
              <h3 className="h5 fw-bold text-bright mb-1">🎯 Key Learning Points</h3>
              <p className="text-bright-muted mb-0 small">Click any point to dive deeper • {keyPoints.length} concepts to master</p>
            </div>
          </div>

          <div className="row g-3">
            {keyPoints.map((point, index) => (
              <div key={index} className="col-12 col-md-6 col-lg-4">
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className="h-100 cursor-pointer position-relative point-card"
                  style={{
                    background: hoveredPoint === index 
                      ? 'linear-gradient(135deg, rgba(245, 158, 11, 0.2), rgba(251, 191, 36, 0.25))'
                      : 'linear-gradient(135deg, rgba(245, 158, 11, 0.1), rgba(251, 191, 36, 0.15))',
                    border: '2px solid rgba(245, 158, 11, 0.3)',
                    borderRadius: '16px',
                    transition: 'all 0.3s ease',
                    overflow: 'hidden'
                  }}
                  whileHover={{ 
                    scale: 1.02, 
                    y: -4,
                    boxShadow: '0 12px 32px rgba(245, 158, 11, 0.3)'
                  }}
                  whileTap={{ scale: 0.98 }}
                  onMouseEnter={() => setHoveredPoint(index)}
                  onMouseLeave={() => setHoveredPoint(null)}
                  onClick={() => openKeyPointModal(point)}
                >
                  {/* Card Number Badge */}
                  <div 
                    className="position-absolute d-flex align-items-center justify-content-center fw-bold"
                    style={{
                      top: '12px',
                      right: '12px',
                      width: '28px',
                      height: '28px',
                      background: 'linear-gradient(135deg, #F59E0B, #EAB308)',
                      borderRadius: '50%',
                      color: 'white',
                      fontSize: '12px',
                      zIndex: 2
                    }}
                  >
                    {index + 1}
                  </div>

                  <div className="p-4">
                    <div className="d-flex align-items-center gap-3 mb-4">
                      <div 
                        className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
                        style={{ 
                          width: '48px', 
                          height: '48px',
                          background: 'rgba(245, 158, 11, 0.3)',
                          color: '#F59E0B'
                        }}
                      >
                        <FiZap size={20} />
                      </div>
                      <div className="flex-grow-1">
                        <h4 className="h5 fw-bold text-bright mb-0 lh-sm">
                          {point.title}
                        </h4>
                      </div>
                    </div>
                    
                    <div className="d-flex align-items-center justify-content-between">
                      <div className="text-bright-muted small d-flex align-items-center gap-1">
                        <FiInfo size={14} />
                        <span>Tap to explore this concept</span>
                      </div>
                      <motion.div
                        animate={{ x: hoveredPoint === index ? 6 : 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <FiChevronRight size={18} className="text-accent-yellow" />
                      </motion.div>
                    </div>
                  </div>
                </motion.div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Modern Definitions Section */}
      {definitions.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-4"
        >
          <div className="d-flex align-items-center gap-3 mb-4">
            <div 
              className="rounded-circle d-flex align-items-center justify-content-center"
              style={{ 
                width: '48px', 
                height: '48px',
                background: 'linear-gradient(135deg, #10B981, #22C55E)',
                color: 'white'
              }}
            >
              <FiHelpCircle size={20} />
            </div>
            <div>
              <h3 className="h5 fw-bold text-bright mb-1">📚 Key Definitions</h3>
              <p className="text-bright-muted mb-0 small">Essential terms and concepts • {definitions.length} definitions</p>
            </div>
          </div>

          <div className="row g-3 definitions-grid">
            {definitions.map((def, index) => (
              <div key={index} className="col-12 col-sm-6 col-lg-4">
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                  className="h-100 cursor-pointer definition-card"
                  style={{
                    background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(34, 197, 94, 0.15))',
                    border: '2px solid rgba(16, 185, 129, 0.2)',
                    borderRadius: '12px',
                    transition: 'all 0.2s ease'
                  }}
                  whileHover={{ 
                    scale: 1.02, 
                    y: -2,
                    background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(34, 197, 94, 0.2))',
                    boxShadow: '0 8px 24px rgba(16, 185, 129, 0.2)'
                  }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => openDefinitionModal(def.term, def.definition)}
                >
                  <div className="p-3">
                    <div className="d-flex align-items-start gap-2">
                      <FiTag size={14} className="text-success mt-1 flex-shrink-0" />
                      <div>
                        <h6 className="fw-bold text-bright mb-1">{def.term}</h6>
                        <p className="text-bright-muted small mb-0 lh-base">
                          {def.definition.length > 100 
                            ? `${def.definition.substring(0, 100)}...` 
                            : def.definition}
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Key Point Modal */}
      <AnimatePresence>
        {selectedKeyPoint && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
            style={{ 
              backgroundColor: 'rgba(0, 0, 0, 0.8)', 
              zIndex: 1050,
              backdropFilter: 'blur(12px)'
            }}
            onClick={() => setSelectedKeyPoint(null)}
          >
            <motion.div
              initial={{ scale: 0.7, opacity: 0, y: 50 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.7, opacity: 0, y: 50 }}
              className="mx-3"
              style={{ 
                maxWidth: '700px',
                width: '100%',
                maxHeight: '85vh',
                overflowY: 'auto'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div 
                style={{
                  background: 'linear-gradient(145deg, rgba(31, 41, 55, 0.98), rgba(55, 65, 81, 0.98))',
                  border: '2px solid rgba(245, 158, 11, 0.4)',
                  borderRadius: '24px',
                  boxShadow: '0 25px 80px rgba(0, 0, 0, 0.5)',
                  backdropFilter: 'blur(30px)'
                }}
              >
                <div className="p-4 p-md-5">
                  <div className="d-flex align-items-start justify-content-between mb-4">
                    <div className="d-flex align-items-center gap-3">
                      <div 
                        className="rounded-circle d-flex align-items-center justify-content-center"
                        style={{ 
                          width: '56px', 
                          height: '56px',
                          background: 'linear-gradient(135deg, #F59E0B, #EAB308)',
                          color: 'white',
                          boxShadow: '0 8px 24px rgba(245, 158, 11, 0.4)'
                        }}
                      >
                        <FiStar size={24} />
                      </div>
                      <div>
                        <h3 className="fw-bold text-bright mb-1">{selectedKeyPoint.title}</h3>
                        <small className="text-bright-muted">Key Learning Point</small>
                      </div>
                    </div>
                    <motion.button
                      className="btn btn-link text-bright-muted p-2"
                      onClick={() => setSelectedKeyPoint(null)}
                      style={{ border: 'none', background: 'none' }}
                      whileHover={{ scale: 1.1, rotate: 90 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <FiX size={24} />
                    </motion.button>
                  </div>
                  
                  <div 
                    className="p-4 rounded-3"
                    style={{
                      background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.1), rgba(251, 191, 36, 0.15))',
                      border: '1px solid rgba(245, 158, 11, 0.2)'
                    }}
                  >
                    <p className="text-bright mb-0 lh-lg" style={{ fontSize: '1.1rem', textAlign: 'justify' }}>
                      {selectedKeyPoint.explanation}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Definition Modal */}
      <AnimatePresence>
        {selectedDefinition && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
            style={{ 
              backgroundColor: 'rgba(0, 0, 0, 0.8)', 
              zIndex: 1050,
              backdropFilter: 'blur(12px)'
            }}
            onClick={() => setSelectedDefinition(null)}
          >
            <motion.div
              initial={{ scale: 0.7, opacity: 0, y: 50 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.7, opacity: 0, y: 50 }}
              className="mx-3"
              style={{ 
                maxWidth: '600px',
                width: '100%',
                maxHeight: '80vh',
                overflowY: 'auto'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div 
                style={{
                  background: 'linear-gradient(145deg, rgba(31, 41, 55, 0.98), rgba(55, 65, 81, 0.98))',
                  border: '2px solid rgba(16, 185, 129, 0.4)',
                  borderRadius: '24px',
                  boxShadow: '0 25px 80px rgba(0, 0, 0, 0.5)',
                  backdropFilter: 'blur(30px)'
                }}
              >
                <div className="p-4 p-md-5">
                  <div className="d-flex align-items-start justify-content-between mb-4">
                    <div className="d-flex align-items-center gap-3">
                      <div 
                        className="rounded-circle d-flex align-items-center justify-content-center"
                        style={{ 
                          width: '50px', 
                          height: '50px',
                          background: 'linear-gradient(135deg, #10B981, #22C55E)',
                          color: 'white'
                        }}
                      >
                        <FiTag size={20} />
                      </div>
                      <div>
                        <h4 className="fw-bold text-bright mb-1">{selectedDefinition.term}</h4>
                        <small className="text-bright-muted">Definition</small>
                      </div>
                    </div>
                    <motion.button
                      className="btn btn-link text-bright-muted p-2"
                      onClick={() => setSelectedDefinition(null)}
                      style={{ border: 'none', background: 'none' }}
                      whileHover={{ scale: 1.1, rotate: 90 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <FiX size={24} />
                    </motion.button>
                  </div>
                  
                  <div 
                    className="p-4 rounded-3"
                    style={{
                      background: 'rgba(16, 185, 129, 0.1)',
                      border: '1px solid rgba(16, 185, 129, 0.2)'
                    }}
                  >
                    <p className="text-bright mb-0 lh-lg" style={{ fontSize: '1.1rem', textAlign: 'justify' }}>
                      {selectedDefinition.definition}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}; 