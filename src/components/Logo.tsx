import React from 'react';

export const Logo: React.FC<{ size?: number }> = ({ size = 48 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 64 64"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    style={{ display: 'block' }}
  >
    <defs>
      <linearGradient id="sw-gradient" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
        <stop stopColor="#6366F1" />
        <stop offset="1" stopColor="#7C3AED" />
      </linearGradient>
    </defs>
    <circle cx="32" cy="32" r="28" fill="url(#sw-gradient)" opacity="0.18" />
    <path
      d="M18 40C18 32 32 32 32 24C32 16 46 16 46 24C46 32 32 32 32 40C32 48 18 48 18 40Z"
      fill="url(#sw-gradient)"
      stroke="#fff"
      strokeWidth="2.5"
      strokeLinejoin="round"
      style={{ filter: 'drop-shadow(0 2px 8px #6366F1aa)' }}
    />
    <circle cx="32" cy="24" r="3.5" fill="#fff" />
    <circle cx="32" cy="40" r="3.5" fill="#fff" />
  </svg>
);

export default Logo; 