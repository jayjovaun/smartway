import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { FiUpload, FiFileText, FiX, FiFile } from 'react-icons/fi';

interface InputFormProps {
  onSubmit: (data: { notes?: string; file?: File; extractedText?: string }) => void;
  isLoading: boolean;
}

export const InputForm: React.FC<InputFormProps> = ({ onSubmit, isLoading }) => {
  const [notes, setNotes] = useState('');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [inputMethod, setInputMethod] = useState<'text' | 'file'>('text');
  const [isUploading, setIsUploading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (inputMethod === 'text' && notes.trim()) {
      onSubmit({ notes: notes.trim() });
    } else if (inputMethod === 'file' && uploadedFile) {
      setIsUploading(true);
      try {
        // First upload file to Vercel Blob
        const response = await fetch('/api/file-upload', {
          method: 'POST',
          headers: {
            'Content-Type': uploadedFile.type,
            'X-Filename': uploadedFile.name
          },
          body: uploadedFile
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to upload file');
        }

        const uploadResult = await response.json();
        
        // For text files, try to process them
        if (uploadedFile.type === 'text/plain') {
          try {
            const processResponse = await fetch('/api/process-file', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                blobUrl: uploadResult.blobUrl,
                mimeType: uploadedFile.type
              })
            });

            if (processResponse.ok) {
              const processResult = await processResponse.json();
              onSubmit({ extractedText: processResult.extractedText });
            } else {
              const errorData = await processResponse.json();
              throw new Error(errorData.error || 'Failed to process file');
            }
          } catch (processError) {
            console.error('File processing error:', processError);
            throw new Error('Failed to extract text from the file. Please copy and paste the content directly.');
          }
        } else {
          // For PDF and Word files, show a helpful message
          throw new Error('For PDF and Word documents, please copy and paste the text content directly into the text input area for best results.');
        }
      } catch (error) {
        console.error('Upload error:', error);
        setInputMethod('text'); // Switch back to text input
        throw error;
      } finally {
        setIsUploading(false);
      }
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

    // Check file size (4MB limit for serverless)
    if (file.size > 4 * 1024 * 1024) {
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
          Upload a document or paste your study material to generate summaries, flashcards, and quizzes
        </p>
      </div>

      {/* Input method toggle */}
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
              disabled={isLoading || isUploading}
            />
            <div className="text-bright-muted small mt-2 px-1">
              The more detailed your content, the better your study pack will be!
            </div>
          </div>
        ) : (
          /* File Upload Section */
          <div className="mb-4">
            <label className="form-label text-bright fw-semibold fs-6 mb-3">
              Upload Your Document
            </label>
            
            {!uploadedFile ? (
              <div
                className={`border-2 border-dashed rounded-3 p-4 text-center position-relative ${
                  dragActive ? 'border-primary bg-primary bg-opacity-10' : 'border-secondary'
                }`}
                style={{
                  minHeight: '200px',
                  background: dragActive ? 'rgba(99, 102, 241, 0.1)' : 'rgba(31, 41, 55, 0.5)',
                  backdropFilter: 'blur(10px)',
                  transition: 'all 0.3s ease'
                }}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <input
                  type="file"
                  onChange={handleFileInput}
                  accept=".pdf,.docx,.doc,.txt"
                  className="position-absolute w-100 h-100 opacity-0"
                  style={{ cursor: 'pointer' }}
                  disabled={isLoading || isUploading}
                />
                
                <div className="d-flex flex-column align-items-center justify-content-center h-100">
                  <motion.div
                    animate={{ y: dragActive ? -5 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <FiUpload size={48} className="text-primary mb-3" />
                  </motion.div>
                  
                  <h6 className="text-bright fw-semibold mb-2">
                    {dragActive ? 'Drop your file here' : 'Drag & drop your file here'}
                  </h6>
                  
                  <p className="text-bright-muted mb-3">
                    or <span className="text-primary">browse files</span>
                  </p>
                  
                  <div className="text-bright-muted small">
                    <div>📄 PDF documents</div>
                    <div>📝 Word documents (.docx, .doc)</div>
                    <div>📋 Text files (.txt)</div>
                    <div className="mt-2 text-warning">Max 4MB • Text files work best</div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="card-glass p-4 rounded-3">
                <div className="d-flex align-items-center justify-content-between">
                  <div className="d-flex align-items-center gap-3">
                    <span style={{ fontSize: '2rem' }}>
                      {getFileIcon(uploadedFile)}
                    </span>
                    <div>
                      <h6 className="text-bright mb-1">{uploadedFile.name}</h6>
                      <small className="text-bright-muted">
                        {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                      </small>
                    </div>
                  </div>
                  
                  <button
                    type="button"
                    onClick={removeFile}
                    className="btn btn-outline-danger btn-sm rounded-circle p-2"
                    disabled={isLoading || isUploading}
                  >
                    <FiX size={16} />
                  </button>
                </div>
                
                {uploadedFile.type !== 'text/plain' && (
                  <div className="mt-3 p-3 rounded-2" style={{ background: 'rgba(255, 193, 7, 0.1)' }}>
                    <div className="text-warning small">
                      <strong>Note:</strong> For PDF and Word documents, copying and pasting the text content directly 
                      provides better results. File upload will attempt text extraction but may have limitations.
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Submit Button */}
        <div className="d-grid">
          <motion.button
            type="submit"
            disabled={!canSubmit || isLoading || isUploading}
            className="btn btn-primary btn-lg fw-semibold py-3"
            style={{
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
              border: 'none',
              fontSize: '18px'
            }}
            whileHover={(!canSubmit || isLoading || isUploading) ? {} : { scale: 1.02 }}
            whileTap={(!canSubmit || isLoading || isUploading) ? {} : { scale: 0.98 }}
          >
            {isLoading || isUploading ? (
              <div className="d-flex align-items-center justify-content-center gap-2">
                <div 
                  className="spinner-border spinner-border-sm" 
                  role="status"
                  style={{ width: '1.2rem', height: '1.2rem' }}
                >
                  <span className="visually-hidden">Loading...</span>
                </div>
                <span>
                  {isUploading ? 'Uploading File...' : 'Generating Study Pack...'}
                </span>
              </div>
            ) : (
              <>
                ✨ Generate Study Pack
              </>
            )}
          </motion.button>
        </div>

        {/* Help Text */}
        <div className="text-center mt-3">
          <small className="text-bright-muted">
            Your study pack will include a summary, flashcards, and an interactive quiz
          </small>
        </div>
      </form>
    </div>
  );
}; 