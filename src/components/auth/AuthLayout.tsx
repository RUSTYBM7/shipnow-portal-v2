import React, { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { GlassBlock } from '../ui/GlassBlock';
import { ParticleBg, GradientOrbs } from '../ui/ParticleBg';

interface AuthLayoutProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  showLogo?: boolean;
  showBackLink?: boolean;
  backLinkTo?: string;
  backLinkText?: string;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({
  children,
  title,
  subtitle,
  showLogo = true,
  showBackLink = false,
  backLinkTo = '/',
  backLinkText = 'Back to home'
}) => {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');
  const accentColor = isAdminRoute ? 'var(--accent-purple)' : 'var(--accent-blue)';

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background effects */}
      <GradientOrbs />
      <ParticleBg count={40} />

      {/* Main content */}
      <div className="w-full max-w-md relative z-10">
        {/* Logo & Header */}
        <div className="text-center mb-8 page-enter">
          {showLogo && (
            <Link to="/" className="inline-block mb-6">
              <img
                src="/airpak-logo.png"
                alt="AirPak Express Logo"
                className="h-20 w-auto mx-auto object-contain"
                style={{ maxHeight: '80px' }}
              />
            </Link>
          )}

          {title && (
            <h1 className="text-title1 text-text-primary mb-2">{title}</h1>
          )}
          {subtitle && (
            <p className="text-body text-text-secondary max-w-sm mx-auto">{subtitle}</p>
          )}
        </div>

        {/* Auth card */}
        <GlassBlock
          variant={isAdminRoute ? 'purple' : 'default'}
          padding="lg"
          className="scale-enter"
        >
          {children}
        </GlassBlock>

        {/* Back link */}
        {showBackLink && (
          <div className="text-center mt-6 scale-enter" style={{ animationDelay: '200ms' }}>
            <Link
              to={backLinkTo}
              className="text-subhead text-text-secondary hover:text-text-primary transition-colors"
            >
              ← {backLinkText}
            </Link>
          </div>
        )}

        {/* Footer */}
        <div className="text-center mt-8 text-caption text-text-tertiary">
          <p>&copy; {new Date().getFullYear()} AirPak Express. All rights reserved.</p>
          <div className="flex justify-center gap-4 mt-2">
            <Link to="/privacy" className="hover:text-text-secondary transition-colors">Privacy</Link>
            <span>•</span>
            <Link to="/terms" className="hover:text-text-secondary transition-colors">Terms</Link>
            <span>•</span>
            <Link to="/support" className="hover:text-text-secondary transition-colors">Support</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;