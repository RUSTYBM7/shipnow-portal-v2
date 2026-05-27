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

// Generate 6-digit verification code
function generateCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Generate branded HTML email
function generateBrandedEmailHtml(data: {
  email: string;
  name: string;
  verificationCode: string;
  type: 'verification' | 'welcome' | 'password_reset';
}): string {
  const { email, name, verificationCode, type } = data;

  const title = type === 'verification' ? 'Verify Your Account' :
                type === 'welcome' ? 'Welcome to AirPak Express!' :
                'Reset Your Password';

  const subtitle = type === 'verification' ? 'Please verify your email address to activate your account.' :
                   type === 'welcome' ? 'Your account has been successfully verified.' :
                   'Click the button below to reset your password.';

  const instructions = type === 'verification' ? `
    <ol style="margin: 0; padding-left: 20px; color: #94a3b8; font-size: 14px; line-height: 1.8;">
      <li>Go to the AirPak Express login page</li>
      <li>Enter your email and password</li>
      <li>Enter the 6-digit code above when prompted</li>
      <li>Click "Verify Code" to activate your account</li>
    </ol>
  ` : `
    <ol style="margin: 0; padding-left: 20px; color: #94a3b8; font-size: 14px; line-height: 1.8;">
      <li>Click the reset button below</li>
      <li>You'll be redirected to set a new password</li>
      <li>Choose a secure password (at least 8 characters)</li>
      <li>Sign in with your new password</li>
    </ol>
  `;

  return `
<!DOCTYPE html>
<html xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office" lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} - AirPak Express</title>
  <style>
    body, table, td, a { -webkit-text-size-adjust: 100%; }
    body { height: 100% !important; margin: 0 !important; padding: 0 !important; width: 100% !important; background-color: #0f172a; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; }
    @media only screen and (max-width: 620px) {
      .email-container { width: 100% !important; }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #0f172a;">
  <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #0f172a;">
    <tr>
      <td align="center" style="padding: 40px 10px;">
        <table role="presentation" class="email-container" border="0" cellpadding="0" cellspacing="0" width="600" style="max-width: 600px; background-color: #1e293b; border-radius: 16px; overflow: hidden;">
          <tr>
            <td style="background: linear-gradient(135deg, #dc143c 0%, #b01030 100%); padding: 32px 40px; text-align: center;">
              <span style="font-size: 28px; font-weight: bold; color: #ffffff;">AirPak</span>
              <span style="font-size: 12px; color: rgba(255,255,255,0.8); margin-left: 8px; text-transform: uppercase; letter-spacing: 2px;">Express</span>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px; background-color: #1e293b;">
              <h1 style="margin: 0 0 16px; font-size: 24px; font-weight: 600; color: #ffffff; text-align: center;">${title}</h1>
              <p style="margin: 0 0 24px; font-size: 16px; line-height: 1.6; color: #94a3b8; text-align: center;">
                Hello ${name || 'there'},<br>${subtitle}
              </p>
              ${type !== 'welcome' ? `
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background: linear-gradient(135deg, rgba(220,20,60,0.1) 0%, rgba(220,20,60,0.05) 100%); border: 2px solid rgba(220,20,60,0.3); border-radius: 12px; padding: 24px; margin: 24px 0; text-align: center;">
                <tr><td>
                  <p style="margin: 0 0 12px; font-size: 12px; color: #94a3b8; text-transform: uppercase; letter-spacing: 2px; font-weight: 600;">Your Verification Code</p>
                  <p style="margin: 0; font-size: 36px; font-weight: 700; color: #dc143c; letter-spacing: 8px; font-family: 'Courier New', Courier, monospace;">${verificationCode}</p>
                  <p style="margin: 12px 0 0; font-size: 12px; color: #64748b;">This code expires in 15 minutes</p>
                </td></tr>
              </table>
              ` : ''}
              <div style="background-color: #0f172a; border-radius: 12px; padding: 20px; margin: 24px 0;">
                <h3 style="margin: 0 0 16px; font-size: 14px; font-weight: 600; color: #e2e8f0;">How to proceed:</h3>
                ${instructions}
              </div>
            </td>
          </tr>
          <tr>
            <td style="background-color: #0f172a; padding: 32px 40px; text-align: center;">
              <p style="margin: 0 0 20px; font-size: 14px; font-weight: 600; color: #e2e8f0; text-transform: uppercase; letter-spacing: 1px;">Contact Us</p>
              <p style="margin: 0; font-size: 12px; color: #94a3b8;">Email: <a href="mailto:${BRAND_CONTACT.email}" style="color: #dc143c;">${BRAND_CONTACT.email}</a></p>
              <p style="margin: 8px 0 0; font-size: 12px; color: #94a3b8;">Phone: <a href="tel:${BRAND_CONTACT.phone}" style="color: #dc143c;">${BRAND_CONTACT.phone}</a></p>
            </td>
          </tr>
          <tr>
            <td style="background-color: #1e293b; padding: 24px 40px; border-top: 1px solid #334155; text-align: center;">
              <p style="margin: 0; font-size: 12px; color: #64748b;">© 2026 ${BRAND_CONTACT.company}. All rights reserved.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { email, password, name } = await req.json();

    if (!email || !password) {
      return new Response(
        JSON.stringify({ error: 'Email and password are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Check if user already exists
    const { data: existingUser } = await supabase.auth.admin.listUsers();
    const userExists = existingUser?.users.some(u => u.email === email.toLowerCase());

    if (userExists) {
      return new Response(
        JSON.stringify({ error: 'User already exists' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create user with admin API (bypasses email confirmation)
    const { data: userData, error: createError } = await supabase.auth.admin.createUser({
      email: email.toLowerCase(),
      password,
      email_confirm: true, // Auto-confirm email
      user_metadata: { full_name: name }
    });

    if (createError) {
      console.error('Error creating user:', createError);
      return new Response(
        JSON.stringify({ error: createError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!userData.user) {
      return new Response(
        JSON.stringify({ error: 'Failed to create user' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create profile for user
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: userData.user.id,
        email: email.toLowerCase(),
        name: name || email.split('@')[0],
        role: 'user',
        tier: 'bronze',
      });

    if (profileError) {
      console.error('Error creating profile:', profileError);
    }

    // Generate verification code
    const verificationCode = generateCode();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    // Store verification code
    await supabase
      .from('two_factor_codes')
      .insert({
        email: email.toLowerCase(),
        code: verificationCode,
        code_type: 'verification',
        expires_at: expiresAt.toISOString(),
        attempts: 0,
      });

    // Generate email HTML
    const htmlContent = generateBrandedEmailHtml({
      email, name, verificationCode, type: 'verification'
    });

    // Log for development
    console.log('=== AIRPAK EXPRESS BRANDED EMAIL ===');
    console.log('To:', email);
    console.log('Subject: Verify Your AirPak Express Account');
    console.log('Code:', verificationCode);
    console.log('Name:', name);
    console.log('User ID:', userData.user.id);
    console.log('=====================================');

    // Return success with dev code
    return new Response(
      JSON.stringify({
        success: true,
        message: 'User created successfully',
        user_id: userData.user.id,
        dev_code: verificationCode, // For development testing
        expiresIn: '15 minutes',
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in create-user:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
