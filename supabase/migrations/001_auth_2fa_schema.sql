-- ShipNow Portal - 2FA and Auth Enhancement Schema
-- Run this in Supabase SQL Editor to set up 2FA, rate limiting, and auth tables

-- =====================================================
-- PROFILES TABLE (User metadata)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  phone TEXT,
  company_name TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin', 'moderator')),
  email_verified BOOLEAN DEFAULT FALSE,
  two_factor_enabled BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Users can read their own profile
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- =====================================================
-- TWO FACTOR CODES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.two_factor_codes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  code TEXT NOT NULL,
  code_type TEXT NOT NULL CHECK (code_type IN ('login', 'recovery', 'change_email')),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  expires_at TIMESTAMPTZ NOT NULL,
  attempts INTEGER DEFAULT 0,
  is_used BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-cleanup expired codes (run periodically)
CREATE OR REPLACE FUNCTION cleanup_expired_2fa_codes()
RETURNS void AS $$
BEGIN
  DELETE FROM public.two_factor_codes WHERE expires_at < NOW() OR is_used = TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- USER SESSIONS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.user_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  session_token TEXT UNIQUE NOT NULL,
  ip_address TEXT,
  user_agent TEXT,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_activity TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- LOGIN HISTORY TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.login_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  email TEXT NOT NULL,
  method TEXT NOT NULL CHECK (method IN ('password', '2fa', 'oauth', 'magic_link')),
  success BOOLEAN NOT NULL,
  ip_address TEXT,
  user_agent TEXT,
  failure_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for login history queries
CREATE INDEX IF NOT EXISTS idx_login_history_user_id ON public.login_history(user_id);
CREATE INDEX IF NOT EXISTS idx_login_history_created_at ON public.login_history(created_at DESC);

-- =====================================================
-- AUTH RATE LIMITS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.auth_rate_limits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  action TEXT NOT NULL CHECK (action IN ('login_attempt', 'signup_attempt', 'password_reset', '2fa_request')),
  attempts INTEGER DEFAULT 1,
  window_start TIMESTAMPTZ DEFAULT NOW(),
  blocked_until TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(email, action)
);

-- Index for rate limit queries
CREATE INDEX IF NOT EXISTS idx_auth_rate_limits_email ON public.auth_rate_limits(email);

-- =====================================================
-- RATE LIMITING FUNCTIONS
-- =====================================================

-- Function to check and update rate limits
CREATE OR REPLACE FUNCTION public.check_auth_rate_limit(
  p_email TEXT,
  p_action TEXT
)
RETURNS JSON AS $$
DECLARE
  v_record RECORD;
  v_max_attempts INTEGER;
  v_window_seconds INTEGER;
  v_block_seconds INTEGER;
  v_exceeded BOOLEAN := FALSE;
  v_retry_after INTEGER := 0;
BEGIN
  -- Define rate limit rules based on action
  CASE p_action
    WHEN 'login_attempt' THEN
      v_max_attempts := 5;
      v_window_seconds := 900; -- 15 minutes
      v_block_seconds := 900; -- 15 minute block
    WHEN 'signup_attempt' THEN
      v_max_attempts := 3;
      v_window_seconds := 3600; -- 1 hour
      v_block_seconds := 3600; -- 1 hour block
    WHEN 'password_reset' THEN
      v_max_attempts := 3;
      v_window_seconds := 3600; -- 1 hour
      v_block_seconds := 3600; -- 1 hour block
    WHEN '2fa_request' THEN
      v_max_attempts := 5;
      v_window_seconds := 300; -- 5 minutes
      v_block_seconds := 300; -- 5 minute block
    ELSE
      v_max_attempts := 10;
      v_window_seconds := 3600;
      v_block_seconds := 3600;
  END CASE;

  -- Check existing record
  SELECT * INTO v_record
  FROM public.auth_rate_limits
  WHERE email = p_email AND action = p_action;

  IF v_record IS NULL THEN
    -- First attempt, insert new record
    INSERT INTO public.auth_rate_limits (email, action, attempts, window_start)
    VALUES (p_email, p_action, 1, NOW())
    ON CONFLICT (email, action) DO UPDATE
    SET attempts = 1, window_start = NOW(), updated_at = NOW();

  ELSIF v_record.blocked_until IS NOT NULL AND v_record.blocked_until > NOW() THEN
    -- User is blocked
    v_exceeded := TRUE;
    v_retry_after := EXTRACT(EPOCH FROM (v_record.blocked_until - NOW()))::INTEGER;

  ELSIF EXTRACT(EPOCH FROM (NOW() - v_record.window_start)) > v_window_seconds THEN
    -- Window expired, reset counter
    UPDATE public.auth_rate_limits
    SET attempts = 1, window_start = NOW(), blocked_until = NULL, updated_at = NOW()
    WHERE email = p_email AND action = p_action;

  ELSE
    -- Within window, check attempts
    IF v_record.attempts >= v_max_attempts THEN
      -- Too many attempts, block user
      UPDATE public.auth_rate_limits
      SET blocked_until = NOW() + (v_block_seconds || ' seconds')::INTERVAL,
          attempts = v_record.attempts + 1,
          updated_at = NOW()
      WHERE email = p_email AND action = p_action;

      v_exceeded := TRUE;
      v_retry_after := v_block_seconds;

    ELSE
      -- Increment attempts
      UPDATE public.auth_rate_limits
      SET attempts = attempts + 1, updated_at = NOW()
      WHERE email = p_email AND action = p_action;
    END IF;
  END IF;

  RETURN json_build_object(
    'exceeded', v_exceeded,
    'retry_after_seconds', v_retry_after,
    'attempts', CASE WHEN v_record IS NULL THEN 1 ELSE v_record.attempts + 1 END
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to reset rate limit (call after successful auth)
CREATE OR REPLACE FUNCTION public.reset_auth_rate_limit(
  p_email TEXT,
  p_action TEXT
)
RETURNS void AS $$
BEGIN
  DELETE FROM public.auth_rate_limits
  WHERE email = p_email AND action = p_action;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 2FA CODE GENERATION AND VERIFICATION
-- =====================================================

-- Function to generate and store 2FA code
CREATE OR REPLACE FUNCTION public.generate_2fa_code(
  p_email TEXT,
  p_code_type TEXT DEFAULT 'login',
  p_user_id UUID DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
  v_code TEXT;
  v_expiry TIMESTAMPTZ;
BEGIN
  -- Delete any existing unused codes for this email/type
  DELETE FROM public.two_factor_codes
  WHERE email = p_email AND code_type = p_code_type AND is_used = FALSE;

  -- Generate 6-digit code
  v_code := LPAD(FLOOR(RANDOM() * 1000000)::TEXT, 6, '0');

  -- Set expiry (5 minutes)
  v_expiry := NOW() + INTERVAL '5 minutes';

  -- Store code
  INSERT INTO public.two_factor_codes (email, code, code_type, user_id, expires_at)
  VALUES (p_email, v_code, p_code_type, p_user_id, v_expiry);

  RETURN json_build_object(
    'code', v_code,
    'expires_at', v_expiry
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to verify 2FA code
CREATE OR REPLACE FUNCTION public.verify_2fa_code(
  p_email TEXT,
  p_code TEXT,
  p_code_type TEXT DEFAULT 'login'
)
RETURNS JSON AS $$
DECLARE
  v_record RECORD;
  v_remaining_attempts INTEGER;
BEGIN
  -- Find the code record
  SELECT * INTO v_record
  FROM public.two_factor_codes
  WHERE email = p_email
    AND code_type = p_code_type
    AND is_used = FALSE
    AND expires_at > NOW()
  ORDER BY created_at DESC
  LIMIT 1;

  IF v_record IS NULL THEN
    RETURN json_build_object(
      'success', FALSE,
      'error', 'invalid_or_expired_code'
    );
  END IF;

  -- Check attempts
  IF v_record.attempts >= 3 THEN
    -- Too many failed attempts
    UPDATE public.two_factor_codes SET is_used = TRUE WHERE id = v_record.id;
    RETURN json_build_object(
      'success', FALSE,
      'error', 'too_many_attempts'
    );
  END IF;

  -- Verify code
  IF v_record.code = p_code THEN
    -- Success - mark code as used
    UPDATE public.two_factor_codes SET is_used = TRUE WHERE id = v_record.id;

    RETURN json_build_object(
      'success', TRUE,
      'user_id', v_record.user_id
    );
  ELSE
    -- Failed - increment attempts
    UPDATE public.two_factor_codes
    SET attempts = attempts + 1
    WHERE id = v_record.id;

    v_remaining_attempts := 3 - v_record.attempts - 1;

    RETURN json_build_object(
      'success', FALSE,
      'error', 'invalid_code',
      'remaining_attempts', v_remaining_attempts
    );
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- AUTO-CREATE PROFILE ON USER SIGNUP
-- =====================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =====================================================
-- TRIGGER TO UPDATE PROFILE TIMESTAMP
-- =====================================================
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- =====================================================
-- GRANT PERMISSIONS
-- =====================================================
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON public.profiles TO anon, authenticated;
GRANT ALL ON public.two_factor_codes TO anon, authenticated;
GRANT ALL ON public.user_sessions TO anon, authenticated;
GRANT ALL ON public.login_history TO anon, authenticated;
GRANT ALL ON public.auth_rate_limits TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.check_auth_rate_limit TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.reset_auth_rate_limit TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.generate_2fa_code TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.verify_2fa_code TO anon, authenticated;

-- =====================================================
-- CLEANUP OLD RECORDS (optional - run periodically)
-- =====================================================
-- Delete 2FA codes older than 24 hours: DELETE FROM two_factor_codes WHERE created_at < NOW() - INTERVAL '24 hours';
-- Delete login history older than 90 days: DELETE FROM login_history WHERE created_at < NOW() - INTERVAL '90 days';
-- Delete expired rate limits: DELETE FROM auth_rate_limits WHERE window_start < NOW() - INTERVAL '24 hours';