import React, { useMemo } from 'react';

interface PasswordMeterProps {
  password: string;
  showText?: boolean;
}

export const PasswordMeter: React.FC<PasswordMeterProps> = ({
  password,
  showText = true
}) => {
  const { strength, level, text } = useMemo(() => {
    if (!password) {
      return { strength: 0, level: 'empty', text: '' };
    }

    let score = 0;

    // Length checks
    if (password.length >= 8) score += 1;
    if (password.length >= 12) score += 1;
    if (password.length >= 16) score += 1;

    // Character type checks
    if (/[a-z]/.test(password)) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^a-zA-Z0-9]/.test(password)) score += 1;

    // Calculate strength
    if (score <= 2) return { strength: 25, level: 'weak', text: 'Weak password' };
    if (score <= 4) return { strength: 50, level: 'fair', text: 'Fair password' };
    if (score <= 6) return { strength: 75, level: 'good', text: 'Good password' };
    return { strength: 100, level: 'strong', text: 'Strong password' };
  }, [password]);

  if (!password) return null;

  return (
    <div className="password-meter">
      <div className="password-meter-bar">
        <div
          className={`password-meter-fill ${level}`}
          style={{ width: `${strength}%` }}
          role="progressbar"
          aria-valuenow={strength}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`Password strength: ${level}`}
        />
      </div>
      {showText && (
        <div className={`password-meter-text ${level}`}>
          {text}
        </div>
      )}
    </div>
  );
};

// Password requirements checklist component
interface PasswordRequirementsProps {
  password: string;
}

export const PasswordRequirements: React.FC<PasswordRequirementsProps> = ({ password }) => {
  const requirements = [
    { check: password.length >= 8, text: 'At least 8 characters' },
    { check: password.length >= 12, text: 'At least 12 characters', optional: true },
    { check: /[a-z]/.test(password), text: 'One lowercase letter' },
    { check: /[A-Z]/.test(password), text: 'One uppercase letter' },
    { check: /[0-9]/.test(password), text: 'One number' },
    { check: /[^a-zA-Z0-9]/.test(password), text: 'One special character' },
  ];

  return (
    <div className="flex flex-col gap-1 mt-2">
      {requirements.map((req, index) => (
        <div
          key={index}
          className={`flex items-center gap-2 text-subhead ${
            req.check ? 'text-color-success' : 'text-text-tertiary'
          } ${req.optional ? 'opacity-60' : ''}`}
        >
          <span className={`w-4 h-4 rounded-full flex items-center justify-center ${
            req.check
              ? 'bg-color-success text-text-primary'
              : 'bg-border-default'
          }`}>
            {req.check && (
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                <path
                  d="M2 5L4 7L8 3"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            )}
          </span>
          <span>{req.text}</span>
        </div>
      ))}
    </div>
  );
};

export default PasswordMeter;