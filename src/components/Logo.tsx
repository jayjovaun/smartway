import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import logoSvg from '../assets/logo.svg';

interface LogoProps {
  size?: number;
  showText?: boolean;
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({ size = 56, showText = true, className = '' }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate('/');
  };

  return (
    <motion.div
      className={`d-flex align-items-center gap-3 ${className}`}
      style={{ cursor: 'pointer' }}
      onClick={handleClick}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div
        className="d-flex align-items-center justify-content-center"
        style={{
          width: size,
          height: size,
          borderRadius: '12px',
          background: 'linear-gradient(135deg, #6366F1, #7C3AED)',
          boxShadow: '0 8px 25px rgba(99, 102, 241, 0.4)',
          overflow: 'hidden'
        }}
        whileHover={{ 
          boxShadow: '0 12px 35px rgba(99, 102, 241, 0.6)',
          rotate: [0, -5, 5, 0]
        }}
        transition={{ duration: 0.3 }}
      >
        <motion.img
          src={logoSvg}
          alt="SmartWay Logo"
          style={{
            width: `${size * 0.7}px`,
            height: `${size * 0.7}px`,
            filter: 'brightness(0) invert(1)'
          }}
          whileHover={{ scale: 1.1 }}
          transition={{ duration: 0.2 }}
        />
      </motion.div>
      {showText && (
        <div className="d-flex flex-column">
          <motion.span 
            className="text-bright fw-bold" 
            style={{ 
              fontSize: `${size * 0.35}px`, 
              lineHeight: '1',
              background: 'linear-gradient(135deg, #6366F1, #7C3AED)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}
            whileHover={{ 
              scale: 1.05,
              textShadow: '0 0 20px rgba(99, 102, 241, 0.5)'
            }}
            transition={{ duration: 0.2 }}
          >
            SmartWay
          </motion.span>
          <motion.span 
            className="text-bright-muted" 
            style={{ 
              fontSize: `${size * 0.22}px`, 
              lineHeight: '1',
              opacity: 0.8
            }}
            whileHover={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
          >
            Study Tool
          </motion.span>
        </div>
      )}
    </motion.div>
  );
};

export default Logo; 