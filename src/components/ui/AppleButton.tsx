import React from 'react';
import { Loader2 } from 'lucide-react';

interface AppleButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'admin';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  icon?: React.ReactNode;
  className?: string;
}

export const AppleButton: React.FC<AppleButtonProps> = ({
  children,
  onClick,
  type = 'button',
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  fullWidth = true,
  icon,
  className = ''
}) => {
  const baseClasses = 'apple-button';

  const variantClasses: Record<string, string> = {
    primary: 'btn-glass-primary',
    secondary: 'btn-glass-secondary',
    ghost: 'bg-transparent border-none text-text-secondary hover:text-text-primary',
    danger: 'bg-color-error-subtle border-color-error text-color-error hover:bg-color-error hover:text-text-primary',
    admin: 'bg-gradient-to-b from-[#BF5AF2] to-[#9B4DCA] text-white shadow-[0_4px_16px_rgba(191,90,242,0.4)] hover:shadow-[0_6px_24px_rgba(191,90,242,0.5)] hover:-translate-y-0.5',
  };

  const sizeClasses: Record<string, string> = {
    sm: 'py-2 px-4 text-sm',
    md: 'py-3 px-6 text-base',
    lg: 'py-4 px-8 text-lg',
  };

  const isDisabled = disabled || isLoading;

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={isDisabled}
      className={`
        ${baseClasses}
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${fullWidth ? 'w-full' : ''}
        ${isLoading ? 'btn-loading' : ''}
        ${className}
      `.trim().replace(/\s+/g, ' ')}
      aria-busy={isLoading}
    >
      {isLoading ? (
        <Loader2 size={20} className="spinner" />
      ) : icon ? (
        <span className="flex-shrink-0">{icon}</span>
      ) : null}
      <span>{children}</span>
    </button>
  );
};

export default AppleButton;