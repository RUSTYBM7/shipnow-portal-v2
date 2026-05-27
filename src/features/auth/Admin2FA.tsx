import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Shield, Smartphone, Mail, AlertCircle, ArrowLeft } from 'lucide-react';
import { AuthLayout } from '../../components/auth/AuthLayout';
import { TwoFactorInput } from '../../components/ui/TwoFactorInput';
import { AppleButton } from '../../components/ui/AppleButton';
import toast from 'react-hot-toast';

export const Admin2FA: React.FC = () => {
  const navigate = useNavigate();
  const [code, setCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState(false);
  const [timeLeft, setTimeLeft] = useState(180); // 3 minutes countdown
  const [showBackupCode, setShowBackupCode] = useState(false);
  const [backupCode, setBackupCode] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);

  // Countdown timer
  useEffect(() => {
    if (timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  // Resend cooldown
  useEffect(() => {
    if (resendCooldown <= 0) return;

    const timer = setInterval(() => {
      setResendCooldown(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [resendCooldown]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleCodeComplete = useCallback(async (completeCode: string) => {
    if (isVerifying) return;

    setCode(completeCode);
    setError(false);
    setIsVerifying(true);

    try {
      // Simulate verification
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Mock validation - in production, verify against Supabase
      const isValid = completeCode.length === 6;

      if (isValid) {
        toast.success('Two-factor authentication verified');
        // Clear pending admin session
        sessionStorage.removeItem('adminPending2FA');
        navigate('/admin/portal');
      } else {
        setError(true);
        toast.error('Invalid code. Please try again.');
      }
    } catch (error) {
      setError(true);
      toast.error('Verification failed. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  }, [isVerifying, navigate]);

  const handleBackupCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (backupCode.length < 8) {
      toast.error('Please enter a valid backup code');
      return;
    }

    setIsVerifying(true);

    try {
      // Simulate verification
      await new Promise(resolve => setTimeout(resolve, 1500));

      toast.success('Backup code accepted');
      sessionStorage.removeItem('adminPending2FA');
      navigate('/admin/portal');
    } catch (error) {
      toast.error('Invalid backup code');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendCode = () => {
    if (resendCooldown > 0) return;

    // Simulate sending new code
    toast.success('New verification code sent');
    setTimeLeft(180);
    setResendCooldown(30);
    setCode('');
    setError(false);
  };

  // Get pending admin info
  const pendingAdmin = JSON.parse(sessionStorage.getItem('adminPending2FA') || '{}');

  return (
    <AuthLayout
      title="Two-Factor Authentication"
      subtitle="Enter the 6-digit code from your authenticator app"
      showBackLink
      backLinkTo="/admin"
      backLinkText="Back to sign in"
    >
      <div className="space-y-6">
        {/* Security Badge */}
        <div className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[rgba(191,90,242,0.1)] border border-[rgba(191,90,242,0.2)]">
          <Shield className="w-5 h-5 text-[#BF5AF2]" />
          <span className="text-sm text-[#BF5AF2] font-medium">Secure Verification</span>
        </div>

        {/* Admin Info */}
        {pendingAdmin.email && (
          <div className="text-center text-sm text-[rgba(255,255,255,0.5)]">
            Authenticating as <span className="text-white font-medium">{pendingAdmin.email}</span>
          </div>
        )}

        {!showBackupCode ? (
          <>
            {/* 2FA Input */}
            <div className="py-4">
              <TwoFactorInput
                length={6}
                onComplete={handleCodeComplete}
                disabled={isVerifying}
                error={error}
              />
            </div>

            {/* Timer */}
            <div className="text-center">
              <p className={`text-sm font-mono ${
                timeLeft <= 30 ? 'text-[#FF453A]' : 'text-[rgba(255,255,255,0.5)]'
              }`}>
                Code expires in {formatTime(timeLeft)}
              </p>
            </div>

            {/* Loading State */}
            {isVerifying && (
              <div className="flex items-center justify-center gap-3 py-4">
                <div className="w-5 h-5 border-2 border-[#BF5AF2] border-t-transparent rounded-full animate-spin" />
                <span className="text-sm text-[rgba(255,255,255,0.7)]">Verifying...</span>
              </div>
            )}

            {/* Resend Code */}
            <div className="text-center">
              {resendCooldown > 0 ? (
                <p className="text-sm text-[rgba(255,255,255,0.5)]">
                  Resend available in {resendCooldown}s
                </p>
              ) : (
                <button
                  type="button"
                  onClick={handleResendCode}
                  className="text-sm text-[#BF5AF2] hover:text-[#D97BFF] transition-colors"
                >
                  Didn't receive a code? Resend
                </button>
              )}
            </div>

            {/* Backup Code Link */}
            <div className="text-center pt-4 border-t border-[rgba(255,255,255,0.08)]">
              <button
                type="button"
                onClick={() => setShowBackupCode(true)}
                className="text-sm text-[rgba(255,255,255,0.5)] hover:text-white transition-colors"
              >
                Can't access your authenticator? Use a backup code
              </button>
            </div>
          </>
        ) : (
          <>
            {/* Backup Code Form */}
            <form onSubmit={handleBackupCodeSubmit} className="space-y-5">
              <div>
                <label className="block text-sm text-[rgba(255,255,255,0.7)] mb-2">
                  Enter your 8-character backup code
                </label>
                <input
                  type="text"
                  value={backupCode}
                  onChange={(e) => setBackupCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''))}
                  placeholder="ABCD1234"
                  maxLength={8}
                  className="w-full px-5 py-4 text-base rounded-xl text-center
                    bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)]
                    text-white font-mono tracking-widest placeholder:text-[rgba(255,255,255,0.35)]
                    focus:border-[rgba(191,90,242,0.5)] focus:shadow-[0_0_0_4px_rgba(191,90,242,0.2)]
                    transition-all duration-300"
                  style={{ fontFamily: "'SF Mono', 'Monaco', 'Consolas', monospace" }}
                  disabled={isVerifying}
                />
              </div>

              <AppleButton
                type="submit"
                variant="admin"
                isLoading={isVerifying}
                disabled={backupCode.length < 8 || isVerifying}
              >
                Verify Backup Code
              </AppleButton>

              <button
                type="button"
                onClick={() => setShowBackupCode(false)}
                className="w-full text-sm text-[rgba(255,255,255,0.5)] hover:text-white transition-colors flex items-center justify-center gap-2"
              >
                <ArrowLeft size={16} />
                Back to authenticator app
              </button>
            </form>
          </>
        )}

        {/* Help Links */}
        <div className="flex items-center justify-center gap-6 pt-4 text-xs text-[rgba(255,255,255,0.4)]">
          <a href="#" className="hover:text-[#BF5AF2] transition-colors flex items-center gap-1">
            <Smartphone size={12} />
            Setup Authenticator
          </a>
          <span>•</span>
          <a href="#" className="hover:text-[#BF5AF2] transition-colors flex items-center gap-1">
            <Mail size={12} />
            Contact Support
          </a>
        </div>
      </div>
    </AuthLayout>
  );
};

export default Admin2FA;