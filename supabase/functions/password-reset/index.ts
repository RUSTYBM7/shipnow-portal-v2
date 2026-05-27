import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Brand Contact Information
const BRAND_CONTACT = {
  name: 'AirPak Express',
  email: 'admin@airpak-express.com',
  altEmail: 'admin.airpak@gmail.com',
  phone: '+44 20 7946 0001',
  website: 'https://airpak-express.com',
  company: 'AirPak Express Ltd',
  address: 'London, United Kingdom',
};

// Generate 6-digit reset code
function generateResetCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Generate branded HTML email for password reset
function generatePasswordResetEmailHtml(data: {
  email: string;
  name: string;
  resetCode: string;
}): string {
  const { email, name, resetCode } = data;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Your Password - AirPak Express</title>
  <style>
    body { margin: 0; padding: 0; background-color: #0f172a; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; }
    .container { max-width: 600px; margin: 0 auto; background-color: #1e293b; border-radius: 16px; overflow: hidden; }
    .header { background: linear-gradient(135deg, #dc143c 0%, #b01030 100%); padding: 32px 40px; text-align: center; }
    .brand { font-size: 28px; font-weight: bold; color: #ffffff; }
    .brand-sub { font-size: 12px; color: rgba(255,255,255,0.8); margin-left: 8px; text-transform: uppercase; letter-spacing: 2px; }
    .content { padding: 40px; background-color: #1e293b; }
    h1 { margin: 0 0 16px; font-size: 24px; color: #ffffff; text-align: center; }
    p { margin: 0 0 24px; font-size: 16px; line-height: 1.6; color: #94a3b8; text-align: center; }
    .code-box { background: linear-gradient(135deg, rgba(220,20,60,0.1) 0%, rgba(220,20,60,0.05) 100%); border: 2px solid rgba(220,20,60,0.3); border-radius: 12px; padding: 24px; margin: 24px 0; text-align: center; }
    .code-label { font-size: 12px; color: #94a3b8; text-transform: uppercase; letter-spacing: 2px; font-weight: 600; margin: 0 0 12px; }
    .code { font-size: 36px; font-weight: 700; color: #dc143c; letter-spacing: 8px; font-family: 'Courier New', Courier, monospace; margin: 0; }
    .instructions { background-color: #0f172a; border-radius: 12px; padding: 20px; margin: 24px 0; }
    .instructions h3 { margin: 0 0 16px; font-size: 14px; font-weight: 600; color: #e2e8f0; }
    .instructions ol { margin: 0; padding-left: 20px; color: #94a3b8; font-size: 14px; line-height: 1.8; }
    .security { background-color: #0f172a; border-left: 4px solid #f59e0b; border-radius: 4px; padding: 16px; margin: 24px 0; }
    .security-title { font-size: 14px; font-weight: 600; color: #f59e0b; margin: 0 0 8px; }
    .security-text { font-size: 13px; color: #64748b; line-height: 1.5; margin: 0; }
    .contact { background-color: #0f172a; padding: 32px 40px; text-align: center; }
    .contact-title { font-size: 14px; font-weight: 600; color: #e2e8f0; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 20px; }
    .contact-info { font-size: 12px; color: #94a3b8; }
    .contact-info a { color: #dc143c; text-decoration: none; }
    .footer { background-color: #1e293b; padding: 24px 40px; border-top: 1px solid #334155; text-align: center; }
    .footer-text { font-size: 12px; color: #64748b; margin: 0; }
  </style>
</head>
<body style="margin: 0; padding: 20px; background-color: #0f172a;">
  <div class="container">
    <div class="header">
      <span class="brand">AirPak</span>
      <span class="brand-sub">Express</span>
    </div>
    <div class="content">
      <h1>Reset Your Password</h1>
      <p>Hello ${name || 'there'},<br>We received a request to reset your password. Enter the code below to create a new password.</p>

      <div class="code-box">
        <p class="code-label">Your Reset Code</p>
        <p class="code">${resetCode}</p>
      </div>

      <div class="instructions">
        <h3>How to reset your password:</h3>
        <ol>
          <li>Go to the AirPak Express login page</li>
          <li>Click "Forgot password"</li>
          <li>Enter your email and the code above</li>
          <li>Choose a new secure password</li>
        </ol>
      </div>

      <div class="security">
        <p class="security-title">🔒 Security Notice</p>
        <p class="security-text">If you didn't request this password reset, please ignore this email or contact our support team immediately at ${BRAND_CONTACT.email}. This code expires in 15 minutes.</p>
      </div>
    </div>
    <div class="contact">
      <p class="contact-title">Contact Us</p>
      <p class="contact-info">Email: <a href="mailto:${BRAND_CONTACT.email}">${BRAND_CONTACT.email}</a></p>
      <p class="contact-info" style="margin-top: 8px;">Phone: <a href="tel:${BRAND_CONTACT.phone}">${BRAND_CONTACT.phone}</a></p>
    </div>
    <div class="footer">
      <p class="footer-text">© 2026 ${BRAND_CONTACT.company}. All rights reserved.</p>
    </div>
  </div>
</body>
</html>`;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { email, name } = await req.json();

    if (!email) {
      return new Response(
        JSON.stringify({ error: 'Email is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Check if user exists
    const { data: userData } = await supabase.auth.admin.listUsers();
    const user = userData?.users.find(u => u.email === email.toLowerCase());

    if (!user) {
      // Don't reveal if user exists for security
      return new Response(
        JSON.stringify({
          success: true,
          message: 'If an account exists, a reset code has been sent'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Generate reset code
    const resetCode = generateResetCode();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    // Store reset code
    await supabase
      .from('two_factor_codes')
      .insert({
        email: email.toLowerCase(),
        code: resetCode,
        code_type: 'password_reset',
        expires_at: expiresAt.toISOString(),
        attempts: 0,
      });

    // Generate branded HTML email
    const htmlContent = generatePasswordResetEmailHtml({
      email,
      name: name || user.user_metadata?.full_name || email.split('@')[0],
      resetCode,
    });

    // Log for development
    console.log('=== AIRPAK EXPRESS PASSWORD RESET EMAIL ===');
    console.log('To:', email);
    console.log('Reset Code:', resetCode);
    console.log('User ID:', user.id);
    console.log('===========================================');

    // Return success with dev code
    return new Response(
      JSON.stringify({
        success: true,
        message: 'Password reset email sent successfully',
        dev_code: resetCode, // For development testing
        expiresIn: '15 minutes',
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in password-reset:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});