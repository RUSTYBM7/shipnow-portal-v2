import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Shield, KeyRound, Mail, AlertTriangle, CheckCircle } from 'lucide-react';
import { AuthLayout } from '../../components/auth/AuthLayout';
import { FloatingInput } from '../../components/ui/FloatingInput';
import { AppleButton } from '../../components/ui/AppleButton';
import toast from 'react-hot-toast';

export const AdminForgotPassword: React.FC = () => {
  const [adminKey, setAdminKey] = useState('');
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Validate admin key format
  const validateAdminKey = (key: string): boolean => {
    const keyRegex = /^ADM-[A-Z0-9]{4}-[A-Z0-9]{4}$/;
    return keyRegex.test(key);
  };

  // Validate email format
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

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

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setIsLoading(true);

    try {
      // Simulate API call - in production, this would validate against Supabase
      // and notify super-admin for approval
      await new Promise(resolve => setTimeout(resolve, 2000));

      setIsSuccess(true);
      toast.success('Reset request submitted successfully');
    } catch (error) {
      toast.error('Failed to submit reset request. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <AuthLayout title="Request Submitted" subtitle="Your password reset request has been submitted for approval">
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
              Your password reset request has been submitted and is pending approval from the security team.
            </p>
            <p className="text-sm text-[rgba(255,255,255,0.5)]">
              You will receive an email at <span className="text-white font-medium">{email}</span> once approved.
            </p>
          </div>

          {/* Info Box */}
          <div className="flex items-start gap-3 py-4 px-4 rounded-xl bg-[rgba(255,159,10,0.1)] border border-[rgba(255,159,10,0.3)]">
            <AlertTriangle className="w-5 h-5 text-[#FF9F0A] flex-shrink-0 mt-0.5" />
            <div className="text-sm text-[rgba(255,255,255,0.7)]">
              <p className="font-medium text-[#FF9F0A] mb-1">Security Notice</p>
              <p>For security reasons, admin password resets require approval from a super administrator. This process typically takes 1-24 hours.</p>
            </div>
          </div>

          {/* Back to Sign In */}
          <div className="pt-4">
            <Link
              to="/admin"
              className="block w-full text-center py-3 rounded-xl
                bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.08)]
                text-[rgba(255,255,255,0.7)] hover:bg-[rgba(255,255,255,0.08)]
                transition-all duration-300"
            >
              Back to Admin Sign In
            </Link>
          </div>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Admin Password Recovery"
      subtitle="For security, admin password resets require verification"
      showBackLink
      backLinkTo="/admin"
      backLinkText="Back to sign in"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Security Warning */}
        <div className="flex items-center gap-3 py-4 px-4 rounded-xl bg-[rgba(255,69,58,0.1)] border border-[rgba(255,69,58,0.2)]">
          <AlertTriangle className="w-5 h-5 text-[#FF453A] flex-shrink-0" />
          <p className="text-sm text-[rgba(255,255,255,0.7)]">
            Admin password resets are reviewed by the security team for your protection.
          </p>
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
              <AlertTriangle size={16} />
              <span>{errors.adminKey}</span>
            </div>
          )}
        </div>

        {/* Email Field */}
        <div>
          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[rgba(255,255,255,0.35)]">
              <Mail size={18} />
            </div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Admin Email"
              className={`
                w-full pl-12 py-4 text-base rounded-xl
                bg-[rgba(255,255,255,0.04)] border text-white
                placeholder:text-[rgba(255,255,255,0.35)]
                transition-all duration-300
                ${errors.email
                  ? 'border-[rgba(255,69,58,0.6)] shadow-[0_0_0_3px_rgba(255,69,58,0.15)]'
                  : 'border-[rgba(255,255,255,0.08)] focus:border-[rgba(191,90,242,0.5)] focus:shadow-[0_0_0_4px_rgba(191,90,242,0.2)]'
                }
              `}
              disabled={isLoading}
              autoComplete="email"
            />
          </div>
          {errors.email && (
            <div className="flex items-center gap-2 mt-2 text-sm text-[#FF453A]">
              <AlertTriangle size={16} />
              <span>{errors.email}</span>
            </div>
          )}
        </div>

        {/* Submit Button */}
        <AppleButton
          type="submit"
          variant="admin"
          isLoading={isLoading}
          disabled={isLoading}
        >
          Request Password Reset
        </AppleButton>

        {/* Info */}
        <div className="text-center text-sm text-[rgba(255,255,255,0.5)] pt-2">
          <Shield className="w-4 h-4 inline-block mr-1 text-[#BF5AF2]" />
          This action will notify the security team for approval
        </div>
      </form>
    </AuthLayout>
  );
};

export default AdminForgotPassword;