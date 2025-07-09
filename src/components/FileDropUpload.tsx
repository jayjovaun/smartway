import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { FiUpload, FiX, FiFile, FiCheck, FiExternalLink } from 'react-icons/fi';
import { uploadFile, UploadResult } from '@utils/uploadFile';

interface FileDropUploadProps {
  onUploadComplete: (result: UploadResult) => void;
  onUploadError: (error: string) => void;
  disabled?: boolean;
}

export const FileDropUpload: React.FC<FileDropUploadProps> = ({
  onUploadComplete,
  onUploadError,
  disabled = false
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<UploadResult | null>(null);

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
      handleFileUpload(file);
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
      onUploadError('Invalid file type. Please upload PDF (.pdf), Word (.docx, .doc), or text (.txt) files.');
      return;
    }

    // Check file size (50MB limit to match server)
    if (file.size > 50 * 1024 * 1024) {
      onUploadError('File size too large. Please upload a file smaller than 50MB.');
      return;
    }

    // Check if file is empty
    if (file.size === 0) {
      onUploadError('File is empty. Please select a valid file.');
      return;
    }

    handleFileUpload(file);
  };

  const handleFileUpload = async (file: File) => {
    setIsUploading(true);
    setUploadProgress(0);
    setUploadResult(null);

    try {
      const result = await uploadFile(file, (progress) => {
        setUploadProgress(progress);
      });
      
      setUploadResult(result);
      onUploadComplete(result);
    } catch (error) {
      console.error('Upload error:', error);
      onUploadError(error instanceof Error ? error.message : 'Failed to upload file');
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const resetUpload = () => {
    setUploadResult(null);
    setUploadProgress(0);
    setIsUploading(false);
  };

  const getFileIcon = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    if (extension === 'pdf') return '📄';
    if (extension === 'docx' || extension === 'doc') return '📝';
    if (extension === 'txt') return '📋';
    return '📁';
  };

  if (uploadResult) {
    return (
      <div className="mb-4">
        <label className="form-label text-bright fw-semibold fs-6 mb-3">
          Document Uploaded Successfully
        </label>
        
        <div
          className="border border-success rounded bg-success bg-opacity-10 p-3"
          style={{ borderRadius: '12px' }}
        >
          <div className="d-flex align-items-center justify-content-between">
            <div className="d-flex align-items-center gap-3">
              <FiCheck size={24} className="text-success" />
              <div>
                <div className="text-bright fw-semibold d-flex align-items-center gap-2">
                  <span>{getFileIcon(uploadResult.fileName)}</span>
                  {uploadResult.fileName}
                </div>
                <div className="text-bright-muted small">
                  {(uploadResult.fileSize / 1024 / 1024).toFixed(2)} MB • Uploaded to Supabase
                </div>
                <a
                  href={uploadResult.downloadURL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary small d-flex align-items-center gap-1 mt-1"
                  style={{ textDecoration: 'none' }}
                >
                  <FiExternalLink size={12} />
                  View file
                </a>
              </div>
            </div>
            <button
              type="button"
              onClick={resetUpload}
              className="btn btn-sm btn-outline-primary"
              style={{ borderRadius: '8px' }}
              disabled={disabled}
            >
              <FiX size={16} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-4">
      <label className="form-label text-bright fw-semibold fs-6 mb-3">
        Upload Your Document
      </label>
      
      <div
        className={`border-2 border-dashed rounded text-center transition-all ${
          dragActive 
            ? 'border-primary' 
            : 'border-secondary'
        } ${disabled ? 'opacity-50' : ''}`}
        style={{
          borderRadius: '12px',
          background: dragActive 
            ? 'linear-gradient(135deg, rgba(99, 102, 241, 0.15), rgba(124, 58, 237, 0.15))'
            : 'rgba(31, 41, 55, 0.5)',
          backdropFilter: 'blur(10px)',
          minHeight: '200px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '2rem 1rem',
          cursor: disabled ? 'not-allowed' : 'pointer'
        }}
        onDragEnter={disabled ? undefined : handleDrag}
        onDragLeave={disabled ? undefined : handleDrag}
        onDragOver={disabled ? undefined : handleDrag}
        onDrop={disabled ? undefined : handleDrop}
      >
        <motion.div
          animate={{ scale: dragActive ? 1.1 : 1 }}
          className="text-center"
        >
          {isUploading ? (
            <>
              <FiUpload size={48} className="text-primary mb-3" />
              <h5 className="text-bright mb-2">Uploading...</h5>
              <div className="progress mb-3" style={{ height: '8px', borderRadius: '4px' }}>
                <div
                  className="progress-bar bg-primary"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              <p className="text-bright-muted">
                {uploadProgress}% complete
              </p>
            </>
          ) : (
            <>
              <FiUpload size={48} className="text-primary mb-3" />
              <h5 className="text-bright mb-2">Drop your document here</h5>
              <p className="text-bright-muted mb-3">
                or click to browse files
              </p>
              <input
                type="file"
                accept=".pdf,.docx,.doc,.txt"
                onChange={handleFileInput}
                className="d-none"
                id="supabaseFileInput"
                disabled={disabled || isUploading}
              />
              <label
                htmlFor="supabaseFileInput"
                className="btn btn-outline-primary px-4 py-2"
                style={{ 
                  borderRadius: '12px', 
                  fontWeight: '600',
                  cursor: disabled ? 'not-allowed' : 'pointer'
                }}
              >
                <FiFile className="me-2" />
                Choose File
              </label>
              <div className="text-bright-muted small mt-3">
                Supports: PDF, Word (.docx, .doc), Text files (max 50MB)
              </div>
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
}; 