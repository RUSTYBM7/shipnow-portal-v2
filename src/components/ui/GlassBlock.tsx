import React from 'react';

interface GlassBlockProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'light' | 'heavy' | 'blue' | 'purple';
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  onClick?: () => void;
}

export const GlassBlock: React.FC<GlassBlockProps> = ({
  children,
  className = '',
  variant = 'default',
  padding = 'lg',
  onClick
}) => {
  const variantClasses: Record<string, string> = {
    default: '',
    light: 'glass-block-light',
    heavy: 'glass-block-heavy',
    blue: 'glass-block-blue',
    purple: 'glass-block-purple',
  };

  const paddingClasses: Record<string, string> = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
    xl: 'p-10',
  };

  return (
    <div
      className={`glass-block ${variantClasses[variant]} ${paddingClasses[padding]} ${className}`}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => e.key === 'Enter' && onClick() : undefined}
    >
      {children}
    </div>
  );
};

export default GlassBlock;