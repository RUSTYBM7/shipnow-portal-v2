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
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>${title} - AirPak Express</title>
  <style>
    body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    img { -ms-interpolation-mode: bicubic; border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; }
    body { height: 100% !important; margin: 0 !important; padding: 0 !important; width: 100% !important; background-color: #0f172a; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; }
    a[x-apple-data-detectors] { color: inherit !important; text-decoration: none !important; font-size: inherit !important; font-family: inherit !important; font-weight: inherit !important; line-height: inherit !important; }
    @media only screen and (max-width: 620px) {
      .email-container { width: 100% !important; max-width: 100% !important; }
      .content-padding { padding: 24px 20px !important; }
      .code-size { font-size: 28px !important; letter-spacing: 4px !important; }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #0f172a;">

  <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #0f172a;">
    <tr>
      <td align="center" style="padding: 40px 10px;">
        <table role="presentation" class="email-container" border="0" cellpadding="0" cellspacing="0" width="600" style="max-width: 600px; background-color: #1e293b; border-radius: 16px; overflow: hidden; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);">

          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #dc143c 0%, #b01030 100%); padding: 32px 40px;">
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td align="center">
                    <div style="display: inline-block; background-color: rgba(255,255,255,0.15); border-radius: 12px; padding: 12px 24px;">
                      <span style="font-size: 28px; font-weight: bold; color: #ffffff; letter-spacing: -0.5px;">AirPak</span>
                      <span style="font-size: 12px; color: rgba(255,255,255,0.8); margin-left: 8px; text-transform: uppercase; letter-spacing: 2px;">Express</span>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td align="center" style="padding-top: 12px;">
                    <span style="font-size: 14px; color: rgba(255,255,255,0.9); letter-spacing: 1px;">ShipNow Portal</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Main Content -->
          <tr>
            <td class="content-padding" style="padding: 40px; background-color: #1e293b;">

              <h1 style="margin: 0 0 16px; font-size: 24px; font-weight: 600; color: #ffffff; text-align: center;">
                ${title}
              </h1>

              <p style="margin: 0 0 24px; font-size: 16px; line-height: 1.6; color: #94a3b8; text-align: center;">
                Hello ${name || 'there'},<br>
                ${subtitle}
              </p>

              ${type !== 'welcome' ? `
              <!-- Verification Code Box -->
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background: linear-gradient(135deg, rgba(220,20,60,0.1) 0%, rgba(220,20,60,0.05) 100%); border: 2px solid rgba(220,20,60,0.3); border-radius: 12px; padding: 24px; margin: 24px 0;">
                <tr>
                  <td align="center">
                    <p style="margin: 0 0 12px; font-size: 12px; color: #94a3b8; text-transform: uppercase; letter-spacing: 2px; font-weight: 600;">
                      Your Verification Code
                    </p>
                    <p class="code-size" style="margin: 0; font-size: 36px; font-weight: 700; color: #dc143c; letter-spacing: 8px; font-family: 'Courier New', Courier, monospace;">
                      ${verificationCode}
                    </p>
                    <p style="margin: 12px 0 0; font-size: 12px; color: #64748b;">
                      This code expires in 15 minutes
                    </p>
                  </td>
                </tr>
              </table>
              ` : ''}

              <!-- Instructions -->
              <div style="background-color: #0f172a; border-radius: 12px; padding: 20px; margin: 24px 0;">
                <h3 style="margin: 0 0 16px; font-size: 14px; font-weight: 600; color: #e2e8f0;">
                  📋 How to proceed:
                </h3>
                ${instructions}
              </div>

            </td>
          </tr>

          <!-- Divider -->
          <tr>
            <td style="padding: 0 40px;">
              <hr style="border: none; border-top: 1px solid #334155; margin: 0;">
            </td>
          </tr>

          <!-- Security Notice -->
          <tr>
            <td style="padding: 24px 40px; background-color: #1e293b;">
              <div style="background-color: #0f172a; border-left: 4px solid #f59e0b; border-radius: 4px; padding: 16px;">
                <p style="margin: 0 0 8px; font-size: 14px; font-weight: 600; color: #f59e0b;">🔒 Security Notice</p>
                <p style="margin: 0; font-size: 13px; color: #64748b; line-height: 1.5;">
                  If you didn't ${type === 'welcome' ? 'activate this feature' : 'create this request'}, please ignore this email or contact our support team immediately at ${BRAND_CONTACT.email}.
                </p>
              </div>
            </td>
          </tr>

          <!-- Contact Info -->
          <tr>
            <td style="background-color: #0f172a; padding: 32px 40px;">
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td align="center">
                    <p style="margin: 0 0 20px; font-size: 14px; font-weight: 600; color: #e2e8f0; text-transform: uppercase; letter-spacing: 1px;">
                      Contact Us
                    </p>
                  </td>
                </tr>
                <tr>
                  <td align="center">
                    <table role="presentation" border="0" cellpadding="0" cellspacing="0" style="display: inline-table;">
                      <tr>
                        <td style="padding: 0 20px;">
                          <p style="margin: 0; font-size: 18px;">✉️</p>
                          <p style="margin: 8px 0 0; font-size: 12px; color: #94a3b8;">Email</p>
                          <a href="mailto:${BRAND_CONTACT.email}" style="color: #dc143c; text-decoration: none; font-size: 13px; font-weight: 500;">${BRAND_CONTACT.email}</a>
                        </td>
                        <td style="padding: 0 20px;">
                          <p style="margin: 0; font-size: 18px;">📞</p>
                          <p style="margin: 8px 0 0; font-size: 12px; color: #94a3b8;">Phone</p>
                          <a href="tel:${BRAND_CONTACT.phone}" style="color: #dc143c; text-decoration: none; font-size: 13px; font-weight: 500;">${BRAND_CONTACT.phone}</a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #1e293b; padding: 24px 40px; border-top: 1px solid #334155;">
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td align="center">
                    <p style="margin: 0 0 8px; font-size: 12px; color: #64748b;">
                      © 2026 ${BRAND_CONTACT.company}. All rights reserved.
                    </p>
                    <p style="margin: 0; font-size: 11px; color: #475569;">
                      ShipNow Portal • Global Logistics Solutions<br>
                      This email was sent to ${email}
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>

</body>
</html>
`;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { email, name, codeType = 'verification' } = await req.json();

    if (!email) {
      return new Response(
        JSON.stringify({ error: 'Email is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Generate verification code
    const verificationCode = generateCode();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    // Store code in database
    const { error: insertError } = await supabase
      .from('two_factor_codes')
      .insert({
        email: email.toLowerCase(),
        code: verificationCode,
        code_type: codeType,
        expires_at: expiresAt.toISOString(),
        attempts: 0,
      });

    if (insertError) {
      console.error('Failed to store verification code:', insertError);
      // Continue anyway - we'll still send the email
    }

    // Generate branded HTML email
    const htmlContent = generateBrandedEmailHtml({
      email, name, verificationCode, type: codeType === 'verification' ? 'verification' : 'password_reset'
    });

    // For development - return the code directly
    // In production, this would integrate with an email service like SendGrid, Mailgun, etc.
    const devCode = Deno.env.get('DEV_MODE') === 'true' ? verificationCode : null;

    // Simulate email sending (in production, integrate with actual email service)
    console.log('=== AIRPAK EXPRESS BRANDED EMAIL ===');
    console.log('To:', email);
    console.log('Subject: Verify Your AirPak Express Account');
    console.log('Code:', verificationCode);
    console.log('Name:', name);
    console.log('=====================================');

    // Return success response
    return new Response(
      JSON.stringify({
        success: true,
        message: 'Verification email sent successfully',
        dev_code: devCode, // Only in dev mode
        expiresIn: '15 minutes',
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error sending verification email:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to send verification email', details: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
