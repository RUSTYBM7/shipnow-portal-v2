import React, { useState } from 'react';
import { Eye, EyeOff, AlertCircle, Check } from 'lucide-react';

interface FloatingInputProps {
  type?: 'text' | 'email' | 'password' | 'tel' | 'number';
  name: string;
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  error?: string;
  success?: boolean;
  disabled?: boolean;
  autoComplete?: string;
  icon?: React.ReactNode;
  maxLength?: number;
}

export const FloatingInput: React.FC<FloatingInputProps> = ({
  type = 'text',
  name,
  label,
  value,
  onChange,
  onBlur,
  error,
  success,
  disabled = false,
  autoComplete,
  icon,
  maxLength
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const inputType = type === 'password' ? (showPassword ? 'text' : 'password') : type;

  const getStatusClass = () => {
    if (error) return 'error';
    if (success && value) return 'success';
    return '';
  };

  const handleFocus = () => setIsFocused(true);
  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(false);
    onBlur?.(e);
  };

  return (
    <div className="flex flex-col gap-1">
      <div className="input-icon-wrapper">
        {icon && <span className="input-icon">{icon}</span>}
        <input
          type={inputType}
          name={name}
          id={name}
          value={value}
          onChange={onChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          disabled={disabled}
          autoComplete={autoComplete}
          maxLength={maxLength}
          placeholder=" "
          className={`glass-input ${icon ? 'pl-12' : ''} ${type === 'password' ? 'pr-12' : ''} ${getStatusClass()}`}
          aria-label={label}
          aria-invalid={!!error}
          aria-describedby={error ? `${name}-error` : undefined}
        />
        <label htmlFor={name} className="absolute left-5 top-4 text-text-tertiary transition-all duration-300 pointer-events-none">
          {label}
        </label>
        {type === 'password' && value && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text-secondary transition-colors"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        )}
        {success && !error && value && (
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-color-success">
            <Check size={20} />
          </span>
        )}
      </div>
      {error && (
        <div className="input-error" id={`${name}-error`} role="alert">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};

export default FloatingInput;