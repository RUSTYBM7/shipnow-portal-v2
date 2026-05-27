import React from 'react';
import {
  Mail, Github, Apple as AppleIcon, CheckCircle,
  AlertCircle, Eye, EyeOff, Lock, User, Phone,
  Building2, ArrowRight, ArrowLeft, Check
} from 'lucide-react';

interface SocialLoginProps {
  onGoogleClick?: () => void;
  onGithubClick?: () => void;
  onAppleClick?: () => void;
  disabled?: boolean;
}

export const SocialLogin: React.FC<SocialLoginProps> = ({
  onGoogleClick,
  onGithubClick,
  onAppleClick,
  disabled = false
}) => {
  return (
    <div className="flex flex-col gap-3">
      <div className="glass-divider">
        <span>or continue with</span>
      </div>

      <div className="flex gap-3">
        {/* Google */}
        <button
          type="button"
          onClick={onGoogleClick}
          disabled={disabled}
          className="flex-1 btn-glass-icon hover-lift"
          aria-label="Sign in with Google"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
        </button>

        {/* GitHub */}
        <button
          type="button"
          onClick={onGithubClick}
          disabled={disabled}
          className="flex-1 btn-glass-icon hover-lift"
          aria-label="Sign in with GitHub"
        >
          <Github size={22} />
        </button>

        {/* Apple */}
        <button
          type="button"
          onClick={onAppleClick}
          disabled={disabled}
          className="flex-1 btn-glass-icon hover-lift"
          aria-label="Sign in with Apple"
        >
          <AppleIcon size={22} />
        </button>
      </div>
    </div>
  );
};

export default SocialLogin;