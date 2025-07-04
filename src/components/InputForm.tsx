import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiInfo, FiZap, FiBookOpen } from 'react-icons/fi';
import { motion } from 'framer-motion';

interface InputFormProps {
  onSubmit: (input: string) => void;
  isLoading: boolean;
}

export const InputForm: React.FC<InputFormProps> = ({ onSubmit, isLoading }) => {
  const [input, setInput] = React.useState('');
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      onSubmit(input.trim());
    }
  };

  return (
    <div className="container py-5">
      <div className="mb-4">
        <button className="btn btn-outline-secondary d-flex align-items-center gap-2" onClick={() => navigate('/')}
          style={{ borderRadius: '0.75rem', fontWeight: 500 }}>
          <FiArrowLeft /> Back
        </button>
      </div>
      <div className="card p-4 shadow-lg bg-gradient-card">
        <h2 className="fw-bold gradient-text mb-2">Paste Your Notes</h2>
        <p className="text-bright-muted mb-4">Paste your lecture notes or study material below. SmartWay will instantly generate summaries, flashcards, and quizzes for you!</p>
        <form onSubmit={handleSubmit} className="mb-4">
          <div className="mb-3 position-relative">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Paste your lecture notes here..."
              className="input-field form-control h-48"
              disabled={isLoading}
              style={{ minHeight: '180px', fontSize: '1.1rem', background: 'rgba(30,30,40,0.95)', color: '#fff' }}
            />
          </div>
          <motion.button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="btn btn-primary w-100 d-flex align-items-center justify-content-center gap-2"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {isLoading ? (
              <>
                <FiZap className="animate-spin" /> Generating Study Pack...
              </>
            ) : (
              <>
                <FiBookOpen /> Generate Study Pack
              </>
            )}
          </motion.button>
        </form>
        <div className="mt-3">
          <div className="d-flex align-items-center gap-2 mb-2 text-accent-indigo">
            <FiInfo /> <span className="fw-semibold">Tips for Best Results:</span>
          </div>
          <ul className="text-bright-muted mb-0 ps-4" style={{ fontSize: '1rem' }}>
            <li>Paste clear, well-structured notes for the best summaries.</li>
            <li>Use headings and bullet points if possible.</li>
            <li>Try with different subjects—SmartWay adapts to your content!</li>
          </ul>
        </div>
      </div>
    </div>
  );
}; 