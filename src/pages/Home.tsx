import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiArrowRight } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { Logo } from '@components/Logo';

const featureExamples = [
  {
    title: 'Creative AI Summaries',
    content: (
      <>
        <h5 className="fw-bold mb-2 text-bright">Example Summary</h5>
        <p className="mb-0 text-bright">"<span className="gradient-text">Photosynthesis</span> is the process by which green plants use sunlight to synthesize foods from carbon dioxide and water. It produces oxygen as a byproduct and is essential for life on Earth."</p>
      </>
    )
  },
  {
    title: 'Smart Flashcards & Quizzes',
    content: (
      <>
        <h5 className="fw-bold mb-2 text-bright">Example Flashcard</h5>
        <div className="card mb-2 p-3 text-bright" style={{ background: 'rgba(80,90,120,0.96)', border: '1.5px solid #6366F1', color: '#fff' }}>
          <div className="fw-semibold mb-1 text-bright">Q: What is the powerhouse of the cell?</div>
          <div className="text-accent-indigo text-bright">A: Mitochondria</div>
        </div>
        <h5 className="fw-bold mb-2 mt-3 text-bright">Example Quiz</h5>
        <div className="card p-3 text-bright" style={{ background: 'rgba(80,90,120,0.96)', border: '1.5px solid #6366F1', color: '#fff' }}>
          <div className="mb-1 text-bright">Which gas is produced during photosynthesis?</div>
          <ul className="mb-0 text-bright">
            <li>Oxygen</li>
            <li>Carbon Dioxide</li>
            <li>Nitrogen</li>
          </ul>
          <div className="mt-2 text-accent-indigo text-bright">Correct: Oxygen</div>
        </div>
      </>
    )
  },
  {
    title: 'Minimal, Distraction-Free',
    content: (
      <>
        <h5 className="fw-bold mb-2 text-bright">Minimal Mode Example</h5>
        <p className="mb-0 text-bright">All you see is your content and your study tools—no ads, no clutter, just a clean, focused workspace.</p>
      </>
    )
  }
];

export const Home: React.FC = () => {
  const navigate = useNavigate();
  const [ctaHover, setCtaHover] = useState(false);
  const [modalOpen, setModalOpen] = useState<number|null>(null);

  useEffect(() => {
    if (modalOpen !== null) {
      const handler = (e: KeyboardEvent) => {
        if (e.key === 'Escape') setModalOpen(null);
      };
      window.addEventListener('keydown', handler);
      return () => window.removeEventListener('keydown', handler);
    }
  }, [modalOpen]);

  return (
    <div className="min-vh-100 bg-gradient-main d-flex flex-column">
      {/* Hero Section */}
      <section className="py-5 flex-grow-1 d-flex align-items-center">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="row align-items-center justify-content-center"
          >
            <div className="col-lg-7 text-center text-lg-start mb-5 mb-lg-0">
              <div className="d-flex align-items-center justify-content-center justify-content-lg-start mb-3 gap-3">
                <Logo size={56} />
                <span className="display-4 fw-bold gradient-text" style={{ letterSpacing: '0.02em', textShadow: '0 2px 12px #0008' }}>SmartWay</span>
              </div>
              <h2 className="fw-semibold mb-3 fs-2" style={{ color: '#fff', textShadow: '0 2px 8px #000a' }}>
                The creative AI study companion for modern learners
              </h2>
              <p className="fs-5 mb-4" style={{ color: '#e0e0ff', textShadow: '0 1px 4px #0006' }}>
                Instantly turn your notes into <span className="gradient-text-secondary">smart summaries</span>, <span className="gradient-text">flashcards</span>, and <span className="gradient-text">quizzes</span>.<br />
                Designed for students, creators, and lifelong learners who want to study smarter, not harder.
              </p>
              <motion.button
                onClick={() => navigate('/app')}
                className="btn btn-primary btn-lg px-5 py-3 shadow-lg"
                whileHover={{ scale: 1.07 }}
                whileTap={{ scale: 0.97 }}
                onMouseEnter={() => setCtaHover(true)}
                onMouseLeave={() => setCtaHover(false)}
                style={{ boxShadow: ctaHover ? '0 4px 32px #6366F1aa' : undefined }}
              >
                Try SmartWay Now <FiArrowRight className="ms-2" />
              </motion.button>
            </div>
            <div className="col-lg-5 d-flex align-items-center justify-content-center">
              {/* Modern abstract SVG or animated element */}
              <svg width="320" height="320" viewBox="0 0 320 320" fill="none" xmlns="http://www.w3.org/2000/svg" className="d-none d-lg-block animate-float">
                <defs>
                  <radialGradient id="sw-bg" cx="50%" cy="50%" r="80%" fx="50%" fy="50%">
                    <stop offset="0%" stopColor="#6366F1" stopOpacity="0.7" />
                    <stop offset="100%" stopColor="#7C3AED" stopOpacity="0.1" />
                  </radialGradient>
                </defs>
                <ellipse cx="160" cy="160" rx="120" ry="80" fill="url(#sw-bg)" />
                <circle cx="100" cy="120" r="18" fill="#6366F1" opacity="0.7" />
                <circle cx="220" cy="200" r="12" fill="#7C3AED" opacity="0.5" />
                <circle cx="180" cy="80" r="8" fill="#fff" opacity="0.3" />
                <circle cx="80" cy="220" r="6" fill="#fff" opacity="0.18" />
              </svg>
            </div>
          </motion.div>
        </div>
      </section>

      {/* What Makes Us Different Section */}
      <section className="py-5 bg-gradient-card">
        <div className="container">
          <div className="row justify-content-center mb-4">
            <div className="col-lg-8 text-center">
              <h3 className="display-6 fw-bold mb-3 gradient-text">What Makes SmartWay Different?</h3>
              <p className="fs-5 bright-muted mb-0">
                SmartWay isn't just another note app. It's a creative AI-powered study partner that adapts to your style, helps you focus, and makes learning fun.<br />
                <span className="text-accent-indigo">Just a free real smart tools for real learners.</span>
              </p>
            </div>
          </div>
          <div className="row g-4 mt-2">
            {['🧠','🎲','✨'].map((icon, i) => (
              <div key={i} className="col-md-4">
                <div
                  className="card-feature h-100 text-center interactive-card"
                  tabIndex={0}
                  role="button"
                  onClick={() => setModalOpen(i)}
                  onKeyPress={e => (e.key === 'Enter' || e.key === ' ') && setModalOpen(i)}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="mb-3 gradient-text" style={{ fontSize: '2.5rem' }}>{icon}</div>
                  <h4 className="h5 fw-semibold mb-2 text-bright">{featureExamples[i].title}</h4>
                  <p className="text-bright-muted">{['Not just bullet points—get context-aware, easy-to-review summaries that help you actually understand.','Auto-generate flashcards and quizzes that adapt to your learning pace and style.','A beautiful, modern interface that keeps you focused—no clutter, no distractions, just learning.'][i]}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Footer */}
      <footer className="footer mt-auto">
        <div className="container text-center">
          <div className="d-flex flex-column align-items-center gap-2 mb-2">
            <Logo size={32} />
            <span className="fw-bold gradient-text fs-4">SmartWay</span>
          </div>
          <p className="text-bright-muted mb-1">Made by Josh Ivan Sartin, for students. Free, just smart learning.</p>
          <p className="text-bright-muted small">&copy; {new Date().getFullYear()} SmartWay. All rights reserved.</p>
        </div>
      </footer>

      {modalOpen !== null && (
        <div
          className="modal show d-block"
          tabIndex={-1}
          style={{
            background: 'rgba(0,0,0,0.45)',
            zIndex: 2000,
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            pointerEvents: 'auto',
          }}
          onClick={() => setModalOpen(null)}
        >
          <div
            className="modal-dialog modal-dialog-centered"
            style={{
              minHeight: '100vh',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              pointerEvents: 'none',
            }}
          >
            <div
              className="modal-glass position-relative"
              style={{ pointerEvents: 'auto' }}
              onClick={e => e.stopPropagation()}
            >
              <button
                className="modal-close"
                onClick={() => setModalOpen(null)}
                style={{ zIndex: 2100, position: 'absolute', top: '1.2rem', right: '1.2rem' }}
                aria-label="Close"
              >
                &times;
              </button>
              {featureExamples[modalOpen].content}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
