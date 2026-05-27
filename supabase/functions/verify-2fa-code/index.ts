// Supabase Edge Function: Verify 2FA Code
// This function verifies the 2FA code entered by the user

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

interface Verify2FARequest {
  email: string;
  code: string;
  expectedType?: 'login' | 'recovery' | 'change_email';
}

serve(async (req) => {
  // CORS headers
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  };

  // Handle preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { email, code, expectedType = 'login' }: Verify2FARequest = await req.json();

    if (!email || !code) {
      return new Response(
        JSON.stringify({ error: 'Email and code are required' }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate code format (6 digits)
    const codeRegex = /^\d{6}$/;
    if (!codeRegex.test(code)) {
      return new Response(
        JSON.stringify({ error: 'Invalid code format. Code must be 6 digits.' }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create Supabase admin client
    const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Find the 2FA code record
    const { data: codeRecord, error: findError } = await supabaseAdmin
      .from('two_factor_codes')
      .select('*')
      .eq('email', email.toLowerCase())
      .eq('code_type', expectedType)
      .eq('is_used', false)
      .single();

    if (findError || !codeRecord) {
      return new Response(
        JSON.stringify({ error: 'Invalid or expired code' }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if code is expired
    const now = new Date();
    const expiresAt = new Date(codeRecord.expires_at);
    if (now > expiresAt) {
      // Mark as used (expired)
      await supabaseAdmin
        .from('two_factor_codes')
        .update({ is_used: true })
        .eq('id', codeRecord.id);

      return new Response(
        JSON.stringify({ error: 'Code has expired. Please request a new one.' }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check attempt count
    if (codeRecord.attempts >= 3) {
      await supabaseAdmin
        .from('two_factor_codes')
        .update({ is_used: true })
        .eq('id', codeRecord.id);

      return new Response(
        JSON.stringify({ error: 'Too many failed attempts. Please request a new code.' }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verify the code
    if (codeRecord.code !== code) {
      // Increment attempt count
      await supabaseAdmin
        .from('two_factor_codes')
        .update({ attempts: codeRecord.attempts + 1 })
        .eq('id', codeRecord.id);

      const remainingAttempts = 3 - codeRecord.attempts - 1;
      return new Response(
        JSON.stringify({
          error: 'Invalid code',
          remaining_attempts: remainingAttempts
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Code is valid - mark as used
    await supabaseAdmin
      .from('two_factor_codes')
      .update({ is_used: true })
      .eq('id', codeRecord.id);

    // Log successful verification in login_history if it's a login attempt
    if (expectedType === 'login' && codeRecord.user_id) {
      await supabaseAdmin
        .from('login_history')
        .insert({
          user_id: codeRecord.user_id,
          email: email.toLowerCase(),
          method: '2fa',
          success: true,
          ip_address: req.headers.get('x-forwarded-for') || 'unknown',
          user_agent: req.headers.get('user-agent') || 'unknown'
        });
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Code verified successfully',
        user_id: codeRecord.user_id
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error('Error in verify-2fa-code function:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});