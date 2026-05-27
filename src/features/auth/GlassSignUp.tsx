/**
 * AirPak Express - Glassmorphism Multi-Step Sign Up
 * Apple-inspired glassmorphism authentication UI
 * Step 1: Account Credentials
 * Step 2: Personal Information
 * Step 3: Confirmation
 */

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, User, Phone, Building2, ArrowRight, ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react';
import { AuthLayout } from '../../components/auth/AuthLayout';
import { StepIndicator } from '../../components/ui/StepIndicator';
import { PasswordMeter, PasswordRequirements } from '../../components/ui/PasswordMeter';

interface SignUpData {
  // Step 1: Credentials
  email: string;
  password: string;
  confirmPassword: string;
  // Step 2: Personal Info
  fullName: string;
  phone: string;
  company: string;
}

export const GlassSignUp: React.FC = () => {
  const navigate = useNavigate();

  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<SignUpData>({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    phone: '',
    company: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);

  const steps = [
    { label: 'Account', description: 'Credentials' },
    { label: 'Profile', description: 'Personal info' },
    { label: 'Confirm', description: 'Review & submit' }
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (step === 0) {
      // Validate credentials
      if (!formData.email) {
        newErrors.email = 'Email is required';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        newErrors.email = 'Please enter a valid email address';
      }

      if (!formData.password) {
        newErrors.password = 'Password is required';
      } else if (formData.password.length < 8) {
        newErrors.password = 'Password must be at least 8 characters';
      }

      if (!formData.confirmPassword) {
        newErrors.confirmPassword = 'Please confirm your password';
      } else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }

    if (step === 1) {
      // Validate personal info
      if (!formData.fullName || formData.fullName.trim().length < 2) {
        newErrors.fullName = 'Full name is required';
      }

      if (formData.phone && !/^[\d\s\-+()]{7,20}$/.test(formData.phone)) {
        newErrors.phone = 'Please enter a valid phone number';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    setCurrentStep(prev => prev - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!acceptTerms) {
      setErrors({ submit: 'Please accept the Terms of Service and Privacy Policy' });
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Save demo user
      const newUser = {
        id: 'user-' + Date.now(),
        email: formData.email,
        full_name: formData.fullName,
        role: 'user',
        created_at: new Date().toISOString(),
      };
      localStorage.setItem('airpak_user', JSON.stringify(newUser));
      localStorage.setItem('airpak_auth_token', `token_${Date.now()}`);

      // Navigate to dashboard
      navigate('/dashboard');
      window.location.reload();
    } catch (err) {
      setErrors({ submit: 'Registration failed. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-5 step-forward">
            {/* Step 1: Account Credentials */}
            <div className="text-center mb-6">
              <h2 className="text-title2 text-text-primary mb-2">Create Account</h2>
              <p className="text-body text-text-secondary">Step 1: Set up your credentials</p>
            </div>

            {/* Email */}
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
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="you@example.com"
                  autoComplete="email"
                  className={`w-full pl-12 pr-4 py-4 bg-white/[0.04] border rounded-xl text-text-primary placeholder-text-tertiary transition-all duration-300 outline-none ${
                    errors.email
                      ? 'border-color-error focus:border-color-error/50'
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

            {/* Password */}
            <div className="flex flex-col gap-1">
              <label htmlFor="password" className="text-subhead text-text-secondary font-medium">
                Password
              </label>
              <div className="relative">
                <Lock size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-tertiary" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Create a strong password"
                  autoComplete="new-password"
                  className={`w-full pl-12 pr-12 py-4 bg-white/[0.04] border rounded-xl text-text-primary placeholder-text-tertiary transition-all duration-300 outline-none ${
                    errors.password
                      ? 'border-color-error focus:border-color-error/50'
                      : 'border-white/[0.08] focus:border-accent-blue/50 focus:shadow-[0_0_0_4px_var(--accent-blue-subtle)]'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text-secondary transition-colors"
                >
                  {showPassword ? <Eye size={20} /> : <EyeOff size={20} />}
                </button>
              </div>
              <PasswordMeter password={formData.password} />
              <PasswordRequirements password={formData.password} />
              {errors.password && (
                <div className="flex items-center gap-2 mt-1 text-color-error text-subhead">
                  <AlertCircle size={14} />
                  <span>{errors.password}</span>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div className="flex flex-col gap-1">
              <label htmlFor="confirmPassword" className="text-subhead text-text-secondary font-medium">
                Confirm Password
              </label>
              <div className="relative">
                <Lock size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-tertiary" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  placeholder="Confirm your password"
                  autoComplete="new-password"
                  className={`w-full pl-12 pr-12 py-4 bg-white/[0.04] border rounded-xl text-text-primary placeholder-text-tertiary transition-all duration-300 outline-none ${
                    errors.confirmPassword
                      ? 'border-color-error focus:border-color-error/50'
                      : 'border-white/[0.08] focus:border-accent-blue/50 focus:shadow-[0_0_0_4px_var(--accent-blue-subtle)]'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text-secondary transition-colors"
                >
                  {showConfirmPassword ? <Eye size={20} /> : <EyeOff size={20} />}
                </button>
              </div>
              {errors.confirmPassword && (
                <div className="flex items-center gap-2 mt-1 text-color-error text-subhead">
                  <AlertCircle size={14} />
                  <span>{errors.confirmPassword}</span>
                </div>
              )}
            </div>
          </div>
        );

      case 1:
        return (
          <div className="space-y-5 step-forward">
            {/* Step 2: Personal Information */}
            <div className="text-center mb-6">
              <h2 className="text-title2 text-text-primary mb-2">Personal Details</h2>
              <p className="text-body text-text-secondary">Step 2: Tell us about yourself</p>
            </div>

            {/* Full Name */}
            <div className="flex flex-col gap-1">
              <label htmlFor="fullName" className="text-subhead text-text-secondary font-medium">
                Full Name
              </label>
              <div className="relative">
                <User size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-tertiary" />
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  placeholder="John Smith"
                  autoComplete="name"
                  className={`w-full pl-12 pr-4 py-4 bg-white/[0.04] border rounded-xl text-text-primary placeholder-text-tertiary transition-all duration-300 outline-none ${
                    errors.fullName
                      ? 'border-color-error focus:border-color-error/50'
                      : 'border-white/[0.08] focus:border-accent-blue/50 focus:shadow-[0_0_0_4px_var(--accent-blue-subtle)]'
                  }`}
                />
              </div>
              {errors.fullName && (
                <div className="flex items-center gap-2 mt-1 text-color-error text-subhead">
                  <AlertCircle size={14} />
                  <span>{errors.fullName}</span>
                </div>
              )}
            </div>

            {/* Phone (Optional) */}
            <div className="flex flex-col gap-1">
              <label htmlFor="phone" className="text-subhead text-text-secondary font-medium">
                Phone Number <span className="text-text-tertiary">(Optional)</span>
              </label>
              <div className="relative">
                <Phone size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-tertiary" />
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="+1 (555) 123-4567"
                  autoComplete="tel"
                  className={`w-full pl-12 pr-4 py-4 bg-white/[0.04] border rounded-xl text-text-primary placeholder-text-tertiary transition-all duration-300 outline-none ${
                    errors.phone
                      ? 'border-color-error focus:border-color-error/50'
                      : 'border-white/[0.08] focus:border-accent-blue/50 focus:shadow-[0_0_0_4px_var(--accent-blue-subtle)]'
                  }`}
                />
              </div>
              {errors.phone && (
                <div className="flex items-center gap-2 mt-1 text-color-error text-subhead">
                  <AlertCircle size={14} />
                  <span>{errors.phone}</span>
                </div>
              )}
            </div>

            {/* Company (Optional) */}
            <div className="flex flex-col gap-1">
              <label htmlFor="company" className="text-subhead text-text-secondary font-medium">
                Company <span className="text-text-tertiary">(Optional)</span>
              </label>
              <div className="relative">
                <Building2 size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-tertiary" />
                <input
                  type="text"
                  id="company"
                  name="company"
                  value={formData.company}
                  onChange={handleInputChange}
                  placeholder="Your Company Inc."
                  autoComplete="organization"
                  className="w-full pl-12 pr-4 py-4 bg-white/[0.04] border border-white/[0.08] rounded-xl text-text-primary placeholder-text-tertiary transition-all duration-300 outline-none focus:border-accent-blue/50 focus:shadow-[0_0_0_4px_var(--accent-blue-subtle)]"
                />
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-5 step-forward">
            {/* Step 3: Confirmation */}
            <div className="text-center mb-6">
              <h2 className="text-title2 text-text-primary mb-2">Review & Confirm</h2>
              <p className="text-body text-text-secondary">Step 3: Verify your information</p>
            </div>

            {/* Summary Card */}
            <div className="p-5 bg-white/[0.03] rounded-xl border border-white/[0.06] space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-accent-blue/20 flex items-center justify-center flex-shrink-0">
                  <User size={20} className="text-accent-blue" />
                </div>
                <div className="flex-1">
                  <p className="text-subhead text-text-secondary">Account Holder</p>
                  <p className="text-body text-text-primary font-medium">{formData.fullName || 'Not provided'}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-accent-blue/20 flex items-center justify-center flex-shrink-0">
                  <Mail size={20} className="text-accent-blue" />
                </div>
                <div className="flex-1">
                  <p className="text-subhead text-text-secondary">Email Address</p>
                  <p className="text-body text-text-primary font-medium">{formData.email}</p>
                </div>
              </div>

              {formData.phone && (
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-accent-blue/20 flex items-center justify-center flex-shrink-0">
                    <Phone size={20} className="text-accent-blue" />
                  </div>
                  <div className="flex-1">
                    <p className="text-subhead text-text-secondary">Phone Number</p>
                    <p className="text-body text-text-primary font-medium">{formData.phone}</p>
                  </div>
                </div>
              )}

              {formData.company && (
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-accent-blue/20 flex items-center justify-center flex-shrink-0">
                    <Building2 size={20} className="text-accent-blue" />
                  </div>
                  <div className="flex-1">
                    <p className="text-subhead text-text-secondary">Company</p>
                    <p className="text-body text-text-primary font-medium">{formData.company}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Terms Agreement */}
            <label className="flex items-start gap-3 p-4 bg-white/[0.03] rounded-xl border border-white/[0.06] cursor-pointer hover:bg-white/[0.05] transition-colors">
              <div className={`mt-0.5 w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all flex-shrink-0 ${
                acceptTerms
                  ? 'bg-accent-blue border-accent-blue'
                  : 'border-white/[0.2]'
              }`}>
                {acceptTerms && <CheckCircle size={14} weight="fill" className="text-white" />}
              </div>
              <input
                type="checkbox"
                checked={acceptTerms}
                onChange={(e) => setAcceptTerms(e.target.checked)}
                className="sr-only"
              />
              <div className="flex-1">
                <p className="text-subhead text-text-primary">
                  I agree to the{' '}
                  <Link to="/terms" className="text-accent-blue hover:underline">Terms of Service</Link>
                  {' '}and{' '}
                  <Link to="/privacy" className="text-accent-blue hover:underline">Privacy Policy</Link>
                </p>
              </div>
            </label>

            {errors.submit && (
              <div className="flex items-center gap-3 p-4 bg-color-error-subtle border border-color-error/30 rounded-xl text-color-error">
                <AlertCircle size={20} />
                <span className="text-subhead">{errors.submit}</span>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <AuthLayout
      showBackLink={false}
      showLogo={true}
    >
      <div className="space-y-6 page-enter">

        {/* Step Indicator */}
        <StepIndicator steps={steps} currentStep={currentStep} />

        {/* Form Content */}
        <form onSubmit={handleSubmit}>
          {renderStepContent()}

          {/* Navigation Buttons */}
          <div className="flex gap-3 mt-8">
            {currentStep > 0 && (
              <button
                type="button"
                onClick={handleBack}
                className="flex-1 py-4 bg-white/[0.05] border border-white/[0.08] text-text-primary font-semibold rounded-xl hover:bg-white/[0.08] transition-all flex items-center justify-center gap-2"
              >
                <ArrowLeft size={18} />
                Back
              </button>
            )}

            {currentStep < 2 ? (
              <button
                type="button"
                onClick={handleNext}
                className="flex-1 py-4 bg-gradient-to-b from-[#0A84FF] to-[#0077E6] text-white font-semibold rounded-xl hover:from-[#409CFF] hover:to-[#0A84FF] transition-all flex items-center justify-center gap-2 shadow-[0_4px_16px_rgba(10,132,255,0.4)] hover:shadow-[0_6px_24px_rgba(10,132,255,0.5)] hover:-translate-y-0.5"
              >
                Continue
                <ArrowRight size={18} />
              </button>
            ) : (
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 py-4 bg-gradient-to-b from-[#30D158] to-[#28A745] text-white font-semibold rounded-xl hover:from-[#3DE264] hover:to-[#30D158] transition-all flex items-center justify-center gap-2 shadow-[0_4px_16px_rgba(48,209,88,0.4)] hover:shadow-[0_6px_24px_rgba(48,209,88,0.5)] hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Creating Account...
                  </>
                ) : (
                  <>
                    <CheckCircle size={18} weight="fill" />
                    Create Account
                  </>
                )}
              </button>
            )}
          </div>
        </form>

        {/* Sign In Link */}
        <div className="text-center pt-4">
          <span className="text-subhead text-text-tertiary">Already have an account? </span>
          <Link
            to="/login"
            className="text-subhead text-accent-blue hover:text-accent-blue-hover font-semibold transition-colors"
          >
            Sign in
          </Link>
        </div>
      </div>
    </AuthLayout>
  );
};

export default GlassSignUp;