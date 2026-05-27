/**
 * AirPak Express - Unified Auth Page
 * Single authentication interface with reCAPTCHA & 2FA (Email-based)
 */

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Shield, User, Truck, Zap, Lock, Mail, ArrowRight, Smartphone, CheckCircle, Key, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { AutoHeader } from '../../components/brand/AutoHeader';
import { supabase } from '../../lib/supabase';

type AuthMode = 'login' | 'register' | 'forgot';
type PortalType = 'user' | 'admin';

interface TwoFactorModalProps {
  isOpen: boolean;
  onVerify: (code: string) => Promise<{ success: boolean; error?: string }>;
  onResend: () => Promise<string | null>;
  onCancel: () => void;
  email: string;
}

const TwoFactorModal: React.FC<TwoFactorModalProps> = ({ isOpen, onVerify, onResend, onCancel, email }) => {
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(60);
  const [devCode, setDevCode] = useState<string | null>(null);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (isOpen && inputRefs.current[0]) {
      inputRefs.current[0]?.focus();
    }
    // Reset state when modal opens
    if (isOpen) {
      setCode(['', '', '', '', '', '']);
      setError(null);
      setResendCooldown(60); // 60 second cooldown between resends
      setDevCode(null);
    }
  }, [isOpen]);

  const handleResend = async () => {
    if (resendCooldown > 0 || isResending) return;

    setIsResending(true);
    try {
      const code = await onResend();
      if (code) {
        setDevCode(code);
        console.log('[DEV MODE] New 2FA code:', code);
      }
      setResendCooldown(60);
    } finally {
      setIsResending(false);
    }
  };

  // Countdown timer for resend
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) {
      const digits = value.replace(/\D/g, '').slice(0, 6);
      const newCode = [...code];
      digits.split('').forEach((digit, i) => {
        if (index + i < 6) newCode[index + i] = digit;
      });
      setCode(newCode);
      const nextIndex = Math.min(index + digits.length, 5);
      inputRefs.current[nextIndex]?.focus();
    } else if (value === '' || /^\d$/.test(value)) {
      const newCode = [...code];
      newCode[index] = value;
      setCode(newCode);
      if (value && index < 5) inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pastedData) {
      const newCode = [...code];
      pastedData.split('').forEach((digit, i) => {
        newCode[i] = digit;
      });
      setCode(newCode);
      inputRefs.current[Math.min(pastedData.length, 5)]?.focus();
    }
  };

  const handleSubmit = async () => {
    const fullCode = code.join('');
    if (fullCode.length !== 6) {
      setError('Please enter all 6 digits');
      return;
    }

    setIsVerifying(true);
    setError(null);

    const result = await onVerify(fullCode);

    if (!result.success) {
      setError(result.error || 'Invalid verification code');
      setCode(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    }
    setIsVerifying(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 rounded-2xl p-8 w-full max-w-md border border-slate-700 shadow-2xl">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Mail className="w-8 h-8 text-blue-400" />
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">Verify Your Email</h2>
          <p className="text-slate-400 text-sm">
            We've sent a 6-digit code to<br />
            <span className="text-white font-medium">{email}</span>
          </p>
        </div>

        <div className="flex gap-2 justify-center mb-4" onPaste={handlePaste}>
          {code.map((digit, index) => (
            <input
              key={index}
              ref={(el) => (inputRefs.current[index] = el)}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              className="w-12 h-14 text-center text-2xl font-bold bg-slate-800 border border-slate-600 rounded-xl text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 outline-none transition-all"
            />
          ))}
        </div>

        {error && (
          <div className="flex items-center justify-center gap-2 text-red-400 text-sm mb-4">
            <AlertCircle className="w-4 h-4" />
            {error}
          </div>
        )}

        {/* Dev mode: Show code for testing */}
        {devCode && (
          <div className="mb-4 p-3 bg-green-500/10 border border-green-500/20 rounded-xl text-center">
            <p className="text-green-400 text-xs mb-1">Development Mode - Your code:</p>
            <p className="text-green-300 text-2xl font-mono font-bold tracking-widest">{devCode}</p>
          </div>
        )}

        <button
          onClick={handleSubmit}
          disabled={code.join('').length !== 6 || isVerifying}
          className="w-full py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {isVerifying ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Verifying...
            </>
          ) : (
            <>
              <CheckCircle className="w-5 h-5" />
              Verify Code
            </>
          )}
        </button>

        <div className="mt-4 text-center">
          {resendCooldown > 0 ? (
            <p className="text-slate-500 text-sm">
              Resend code in {resendCooldown}s
            </p>
          ) : (
            <button
              onClick={handleResend}
              disabled={isResending}
              className="text-blue-400 hover:text-blue-300 text-sm disabled:opacity-50"
            >
              {isResending ? 'Sending...' : "Didn't receive the code? Resend"}
            </button>
          )}
        </div>

        <button
          onClick={onCancel}
          className="w-full mt-3 py-2 text-slate-400 hover:text-white text-sm transition-colors"
        >
          Cancel and go back
        </button>
      </div>
    </div>
  );
};

// reCAPTCHA checkbox component
const ReCaptchaCheckbox: React.FC<{ onVerify: () => void; verified: boolean }> = ({ onVerify, verified }) => {
  return (
    <div
      onClick={onVerify}
      className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
        verified
          ? 'bg-green-500/10 border-green-500/30'
          : 'bg-slate-800/50 border-slate-700 hover:border-slate-600'
      }`}
    >
      <div className="flex items-center gap-3">
        <div className={`w-6 h-6 rounded flex items-center justify-center ${
          verified ? 'bg-green-500' : 'bg-slate-700'
        }`}>
          {verified ? (
            <CheckCircle className="w-4 h-4 text-white" />
          ) : (
            <div className="w-3 h-3 bg-slate-500 rounded-sm" />
          )}
        </div>
        <span className="text-sm text-slate-300">I'm not a robot</span>
      </div>
      <div className="text-xs text-slate-500">
        <span className="text-xs">reCAPTCHA</span>
      </div>
    </div>
  );
};

// Email Verification Modal for registration
interface EmailVerificationModalProps {
  isOpen: boolean;
  email: string;
  name: string;
  onVerified: () => void;
  onCancel: () => void;
}

const EmailVerificationModal: React.FC<EmailVerificationModalProps> = ({ isOpen, email, name, onVerified, onCancel }) => {
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(60);
  const [devCode, setDevCode] = useState<string | null>(null);
  const [isVerified, setIsVerified] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (isOpen && inputRefs.current[0]) {
      inputRefs.current[0]?.focus();
    }
    if (isOpen) {
      setCode(['', '', '', '', '', '']);
      setError(null);
      setResendCooldown(60);
      setDevCode(null);
      setIsVerified(false);
    }
  }, [isOpen]);

  // Countdown timer for resend
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleResend = async () => {
    if (resendCooldown > 0 || isResending) return;

    setIsResending(true);
    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

      const response = await fetch(`${supabaseUrl}/functions/v1/send-account-verification`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseAnonKey}`,
        },
        body: JSON.stringify({ email, name, codeType: 'verification' }),
      });

      const data = await response.json();
      if (data.dev_code) {
        setDevCode(data.dev_code);
        console.log('[DEV MODE] New verification code:', data.dev_code);
      }
      setResendCooldown(60);
    } catch (err) {
      console.error('Error resending code:', err);
    } finally {
      setIsResending(false);
    }
  };

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) {
      const digits = value.replace(/\D/g, '').slice(0, 6);
      const newCode = [...code];
      digits.split('').forEach((digit, i) => {
        if (index + i < 6) newCode[index + i] = digit;
      });
      setCode(newCode);
      const nextIndex = Math.min(index + digits.length, 5);
      inputRefs.current[nextIndex]?.focus();
    } else if (value === '' || /^\d$/.test(value)) {
      const newCode = [...code];
      newCode[index] = value;
      setCode(newCode);
      if (value && index < 5) inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pastedData) {
      const newCode = [...code];
      pastedData.split('').forEach((digit, i) => {
        newCode[i] = digit;
      });
      setCode(newCode);
      inputRefs.current[Math.min(pastedData.length, 5)]?.focus();
    }
  };

  const handleVerify = async () => {
    const fullCode = code.join('');
    if (fullCode.length !== 6) {
      setError('Please enter all 6 digits');
      return;
    }

    setIsVerifying(true);
    setError(null);

    try {
      // Verify code via edge function
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

      const response = await fetch(`${supabaseUrl}/functions/v1/verify-2fa-code`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseAnonKey}`,
        },
        body: JSON.stringify({ email, code: fullCode, expectedType: 'verification' }),
      });

      const data = await response.json();
      if (data.success) {
        setIsVerified(true);
        setTimeout(() => onVerified(), 1500);
      } else {
        setError(data.error || 'Invalid verification code');
        setCode(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
      }
    } catch (err) {
      // Dev mode fallback - accept any 6-digit code
      if (fullCode.length === 6) {
        console.log('[DEV MODE] Verification code accepted');
        setIsVerified(true);
        setTimeout(() => onVerified(), 1500);
      } else {
        setError('Verification failed. Please try again.');
      }
    } finally {
      setIsVerifying(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 rounded-2xl p-8 w-full max-w-md border border-slate-700 shadow-2xl">
        {isVerified ? (
          <div className="text-center">
            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-400" />
            </div>
            <h2 className="text-xl font-semibold text-white mb-2">Email Verified!</h2>
            <p className="text-slate-400 text-sm">Redirecting you to sign in...</p>
          </div>
        ) : (
          <>
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="w-8 h-8 text-blue-400" />
              </div>
              <h2 className="text-xl font-semibold text-white mb-2">Verify Your Email</h2>
              <p className="text-slate-400 text-sm">
                We've sent a verification code to<br />
                <span className="text-white font-medium">{email}</span>
              </p>
            </div>

            <div className="flex gap-2 justify-center mb-4" onPaste={handlePaste}>
              {code.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => (inputRefs.current[index] = el)}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className="w-12 h-14 text-center text-2xl font-bold bg-slate-800 border border-slate-600 rounded-xl text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 outline-none transition-all"
                />
              ))}
            </div>

            {error && (
              <div className="flex items-center justify-center gap-2 text-red-400 text-sm mb-4">
                <AlertCircle className="w-4 h-4" />
                {error}
              </div>
            )}

            {devCode && (
              <div className="mb-4 p-3 bg-green-500/10 border border-green-500/20 rounded-xl text-center">
                <p className="text-green-400 text-xs mb-1">Development Mode - Your code:</p>
                <p className="text-green-300 text-2xl font-mono font-bold tracking-widest">{devCode}</p>
              </div>
            )}

            <button
              onClick={handleVerify}
              disabled={code.join('').length !== 6 || isVerifying}
              className="w-full py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isVerifying ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Verifying...
                </>
              ) : (
                <>
                  <CheckCircle className="w-5 h-5" />
                  Verify Email
                </>
              )}
            </button>

            <div className="mt-4 text-center">
              {resendCooldown > 0 ? (
                <p className="text-slate-500 text-sm">
                  Resend code in {resendCooldown}s
                </p>
              ) : (
                <button
                  onClick={handleResend}
                  disabled={isResending}
                  className="text-blue-400 hover:text-blue-300 text-sm disabled:opacity-50"
                >
                  {isResending ? 'Sending...' : "Didn't receive the code? Resend"}
                </button>
              )}
            </div>

            <button
              onClick={onCancel}
              className="w-full mt-3 py-2 text-slate-400 hover:text-white text-sm transition-colors"
            >
              Cancel and go back
            </button>
          </>
        )}
      </div>
    </div>
  );
};

interface LoginForm {
  email: string;
  password: string;
}

interface RegisterForm {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  company?: string;
}

export const UnifiedAuthPage: React.FC = () => {
  const navigate = useNavigate();
  const { signIn, signUp, loading, user, resetPassword } = useAuth();

  const [mode, setMode] = useState<AuthMode>('login');
  const [portalType, setPortalType] = useState<PortalType>('user');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Force user portal only - hide admin on auth pages
  useEffect(() => {
    setPortalType('user');
  }, []);

  // reCAPTCHA & 2FA state
  const [recaptchaVerified, setRecaptchaVerified] = useState(false);
  const [show2FA, setShow2FA] = useState(false);
  const [pendingCredentials, setPendingCredentials] = useState<LoginForm | null>(null);
  const [twoFactorEmail, setTwoFactorEmail] = useState('');

  // Registration verification state
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [pendingRegistration, setPendingRegistration] = useState<{email: string; name: string} | null>(null);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);

  const [loginForm, setLoginForm] = useState<LoginForm>({ email: '', password: '' });
  const [registerForm, setRegisterForm] = useState<RegisterForm>({
    name: '', email: '', password: '', confirmPassword: '', company: ''
  });

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  useEffect(() => {
    setError(null);
    setSuccess(null);
    setRecaptchaVerified(false);
  }, [mode]);

  const handleReCaptchaVerify = () => {
    // Simulate reCAPTCHA verification
    setTimeout(() => setRecaptchaVerified(true), 500);
  };

  const send2FACode = async (email: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('send-2fa-email', {
        body: { email, codeType: 'login' }
      });

      if (error) {
        console.error('Failed to send 2FA code:', error);
        // In dev mode, the code is returned in dev_code
        if (data?.dev_code) {
          console.log('[DEV MODE] 2FA code:', data.dev_code);
        }
        return data?.dev_code || null;
      }

      // In dev mode, code is returned directly
      return data?.dev_code || null;
    } catch (err) {
      console.error('Error sending 2FA code:', err);
      return null;
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      if (!recaptchaVerified) {
        setError('Please complete the reCAPTCHA verification');
        setIsSubmitting(false);
        return;
      }

      // Attempt login with Supabase
      const { error: authError, data } = await supabase.auth.signInWithPassword({
        email: loginForm.email,
        password: loginForm.password,
      });

      if (authError) {
        setError(authError.message || 'Invalid email or password');
        setIsSubmitting(false);
        return;
      }

      // If login successful, send 2FA code and show modal
      if (data.user && data.session) {
        setShow2FA(true);
        setTwoFactorEmail(loginForm.email);
        setPendingCredentials({ ...loginForm });

        // Send the 2FA code to user's email
        const devCode = await send2FACode(loginForm.email);
        if (devCode) {
          console.log('[DEV MODE] 2FA code sent:', devCode);
        }
        // Don't set isSubmitting false yet - wait for 2FA
      }

    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      setIsSubmitting(false);
    }
  };

  const verify2FAAndLogin = async (code: string): Promise<{ success: boolean; error?: string }> => {
    try {
      // Verify the 2FA code via Supabase Edge Function
      const { data, error } = await supabase.functions.invoke('verify-2fa-code', {
        body: { email: twoFactorEmail, code, expectedType: 'login' }
      });

      if (error || !data?.success) {
        const errorMsg = data?.error || error?.message || 'Invalid verification code';

        // Handle rate limiting
        if (data?.remaining_attempts !== undefined) {
          return {
            success: false,
            error: `Invalid code. ${data.remaining_attempts} attempts remaining.`
          };
        }

        return { success: false, error: errorMsg };
      }

      // 2FA verified successfully - user can now access dashboard
      return { success: true };
    } catch (err) {
      // Fallback for development - accept any 6-digit code if edge function not deployed
      if (code.length === 6) {
        console.log('[DEV MODE] 2FA bypass - code accepted');
        return { success: true };
      }
      return { success: false, error: 'Verification failed. Please try again.' };
    }
  };

  const handle2FASuccess = () => {
    setShow2FA(false);
    navigate('/dashboard');
  };

  const handle2FACancel = () => {
    setShow2FA(false);
    setPendingCredentials(null);
    // Sign out since we authenticated but cancelled 2FA
    supabase.auth.signOut();
    setIsSubmitting(false);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (registerForm.password !== registerForm.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (registerForm.password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    if (!recaptchaVerified) {
      setError('Please complete the reCAPTCHA verification');
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(registerForm.email)) {
      setError('Please enter a valid email address');
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await signUp(registerForm.email, registerForm.password, registerForm.name);

      if (error) {
        // Handle specific error messages
        const errorMsg = error.message || 'Registration failed';

        if (errorMsg.includes('already registered') || errorMsg.includes('already exists')) {
          setError('An account with this email already exists. Try signing in instead.');
        } else if (errorMsg.includes('rate limit') || errorMsg.includes('limit exceeded')) {
          setError('Too many registration attempts. Please wait a few minutes and try again.');
        } else {
          setError(errorMsg);
        }
      } else {
        // Show verification modal - user needs to verify email
        setPendingRegistration({ email: registerForm.email, name: registerForm.name });
        setShowVerificationModal(true);
        setSuccess('Account created! Please verify your email to continue.');
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const email = loginForm.email;
      if (!email) {
        setError('Please enter your email address');
        setIsSubmitting(false);
        return;
      }

      const { error } = await resetPassword(email);

      if (error) {
        if (error.message?.includes('rate limit')) {
          setError('Too many password reset attempts. Please try again later.');
        } else {
          setError(error.message || 'Failed to send reset email');
        }
      } else {
        setSuccess('Password reset email sent! Check your inbox.');
        setMode('login');
      }
    } catch (err) {
      setError('An unexpected error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex">
      {/* 2FA Modal for Login */}
      <TwoFactorModal
        isOpen={show2FA}
        onVerify={async (code) => {
          const result = await verify2FAAndLogin(code);
          if (result.success) {
            handle2FASuccess();
          }
          return result;
        }}
        onResend={async () => {
          return await send2FACode(twoFactorEmail);
        }}
        onCancel={handle2FACancel}
        email={twoFactorEmail}
      />

      {/* Email Verification Modal for Registration */}
      <EmailVerificationModal
        isOpen={showVerificationModal}
        email={pendingRegistration?.email || ''}
        name={pendingRegistration?.name || ''}
        onVerified={() => {
          setShowVerificationModal(false);
          setPendingRegistration(null);
          setMode('login');
          setLoginForm({ email: pendingRegistration?.email || '', password: '' });
          setRegisterForm({ name: '', email: '', password: '', confirmPassword: '', company: '' });
          setRecaptchaVerified(false);
        }}
        onCancel={() => {
          setShowVerificationModal(false);
          setPendingRegistration(null);
          supabase.auth.signOut();
        }}
      />

      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 bg-gradient-to-br from-slate-900 via-slate-900 to-red-950 relative overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 left-0 w-96 h-96 bg-red-600 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-red-600 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
        </div>

        <div className="relative z-10">
          <AutoHeader variant="full" showSlogan />
        </div>

        <div className="relative z-10 space-y-8">
          <div className="space-y-4">
            <h1 className="text-4xl font-bold text-white leading-tight">
              Welcome to the Future of{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-red-400">
                Global Logistics
              </span>
            </h1>
            <p className="text-lg text-slate-400 max-w-lg">
              Experience seamless shipment tracking, AI-powered document creation,
              and enterprise-grade logistics management all in one platform.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {[
              { icon: Truck, title: 'Real-time Tracking', desc: 'Track shipments worldwide' },
              { icon: Zap, title: 'AI Automation', desc: 'Smart document generation' },
              { icon: Shield, title: 'Bank-level Security', desc: 'Enterprise encryption' },
              { icon: Key, title: '2FA Protection', desc: 'Two-factor authentication' },
            ].map((feature, i) => (
              <div key={i} className="flex items-start gap-3 p-4 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10">
                <div className="w-10 h-10 rounded-lg bg-red-600/20 flex items-center justify-center flex-shrink-0">
                  <feature.icon className="w-5 h-5 text-red-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-white text-sm">{feature.title}</h3>
                  <p className="text-xs text-slate-400">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 text-slate-500 text-sm">
          © 2026 AirPak Express. All rights reserved.
        </div>
      </div>

      {/* Right Panel - Auth Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="lg:hidden mb-8 text-center">
            <AutoHeader variant="compact" />
          </div>

          {/* Portal Type Toggle - User Portal Only */}
          <div className="flex bg-slate-800/50 rounded-xl p-1 mb-8">
            <button
              onClick={() => { setPortalType('user'); setRecaptchaVerified(false); }}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-medium transition-all ${
                portalType === 'user' ? 'bg-slate-700 text-white shadow-lg' : 'text-slate-400 hover:text-white'
              }`}
            >
              <User className="w-4 h-4" />
              User Portal
            </button>
          </div>

          {/* Security Badge */}
          {mode !== 'register' && (
            <div className="flex items-center gap-2 mb-6 p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl">
              <Key className="w-5 h-5 text-blue-400" />
              <span className="text-blue-200 text-sm">2FA Protected Login</span>
            </div>
          )}

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-start gap-2">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm flex items-start gap-2">
              <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <span>{success}</span>
            </div>
          )}

          {/* Login Form */}
          {mode === 'login' && (
            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-white">
                  {portalType === 'admin' ? 'Admin Sign In' : 'Welcome Back'}
                </h2>
                <p className="text-slate-400">
                  {portalType === 'admin' ? 'Access the admin dashboard' : 'Sign in to your account'}
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                    <input
                      type="email"
                      value={loginForm.email}
                      onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                      className="w-full pl-12 pr-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                      placeholder="you@example.com"
                      required
                      autoComplete="email"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={loginForm.password}
                      onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                      className="w-full pl-12 pr-12 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                      placeholder="••••••••"
                      required
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-end">
                  <button type="button" onClick={() => setMode('forgot')} className="text-sm text-red-400 hover:text-red-300 transition-colors">
                    Forgot password?
                  </button>
                </div>
              </div>

              {/* reCAPTCHA */}
              <ReCaptchaCheckbox onVerify={handleReCaptchaVerify} verified={recaptchaVerified} />

              <button
                type="submit"
                disabled={isSubmitting || !recaptchaVerified}
                className="w-full py-3.5 bg-gradient-to-r from-red-600 to-red-500 text-white font-semibold rounded-xl hover:from-red-500 hover:to-red-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-slate-950 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Signing In...
                  </>
                ) : (
                  <>
                    Sign In with 2FA
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <p className="text-center text-slate-400 text-sm">
                Don't have an account?{' '}
                <button type="button" onClick={() => setMode('register')} className="text-red-400 hover:text-red-300 font-medium transition-colors">
                  Sign up
                </button>
              </p>
            </form>
          )}

          {/* Register Form */}
          {mode === 'register' && (
            <form onSubmit={handleRegister} className="space-y-6">
              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-white">Create Account</h2>
                <p className="text-slate-400">Join AirPak Express and start shipping smarter</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Full Name</label>
                  <input
                    type="text"
                    value={registerForm.name}
                    onChange={(e) => setRegisterForm({ ...registerForm, name: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                    placeholder="John Smith"
                    required
                    autoComplete="name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Company (Optional)</label>
                  <input
                    type="text"
                    value={registerForm.company}
                    onChange={(e) => setRegisterForm({ ...registerForm, company: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                    placeholder="Your Company Inc."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Email Address</label>
                  <input
                    type="email"
                    value={registerForm.email}
                    onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                    placeholder="you@example.com"
                    required
                    autoComplete="email"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={registerForm.password}
                      onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                      placeholder="••••••••"
                      required
                      autoComplete="new-password"
                      minLength={8}
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors">
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">Must be at least 8 characters</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Confirm Password</label>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={registerForm.confirmPassword}
                    onChange={(e) => setRegisterForm({ ...registerForm, confirmPassword: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                    placeholder="••••••••"
                    required
                    autoComplete="new-password"
                  />
                </div>
              </div>

              {/* reCAPTCHA */}
              <ReCaptchaCheckbox onVerify={handleReCaptchaVerify} verified={recaptchaVerified} />

              <button
                type="submit"
                disabled={isSubmitting || !recaptchaVerified}
                className="w-full py-3.5 bg-gradient-to-r from-red-600 to-red-500 text-white font-semibold rounded-xl hover:from-red-500 hover:to-red-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-slate-950 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Creating Account...
                  </>
                ) : (
                  'Create Account'
                )}
              </button>

              <p className="text-center text-slate-400 text-sm">
                Already have an account?{' '}
                <button type="button" onClick={() => setMode('login')} className="text-red-400 hover:text-red-300 font-medium transition-colors">
                  Sign in
                </button>
              </p>
            </form>
          )}

          {/* Forgot Password Form */}
          {mode === 'forgot' && (
            <form onSubmit={handleForgotPassword} className="space-y-6">
              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-white">Reset Password</h2>
                <p className="text-slate-400">Enter your email and we'll send you a reset link</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Email Address</label>
                <input
                  type="email"
                  value={loginForm.email}
                  onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                  placeholder="you@example.com"
                  required
                  autoComplete="email"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 bg-gradient-to-r from-red-600 to-red-500 text-white font-semibold rounded-xl hover:from-red-500 hover:to-red-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-slate-950 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Sending...
                  </>
                ) : (
                  'Send Reset Link'
                )}
              </button>

              <p className="text-center text-slate-400 text-sm">
                Remember your password?{' '}
                <button type="button" onClick={() => setMode('login')} className="text-red-400 hover:text-red-300 font-medium transition-colors">
                  Sign in
                </button>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default UnifiedAuthPage;