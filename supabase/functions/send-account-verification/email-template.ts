// AirPak Express - Account Verification Email Template
// Branded HTML email for new account verification

export interface EmailData {
  email: string;
  name: string;
  verificationCode: string;
  verificationUrl?: string;
}

export const getBrandedEmailHtml = (data: EmailData): string => {
  const { email, name, verificationCode } = data;

  return `
<!DOCTYPE html>
<html xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office" lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>Verify Your AirPak Express Account</title>
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:PixelsPerInch>...</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
  <style>
    body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    img { -ms-interpolation-mode: bicubic; border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; }
    body { height: 100% !important; margin: 0 !important; padding: 0 !important; width: 100% !important; }
    a[x-apple-data-detectors] { color: inherit !important; text-decoration: none !important; font-size: inherit !important; font-family: inherit !important; font-weight: inherit !important; line-height: inherit !important; }
    @media only screen and (max-width: 620px) {
      .email-container { width: 100% !important; }
      .fluid { max-width: 100% !important; height: auto !important; margin-left: auto !important; margin-right: auto !important; }
      .stack-column { display: block !important; width: 100% !important; max-width: 100% !important; }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #0f172a; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">

  <!-- Preview Text (hidden) -->
  <div style="display: none; max-height: 0px; overflow: hidden;">
    Verify your AirPak Express account - Your verification code is ${verificationCode}
  </div>

  <!-- Wrapper Table -->
  <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #0f172a;">
    <tr>
      <td align="center" style="padding: 40px 10px;">

        <!--[if (gte mso 9)|(IE)]>
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="600" align="center">
        <tr>
        <td align="center">
        <![endif]-->

        <!-- Email Container -->
        <table role="presentation" class="email-container" border="0" cellpadding="0" cellspacing="0" width="600" style="max-width: 600px; background-color: #1e293b; border-radius: 16px; overflow: hidden;">

          <!-- Header / Logo -->
          <tr>
            <td style="background: linear-gradient(135deg, #dc143c 0%, #b01030 100%); padding: 32px 40px; text-align: center;">
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td align="center">
                    <!-- Logo Box -->
                    <div style="display: inline-block; background-color: rgba(255,255,255,0.15); border-radius: 12px; padding: 12px 20px; margin-bottom: 8px;">
                      <span style="font-size: 28px; font-weight: bold; color: #ffffff; letter-spacing: -0.5px;">AirPak</span>
                      <span style="font-size: 12px; color: rgba(255,255,255,0.8); margin-left: 8px; text-transform: uppercase; letter-spacing: 1px;">Express</span>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td align="center" style="padding-top: 8px;">
                    <span style="font-size: 14px; color: rgba(255,255,255,0.9);">ShipNow Portal</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Main Content -->
          <tr>
            <td style="padding: 40px 40px 20px; background-color: #1e293b;">

              <!-- Greeting -->
              <h1 style="margin: 0 0 16px; font-size: 24px; font-weight: 600; color: #ffffff; text-align: center;">
                Verify Your Account
              </h1>

              <p style="margin: 0 0 24px; font-size: 16px; line-height: 1.6; color: #94a3b8; text-align: center;">
                Hello ${name || 'there'},<br>
                Welcome to AirPak Express! Please verify your email address to activate your account.
              </p>

              <!-- Verification Code Box -->
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background: linear-gradient(135deg, #dc143c10 0%, #dc143c05 100%); border: 2px solid #dc143c30; border-radius: 12px; padding: 24px; margin: 24px 0;">
                <tr>
                  <td align="center">
                    <p style="margin: 0 0 12px; font-size: 14px; color: #94a3b8; text-transform: uppercase; letter-spacing: 1px;">
                      Your Verification Code
                    </p>
                    <p style="margin: 0; font-size: 36px; font-weight: 700; color: #dc143c; letter-spacing: 8px; font-family: 'Courier New', monospace;">
                      ${verificationCode}
                    </p>
                    <p style="margin: 12px 0 0; font-size: 12px; color: #64748b;">
                      This code expires in 15 minutes
                    </p>
                  </td>
                </tr>
              </table>

              <!-- Instructions -->
              <div style="background-color: #0f172a; border-radius: 8px; padding: 20px; margin: 24px 0;">
                <h3 style="margin: 0 0 12px; font-size: 14px; font-weight: 600; color: #e2e8f0;">
                  How to verify your account:
                </h3>
                <ol style="margin: 0; padding-left: 20px; color: #94a3b8; font-size: 14px; line-height: 1.8;">
                  <li>Go to the AirPak Express login page</li>
                  <li>Enter your email and password</li>
                  <li>Enter the 6-digit code above when prompted</li>
                  <li>Click "Verify Code" to activate your account</li>
                </ol>
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
                <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                  <tr>
                    <td style="vertical-align: top; padding-right: 12px;">
                      <span style="font-size: 20px;">🔐</span>
                    </td>
                    <td>
                      <p style="margin: 0 0 4px; font-size: 14px; font-weight: 600; color: #f59e0b;">Security Notice</p>
                      <p style="margin: 0; font-size: 13px; color: #64748b; line-height: 1.5;">
                        If you didn't create an AirPak Express account, please ignore this email or contact our support team immediately.
                      </p>
                    </td>
                  </tr>
                </table>
              </div>
            </td>
          </tr>

          <!-- Divider -->
          <tr>
            <td style="padding: 0 40px;">
              <hr style="border: none; border-top: 1px solid #334155; margin: 0;">
            </td>
          </tr>

          <!-- Contact Info -->
          <tr>
            <td style="padding: 32px 40px; background-color: #0f172a;">
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td align="center">
                    <p style="margin: 0 0 16px; font-size: 14px; font-weight: 600; color: #e2e8f0;">
                      Need Help? Contact Us
                    </p>
                  </td>
                </tr>
                <tr>
                  <td align="center">
                    <table role="presentation" border="0" cellpadding="0" cellspacing="0">
                      <tr>
                        <!-- Email -->
                        <td style="padding: 0 16px;">
                          <table role="presentation" border="0" cellpadding="0" cellspacing="0" align="center">
                            <tr>
                              <td style="background-color: #dc143c15; border-radius: 8px; padding: 12px;">
                                <span style="font-size: 16px;">✉️</span>
                              </td>
                            </tr>
                            <tr>
                              <td style="padding-top: 8px;">
                                <a href="mailto:admin@airpak-express.com" style="color: #dc143c; text-decoration: none; font-size: 12px;">
                                  admin@airpak-express.com
                                </a>
                              </td>
                            </tr>
                          </table>
                        </td>

                        <!-- Phone -->
                        <td style="padding: 0 16px;">
                          <table role="presentation" border="0" cellpadding="0" cellspacing="0" align="center">
                            <tr>
                              <td style="background-color: #dc143c15; border-radius: 8px; padding: 12px;">
                                <span style="font-size: 16px;">📞</span>
                              </td>
                            </tr>
                            <tr>
                              <td style="padding-top: 8px;">
                                <a href="tel:+442079460001" style="color: #dc143c; text-decoration: none; font-size: 12px;">
                                  +44 20 7946 0001
                                </a>
                              </td>
                            </tr>
                          </table>
                        </td>

                        <!-- Alt Email -->
                        <td style="padding: 0 16px;">
                          <table role="presentation" border="0" cellpadding="0" cellspacing="0" align="center">
                            <tr>
                              <td style="background-color: #dc143c15; border-radius: 8px; padding: 12px;">
                                <span style="font-size: 16px;">💬</span>
                              </td>
                            </tr>
                            <tr>
                              <td style="padding-top: 8px;">
                                <a href="mailto:admin.airpak@gmail.com" style="color: #dc143c; text-decoration: none; font-size: 12px;">
                                  admin.airpak@gmail.com
                                </a>
                              </td>
                            </tr>
                          </table>
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
                      © 2026 AirPak Express. All rights reserved.
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

        <!--[if (gte mso 9)|(IE)]>
        </td>
        </tr>
        </table>
        <![endif]-->

      </td>
    </tr>
  </table>

</body>
</html>
`;
};

export const getPlainTextEmail = (data: EmailData): string => {
  const { name, verificationCode } = data;

  return `
AIRPAK EXPRESS - Account Verification

Welcome ${name || 'there'},

Thank you for creating an AirPak Express account! Please verify your email address using the code below.

YOUR VERIFICATION CODE: ${verificationCode}

This code expires in 15 minutes.

HOW TO VERIFY YOUR ACCOUNT:
1. Go to the AirPak Express login page
2. Enter your email and password
3. Enter the 6-digit code above when prompted
4. Click "Verify Code" to activate your account

SECURITY NOTICE:
If you didn't create an AirPak Express account, please ignore this email or contact our support team immediately.

NEED HELP? CONTACT US:
• Email: admin@airpak-express.com
• Phone: +44 20 7946 0001
• Alt Email: admin.airpak@gmail.com

© 2026 AirPak Express. All rights reserved.
ShipNow Portal • Global Logistics Solutions
This email was sent to ${data.email}
`;
};
