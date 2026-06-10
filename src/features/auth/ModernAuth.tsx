/**
 * Modern Auth — AirPak Express
 * Clean, ChatGPT-inspired authentication.
 * Single screen, two modes (sign in / sign up), Supabase-backed.
 */

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, Loader2, ArrowRight, Package, AlertCircle, CheckCircle2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';

type AuthMode = 'signin' | 'signup';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const ModernAuth: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const initialMode: AuthMode = (location.state as any)?.mode === 'signup' ? 'signup' : 'signin';
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [forgotMode, setForgotMode] = useState(false);
  const [forgotSent, setForgotSent] = useState(false);
  const emailRef = useRef<HTMLInputElement>(null);

  // Already-signed-in user goes straight to portal
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data } = await supabase.auth.getSession();
      if (!cancelled && data.session) {
        navigate('/portal/dashboard', { replace: true });
      }
    })();
    return () => { cancelled = true; };
  }, [navigate]);

  // Reset transient state when switching modes
  useEffect(() => {
    setError(null);
    setInfo(null);
  }, [mode]);

  const validate = (): string | null => {
    if (!email.trim()) return 'Please enter your email.';
    if (!EMAIL_RE.test(email.trim())) return 'That email doesn\u2019t look right — double-check it.';
    if (!forgotMode) {
      if (password.length < 8) return 'Password must be at least 8 characters.';
    }
    if (mode === 'signup' && fullName.trim().length < 2) {
      return 'Please enter your full name.';
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfo(null);

    const v = validate();
    if (v) { setError(v); return; }

    setLoading(true);
    try {
      if (forgotMode) {
        const { error: resetErr } = await supabase.auth.resetPasswordForEmail(email.trim(), {
          redirectTo: `${window.location.origin}/portal/dashboard`,
        });
        if (resetErr) {
          setError(resetErr.message);
        } else {
          setForgotSent(true);
          setInfo(`Check ${email.trim()} for a reset link.`);
        }
        return;
      }

      if (mode === 'signup') {
        const { data, error: signUpErr } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            data: { full_name: fullName.trim() },
            emailRedirectTo: `${window.location.origin}/portal/dashboard`,
          },
        });
        if (signUpErr) { setError(signUpErr.message); return; }
        if (data.session) {
          navigate('/portal/dashboard', { replace: true });
        } else {
          setInfo('Account created. Check your email to confirm, then sign in.');
          setMode('signin');
        }
      } else {
        const { error: signInErr } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
        if (signInErr) { setError(signInErr.message); return; }
        navigate('/portal/dashboard', { replace: true });
      }
    } catch (err: any) {
      setError(err?.message ?? 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const switchMode = (next: AuthMode) => {
    setMode(next);
    setForgotMode(false);
    setForgotSent(false);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center px-4 py-10 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 relative overflow-hidden">
      {/* Ambient background glow */}
      <div className="pointer-events-none absolute -top-40 -left-40 w-[420px] h-[420px] rounded-full bg-red-600/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 -right-40 w-[420px] h-[420px] rounded-full bg-red-500/5 blur-3xl" />

      <div className="relative w-full max-w-[420px]">
        {/* Logo + brand */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#DC2626] to-[#991B1B] flex items-center justify-center shadow-lg shadow-red-900/40">
            <Package className="w-6 h-6 text-white" />
          </div>
          <h1 className="mt-4 text-2xl font-semibold text-white tracking-tight">AirPak Express</h1>
          <p className="mt-1 text-sm text-slate-400">Ship smarter. Track in real time.</p>
        </div>

        {/* Card */}
        <div className="rounded-2xl bg-slate-900/80 backdrop-blur-xl border border-slate-800 shadow-2xl shadow-black/50 p-6 sm:p-8">
          {/* Tabs */}
          {!forgotMode && (
            <div className="flex p-1 mb-6 bg-slate-800/60 rounded-xl border border-slate-700/50">
              <button
                type="button"
                onClick={() => switchMode('signin')}
                className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${
                  mode === 'signin'
                    ? 'bg-slate-700 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Log in
              </button>
              <button
                type="button"
                onClick={() => switchMode('signup')}
                className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${
                  mode === 'signup'
                    ? 'bg-slate-700 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Sign up
              </button>
            </div>
          )}

          {/* Title */}
          <h2 className="text-xl font-semibold text-white">
            {forgotMode ? 'Reset your password' : mode === 'signin' ? 'Welcome back' : 'Create your account'}
          </h2>
          <p className="mt-1 text-sm text-slate-400">
            {forgotMode
              ? 'Enter your email and we\u2019ll send a reset link.'
              : mode === 'signin'
              ? 'Sign in to manage shipments, track parcels, and earn rewards.'
              : 'Get started with AirPak — free to create an account.'}
          </p>

          {/* Form */}
          <form onSubmit={handleSubmit} className="mt-6 space-y-4" noValidate>
            {mode === 'signup' && !forgotMode && (
              <Field
                id="fullName"
                label="Full name"
                type="text"
                value={fullName}
                onChange={setFullName}
                placeholder="Jane Doe"
                autoComplete="name"
                disabled={loading}
              />
            )}

            <Field
              ref={emailRef}
              id="email"
              label="Email"
              type="email"
              value={email}
              onChange={setEmail}
              placeholder="you@example.com"
              autoComplete="email"
              disabled={loading}
              icon={<Mail className="w-4 h-4 text-slate-500" />}
            />

            {!forgotMode && (
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label htmlFor="password" className="text-sm font-medium text-slate-300">
                    Password
                  </label>
                  {mode === 'signin' && (
                    <button
                      type="button"
                      onClick={() => { setForgotMode(true); setError(null); setInfo(null); }}
                      className="text-xs text-red-400 hover:text-red-300 transition-colors"
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022"
                    autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
                    disabled={loading}
                    className="w-full pl-10 pr-10 py-2.5 bg-slate-800/60 border border-slate-700 rounded-lg text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/40 focus:border-red-500/50 disabled:opacity-50"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    tabIndex={-1}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {mode === 'signup' && (
                  <p className="mt-1.5 text-xs text-slate-500">Must be at least 8 characters.</p>
                )}
              </div>
            )}

            {/* Error / info banners */}
            {error && (
              <div className="flex items-start gap-2 p-3 rounded-lg bg-red-950/40 border border-red-900/50 text-red-200 text-sm">
                <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}
            {info && (
              <div className="flex items-start gap-2 p-3 rounded-lg bg-emerald-950/40 border border-emerald-900/50 text-emerald-200 text-sm">
                <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>{info}</span>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 inline-flex items-center justify-center gap-2 py-2.5 px-4 bg-gradient-to-r from-[#DC2626] to-[#B91C1C] hover:from-[#B91C1C] hover:to-[#991B1B] text-white font-medium rounded-lg shadow-lg shadow-red-900/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {forgotMode ? 'Sending link\u2026' : mode === 'signin' ? 'Signing in\u2026' : 'Creating account\u2026'}
                </>
              ) : (
                <>
                  {forgotMode ? 'Send reset link' : mode === 'signin' ? 'Continue' : 'Create account'}
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            {forgotMode && (
              <button
                type="button"
                onClick={() => switchMode('signin')}
                className="w-full text-sm text-slate-400 hover:text-slate-200 transition-colors"
              >
                \u2190 Back to log in
              </button>
            )}
          </form>

          {/* Footer hint */}
          {!forgotMode && (
            <p className="mt-6 text-center text-xs text-slate-500">
              {mode === 'signin' ? (
                <>
                  New to AirPak?{' '}
                  <button
                    type="button"
                    onClick={() => switchMode('signup')}
                    className="text-red-400 hover:text-red-300 font-medium"
                  >
                    Create an account
                  </button>
                </>
              ) : (
                <>
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => switchMode('signin')}
                    className="text-red-400 hover:text-red-300 font-medium"
                  >
                    Log in
                  </button>
                </>
              )}
            </p>
          )}
        </div>

        {/* Tiny legal */}
        <p className="mt-6 text-center text-xs text-slate-600">
          By continuing, you agree to AirPak Express\u2019s{' '}
          <Link to="/terms" className="underline hover:text-slate-400">Terms</Link> and{' '}
          <Link to="/privacy" className="underline hover:text-slate-400">Privacy Policy</Link>.
        </p>
      </div>
    </div>
  );
};

interface FieldProps {
  id: string;
  label: string;
  type: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  autoComplete?: string;
  disabled?: boolean;
  icon?: React.ReactNode;
}

const Field = React.forwardRef<HTMLInputElement, FieldProps>(function Field(
  { id, label, type, value, onChange, placeholder, autoComplete, disabled, icon },
  ref
) {
  return (
    <div>
      <label htmlFor={id} className="block mb-1.5 text-sm font-medium text-slate-300">
        {label}
      </label>
      <div className="relative">
        {icon && <span className="absolute left-3 top-1/2 -translate-y-1/2">{icon}</span>}
        <input
          ref={ref}
          id={id}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          disabled={disabled}
          className={`w-full ${icon ? 'pl-10' : 'pl-3.5'} pr-3.5 py-2.5 bg-slate-800/60 border border-slate-700 rounded-lg text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/40 focus:border-red-500/50 disabled:opacity-50`}
        />
      </div>
    </div>
  );
});

export default ModernAuth;
