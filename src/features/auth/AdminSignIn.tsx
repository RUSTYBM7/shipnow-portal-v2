import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Shield, KeyRound, Eye, EyeOff, Lock, AlertCircle, CheckCircle } from 'lucide-react';
import { AuthLayout } from '../../components/auth/AuthLayout';
import { FloatingInput } from '../../components/ui/FloatingInput';
import { AppleButton } from '../../components/ui/AppleButton';
import toast from 'react-hot-toast';

interface AdminSignInProps {
  prefillKey?: string;
}

export const AdminSignIn: React.FC<AdminSignInProps> = ({ prefillKey }) => {
  const navigate = useNavigate();
  const [adminKey, setAdminKey] = useState(prefillKey || '');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [attemptsRemaining, setAttemptsRemaining] = useState<number | null>(null);

  // Mock validation for admin key format
  const validateAdminKey = (key: string): boolean => {
    const keyRegex = /^ADM-[A-Z0-9]{4}-[A-Z0-9]{4}$/;
    return keyRegex.test(key);
  };

  // Mock validation for email
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Mock validation for password strength
  const getPasswordStrength = (pwd: string): { level: number; label: string } => {
    if (pwd.length === 0) return { level: 0, label: '' };
    if (pwd.length < 12) return { level: 1, label: 'Too short' };

    let score = 0;
    if (pwd.length >= 12) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[a-z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;

    const levels = ['Too short', 'Weak', 'Fair', 'Good', 'Strong'];
    return { level: Math.min(score, 4), label: levels[Math.min(score, 4)] };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate fields
    const newErrors: Record<string, string> = {};

    if (!adminKey) {
      newErrors.adminKey = 'Admin key is required';
    } else if (!validateAdminKey(adminKey)) {
      newErrors.adminKey = 'Invalid admin key format (use ADM-XXXX-XXXX)';
    }

    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 12) {
      newErrors.password = 'Admin passwords require 12+ characters';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setIsLoading(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Mock success - in production, this would validate against Supabase
      // Check if 2FA is enabled (mock)
      const requires2FA = true;

      if (requires2FA) {
        // Store admin session info
        sessionStorage.setItem('adminPending2FA', JSON.stringify({ email, adminKey }));
        navigate('/admin/2fa');
      } else {
        // Direct login
        toast.success('Admin authentication successful');
        navigate('/admin/portal');
      }
    } catch (error) {
      toast.error('Authentication failed. Please check your credentials.');
      setAttemptsRemaining(prev => prev !== null ? prev - 1 : 2);
    } finally {
      setIsLoading(false);
    }
  };

  const passwordStrength = getPasswordStrength(password);

  return (
    <AuthLayout
      title="Admin Access"
      subtitle="Secure authentication for authorized personnel"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Security Badge */}
        <div className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[rgba(191,90,242,0.1)] border border-[rgba(191,90,242,0.2)]">
          <Shield className="w-5 h-5 text-[#BF5AF2]" />
          <span className="text-sm text-[#BF5AF2] font-medium">Secured with end-to-end encryption</span>
        </div>

        {/* Admin Key Field */}
        <div>
          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[rgba(255,255,255,0.35)]">
              <KeyRound size={18} />
            </div>
            <input
              type="text"
              value={adminKey}
              onChange={(e) => setAdminKey(e.target.value.toUpperCase())}
              placeholder="Admin Key (ADM-XXXX-XXXX)"
              className={`
                w-full pl-12 pr-12 py-4 text-base rounded-xl
                bg-[rgba(255,255,255,0.04)] border text-white
                font-mono tracking-wider
                placeholder:text-[rgba(255,255,255,0.35)]
                transition-all duration-300
                ${errors.adminKey
                  ? 'border-[rgba(255,69,58,0.6)] shadow-[0_0_0_3px_rgba(255,69,58,0.15)]'
                  : 'border-[rgba(255,255,255,0.08)] focus:border-[rgba(191,90,242,0.5)] focus:shadow-[0_0_0_4px_rgba(191,90,242,0.2)]'
                }
              `}
              style={{ fontFamily: "'SF Mono', 'Monaco', 'Consolas', monospace" }}
              disabled={isLoading}
            />
            {adminKey && validateAdminKey(adminKey) && (
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[#30D158]">
                <CheckCircle size={18} />
              </span>
            )}
          </div>
          {errors.adminKey && (
            <div className="flex items-center gap-2 mt-2 text-sm text-[#FF453A]">
              <AlertCircle size={16} />
              <span>{errors.adminKey}</span>
            </div>
          )}
          <p className="mt-2 text-xs text-[rgba(255,255,255,0.35)]">
            Found in your invitation email
          </p>
        </div>

        {/* Email Field */}
        <FloatingInput
          type="email"
          name="adminEmail"
          label="Admin Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={errors.email}
          disabled={isLoading}
          autoComplete="email"
          icon={<span className="text-[rgba(255,255,255,0.35)]">@</span>}
        />

        {/* Password Field */}
        <div>
          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[rgba(255,255,255,0.35)]">
              <Lock size={18} />
            </div>
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password (12+ characters)"
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
              autoComplete="current-password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-[rgba(255,255,255,0.35)] hover:text-white transition-colors"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {errors.password && (
            <div className="flex items-center gap-2 mt-2 text-sm text-[#FF453A]">
              <AlertCircle size={16} />
              <span>{errors.password}</span>
            </div>
          )}
        </div>

        {/* Password Strength Indicator */}
        {password.length > 0 && (
          <div className="space-y-2">
            <div className="flex gap-1">
              {[1, 2, 3, 4].map((level) => (
                <div
                  key={level}
                  className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                    passwordStrength.level >= level
                      ? passwordStrength.level === 1
                        ? 'bg-[#FF453A]'
                        : passwordStrength.level === 2
                          ? 'bg-[#FF9F0A]'
                          : passwordStrength.level === 3
                            ? 'bg-[#FFD60A]'
                            : 'bg-[#30D158]'
                      : 'bg-[rgba(255,255,255,0.1)]'
                  }`}
                />
              ))}
            </div>
            <p className={`text-xs ${
              passwordStrength.level === 1
                ? 'text-[#FF453A]'
                : passwordStrength.level === 2
                  ? 'text-[#FF9F0A]'
                  : passwordStrength.level === 3
                    ? 'text-[#FFD60A]'
                    : 'text-[#30D158]'
            }`}>
              {passwordStrength.label}
            </p>
          </div>
        )}

        {/* Attempts Warning */}
        {attemptsRemaining !== null && attemptsRemaining <= 2 && (
          <div className="flex items-center gap-2 py-3 px-4 rounded-xl bg-[rgba(255,159,10,0.1)] border border-[rgba(255,159,10,0.3)]">
            <AlertCircle className="w-5 h-5 text-[#FF9F0A]" />
            <span className="text-sm text-[#FF9F0A]">
              {attemptsRemaining} attempt{attemptsRemaining !== 1 ? 's' : ''} remaining
            </span>
          </div>
        )}

        {/* Submit Button */}
        <AppleButton
          type="submit"
          variant="admin"
          isLoading={isLoading}
          disabled={isLoading}
        >
          {isLoading ? 'Authenticating...' : 'Authenticate'}
        </AppleButton>

        {/* Security Info */}
        <div className="border-t border-[rgba(255,255,255,0.08)] pt-5 space-y-3">
          <div className="flex items-center gap-3 text-xs text-[rgba(255,255,255,0.5)]">
            <Lock size={14} className="text-[#BF5AF2]" />
            <span>Session expires in 30 minutes</span>
          </div>
          <div className="flex items-center gap-3 text-xs text-[rgba(255,255,255,0.5)]">
            <Shield size={14} className="text-[#BF5AF2]" />
            <span>All sessions are end-to-end encrypted</span>
          </div>
        </div>

        {/* Forgot Password Link */}
        <div className="text-center pt-4">
          <Link
            to="/admin/forgot"
            className="text-sm text-[rgba(255,255,255,0.5)] hover:text-[#BF5AF2] transition-colors"
          >
            Forgot admin credentials?
          </Link>
        </div>
      </form>
    </AuthLayout>
  );
};

export default AdminSignIn;