# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: portal.spec.ts >> ShipNow Portal - Internal Pages E2E Tests >> Branding & Design >> should show feature highlights on login page
- Location: e2e/portal.spec.ts:114:5

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByText(/track/i).or(getByText(/ai/i))
Expected: visible
Error: strict mode violation: getByText(/track/i).or(getByText(/ai/i)) resolved to 6 elements:
    1) <p class="text-lg text-slate-400 max-w-lg">Experience seamless shipment tracking, AI-powered…</p> aka getByText('Experience seamless shipment')
    2) <h3 class="font-semibold text-white text-sm">Real-time Tracking</h3> aka getByRole('heading', { name: 'Real-time Tracking' })
    3) <p class="text-xs text-slate-400">Track shipments worldwide</p> aka getByText('Track shipments worldwide')
    4) <h3 class="font-semibold text-white text-sm">AI Automation</h3> aka getByRole('heading', { name: 'AI Automation' })
    5) <div class="relative z-10 text-slate-500 text-sm">© 2026 AirPak Express. All rights reserved.</div> aka getByText('© 2026 AirPak Express. All')
    6) <label class="block text-sm font-medium text-slate-300 mb-2">Email Address</label> aka getByText('Email Address')

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for getByText(/track/i).or(getByText(/ai/i))

```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - generic [ref=e3]:
    - generic [ref=e4]:
      - generic [ref=e9]:
        - img "AirPak Express" [ref=e10]
        - generic [ref=e11]:
          - generic [ref=e12]: Global Logistics
          - generic [ref=e13]: Excellence in Motion
      - generic [ref=e14]:
        - generic [ref=e15]:
          - heading "Welcome to the Future of Global Logistics" [level=1] [ref=e16]
          - paragraph [ref=e17]: Experience seamless shipment tracking, AI-powered document creation, and enterprise-grade logistics management all in one platform.
        - generic [ref=e18]:
          - generic [ref=e19]:
            - img [ref=e21]
            - generic [ref=e26]:
              - heading "Real-time Tracking" [level=3] [ref=e27]
              - paragraph [ref=e28]: Track shipments worldwide
          - generic [ref=e29]:
            - img [ref=e31]
            - generic [ref=e33]:
              - heading "AI Automation" [level=3] [ref=e34]
              - paragraph [ref=e35]: Smart document generation
          - generic [ref=e36]:
            - img [ref=e38]
            - generic [ref=e40]:
              - heading "Bank-level Security" [level=3] [ref=e41]
              - paragraph [ref=e42]: Enterprise encryption
          - generic [ref=e43]:
            - img [ref=e45]
            - generic [ref=e49]:
              - heading "2FA Protection" [level=3] [ref=e50]
              - paragraph [ref=e51]: Two-factor authentication
      - generic [ref=e52]: © 2026 AirPak Express. All rights reserved.
    - generic [ref=e54]:
      - button "User Portal" [ref=e56] [cursor=pointer]:
        - img [ref=e57]
        - text: User Portal
      - generic [ref=e60]:
        - img [ref=e61]
        - generic [ref=e65]: 2FA Protected Login
      - generic [ref=e66]:
        - generic [ref=e67]:
          - heading "Welcome Back" [level=2] [ref=e68]
          - paragraph [ref=e69]: Sign in to your account
        - generic [ref=e70]:
          - generic [ref=e71]:
            - generic [ref=e72]: Email Address
            - generic [ref=e73]:
              - img [ref=e74]
              - textbox "you@example.com" [ref=e77]
          - generic [ref=e78]:
            - generic [ref=e79]: Password
            - generic [ref=e80]:
              - img [ref=e81]
              - textbox "••••••••" [ref=e84]
              - button "Show password" [ref=e85] [cursor=pointer]:
                - img [ref=e86]
          - button "Forgot password?" [ref=e90] [cursor=pointer]
        - generic [ref=e91] [cursor=pointer]:
          - generic [ref=e95]: I'm not a robot
          - generic [ref=e96]: reCAPTCHA
        - button "Sign In with 2FA" [disabled] [ref=e97]:
          - text: Sign In with 2FA
          - img [ref=e98]
        - paragraph [ref=e100]:
          - text: Don't have an account?
          - button "Sign up" [ref=e101] [cursor=pointer]
  - generic [ref=e102] [cursor=pointer]:
    - generic [ref=e105]: Created by MiniMax Agent
    - generic [ref=e106]: ×
```

# Test source

```ts
  20  |       await page.goto('/');
  21  |       await page.waitForTimeout(1000);
  22  | 
  23  |       // Check for login form elements
  24  |       const hasLoginForm = await page.getByPlaceholder(/you@example\.com/i).isVisible()
  25  |         .catch(() => page.getByRole('heading', { name: /welcome back/i }).isVisible())
  26  |         .catch(() => false);
  27  | 
  28  |       expect(hasLoginForm).toBeTruthy();
  29  |     });
  30  | 
  31  |     test('should redirect admin to admin login', async ({ page }) => {
  32  |       await page.goto('/admin/portal');
  33  |       await page.waitForTimeout(1000);
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
> 120 |       await expect(page.getByText(/track/i).or(page.getByText(/ai/i))).toBeVisible();
      |                                                                        ^ Error: expect(locator).toBeVisible() failed
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
  134 |       expect(hasAdminLogin).toBeTruthy();
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