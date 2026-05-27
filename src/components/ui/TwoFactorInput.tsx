import React, { useState, useRef, useEffect, useCallback } from 'react';

interface TwoFactorInputProps {
  length?: number;
  onComplete: (code: string) => void;
  disabled?: boolean;
  error?: boolean;
}

export const TwoFactorInput: React.FC<TwoFactorInputProps> = ({
  length = 6,
  onComplete,
  disabled = false,
  error = false
}) => {
  const [values, setValues] = useState<string[]>(Array(length).fill(''));
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    // Focus first input on mount
    inputRefs.current[0]?.focus();
  }, []);

  // Reset on error
  useEffect(() => {
    if (error) {
      setValues(Array(length).fill(''));
      inputRefs.current[0]?.focus();
    }
  }, [error, length]);

  const handleChange = useCallback((index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    // Only allow digits
    if (!/^\d*$/.test(value)) return;

    const newValues = [...values];

    // Handle paste
    if (value.length > 1) {
      const chars = value.slice(0, length - index).split('');
      chars.forEach((char, i) => {
        if (index + i < length) {
          newValues[index + i] = char;
        }
      });
      setValues(newValues);

      // Focus last filled or next empty
      const nextIndex = Math.min(index + chars.length, length - 1);
      inputRefs.current[nextIndex]?.focus();

      // Check if complete
      const code = newValues.join('');
      if (code.length === length && !newValues.includes('')) {
        onComplete(code);
      }
      return;
    }

    newValues[index] = value;
    setValues(newValues);

    // Auto-focus next
    if (value && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    // Check if complete
    const code = newValues.join('');
    if (code.length === length && !newValues.includes('')) {
      onComplete(code);
    }
  }, [values, length, onComplete]);

  const handleKeyDown = useCallback((index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (!values[index] && index > 0) {
        // Move to previous on backspace if current is empty
        const newValues = [...values];
        newValues[index - 1] = '';
        setValues(newValues);
        inputRefs.current[index - 1]?.focus();
      } else if (values[index]) {
        // Clear current
        const newValues = [...values];
        newValues[index] = '';
        setValues(newValues);
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    } else if (e.key === 'Enter') {
      const code = values.join('');
      if (code.length === length && !values.includes('')) {
        onComplete(code);
      }
    }
  }, [values, length, onComplete]);

  const handlePaste = useCallback((e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length);
    const startIndex = 0; // Paste always starts at index 0

    if (pastedData) {
      const newValues = [...values];
      pastedData.split('').forEach((char, i) => {
        if (startIndex + i < length) {
          newValues[startIndex + i] = char;
        }
      });
      setValues(newValues);

      // Focus appropriate input
      const lastIndex = Math.min(pastedData.length - 1, length - 1);
      inputRefs.current[lastIndex]?.focus();

      // Check if complete
      const code = newValues.join('');
      if (code.length === length && !newValues.includes('')) {
        onComplete(code);
      }
    }
  }, [values, length, onComplete]);

  return (
    <div className="flex justify-center gap-3">
      {Array.from({ length }).map((_, index) => (
        <input
          key={index}
          ref={(el) => { inputRefs.current[index] = el; }}
          type="text"
          inputMode="numeric"
          pattern="[0-9]"
          maxLength={length - index}
          value={values[index]}
          onChange={(e) => handleChange(index, e)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onPaste={index === 0 ? handlePaste : undefined}
          disabled={disabled}
          className={`
            w-12 h-14 text-center text-2xl font-semibold
            bg-[rgba(255,255,255,0.04)] border rounded-xl
            text-white transition-all duration-200
            ${error
              ? 'border-[rgba(255,69,58,0.6)] shadow-[0_0_0_3px_rgba(255,69,58,0.15)] animate-shake'
              : 'border-[rgba(255,255,255,0.08)] focus:border-[rgba(191,90,242,0.5)] focus:shadow-[0_0_0_4px_rgba(191,90,242,0.2)]'
            }
            ${values[index] ? 'bg-[rgba(191,90,242,0.1)] border-[rgba(191,90,242,0.3)]' : ''}
            disabled:opacity-50 disabled:cursor-not-allowed
          `}
          style={{ fontFamily: "'SF Mono', monospace" }}
        />
      ))}
    </div>
  );
};

export default TwoFactorInput;