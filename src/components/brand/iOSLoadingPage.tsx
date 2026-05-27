/**
 * iOS-Style Loading Page
 * Beautiful loading animation with Airpak script logo
 */

import React, { useState, useEffect } from 'react';
import { ScriptLogo } from './ScriptLogo';

interface iOSLoadingPageProps {
  minDuration?: number;
  onComplete?: () => void;
  showProgress?: boolean;
  message?: string;
}

export const iOSLoadingPage: React.FC<iOSLoadingPageProps> = ({
  minDuration = 2000,
  onComplete,
  showProgress = false,
  message = 'Loading...',
}) => {
  const [progress, setProgress] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const newProgress = Math.min((elapsed / minDuration) * 100, 100);
      setProgress(newProgress);

      if (newProgress >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          setIsComplete(true);
          setTimeout(() => {
            onComplete?.();
          }, 300);
        }, 200);
      }
    }, 30);

    return () => clearInterval(interval);
  }, [minDuration, onComplete]);

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center relative overflow-hidden">
      {/* Background subtle pattern */}
      <div className="absolute inset-0 opacity-5">
        <div
          className="w-full h-full"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, #E63946 1px, transparent 0)`,
            backgroundSize: '40px 40px',
          }}
        />
      </div>

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center">
        {/* Logo with animation */}
        <div className="mb-8">
          <div
            className={`
              transition-all duration-700 ease-out
              ${isComplete ? 'scale-100 opacity-100' : 'scale-50 opacity-0'}
            `}
            style={{
              animation: !isComplete ? 'logoReveal 1.2s ease-out forwards' : undefined,
            }}
          >
            <ScriptLogo size="presentation" showTrademark />
          </div>
        </div>

        {/* Tagline */}
        <p
          className={`
            text-gray-400 text-sm font-medium tracking-widest uppercase
            transition-all duration-700 delay-500
            ${isComplete ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
          `}
        >
          Global Logistics
        </p>

        {/* iOS-style loading indicator */}
        <div
          className={`
            mt-12 transition-all duration-500
            ${isComplete ? 'opacity-0' : 'opacity-100'}
          `}
        >
          {/* Progress bar */}
          <div
            className={`
              w-48 h-1 bg-gray-100 rounded-full overflow-hidden
              transition-opacity duration-300
              ${showProgress ? 'opacity-100' : 'opacity-0'}
            `}
          >
            <div
              className="h-full bg-airpak-script rounded-full transition-all duration-100"
              style={{
                width: `${progress}%`,
                backgroundColor: '#E63946',
              }}
            />
          </div>

          {/* iOS spinner */}
          <div className="flex items-center justify-center mt-6">
            <div className="relative w-8 h-8">
              <div
                className="absolute inset-0 rounded-full border-2 border-gray-200"
              />
              <div
                className="absolute inset-0 rounded-full border-2 border-transparent border-t-airpak-script animate-spin"
                style={{
                  borderTopColor: '#E63946',
                  animationDuration: '1s',
                }}
              />
            </div>
          </div>

          {/* Loading message */}
          <p
            className={`
              text-gray-500 text-sm mt-4
              transition-opacity duration-300
              ${showProgress ? 'opacity-100' : 'opacity-0'}
            `}
          >
            {message}
          </p>
        </div>
      </div>

      {/* Bottom branding */}
      <div className="absolute bottom-8 text-center">
        <p className="text-gray-400 text-xs">
          © 2026 Airpak. All rights reserved.
        </p>
      </div>
    </div>
  );
};

// Keyframe animations (add to your CSS or Tailwind config)
export const loadingPageStyles = `
@keyframes logoReveal {
  0% {
    opacity: 0;
    transform: scale(0.5) translateY(20px);
  }
  50% {
    opacity: 1;
    transform: scale(1.05) translateY(-5px);
  }
  100% {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in-up {
  animation: logoReveal 1.2s ease-out forwards;
}

.animate-fade-in {
  animation: fadeInUp 0.6s ease-out forwards;
}

.delay-300 {
  animation-delay: 300ms;
}

.delay-500 {
  animation-delay: 500ms;
}
`;

export default iOSLoadingPage;
