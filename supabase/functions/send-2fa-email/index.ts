// Supabase Edge Function: Send 2FA Code via Email
// This function generates and sends a 2FA code to the user's email

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

// Email configuration (using Resend API)
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const FROM_EMAIL = Deno.env.get("FROM_EMAIL") || "noreply@shipnow-portal.com";

interface Send2FARequest {
  email: string;
  userId?: string;
  codeType?: 'login' | 'recovery' | 'change_email';
}

function generateSecureCode(): string {
  // Generate a 6-digit secure code
  const array = new Uint8Array(3);
  crypto.getRandomValues(array);
  const num = (array[0] << 16) | (array[1] << 8) | array[2];
  return String(num % 1000000).padStart(6, '0');
}

async function store2FACode(
  supabaseAdmin: any,
  email: string,
  code: string,
  codeType: string,
  userId?: string
): Promise<{ success: boolean; error?: string }> {
  // Delete any existing codes for this email
  await supabaseAdmin
    .from('two_factor_codes')
    .delete()
    .eq('email', email);

  // Calculate expiry time (5 minutes from now)
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();

  // Store the new code
  const { error } = await supabaseAdmin
    .from('two_factor_codes')
    .insert({
      email: email.toLowerCase(),
      code: code,
      code_type: codeType,
      expires_at: expiresAt,
      user_id: userId,
      attempts: 0,
      is_used: false,
    });

  if (error) {
    console.error('Error storing 2FA code:', error);
    return { success: false, error: error.message };
  }

  return { success: true };
}

async function sendEmailViaResend(toEmail: string, code: string, codeType: string): Promise<{ success: boolean; error?: string }> {
  if (!RESEND_API_KEY) {
    console.log(`[DEV MODE] Would send email to ${toEmail} with code: ${code}`);
    return { success: true }; // In dev mode, just log
  }

  const subject = codeType === 'login'
    ? 'Your ShipNow Portal Login Code'
    : codeType === 'recovery'
    ? 'ShipNow Portal: Password Recovery Code'
    : 'ShipNow Portal: Email Change Verification';

  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 20px; background: #f4f4f5; }
    .container { max-width: 480px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; }
    .header h1 { color: white; margin: 0; font-size: 24px; }
    .content { padding: 30px; text-align: center; }
    .code-box { background: #f8fafc; border: 2px dashed #e2e8f0; border-radius: 8px; padding: 20px; margin: 20px 0; }
    .code { font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #667eea; font-family: monospace; }
    .warning { color: #dc2626; font-size: 12px; margin-top: 15px; }
    .footer { background: #f8fafc; padding: 15px; text-align: center; font-size: 12px; color: #64748b; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>ShipNow Portal</h1>
    </div>
    <div class="content">
      <h2>Your Verification Code</h2>
      <p>Please use the following code to complete your ${codeType === 'login' ? 'login' : codeType === 'recovery' ? 'password recovery' : 'email change'}:</p>
      <div class="code-box">
        <span class="code">${code}</span>
      </div>
      <p class="warning">⚠️ This code expires in 5 minutes. Do not share it with anyone.</p>
      <p>If you didn't request this code, please ignore this email and ensure your account is secure.</p>
    </div>
    <div class="footer">
      <p>© 2026 AirPak Express / ShipNow Portal</p>
      <p>This is an automated message. Please do not reply.</p>
    </div>
  </div>
</body>
</html>
  `;

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: toEmail,
        subject: subject,
        html: htmlContent,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return { success: false, error: errorData.message || 'Failed to send email' };
    }

    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
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
    const { email, userId, codeType = 'login' }: Send2FARequest = await req.json();

    if (!email) {
      return new Response(
        JSON.stringify({ error: 'Email is required' }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return new Response(
        JSON.stringify({ error: 'Invalid email format' }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create Supabase admin client
    const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Check rate limit
    const { data: rateLimitData } = await supabaseAdmin
      .rpc('check_auth_rate_limit', {
        p_email: email.toLowerCase(),
        p_action: '2fa_request'
      });

    if (rateLimitData && rateLimitData.exceeded) {
      return new Response(
        JSON.stringify({
          error: 'Too many requests. Please try again later.',
          retry_after: rateLimitData.retry_after_seconds
        }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Generate secure code
    const code = generateSecureCode();

    // Store code in database
    const storeResult = await store2FACode(supabaseAdmin, email, code, codeType, userId);
    if (!storeResult.success) {
      return new Response(
        JSON.stringify({ error: 'Failed to generate code' }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Send email
    const emailResult = await sendEmailViaResend(email, code, codeType);
    if (!emailResult.success) {
      return new Response(
        JSON.stringify({ error: 'Failed to send verification email' }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Verification code sent to your email',
        // In dev mode, include the code for testing
        ...(RESEND_API_KEY ? {} : { dev_code: code })
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error('Error in send-2fa-email function:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});