/**
 * AirPak Express - Glassmorphism Forgot Password Page
 * Apple-inspired glassmorphism authentication UI
 */

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowRight, CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react';
import { AuthLayout } from '../../components/auth/AuthLayout';

type Step = 'request' | 'success';

export const GlassForgotPassword: React.FC = () => {
  const [step, setStep] = useState<Step>('request');
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email) {
      setError('Email is required');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setIsLoading(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      // For demo, always show success
      setStep('success');
    } catch (err) {
      setError('Failed to send reset email. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    if (error) setError('');
  };

  return (
    <AuthLayout
      showBackLink={false}
      showLogo={true}
    >
      <div className="space-y-6 page-enter">
        {step === 'request' ? (
          <>
            {/* Header */}
            <div className="text-center">
              <h2 className="text-title2 text-text-primary mb-2">Reset Password</h2>
              <p className="text-body text-text-secondary">
                Enter your email address and we'll send you a link to reset your password.
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="flex items-center gap-3 p-4 bg-color-error-subtle border border-color-error/30 rounded-xl text-color-error">
                <AlertCircle size={20} />
                <span className="text-subhead">{error}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="flex flex-col gap-1">
                <label htmlFor="email" className="text-subhead text-text-secondary font-medium">
                  Email Address
                </label>
                <div className="relative">
                  <Mail size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-tertiary" />
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={email}
                    onChange={handleEmailChange}
                    placeholder="you@example.com"
                    autoComplete="email"
                    className={`w-full pl-12 pr-4 py-4 bg-white/[0.04] border rounded-xl text-text-primary placeholder-text-tertiary transition-all duration-300 outline-none ${
                      error
                        ? 'border-color-error focus:border-color-error/50 focus:shadow-[0_0_0_4px_var(--color-error-subtle)]'
                        : 'border-white/[0.08] focus:border-accent-blue/50 focus:shadow-[0_0_0_4px_var(--accent-blue-subtle)]'
                    }`}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-4 bg-gradient-to-b from-[#0A84FF] to-[#0077E6] text-white font-semibold rounded-xl hover:from-[#409CFF] hover:to-[#0A84FF] transition-all flex items-center justify-center gap-2 shadow-[0_4px_16px_rgba(10,132,255,0.4)] hover:shadow-[0_6px_24px_rgba(10,132,255,0.5)] hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    Send Reset Link
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            </form>

            {/* Back to Sign In */}
            <div className="text-center pt-2">
              <Link
                to="/login"
                className="inline-flex items-center gap-2 text-subhead text-text-secondary hover:text-text-primary transition-colors"
              >
                <ArrowLeft size={16} />
                Back to Sign In
              </Link>
            </div>
          </>
        ) : (
          <>
            {/* Success State */}
            <div className="text-center py-6">
              <div className="w-16 h-16 rounded-full bg-color-success/20 flex items-center justify-center mx-auto mb-4">
                <CheckCircle size={32} weight="fill" className="text-color-success" />
              </div>
              <h2 className="text-title2 text-text-primary mb-2">Check Your Email</h2>
              <p className="text-body text-text-secondary mb-2">
                We sent a password reset link to
              </p>
              <p className="text-headline text-accent-blue font-semibold mb-6">{email}</p>
              <p className="text-subhead text-text-tertiary">
                Click the link in the email to reset your password. The link will expire in 24 hours.
              </p>
            </div>

            {/* Resend Info */}
            <div className="p-4 bg-white/[0.03] rounded-xl border border-white/[0.06]">
              <p className="text-subhead text-text-secondary text-center">
                Didn't receive the email? Check your spam folder or{' '}
                <button
                  type="button"
                  onClick={() => setStep('request')}
                  className="text-accent-blue hover:underline"
                >
                  try again
                </button>
              </p>
            </div>

            {/* Back to Sign In */}
            <div className="text-center pt-2">
              <Link
                to="/login"
                className="inline-flex items-center gap-2 text-subhead text-text-secondary hover:text-text-primary transition-colors"
              >
                <ArrowLeft size={16} />
                Back to Sign In
              </Link>
            </div>
          </>
        )}
      </div>
    </AuthLayout>
  );
};

export default GlassForgotPassword;