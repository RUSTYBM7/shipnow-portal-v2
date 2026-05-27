/**
 * Airpak Script Logo Component
 * EXACT match to user's provided HTML/ Tailwind classes
 */

import React from 'react';

interface ScriptLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'presentation';
  showTrademark?: boolean;
  className?: string;
  animated?: boolean;
}

export const ScriptLogo: React.FC<ScriptLogoProps> = ({
  size = 'presentation',
  showTrademark = true,
  className = '',
  animated = false,
}) => {
  const sizeMap = {
    sm: {
      textClass: 'text-4xl',
      tmClass: 'text-xs',
      tmTop: '-top-1',
      tmRight: '-right-3'
    },
    md: {
      textClass: 'text-6xl',
      tmClass: 'text-sm',
      tmTop: '-top-3',
      tmRight: '-right-5'
    },
    lg: {
      textClass: 'text-8xl',
      tmClass: 'text-lg',
      tmTop: '-top-4',
      tmRight: '-right-6'
    },
    xl: {
      textClass: 'text-[100px]',
      tmClass: 'text-xl',
      tmTop: '-top-5',
      tmRight: '-right-8'
    },
    // EXACTLY matches the user's original HTML
    presentation: {
      textClass: 'text-[120px]',
      tmClass: 'text-3xl',
      tmTop: '-top-4',
      tmRight: '-right-8'
    },
  };

  const currentSize = sizeMap[size];

  return (
    <div className={`relative inline-block ${className}`}>
      {/* EXACT classes matching user's HTML: font-airpak text-[120px] text-airpak-red */}
      <h1
        className={`
          font-airpak
          ${currentSize.textClass}
          leading-none
          select-none
          text-airpak-red
          ${animated ? 'animate-fade-in-up' : ''}
        `}
      >
        Airpak
      </h1>

      {/* EXACT trademark positioning from user's HTML */}
      {showTrademark && (
        <span
          className={`
            absolute
            ${currentSize.tmTop}
            ${currentSize.tmRight}
            ${currentSize.tmClass}
            text-gray-800
            font-sans
            font-bold
            ${animated ? 'animate-fade-in delay-300' : ''}
          `}
        >
          ®
        </span>
      )}
    </div>
  );
};

export default ScriptLogo;
