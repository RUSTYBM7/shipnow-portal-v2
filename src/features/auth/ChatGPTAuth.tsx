/**
 * ChatGPTAuth — AirPak Express
 * Three-step onboarding wizard modeled on ChatGPT.com's auth flow.
 * Steps: pick method → credentials → profile (sign up only)
 * Providers: X (Twitter), Google, Email (Supabase + Zoho SMTP), Phone (Supabase + Twilio)
 */

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Eye, EyeOff, Loader2, Phone, Mail, Lock, AlertCircle, CheckCircle2, Package, MessageSquare } from 'lucide-react';
import { supabase } from '../../lib/supabase';

type Mode = 'signin' | 'signup';
type Method = 'x' | 'google' | 'email' | 'phone' | null;
type Step = 'method' | 'credentials' | 'profile' | 'phone-code';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^\+?[1-9]\d{6,14}$/;

// --- Brand-style social icons (custom SVG, no external deps) ---

const XIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
    <path fill="currentColor" d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const GoogleIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
  </svg>
);

const AirPakMark: React.FC<{ className?: string }> = ({ className }) => (
  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br from-[#DC2626] to-[#991B1B] flex items-center justify-center shadow-lg shadow-red-900/40 ${className || ''}`}>
    <Package className="w-5 h-5 text-white" />
  </div>
);

interface Props {
  defaultMode?: Mode;
}

export const ChatGPTAuth: React.FC<Props> = ({ defaultMode = 'signin' }) => {
  const navigate = useNavigate();
  const [mode, setMode] = useState<Mode>(defaultMode);
  const [step, setStep] = useState<Step>('method');
  const [method, setMethod] = useState<Method>(null);

  // Form state
  const [contact, setContact] = useState(''); // email OR phone
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [fullName, setFullName] = useState('');
  const [code, setCode] = useState(['', '', '', '', '', '']);

  // Async state
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<Method | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  const codeRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Bounce out if already signed in
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data } = await supabase.auth.getSession();
      if (!cancelled && data.session) navigate('/portal/dashboard', { replace: true });
    })();
    return () => { cancelled = true; };
  }, [navigate]);

  // Detect email vs phone from input
  const detectMethod = (value: string): 'email' | 'phone' => {
    const v = value.trim();
    if (v.startsWith('+') || /^\d/.test(v)) return 'phone';
    if (EMAIL_RE.test(v)) return 'email';
    return 'email'; // default, will be re-validated
  };

  const reset = (newMode?: Mode) => {
    setStep('method');
    setMethod(null);
    setContact('');
    setPassword('');
    setCode(['', '', '', '', '', '']);
    setFullName('');
    setError(null);
    setInfo(null);
    if (newMode) setMode(newMode);
  };

  // ---------- OAuth handlers ----------

  const handleOAuth = async (provider: 'google' | 'twitter') => {
    setError(null);
    setInfo(null);
    setOauthLoading(provider);
    try {
      const { error: oauthErr } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/portal/dashboard`,
          scopes: provider === 'google' ? 'email profile' : undefined,
        },
      });
      if (oauthErr) {
        setError(oauthErr.message);
        setOauthLoading(null);
      }
      // success → browser redirects to provider
    } catch (e: any) {
      setError(e?.message ?? 'Could not start sign-in. Try again.');
      setOauthLoading(null);
    }
  };

  // ---------- Email / phone → credentials ----------

  const handleContinueFromMethod = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const v = contact.trim();
    if (!v) { setError('Enter your email or phone number to continue.'); return; }
    const isEmail = EMAIL_RE.test(v);
    const isPhone = PHONE_RE.test(v.replace(/[\s\-()]/g, ''));
    if (!isEmail && !isPhone) { setError('That doesn\u2019t look like an email or phone number.'); return; }

    if (isPhone) {
      setMethod('phone');
      setStep('phone-code');
      sendPhoneOtp(v.replace(/[\s\-()]/g, ''));
    } else {
      setMethod('email');
      setStep('credentials');
    }
  };

  // ---------- Password submit (sign in or sign up) ----------

  const handleCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (password.length < 8) { setError('Password must be at least 8 characters.'); return; }

    setLoading(true);
    try {
      if (mode === 'signup') {
        // Move to profile step
        setStep('profile');
      } else {
        const { error: signInErr } = await supabase.auth.signInWithPassword({
          email: contact.trim(),
          password,
        });
        if (signInErr) throw signInErr;
        navigate('/portal/dashboard', { replace: true });
      }
    } catch (e: any) {
      setError(e?.message ?? 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  // ---------- Profile step (sign up only) ----------

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (fullName.trim().length < 2) { setError('Please enter your full name.'); return; }

    setLoading(true);
    try {
      const { data, error: signUpErr } = await supabase.auth.signUp({
        email: contact.trim(),
        password,
        options: {
          data: { full_name: fullName.trim() },
          emailRedirectTo: `${window.location.origin}/portal/dashboard`,
        },
      });
      if (signUpErr) throw signUpErr;
      if (data.session) {
        navigate('/portal/dashboard', { replace: true });
      } else {
        setInfo('Account created. Check your email to confirm, then sign in.');
        setTimeout(() => reset('signin'), 1500);
      }
    } catch (e: any) {
      setError(e?.message ?? 'Could not create account.');
    } finally {
      setLoading(false);
    }
  };

  // ---------- Phone OTP ----------

  const sendPhoneOtp = async (phone: string) => {
    setLoading(true);
    setError(null);
    try {
      const { error: otpErr } = await supabase.auth.signInWithOtp({ phone });
      if (otpErr) throw otpErr;
      setInfo(`Code sent to ${phone}.`);
    } catch (e: any) {
      setError(e?.message ?? 'Could not send code. Check the number and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCodeChange = (idx: number, val: string) => {
    const digit = val.replace(/\D/g, '').slice(0, 1);
    const next = [...code];
    next[idx] = digit;
    setCode(next);
    if (digit && idx < 5) codeRefs.current[idx + 1]?.focus();
  };

  const handleCodeKeyDown = (idx: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !code[idx] && idx > 0) {
      codeRefs.current[idx - 1]?.focus();
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const fullCode = code.join('');
    if (fullCode.length !== 6) { setError('Enter the 6-digit code.'); return; }

    setLoading(true);
    try {
      const { error: verifyErr } = await supabase.auth.verifyOtp({
        phone: contact.replace(/[\s\-()]/g, ''),
        token: fullCode,
        type: 'sms',
      });
      if (verifyErr) throw verifyErr;
      navigate('/portal/dashboard', { replace: true });
    } catch (e: any) {
      setError(e?.message ?? 'Wrong code. Try again.');
    } finally {
      setLoading(false);
    }
  };

  // ---------- Render ----------

  return (
    <div className="min-h-screen w-full flex flex-col bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-100">
      {/* Ambient glow */}
      <div className="pointer-events-none fixed -top-40 -left-40 w-[420px] h-[420px] rounded-full bg-red-600/10 blur-3xl" />
      <div className="pointer-events-none fixed -bottom-40 -right-40 w-[420px] h-[420px] rounded-full bg-red-500/5 blur-3xl" />

      {/* Top bar */}
      <header className="relative z-10 flex items-center justify-between px-6 py-4">
        <Link to="/" className="flex items-center gap-2.5">
          <AirPakMark />
          <span className="text-sm font-semibold tracking-tight text-white">AirPak Express</span>
        </Link>
        <div className="text-xs text-slate-500 hidden sm:block">Need a hand? <Link to="/help" className="underline hover:text-slate-300">Get help</Link></div>
      </header>

      <main className="relative z-10 flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-[440px]">

          {step === 'method' && (
            <MethodStep
              mode={mode}
              contact={contact}
              setContact={setContact}
              onSubmit={handleContinueFromMethod}
              onOAuth={handleOAuth}
              oauthLoading={oauthLoading}
              onSwitchMode={setMode}
              loading={loading}
              error={error}
              info={info}
            />
          )}

          {step === 'credentials' && (
            <CredentialsStep
              email={contact}
              password={password}
              setPassword={setPassword}
              showPassword={showPassword}
              setShowPassword={setShowPassword}
              onSubmit={handleCredentialsSubmit}
              onBack={() => setStep('method')}
              loading={loading}
              error={error}
              mode={mode}
            />
          )}

          {step === 'profile' && (
            <ProfileStep
              fullName={fullName}
              setFullName={setFullName}
              onSubmit={handleProfileSubmit}
              onBack={() => setStep('credentials')}
              loading={loading}
              error={error}
            />
          )}

          {step === 'phone-code' && (
            <PhoneCodeStep
              phone={contact}
              code={code}
              codeRefs={codeRefs}
              onCodeChange={handleCodeChange}
              onCodeKeyDown={handleCodeKeyDown}
              onSubmit={handleVerifyCode}
              onBack={() => setStep('method')}
              onResend={() => sendPhoneOtp(contact.replace(/[\s\-()]/g, ''))}
              loading={loading}
              error={error}
              info={info}
            />
          )}
        </div>
      </main>

      <footer className="relative z-10 px-6 py-4 text-center text-[11px] text-slate-600">
        By continuing, you agree to AirPak Express's{' '}
        <Link to="/terms" className="underline hover:text-slate-400">Terms</Link> and{' '}
        <Link to="/privacy" className="underline hover:text-slate-400">Privacy Policy</Link>.
      </footer>
    </div>
  );
};

// ---------- Sub-components ----------

const Heading: React.FC<{ title: string; subtitle?: string }> = ({ title, subtitle }) => (
  <div className="mb-6">
    <h1 className="text-2xl font-semibold tracking-tight text-white">{title}</h1>
    {subtitle && <p className="mt-1.5 text-sm text-slate-400 leading-relaxed">{subtitle}</p>}
  </div>
);

const ErrorBanner: React.FC<{ message: string }> = ({ message }) => (
  <div className="flex items-start gap-2 p-3 rounded-lg bg-red-950/40 border border-red-900/50 text-red-200 text-sm">
    <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
    <span>{message}</span>
  </div>
);

const InfoBanner: React.FC<{ message: string }> = ({ message }) => (
  <div className="flex items-start gap-2 p-3 rounded-lg bg-emerald-950/40 border border-emerald-900/50 text-emerald-200 text-sm">
    <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" />
    <span>{message}</span>
  </div>
);

const PrimaryButton: React.FC<{
  loading?: boolean;
  disabled?: boolean;
  type?: 'submit' | 'button';
  onClick?: () => void;
  children: React.ReactNode;
}> = ({ loading, disabled, type = 'submit', onClick, children }) => (
  <button
    type={type}
    onClick={onClick}
    disabled={loading || disabled}
    className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 bg-gradient-to-r from-[#DC2626] to-[#B91C1C] hover:from-[#B91C1C] hover:to-[#991B1B] text-white font-medium rounded-lg shadow-lg shadow-red-900/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
  >
    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : children}
  </button>
);

const OAuthButton: React.FC<{
  icon: React.ReactNode;
  loading?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}> = ({ icon, loading, onClick, children }) => (
  <button
    type="button"
    onClick={onClick}
    disabled={loading}
    className="w-full inline-flex items-center justify-center gap-3 py-2.5 px-4 bg-slate-800/70 hover:bg-slate-800 border border-slate-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
  >
    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span className="w-4 h-4 flex items-center justify-center">{icon}</span>}
    {children}
  </button>
);

// ---------- Step 1: Method picker ----------

const MethodStep: React.FC<{
  mode: Mode;
  contact: string;
  setContact: (v: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onOAuth: (p: 'google' | 'twitter') => void;
  oauthLoading: Method | null;
  onSwitchMode: (m: Mode) => void;
  loading: boolean;
  error: string | null;
  info: string | null;
}> = ({ mode, contact, setContact, onSubmit, onOAuth, oauthLoading, onSwitchMode, loading, error, info }) => {
  const detected = contact.trim() ? (PHONE_RE.test(contact.replace(/[\s\-()]/g, '')) && !contact.includes('@') ? 'phone' : EMAIL_RE.test(contact) ? 'email' : null) : null;

  return (
    <div className="rounded-2xl bg-slate-900/80 backdrop-blur-xl border border-slate-800 shadow-2xl shadow-black/50 p-6 sm:p-8">
      <Heading
        title={mode === 'signin' ? 'Welcome back' : 'Create your account'}
        subtitle={mode === 'signin'
          ? 'Sign in to keep your shipments moving and your addresses saved.'
          : 'A few details and you\u2019re shipping. No card, no clutter.'}
      />

      {/* Tab toggle */}
      <div className="flex p-1 mb-6 bg-slate-800/60 rounded-xl border border-slate-700/50">
        <button
          type="button"
          onClick={() => onSwitchMode('signin')}
          className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${mode === 'signin' ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}
        >
          Log in
        </button>
        <button
          type="button"
          onClick={() => onSwitchMode('signup')}
          className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${mode === 'signup' ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}
        >
          Sign up
        </button>
      </div>

      {/* OAuth buttons */}
      <div className="space-y-2.5">
        <OAuthButton icon={<XIcon className="w-4 h-4 text-white" />} loading={oauthLoading === 'twitter'} onClick={() => onOAuth('twitter')}>
          Continue with X
        </OAuthButton>
        <OAuthButton icon={<GoogleIcon className="w-4 h-4" />} loading={oauthLoading === 'google'} onClick={() => onOAuth('google')}>
          Continue with Google
        </OAuthButton>
      </div>

      {/* Divider */}
      <div className="my-6 flex items-center gap-3">
        <div className="flex-1 h-px bg-slate-700" />
        <span className="text-xs text-slate-500 uppercase tracking-wider">OR</span>
        <div className="flex-1 h-px bg-slate-700" />
      </div>

      {/* Email or phone */}
      <form onSubmit={onSubmit} className="space-y-4" noValidate>
        <div>
          <label htmlFor="contact" className="block mb-1.5 text-sm font-medium text-slate-300">
            Email or phone number
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
              {detected === 'phone' ? <Phone className="w-4 h-4" /> : <Mail className="w-4 h-4" />}
            </span>
            <input
              id="contact"
              type="text"
              inputMode="email"
              autoComplete="username"
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              placeholder="you@example.com or +1 555 123 4567"
              disabled={loading}
              className="w-full pl-10 pr-3.5 py-2.5 bg-slate-800/60 border border-slate-700 rounded-lg text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/40 focus:border-red-500/50 disabled:opacity-50"
            />
          </div>
        </div>

        {error && <ErrorBanner message={error} />}
        {info && <InfoBanner message={info} />}

        <PrimaryButton>
          Continue <ArrowRight className="w-4 h-4" />
        </PrimaryButton>
      </form>
    </div>
  );
};

// ---------- Step 2: Credentials ----------

const CredentialsStep: React.FC<{
  email: string;
  password: string;
  setPassword: (v: string) => void;
  showPassword: boolean;
  setShowPassword: (b: boolean) => void;
  onSubmit: (e: React.FormEvent) => void;
  onBack: () => void;
  loading: boolean;
  error: string | null;
  mode: Mode;
}> = ({ email, password, setPassword, showPassword, setShowPassword, onSubmit, onBack, loading, error, mode }) => (
  <div className="rounded-2xl bg-slate-900/80 backdrop-blur-xl border border-slate-800 shadow-2xl shadow-black/50 p-6 sm:p-8">
    <button type="button" onClick={onBack} className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-slate-200 mb-3">
      <ArrowLeft className="w-3 h-3" /> Use a different email
    </button>
    <Heading
      title={mode === 'signin' ? 'Enter your password' : 'Pick a password'}
      subtitle={email}
    />

    <form onSubmit={onSubmit} className="space-y-4" noValidate>
      <div>
        <label htmlFor="password" className="block mb-1.5 text-sm font-medium text-slate-300">Password</label>
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
            onClick={() => setShowPassword(!showPassword)}
            tabIndex={-1}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
        {mode === 'signup' && <p className="mt-1.5 text-xs text-slate-500">At least 8 characters.</p>}
      </div>

      {error && <ErrorBanner message={error} />}

      <PrimaryButton loading={loading}>
        {mode === 'signin' ? 'Sign in' : 'Continue'} <ArrowRight className="w-4 h-4" />
      </PrimaryButton>

      {mode === 'signin' && (
        <button type="button" className="w-full text-sm text-slate-400 hover:text-slate-200 transition-colors">
          Forgot password?
        </button>
      )}
    </form>
  </div>
);

// ---------- Step 3: Profile (sign up only) ----------

const ProfileStep: React.FC<{
  fullName: string;
  setFullName: (v: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onBack: () => void;
  loading: boolean;
  error: string | null;
}> = ({ fullName, setFullName, onSubmit, onBack, loading, error }) => (
  <div className="rounded-2xl bg-slate-900/80 backdrop-blur-xl border border-slate-800 shadow-2xl shadow-black/50 p-6 sm:p-8">
    <button type="button" onClick={onBack} className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-slate-200 mb-3">
      <ArrowLeft className="w-3 h-3" /> Back
    </button>
    <Heading
      title="What should we call you?"
      subtitle="Used on your shipments and receipts. Real name or business \u2014 your call."
    />

    <form onSubmit={onSubmit} className="space-y-4" noValidate>
      <div>
        <label htmlFor="fullName" className="block mb-1.5 text-sm font-medium text-slate-300">Full name</label>
        <input
          id="fullName"
          type="text"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          placeholder="Jane Doe"
          autoComplete="name"
          disabled={loading}
          className="w-full px-3.5 py-2.5 bg-slate-800/60 border border-slate-700 rounded-lg text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/40 focus:border-red-500/50 disabled:opacity-50"
        />
      </div>

      {error && <ErrorBanner message={error} />}

      <PrimaryButton loading={loading}>
        Finish <CheckCircle2 className="w-4 h-4" />
      </PrimaryButton>
    </form>
  </div>
);

// ---------- Phone code ----------

const PhoneCodeStep: React.FC<{
  phone: string;
  code: string[];
  codeRefs: React.MutableRefObject<(HTMLInputElement | null)[]>;
  onCodeChange: (idx: number, val: string) => void;
  onCodeKeyDown: (idx: number, e: React.KeyboardEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
  onBack: () => void;
  onResend: () => void;
  loading: boolean;
  error: string | null;
  info: string | null;
}> = ({ phone, code, codeRefs, onCodeChange, onCodeKeyDown, onSubmit, onBack, onResend, loading, error, info }) => (
  <div className="rounded-2xl bg-slate-900/80 backdrop-blur-xl border border-slate-800 shadow-2xl shadow-black/50 p-6 sm:p-8">
    <button type="button" onClick={onBack} className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-slate-200 mb-3">
      <ArrowLeft className="w-3 h-3" /> Use a different number
    </button>
    <Heading
      title="Enter the code"
      subtitle={`We sent a 6-digit code to ${phone}.`}
    />

    <form onSubmit={onSubmit} className="space-y-5" noValidate>
      <div className="flex gap-2 justify-between">
        {code.map((digit, i) => (
          <input
            key={i}
            ref={(el) => { codeRefs.current[i] = el; }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={(e) => onCodeChange(i, e.target.value)}
            onKeyDown={(e) => onCodeKeyDown(i, e)}
            disabled={loading}
            className="w-12 h-14 text-center text-xl font-semibold bg-slate-800/60 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500/40 focus:border-red-500/50 disabled:opacity-50"
          />
        ))}
      </div>

      {error && <ErrorBanner message={error} />}
      {info && <InfoBanner message={info} />}

      <PrimaryButton loading={loading}>
        Verify <ArrowRight className="w-4 h-4" />
      </PrimaryButton>

      <button type="button" onClick={onResend} disabled={loading} className="w-full text-sm text-slate-400 hover:text-slate-200 disabled:opacity-50">
        Resend code
      </button>
    </form>
  </div>
);

export default ChatGPTAuth;
