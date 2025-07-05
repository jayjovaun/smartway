import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { FiUpload, FiFileText, FiX, FiFile } from 'react-icons/fi';

interface InputFormProps {
  onSubmit: (data: { notes?: string; file?: File }) => void;
  isLoading: boolean;
}

export const InputForm: React.FC<InputFormProps> = ({ onSubmit, isLoading }) => {
  const [notes, setNotes] = useState('');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  // Temporarily force text input only for Vercel deployment
  const [inputMethod, setInputMethod] = useState<'text' | 'file'>('text');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputMethod === 'text' && notes.trim()) {
      onSubmit({ notes: notes.trim() });
    } else if (inputMethod === 'file' && uploadedFile) {
      onSubmit({ file: uploadedFile });
    }
  };

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      handleFileSelect(file);
    }
  }, []);

  const handleFileSelect = (file: File) => {
    const allowedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword',
      'text/plain'
    ];

    // Check file type
    if (!allowedTypes.includes(file.type)) {
      console.warn('Invalid file type:', file.type);
      return;
    }

    // Check file size
    if (file.size > 10 * 1024 * 1024) { // 10MB
      console.warn('File too large:', file.size);
      return;
    }

    // Check if file is empty
    if (file.size === 0) {
      console.warn('File is empty');
      return;
    }

    setUploadedFile(file);
    setInputMethod('file');
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const removeFile = () => {
    setUploadedFile(null);
    setInputMethod('text');
  };

  const getFileIcon = (file: File) => {
    if (file.type === 'application/pdf') return '📄';
    if (file.type.includes('word')) return '📝';
    if (file.type === 'text/plain') return '📋';
    return '📁';
  };

  const canSubmit = (inputMethod === 'text' && notes.trim()) || (inputMethod === 'file' && uploadedFile);

  return (
    <div className="card-glass p-4 mx-auto" style={{ maxWidth: '800px' }}>
      <div className="text-center mb-4">
        <h2 className="text-bright fw-bold fs-4 mb-2">
          📚 Create Your Study Pack
        </h2>
        <p className="text-bright-muted mb-0">
          Paste your study material below to generate summaries, flashcards, and quizzes
        </p>
      </div>

      {/* Temporarily hide input method toggle - force text only for deployment */}
      {/* 
      <div className="d-flex gap-2 mb-4 justify-content-center">
        <button
          type="button"
          onClick={() => setInputMethod('text')}
          className={`btn ${inputMethod === 'text' ? 'btn-primary' : 'btn-outline-primary'} d-flex align-items-center gap-2 px-4 py-2`}
          style={{ borderRadius: '12px', fontWeight: '600' }}
        >
          <FiFileText size={18} />
          <span>Type Text</span>
        </button>
        <button
          type="button"
          onClick={() => setInputMethod('file')}
          className={`btn ${inputMethod === 'file' ? 'btn-primary' : 'btn-outline-primary'} d-flex align-items-center gap-2 px-4 py-2`}
          style={{ borderRadius: '12px', fontWeight: '600' }}
        >
          <FiUpload size={18} />
          <span>Upload Document</span>
        </button>
      </div>
      */}

      <form onSubmit={handleSubmit}>
        {/* Force text input only for now */}
        {inputMethod === 'text' ? (
          /* Text Input Section */
          <div className="mb-4">
            <label htmlFor="notes" className="form-label text-bright fw-semibold fs-6 mb-3">
              Your Study Material
            </label>
            <textarea
              id="notes"
              className="form-control text-light border-0"
              rows={8}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Paste your notes, lecture content, textbook chapters, or any study material here..."
              style={{
                resize: 'vertical',
                borderRadius: '12px',
                background: 'rgba(31, 41, 55, 0.9)',
                backdropFilter: 'blur(10px)',
                border: '2px solid rgba(99, 102, 241, 0.3)',
                fontSize: '16px',
                lineHeight: '1.5',
                padding: '1rem'
              }}
              disabled={isLoading}
            />
            <div className="text-bright-muted small mt-2 px-1">
              The more detailed your content, the better your study pack will be! File upload temporarily disabled - coming soon!
            </div>
          </div>
        ) : null}

        {/* Hide file upload section for now */}
        {/* 
        {inputMethod === 'file' ? (
          // File Upload Section - temporarily disabled
          <div className="mb-4">
            ...file upload code...
          </div>
        ) : null}
        */}

        {/* Submit Button */}
        <div className="d-grid">
          <motion.button
            type="submit"
            disabled={!canSubmit || isLoading}
            className="btn btn-primary btn-lg fw-bold"
            style={{
              background: 'linear-gradient(135deg, #6366F1, #7C3AED)',
              border: 'none',
              borderRadius: '12px',
              padding: '12px 24px',
              fontSize: '16px'
            }}
            whileHover={canSubmit && !isLoading ? { scale: 1.02 } : {}}
            whileTap={canSubmit && !isLoading ? { scale: 0.98 } : {}}
          >
            {isLoading ? (
              <span className="d-flex align-items-center justify-content-center gap-2">
                <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                {inputMethod === 'file' ? 'Processing Document...' : 'Generating Study Pack...'}
              </span>
            ) : (
              <span className="d-flex align-items-center justify-content-center gap-2">
                ✨ Generate Study Pack
              </span>
            )}
          </motion.button>
        </div>

        {/* Information Footer */}
        <div className="text-center mt-4">
          <div className="text-bright-muted small">
            <strong>What you'll get:</strong> Smart Summary • Interactive Flashcards • Adaptive Quiz
          </div>
        </div>
      </form>
    </div>
  );
}; 