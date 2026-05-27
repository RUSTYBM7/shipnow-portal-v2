# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: portal.spec.ts >> ShipNow Portal - Internal Pages E2E Tests >> Admin Portal >> should show admin login page
- Location: e2e/portal.spec.ts:125:5

# Error details

```
Error: expect(received).toBeTruthy()

Received: false
```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - generic [ref=e45]:
    - generic [ref=e46]:
      - link "AirPak Express Logo" [ref=e47] [cursor=pointer]:
        - /url: /
        - img "AirPak Express Logo" [ref=e48]
      - heading "Admin Access" [level=1] [ref=e49]
      - paragraph [ref=e50]: Secure authentication for authorized personnel
    - generic [ref=e52]:
      - generic [ref=e53]:
        - img [ref=e54]
        - generic [ref=e56]: Secured with end-to-end encryption
      - generic [ref=e57]:
        - generic [ref=e58]:
          - img [ref=e60]
          - textbox "Admin Key (ADM-XXXX-XXXX)" [ref=e63]
        - paragraph [ref=e64]: Found in your invitation email
      - generic [ref=e66]:
        - generic [ref=e67]: "@"
        - textbox "Admin Email" [ref=e68]:
          - /placeholder: " "
        - generic: Admin Email
      - generic [ref=e70]:
        - img [ref=e72]
        - textbox "Password (12+ characters)" [ref=e75]
        - button [ref=e76] [cursor=pointer]:
          - img [ref=e77]
      - button "Authenticate" [ref=e80] [cursor=pointer]
      - generic [ref=e81]:
        - generic [ref=e82]:
          - img [ref=e83]
          - generic [ref=e86]: Session expires in 30 minutes
        - generic [ref=e87]:
          - img [ref=e88]
          - generic [ref=e90]: All sessions are end-to-end encrypted
      - link "Forgot admin credentials?" [ref=e92] [cursor=pointer]:
        - /url: /admin/forgot
    - generic [ref=e93]:
      - paragraph [ref=e94]: © 2026 AirPak Express. All rights reserved.
      - generic [ref=e95]:
        - link "Privacy" [ref=e96] [cursor=pointer]:
          - /url: /privacy
        - generic [ref=e97]: •
        - link "Terms" [ref=e98] [cursor=pointer]:
          - /url: /terms
        - generic [ref=e99]: •
        - link "Support" [ref=e100] [cursor=pointer]:
          - /url: /support
  - generic [ref=e101] [cursor=pointer]:
    - generic [ref=e104]: Created by MiniMax Agent
    - generic [ref=e105]: ×
```

# Test source

```ts
  34  | 
  35  |       const url = page.url();
  36  |       // Should be on admin login page
  37  |       expect(url.includes('/admin') || url.includes('/auth')).toBeTruthy();
  38  |     });
  39  |   });
  40  | 
  41  |   test.describe('Public Login Page', () => {
  42  |     test('should display login form correctly', async ({ page }) => {
  43  |       await page.goto('/auth');
  44  |       await page.waitForTimeout(1000);
  45  | 
  46  |       // Check login form elements
  47  |       await expect(page.getByRole('heading', { name: /welcome back/i })).toBeVisible();
  48  |       await expect(page.getByPlaceholder(/you@example\.com/i)).toBeVisible();
  49  |       await expect(page.getByRole('button', { name: /sign in/i }).or(page.getByRole('button', { name: /sign in with 2fa/i }))).toBeVisible();
  50  |       await expect(page.getByRole('button', { name: /sign up/i })).toBeVisible();
  51  |     });
  52  | 
  53  |     test('should toggle between login and registration', async ({ page }) => {
  54  |       await page.goto('/auth');
  55  | 
  56  |       // Click sign up button
  57  |       await page.getByRole('button', { name: /sign up/i }).click();
  58  |       await page.waitForTimeout(500);
  59  | 
  60  |       // Should show registration form
  61  |       await expect(page.getByRole('heading', { name: /create account/i })).toBeVisible();
  62  |       await expect(page.getByPlaceholder(/john smith/i)).toBeVisible();
  63  |     });
  64  | 
  65  |     test('should show forgot password link', async ({ page }) => {
  66  |       await page.goto('/auth');
  67  |       await page.waitForTimeout(500);
  68  | 
  69  |       await expect(page.getByText(/forgot password/i)).toBeVisible();
  70  |     });
  71  |   });
  72  | 
  73  |   test.describe('Registration Flow', () => {
  74  |     test('should allow switching to registration tab', async ({ page }) => {
  75  |       await page.goto('/auth');
  76  |       await page.waitForTimeout(500);
  77  | 
  78  |       // Click sign up
  79  |       await page.getByRole('button', { name: /sign up/i }).click();
  80  |       await page.waitForTimeout(500);
  81  | 
  82  |       // Verify registration form fields
  83  |       await expect(page.getByPlaceholder(/john smith/i)).toBeVisible();
  84  |       await expect(page.getByPlaceholder(/you@example\.com/i)).toBeVisible();
  85  |       await expect(page.getByRole('button', { name: /create account/i })).toBeVisible();
  86  |     });
  87  | 
  88  |     test('should have reCAPTCHA on login form', async ({ page }) => {
  89  |       await page.goto('/auth');
  90  |       await page.waitForTimeout(500);
  91  | 
  92  |       // reCAPTCHA should be present
  93  |       await expect(page.getByText(/i'?m not a robot/i)).toBeVisible();
  94  |     });
  95  | 
  96  |     test('should have 2FA badge on login', async ({ page }) => {
  97  |       await page.goto('/auth');
  98  |       await page.waitForTimeout(500);
  99  | 
  100 |       await expect(page.getByText(/2fa/i)).toBeVisible();
  101 |     });
  102 |   });
  103 | 
  104 |   test.describe('Branding & Design', () => {
  105 |     test('should show AirPak branding on login page', async ({ page }) => {
  106 |       await page.goto('/auth');
  107 |       await page.waitForTimeout(500);
  108 | 
  109 |       // Check for AirPak branding
  110 |       const pageContent = await page.content();
  111 |       expect(pageContent.toLowerCase().includes('airpak') || pageContent.includes('ShipNow')).toBeTruthy();
  112 |     });
  113 | 
  114 |     test('should show feature highlights on login page', async ({ page }) => {
  115 |       await page.goto('/auth');
  116 |       await page.waitForTimeout(500);
  117 | 
  118 |       // Check for feature highlights (on larger screens)
  119 |       await page.setViewportSize({ width: 1280, height: 800 });
  120 |       await expect(page.getByText(/track/i).or(page.getByText(/ai/i))).toBeVisible();
  121 |     });
  122 |   });
  123 | 
  124 |   test.describe('Admin Portal', () => {
  125 |     test('should show admin login page', async ({ page }) => {
  126 |       await page.goto('/admin');
  127 |       await page.waitForTimeout(1000);
  128 | 
  129 |       // Check for admin login elements
  130 |       const hasAdminLogin = await page.getByText(/admin/i).isVisible()
  131 |         .catch(() => page.getByRole('button', { name: /sign in/i }).isVisible())
  132 |         .catch(() => false);
  133 | 
> 134 |       expect(hasAdminLogin).toBeTruthy();
      |                             ^ Error: expect(received).toBeTruthy()
  135 |     });
  136 | 
  137 |     test('should show admin 2FA page', async ({ page }) => {
  138 |       await page.goto('/admin/2fa');
  139 |       await page.waitForTimeout(500);
  140 | 
  141 |       // 2FA verification page should be shown
  142 |       const has2FA = await page.getByText(/verification/i).isVisible()
  143 |         .catch(() => page.getByText(/enter code/i).isVisible())
  144 |         .catch(() => page.getByText(/2fa/i).isVisible())
  145 |         .catch(() => false);
  146 | 
  147 |       expect(has2FA).toBeTruthy();
  148 |     });
  149 |   });
  150 | 
  151 |   test.describe('Responsive Design', () => {
  152 |     test('should show mobile-friendly login on small screens', async ({ page }) => {
  153 |       await page.setViewportSize({ width: 375, height: 667 });
  154 |       await page.goto('/auth');
  155 |       await page.waitForTimeout(500);
  156 | 
  157 |       // Login form should still be visible
  158 |       await expect(page.getByPlaceholder(/you@example\.com/i).or(page.getByRole('heading', { name: /welcome back/i }))).toBeVisible();
  159 |     });
  160 | 
  161 |     test('should show full login on desktop', async ({ page }) => {
  162 |       await page.setViewportSize({ width: 1280, height: 800 });
  163 |       await page.goto('/auth');
  164 |       await page.waitForTimeout(500);
  165 | 
  166 |       // Branding section should be visible on desktop
  167 |       const hasBranding = await page.getByText(/welcome to/i).isVisible()
  168 |         .catch(() => page.getByText(/future/i).isVisible())
  169 |         .catch(() => false);
  170 | 
  171 |       expect(hasBranding).toBeTruthy();
  172 |     });
  173 |   });
  174 | });
```