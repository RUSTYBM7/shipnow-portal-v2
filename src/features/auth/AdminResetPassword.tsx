import React, { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { Shield, Lock, CheckCircle, AlertCircle, KeyRound } from 'lucide-react';
import { AuthLayout } from '../../components/auth/AuthLayout';
import { AppleButton } from '../../components/ui/AppleButton';
import toast from 'react-hot-toast';

export const AdminResetPassword: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [token, setToken] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);

  // Password requirements
  const requirements = [
    { key: 'length', label: '12+ characters', check: (p: string) => p.length >= 12 },
    { key: 'upper', label: 'Uppercase letter', check: (p: string) => /[A-Z]/.test(p) },
    { key: 'lower', label: 'Lowercase letter', check: (p: string) => /[a-z]/.test(p) },
    { key: 'number', label: 'Number', check: (p: string) => /[0-9]/.test(p) },
    { key: 'special', label: 'Special character', check: (p: string) => /[^A-Za-z0-9]/.test(p) },
  ];

  // Validate token from URL
  useEffect(() => {
    const urlToken = searchParams.get('token');
    if (urlToken) {
      setToken(urlToken);
    } else {
      toast.error('Invalid or expired reset link');
      navigate('/admin/forgot');
    }
  }, [searchParams, navigate]);

  // Success countdown
  useEffect(() => {
    if (!isSuccess) return;

    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          navigate('/admin');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isSuccess, navigate]);

  const getPasswordStrength = (pwd: string): { level: number; label: string } => {
    const passed = requirements.filter(r => r.check(pwd)).length;
    const levels = ['Too short', 'Weak', 'Fair', 'Good', 'Strong'];
    return { level: passed, label: levels[Math.min(passed, 4)] };
  };

  const getStrengthColor = (level: number): string => {
    if (level <= 1) return 'bg-[#FF453A]';
    if (level === 2) return 'bg-[#FF9F0A]';
    if (level === 3) return 'bg-[#FFD60A]';
    return 'bg-[#30D158]';
  };

  const validatePasswords = (): boolean => {
    const newErrors: Record<string, string> = {};
    const passedCount = requirements.filter(r => r.check(newPassword)).length;

    if (newPassword.length < 12) {
      newErrors.password = 'Password must be at least 12 characters';
    } else if (passedCount < 4) {
      newErrors.password = 'Password must meet at least 4 requirements';
    }

    if (!confirmPassword) {
      newErrors.confirm = 'Please confirm your password';
    } else if (confirmPassword !== newPassword) {
      newErrors.confirm = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validatePasswords()) {
      return;
    }

    setIsLoading(true);

    try {
      // Simulate API call - in production, this would use Supabase
      // supabase.auth.updateUser({ password: newPassword })
      await new Promise(resolve => setTimeout(resolve, 2000));

      setIsSuccess(true);
      toast.success('Password updated successfully');
    } catch (error) {
      toast.error('Failed to update password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const passwordStrength = getPasswordStrength(newPassword);
  const passedRequirements = requirements.filter(r => r.check(newPassword));

  if (!token) {
    return (
      <AuthLayout title="Validating Link" subtitle="Please wait...">
        <div className="flex justify-center py-8">
          <div className="w-8 h-8 border-2 border-[#BF5AF2] border-t-transparent rounded-full animate-spin" />
        </div>
      </AuthLayout>
    );
  }

  if (isSuccess) {
    return (
      <AuthLayout title="Password Updated" subtitle="Your admin password has been successfully changed">
        <div className="space-y-6">
          {/* Success Icon */}
          <div className="flex justify-center py-6">
            <div className="w-20 h-20 rounded-full bg-[rgba(48,209,88,0.1)] border-2 border-[#30D158] flex items-center justify-center">
              <CheckCircle className="w-10 h-10 text-[#30D158]" />
            </div>
          </div>

          {/* Message */}
          <div className="text-center space-y-4">
            <p className="text-[rgba(255,255,255,0.7)]">
              Your password has been successfully updated. Your session will expire in 30 minutes for security purposes.
            </p>
          </div>

          {/* Redirect Countdown */}
          <div className="text-center">
            <p className="text-sm text-[rgba(255,255,255,0.5)]">
              Redirecting to admin sign in in <span className="text-white font-mono">{countdown}</span>...
            </p>
          </div>

          {/* Sign In Button */}
          <div className="pt-4">
            <Link
              to="/admin"
              className="block w-full text-center py-3 rounded-xl
                bg-[#BF5AF2] text-white font-semibold
                hover:bg-[#D97BFF] transition-all duration-300"
            >
              Sign In Now
            </Link>
          </div>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="New Admin Password"
      subtitle="Create a strong password that differs from your last 5"
      showBackLink
      backLinkTo="/admin"
      backLinkText="Back to sign in"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Security Warning */}
        <div className="flex items-center gap-3 py-4 px-4 rounded-xl bg-[rgba(255,159,10,0.1)] border border-[rgba(255,159,10,0.3)]">
          <AlertCircle className="w-5 h-5 text-[#FF9F0A] flex-shrink-0" />
          <p className="text-sm text-[rgba(255,255,255,0.7)]">
            Password must be different from your last 5 passwords
          </p>
        </div>

        {/* New Password Field */}
        <div>
          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[rgba(255,255,255,0.35)]">
              <Lock size={18} />
            </div>
            <input
              type={showPassword ? 'text' : 'password'}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="New Password"
              className={`
                w-full pl-12 pr-12 py-4 text-base rounded-xl
                bg-[rgba(255,255,255,0.04)] border text-white
                placeholder:text-[rgba(255,255,255,0.35)]
                transition-all duration-300
                ${errors.password
                  ? 'border-[rgba(255,69,58,0.6)] shadow-[0_0_0_3px_rgba(255,69,58,0.15)]'
                  : 'border-[rgba(255,255,255,0.08)] focus:border-[rgba(191,90,242,0.5)] focus:shadow-[0_0_0_4px_rgba(191,90,242,0.2)]'
                }
              `}
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-[rgba(255,255,255,0.35)] hover:text-white transition-colors"
            >
              {showPassword ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                  <line x1="1" y1="1" x2="23" y2="23" />
                </svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              )}
            </button>
          </div>
          {errors.password && (
            <div className="flex items-center gap-2 mt-2 text-sm text-[#FF453A]">
              <AlertCircle size={16} />
              <span>{errors.password}</span>
            </div>
          )}
        </div>

        {/* Password Strength & Requirements */}
        {newPassword.length > 0 && (
          <div className="space-y-3">
            {/* Strength Bar */}
            <div className="flex gap-1">
              {requirements.map((_, index) => (
                <div
                  key={index}
                  className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                    index < passedRequirements.length ? getStrengthColor(passedRequirements.length) : 'bg-[rgba(255,255,255,0.1)]'
                  }`}
                />
              ))}
            </div>
            <p className={`text-xs ${
              passwordStrength.level <= 1 ? 'text-[#FF453A]' :
              passwordStrength.level === 2 ? 'text-[#FF9F0A]' :
              passwordStrength.level === 3 ? 'text-[#FFD60A]' : 'text-[#30D158]'
            }`}>
              {passwordStrength.label}
            </p>

            {/* Requirements Checklist */}
            <div className="grid grid-cols-2 gap-2 pt-2">
              {requirements.map((req) => (
                <div
                  key={req.key}
                  className={`flex items-center gap-2 text-xs ${
                    req.check(newPassword) ? 'text-[#30D158]' : 'text-[rgba(255,255,255,0.4)]'
                  }`}
                >
                  {req.check(newPassword) ? (
                    <CheckCircle size={14} />
                  ) : (
                    <div className="w-3.5 h-3.5 rounded-full border border-current" />
                  )}
                  <span>{req.label}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Confirm Password Field */}
        <div>
          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[rgba(255,255,255,0.35)]">
              <KeyRound size={18} />
            </div>
            <input
              type={showPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm Password"
              className={`
                w-full pl-12 py-4 text-base rounded-xl
                bg-[rgba(255,255,255,0.04)] border text-white
                placeholder:text-[rgba(255,255,255,0.35)]
                transition-all duration-300
                ${errors.confirm
                  ? 'border-[rgba(255,69,58,0.6)] shadow-[0_0_0_3px_rgba(255,69,58,0.15)]'
                  : confirmPassword && confirmPassword === newPassword
                    ? 'border-[rgba(48,209,88,0.5)]'
                    : 'border-[rgba(255,255,255,0.08)] focus:border-[rgba(191,90,242,0.5)] focus:shadow-[0_0_0_4px_rgba(191,90,242,0.2)]'
                }
              `}
              disabled={isLoading}
            />
            {confirmPassword && confirmPassword === newPassword && (
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[#30D158]">
                <CheckCircle size={18} />
              </span>
            )}
          </div>
          {errors.confirm && (
            <div className="flex items-center gap-2 mt-2 text-sm text-[#FF453A]">
              <AlertCircle size={16} />
              <span>{errors.confirm}</span>
            </div>
          )}
        </div>

        {/* Session Warning */}
        <div className="flex items-center gap-2 text-xs text-[rgba(255,255,255,0.5)] pt-2">
          <Shield className="w-4 h-4 text-[#BF5AF2]" />
          <span>Your session will expire in 30 minutes after login</span>
        </div>

        {/* Submit Button */}
        <AppleButton
          type="submit"
          variant="admin"
          isLoading={isLoading}
          disabled={isLoading || passedRequirements.length < 4 || confirmPassword !== newPassword}
        >
          Update Password
        </AppleButton>
      </form>
    </AuthLayout>
  );
};

export default AdminResetPassword;