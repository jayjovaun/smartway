import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Logo } from '@components/Logo';

export const Home: React.FC = () => {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate('/app');
  };

  // Stagger animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: 0.3,
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring" as const,
        damping: 12,
        stiffness: 200
      }
    }
  };

  const cardVariants = {
    hidden: { scale: 0.8, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: {
        type: "spring" as const,
        damping: 10,
        stiffness: 100
      }
    }
  };

  return (
    <div className="min-vh-100 bg-gradient-main">
      {/* Animated Background Particles */}
      <div 
        className="position-fixed top-0 start-0 pointer-events-none" 
        style={{ 
          width: 'calc(100vw - 20px)', 
          height: '100vh', 
          overflow: 'hidden',
          zIndex: 0
        }}
      >
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="position-absolute rounded-circle"
            style={{
              width: `${20 + i * 8}px`,
              height: `${20 + i * 8}px`,
              background: `linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(124, 58, 237, 0.1))`,
              left: `${10 + i * 12}%`,
              top: `${15 + i * 10}%`,
            }}
            animate={{
              x: [0, 30, 0],
              y: [0, -20, 0],
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{
              duration: 4 + i * 0.5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.2
            }}
          />
        ))}
      </div>

      <div className="container-fluid px-3 py-4 position-relative" style={{ zIndex: 2 }}>
        {/* Header with Logo Only */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="d-flex justify-content-start align-items-center mb-5"
        >
          <Logo size={64} showText={true} />
        </motion.div>

        {/* Hero Section */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="text-center mb-5"
        >
          <motion.h1 
            variants={itemVariants}
            className="display-3 fw-bold mb-4"
            style={{
              background: 'linear-gradient(135deg, #6366F1, #7C3AED, #EC4899)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              fontSize: 'clamp(2rem, 8vw, 4rem)'
            }}
          >
            Transform Your Notes into<br />
            <motion.span
              animate={{
                backgroundPosition: ['0% 0%', '100% 100%', '0% 0%']
              }}
              transition={{
                duration: 5,
                repeat: Infinity,
                ease: "linear"
              }}
              style={{
                background: 'linear-gradient(45deg, #6366F1, #7C3AED, #EC4899, #6366F1)',
                backgroundSize: '300% 300%',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}
            >
              Powerful Study Materials
            </motion.span>
          </motion.h1>
          
          <motion.p 
            variants={itemVariants}
            className="lead text-bright-muted mb-5" 
            style={{ 
              maxWidth: '700px', 
              margin: '0 auto',
              fontSize: '1.3rem',
              lineHeight: '1.6'
            }}
          >
            Upload documents or paste your notes and instantly generate comprehensive study packs 
            with summaries, flashcards, and adaptive quizzes powered by AI.
          </motion.p>
          
          <motion.div variants={itemVariants}>
            <motion.button
              onClick={handleGetStarted}
              className="btn btn-primary btn-lg px-5 py-3 position-relative overflow-hidden"
              style={{
                borderRadius: '16px',
                background: 'linear-gradient(135deg, #6366F1, #7C3AED)',
                border: 'none',
                fontWeight: '600',
                fontSize: '20px',
                boxShadow: '0 10px 30px rgba(99, 102, 241, 0.4)'
              }}
              whileHover={{ 
                scale: 1.05, 
                y: -3,
                boxShadow: '0 15px 40px rgba(99, 102, 241, 0.6)'
              }}
              whileTap={{ scale: 0.95 }}
            >
              <motion.span
                className="position-absolute top-0 start-0 w-100 h-100"
                style={{
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.2), transparent)',
                  borderRadius: '16px'
                }}
                initial={{ x: '-100%' }}
                whileHover={{ x: '100%' }}
                transition={{ duration: 0.6 }}
              />
              <span className="position-relative d-flex align-items-center gap-2">
                ✨ Start Creating Study Packs
                <motion.span
                  animate={{ x: [0, 5, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  →
                </motion.span>
              </span>
            </motion.button>
          </motion.div>
        </motion.div>

        {/* Features Section */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="row g-4 mb-5"
        >
          {[
            {
              emoji: '📖',
              title: 'Smart Summaries',
              description: 'AI-powered summaries that extract key concepts, definitions, and important points from your study materials.',
              gradient: 'linear-gradient(135deg, #3B82F6, #1E40AF)'
            },
            {
              emoji: '📚',
              title: 'Interactive Flashcards',
              description: 'Beautifully designed flashcards with flip animations and keyboard navigation for effective active recall.',
              gradient: 'linear-gradient(135deg, #8B5CF6, #6D28D9)'
            },
            {
              emoji: '🧠',
              title: 'Adaptive Quizzes',
              description: 'Dynamic quiz generation that adapts to your content length and complexity, with instant feedback and explanations.',
              gradient: 'linear-gradient(135deg, #EF4444, #DC2626)'
            }
          ].map((feature, index) => (
            <div key={index} className="col-lg-4 col-md-6">
              <motion.div
                variants={cardVariants}
                className="card-glass h-100 text-center p-4 position-relative overflow-hidden"
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '20px',
                  backdropFilter: 'blur(10px)'
                }}
                whileHover={{
                  scale: 1.05,
                  rotateY: 5,
                  boxShadow: '0 20px 40px rgba(0, 0, 0, 0.2)'
                }}
                transition={{ duration: 0.3 }}
              >
                <motion.div
                  className="position-absolute top-0 start-0 w-100 h-100"
                  style={{
                    background: feature.gradient,
                    opacity: 0,
                    borderRadius: '20px'
                  }}
                  whileHover={{ opacity: 0.1 }}
                  transition={{ duration: 0.3 }}
                />
                <div className="position-relative">
                  <motion.div 
                    className="mb-3"
                    whileHover={{ 
                      scale: 1.2,
                      rotate: [0, -10, 10, 0]
                    }}
                    transition={{ duration: 0.5 }}
                  >
                    <span className="display-4">{feature.emoji}</span>
                  </motion.div>
                  <h3 className="h5 fw-bold text-bright mb-3">{feature.title}</h3>
                  <p className="text-bright-muted">{feature.description}</p>
                </div>
              </motion.div>
            </div>
          ))}
        </motion.div>

        {/* How it Works Section */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.8 }}
          className="text-center mb-5"
        >
          <motion.h2 
            className="fw-bold mb-4 fs-2"
            style={{
              background: 'linear-gradient(135deg, #6366F1, #7C3AED)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}
            whileHover={{ scale: 1.05 }}
          >
            How SmartWay Works
          </motion.h2>
          
          <div className="row g-4">
            {[
              { number: '1', title: 'Upload or Paste', description: 'Add your notes, documents, or study materials', color: '#6366F1' },
              { number: '2', title: 'AI Processing', description: 'Our AI analyzes and extracts key information', color: '#7C3AED' },
              { number: '3', title: 'Study Pack Generated', description: 'Receive summaries, flashcards, and quizzes', color: '#F59E0B' },
              { number: '4', title: 'Study & Excel', description: 'Use interactive tools to master your material', color: '#10B981' }
            ].map((step, index) => (
              <div key={index} className="col-lg-3 col-md-6">
                <motion.div
                  className="card-glass p-4 h-100"
                  style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '16px'
                  }}
                  whileHover={{
                    scale: 1.05,
                    y: -5,
                    boxShadow: `0 15px 30px ${step.color}30`
                  }}
                  transition={{ duration: 0.3 }}
                >
                  <motion.div 
                    className="mb-3"
                    whileHover={{ 
                      scale: 1.1,
                      rotate: 360
                    }}
                    transition={{ duration: 0.6 }}
                  >
                    <div 
                      className="d-inline-flex align-items-center justify-content-center rounded-circle"
                      style={{
                        width: '60px',
                        height: '60px',
                        background: `linear-gradient(135deg, ${step.color}, ${step.color}CC)`,
                        boxShadow: `0 8px 20px ${step.color}40`
                      }}
                    >
                      <span className="text-white fw-bold fs-4">{step.number}</span>
                    </div>
                  </motion.div>
                  <h4 className="h6 fw-bold text-bright mb-2">{step.title}</h4>
                  <p className="text-bright-muted small">{step.description}</p>
                </motion.div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Supported Formats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="text-center mb-5"
        >
          <motion.div 
            className="card-glass p-4 mx-auto" 
            style={{ 
              maxWidth: '600px',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '20px'
            }}
            whileHover={{
              scale: 1.02,
              boxShadow: '0 20px 40px rgba(99, 102, 241, 0.2)'
            }}
          >
            <h3 className="fw-bold mb-3 fs-4" style={{
              background: 'linear-gradient(135deg, #6366F1, #7C3AED)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>
              Supported Formats
            </h3>
            <div className="row g-3">
              {[
                { emoji: '📄', label: 'PDF' },
                { emoji: '📝', label: 'Word' },
                { emoji: '📋', label: 'Text' },
                { emoji: '⌨️', label: 'Paste' }
              ].map((format, index) => (
                <div key={index} className="col-3">
                  <motion.div 
                    className="text-center"
                    whileHover={{ 
                      scale: 1.1,
                      y: -5
                    }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="fs-2 mb-1">{format.emoji}</div>
                    <div className="text-bright-muted small">{format.label}</div>
                  </motion.div>
                </div>
              ))}
            </div>
          </motion.div>
        </motion.div>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0 }}
          className="text-center"
        >
          <motion.h2 
            className="fw-bold mb-3 fs-3"
            style={{
              background: 'linear-gradient(135deg, #6366F1, #7C3AED)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}
            whileHover={{ scale: 1.05 }}
          >
            Ready to Transform Your Study Experience?
          </motion.h2>
          <motion.p 
            className="text-bright-muted mb-4"
            style={{ fontSize: '1.1rem' }}
          >
            Join thousands of students who are already studying smarter, not harder.
          </motion.p>
          <motion.button
            onClick={handleGetStarted}
            className="btn btn-primary btn-lg px-5 py-3 position-relative overflow-hidden"
            style={{
              borderRadius: '16px',
              background: 'linear-gradient(135deg, #6366F1, #7C3AED)',
              border: 'none',
              fontWeight: '600',
              fontSize: '20px',
              boxShadow: '0 10px 30px rgba(99, 102, 241, 0.4)'
            }}
            whileHover={{ 
              scale: 1.05, 
              y: -3,
              boxShadow: '0 15px 40px rgba(99, 102, 241, 0.6)'
            }}
            whileTap={{ scale: 0.95 }}
          >
            <motion.span
              className="position-absolute top-0 start-0 w-100 h-100"
              style={{
                background: 'linear-gradient(135deg, rgba(255,255,255,0.2), transparent)',
                borderRadius: '16px'
              }}
              initial={{ x: '-100%' }}
              whileHover={{ x: '100%' }}
              transition={{ duration: 0.6 }}
            />
            <span className="position-relative d-flex align-items-center gap-2">
              🚀 Get Started for Free
              <motion.span
                animate={{ x: [0, 5, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                →
              </motion.span>
            </span>
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
};
