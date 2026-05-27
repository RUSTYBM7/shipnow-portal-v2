/**
 * AirPak Express - Auth Hero Logo Component
 * Large script logo for auth page hero sections
 */

import React from 'react';
import { ScriptLogo } from './ScriptLogo';

interface AuthHeroLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'presentation';
  showTagline?: boolean;
  tagline?: string;
  animated?: boolean;
}

export const AuthHeroLogo: React.FC<AuthHeroLogoProps> = ({
  size = 'presentation',
  showTagline = true,
  tagline = 'Global Logistics',
  animated = false,
}) => {
  return (
    <div className="flex flex-col items-center">
      {/* Script Logo */}
      <div className={animated ? 'animate-fade-in-up' : ''}>
        <ScriptLogo size={size} showTrademark animated={animated} />
      </div>

      {/* Tagline */}
      {showTagline && (
        <p
          className={`
            mt-6 text-gray-400 text-sm font-medium tracking-widest uppercase
            ${animated ? 'animate-fade-in delay-500 opacity-0' : ''}
          `}
        >
          {tagline}
        </p>
      )}
    </div>
  );
};

export default AuthHeroLogo;
