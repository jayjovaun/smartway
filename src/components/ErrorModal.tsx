import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiAlertCircle, FiX, FiRefreshCw } from 'react-icons/fi';

interface ErrorModalProps {
  show: boolean;
  onClose: () => void;
  title?: string;
  message: string;
  onRetry?: () => void;
}

export const ErrorModal: React.FC<ErrorModalProps> = ({ 
  show, 
  onClose, 
  title = "Oops! Something went wrong",
  message,
  onRetry
}) => {
  if (!show) return null;

  return (
    <AnimatePresence>
      <motion.div 
        className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
        style={{ 
          background: 'rgba(0, 0, 0, 0.75)', 
          backdropFilter: 'blur(8px)',
          zIndex: 1060 
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            onClose();
          }
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          className="position-relative"
          style={{ 
            maxWidth: '450px', 
            width: '90%',
            margin: '0 auto'
          }}
        >
          <div 
            className="text-center position-relative"
            style={{
              background: 'linear-gradient(145deg, rgba(239, 68, 68, 0.15), rgba(220, 38, 38, 0.15))',
              border: '2px solid rgba(239, 68, 68, 0.4)',
              borderRadius: '20px',
              backdropFilter: 'blur(20px)',
              boxShadow: '0 20px 60px rgba(239, 68, 68, 0.3)',
              padding: '2rem'
            }}
          >
            {/* Close Button */}
            <motion.button
              onClick={onClose}
              className="btn position-absolute d-flex align-items-center justify-content-center"
              style={{ 
                top: '12px', 
                right: '12px',
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.1)',
                border: '1px solid rgba(255,255,255,0.2)',
                color: 'white',
                backdropFilter: 'blur(10px)'
              }}
              whileHover={{ 
                scale: 1.1, 
                background: 'rgba(255,255,255,0.2)',
                rotate: 90
              }}
              whileTap={{ scale: 0.9 }}
            >
              <FiX size={18} />
            </motion.button>

            {/* Error Icon */}
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="mb-4"
            >
              <div 
                className="d-inline-flex align-items-center justify-content-center rounded-circle mb-3"
                style={{
                  width: '70px',
                  height: '70px',
                  background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                  boxShadow: '0 8px 25px rgba(239, 68, 68, 0.4)'
                }}
              >
                <FiAlertCircle size={32} color="white" />
              </div>
            </motion.div>

            {/* Error Title */}
            <motion.h3
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-bright fw-bold mb-3"
              style={{ fontSize: '1.3rem' }}
            >
              {title}
            </motion.h3>
            
            {/* Error Message */}
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-bright-muted mb-4"
              style={{ fontSize: '1rem', lineHeight: '1.5' }}
            >
              {message}
            </motion.p>

            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="d-flex gap-2 justify-content-center"
            >
              {onRetry && (
                <motion.button
                  onClick={onRetry}
                  className="btn btn-outline-light d-flex align-items-center gap-2 px-4 py-2"
                  style={{
                    borderRadius: '12px',
                    border: '1px solid rgba(255,255,255,0.3)',
                    background: 'rgba(255,255,255,0.1)',
                    backdropFilter: 'blur(10px)'
                  }}
                  whileHover={{ 
                    scale: 1.05,
                    background: 'rgba(255,255,255,0.2)' 
                  }}
                  whileTap={{ scale: 0.95 }}
                >
                  <FiRefreshCw size={16} />
                  Try Again
                </motion.button>
              )}
              
              <motion.button
                onClick={onClose}
                className="btn btn-primary d-flex align-items-center gap-2 px-4 py-2"
                style={{
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #6366F1, #7C3AED)',
                  border: 'none'
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Got it
              </motion.button>
            </motion.div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}; 