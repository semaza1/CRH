// src/components/ui/LoadingSpinner.jsx
import React from 'react';

const LoadingSpinner = ({ 
  size = 'md', 
  text = '', 
  className = '',
  centered = true 
}) => {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8', 
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  const containerClasses = centered 
    ? `flex flex-col items-center justify-center p-8 ${className}`
    : `flex items-center ${className}`;

  return (
    <div className={containerClasses}>
      <div className={`spinner ${sizes[size]} ${text ? 'mb-4' : ''}`}></div>
      {text && (
        <p className="text-sm text-gray-600 animate-pulse">{text}</p>
      )}
    </div>
  );
};

export default LoadingSpinner;