/**
 * AirPak Express - Glassmorphism Sign In Page
 * Apple-inspired glassmorphism authentication UI
 */

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, ArrowRight, CheckCircle, AlertCircle } from 'lucide-react';
import { AuthLayout } from '../../components/auth/AuthLayout';
import { SocialLogin } from '../../components/auth/SocialLogin';
import { ParticleBg, GradientOrbs } from '../../components/ui/ParticleBg';

export const GlassSignIn: React.FC = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  // Check if user is already logged in
  useEffect(() => {
    const savedEmail = localStorage.getItem('airpak_remember_email');
    if (savedEmail) {
      setFormData(prev => ({ ...prev, email: savedEmail }));
      setRememberMe(true);
    }
  }, []);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);
    setErrors({});

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Demo: Accept any email/password for testing
      if (formData.email && formData.password) {
        // Save email if remember me is checked
        if (rememberMe) {
          localStorage.setItem('airpak_remember_email', formData.email);
        } else {
          localStorage.removeItem('airpak_remember_email');
        }

        // Save demo user
        const demoUser = {
          id: 'user-' + Date.now(),
          email: formData.email,
          full_name: formData.email.split('@')[0],
          role: 'user',
          created_at: new Date().toISOString(),
        };
        localStorage.setItem('airpak_user', JSON.stringify(demoUser));
        localStorage.setItem('airpak_auth_token', `token_${Date.now()}`);

        // Navigate to dashboard
        navigate('/dashboard');
        window.location.reload();
      }
    } catch (err) {
      setErrors({ submit: 'Invalid email or password. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  return (
    <AuthLayout
      title="Welcome Back"
      subtitle="Sign in to continue to your dashboard"
      showBackLink={false}
    >
      <div className="space-y-6 page-enter">
        {/* Form Header */}
        <div className="text-center">
          <h2 className="text-title2 text-text-primary mb-2">Sign In</h2>
          <p className="text-body text-text-secondary">Enter your credentials to access your account</p>
        </div>

        {/* Error Message */}
        {errors.submit && (
          <div className="flex items-center gap-3 p-4 bg-color-error-subtle border border-color-error/30 rounded-xl text-color-error">
            <AlertCircle size={20} />
            <span className="text-subhead">{errors.submit}</span>
          </div>
        )}

        {/* Sign In Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email Field */}
          <div className="flex flex-col gap-1">
            <label htmlFor="email" className="text-subhead text-text-secondary font-medium">
              Email Address
            </label>
            <div className="relative">
              <Mail
                size={20}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-text-tertiary"
              />
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="you@example.com"
                autoComplete="email"
                className={`w-full pl-12 pr-4 py-4 bg-white/[0.04] border rounded-xl text-text-primary placeholder-text-tertiary transition-all duration-300 outline-none ${
                  errors.email
                    ? 'border-color-error focus:border-color-error/50 focus:shadow-[0_0_0_4px_var(--color-error-subtle)]'
                    : 'border-white/[0.08] focus:border-accent-blue/50 focus:shadow-[0_0_0_4px_var(--accent-blue-subtle)]'
                }`}
              />
            </div>
            {errors.email && (
              <div className="flex items-center gap-2 mt-1 text-color-error text-subhead">
                <AlertCircle size={14} />
                <span>{errors.email}</span>
              </div>
            )}
          </div>

          {/* Password Field */}
          <div className="flex flex-col gap-1">
            <label htmlFor="password" className="text-subhead text-text-secondary font-medium">
              Password
            </label>
            <div className="relative">
              <Lock
                size={20}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-text-tertiary"
              />
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Enter your password"
                autoComplete="current-password"
                className={`w-full pl-12 pr-12 py-4 bg-white/[0.04] border rounded-xl text-text-primary placeholder-text-tertiary transition-all duration-300 outline-none ${
                  errors.password
                    ? 'border-color-error focus:border-color-error/50 focus:shadow-[0_0_0_4px_var(--color-error-subtle)]'
                    : 'border-white/[0.08] focus:border-accent-blue/50 focus:shadow-[0_0_0_4px_var(--accent-blue-subtle)]'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text-secondary transition-colors"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <Eye size={20} /> : <EyeOff size={20} />}
              </button>
            </div>
            {errors.password && (
              <div className="flex items-center gap-2 mt-1 text-color-error text-subhead">
                <AlertCircle size={14} />
                <span>{errors.password}</span>
              </div>
            )}
          </div>

          {/* Remember Me & Forgot Password */}
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-3 cursor-pointer group">
              <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${
                rememberMe
                  ? 'bg-accent-blue border-accent-blue'
                  : 'border-white/[0.2] group-hover:border-white/[0.4]'
              }`}>
                {rememberMe && <CheckCircle size={14} weight="fill" className="text-white" />}
              </div>
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="sr-only"
              />
              <span className="text-subhead text-text-secondary">Remember me</span>
            </label>
            <Link
              to="/forgot-password"
              className="text-subhead text-accent-blue hover:text-accent-blue-hover transition-colors"
            >
              Forgot password?
            </Link>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-4 bg-gradient-to-b from-[#0A84FF] to-[#0077E6] text-white font-semibold rounded-xl hover:from-[#409CFF] hover:to-[#0A84FF] focus:outline-none focus:ring-2 focus:ring-accent-blue/50 focus:ring-offset-2 focus:ring-offset-transparent disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2 shadow-[0_4px_16px_rgba(10,132,255,0.4)] hover:shadow-[0_6px_24px_rgba(10,132,255,0.5)] hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98]"
          >
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Signing in...
              </>
            ) : (
              <>
                Sign In
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center gap-4 my-6">
          <div className="flex-1 h-px bg-white/[0.1]" />
          <span className="text-subhead text-text-tertiary">or continue with</span>
          <div className="flex-1 h-px bg-white/[0.1]" />
        </div>

        {/* Social Login */}
        <SocialLogin
          onGoogleClick={() => console.log('Google login')}
          onGithubClick={() => console.log('GitHub login')}
          onAppleClick={() => console.log('Apple login')}
          disabled={isLoading}
        />

        {/* Sign Up Link */}
        <div className="text-center pt-4">
          <span className="text-subhead text-text-tertiary">Don't have an account? </span>
          <Link
            to="/signup"
            className="text-subhead text-accent-blue hover:text-accent-blue-hover font-semibold transition-colors"
          >
            Sign up
          </Link>
        </div>

        {/* Demo Credentials */}
        <div className="mt-6 p-4 bg-white/[0.03] rounded-xl border border-white/[0.06]">
          <p className="text-caption text-text-tertiary text-center mb-2">Demo Credentials</p>
          <div className="text-caption text-text-secondary text-center">
            <p>Email: <span className="text-text-primary">demo@airpak.com</span></p>
            <p>Password: <span className="text-text-primary">demo123</span></p>
          </div>
        </div>
      </div>
    </AuthLayout>
  );
};

export default GlassSignIn;