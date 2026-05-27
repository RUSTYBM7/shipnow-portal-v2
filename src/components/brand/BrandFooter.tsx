/**
 * AirPak Express - Brand Footer Component
 * Script logo footer with branding
 */

import React from 'react';
import { ScriptLogo } from './ScriptLogo';

interface BrandFooterProps {
  variant?: 'default' | 'minimal' | 'dark';
  showLogo?: boolean;
  showLinks?: boolean;
  companyName?: string;
}

export const BrandFooter: React.FC<BrandFooterProps> = ({
  variant = 'default',
  showLogo = true,
  showLinks = true,
  companyName = 'Airpak',
}) => {
  const currentYear = new Date().getFullYear();

  const variants = {
    default: 'bg-gray-50 border-t border-gray-100 text-gray-500',
    minimal: 'bg-transparent border-t border-gray-200 text-gray-400',
    dark: 'bg-slate-900 border-t border-slate-800 text-slate-400',
  };

  return (
    <footer className={`py-8 px-6 text-center ${variants[variant]}`}>
      {/* Logo */}
      {showLogo && (
        <div className="mb-4">
          <ScriptLogo size="sm" showTrademark />
        </div>
      )}

      {/* Company name */}
      <p className="text-sm font-medium">
        &copy; {currentYear} {companyName}. All rights reserved.
      </p>

      {/* Links */}
      {showLinks && (
        <div className="mt-4 flex items-center justify-center gap-6 text-xs">
          <a href="#" className="hover:text-gray-700 transition-colors">
            Privacy Policy
          </a>
          <a href="#" className="hover:text-gray-700 transition-colors">
            Terms of Service
          </a>
          <a href="#" className="hover:text-gray-700 transition-colors">
            Contact
          </a>
        </div>
      )}
    </footer>
  );
};

export default BrandFooter;
