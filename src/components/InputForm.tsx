import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FiFileText, FiUpload } from 'react-icons/fi';
import { FileDropUpload } from './FileDropUpload';
import { UploadResult } from '@utils/uploadFile';

interface InputFormProps {
  onSubmit: (data: { notes?: string; file?: File; fileURL?: string }) => void;
  isLoading: boolean;
}

export const InputForm: React.FC<InputFormProps> = ({ onSubmit, isLoading }) => {
  const [notes, setNotes] = useState('');
  const [uploadResult, setUploadResult] = useState<UploadResult | null>(null);
  const [inputMethod, setInputMethod] = useState<'text' | 'file'>('text');
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputMethod === 'text' && notes.trim()) {
      onSubmit({ notes: notes.trim() });
    } else if (inputMethod === 'file' && uploadResult) {
      onSubmit({ fileURL: uploadResult.downloadURL });
    }
  };

  const handleUploadComplete = (result: UploadResult) => {
    setUploadResult(result);
    setUploadError(null);
    setInputMethod('file');
  };

  const handleUploadError = (error: string) => {
    setUploadError(error);
    setUploadResult(null);
  };

  const resetUpload = () => {
    setUploadResult(null);
    setUploadError(null);
    setInputMethod('text');
  };

  const canSubmit = (inputMethod === 'text' && notes.trim()) || (inputMethod === 'file' && uploadResult);

  return (
    <div className="card-glass p-4 mx-auto" style={{ maxWidth: '800px' }}>
      <div className="text-center mb-4">
        <h2 className="text-bright fw-bold fs-4 mb-2">
          📚 Create Your Study Pack
        </h2>
        <p className="text-bright-muted mb-0">
          Choose your preferred input method below
        </p>
      </div>

      {/* Input Method Toggle */}
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

      <form onSubmit={handleSubmit}>
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
              The more detailed your content, the better your study pack will be!
            </div>
          </div>
        ) : (
          /* File Upload Section */
          <>
            <FileDropUpload
              onUploadComplete={handleUploadComplete}
              onUploadError={handleUploadError}
              disabled={isLoading}
            />
            {uploadError && (
              <div className="alert alert-danger mb-3" role="alert">
                {uploadError}
              </div>
            )}
          </>
        )}

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