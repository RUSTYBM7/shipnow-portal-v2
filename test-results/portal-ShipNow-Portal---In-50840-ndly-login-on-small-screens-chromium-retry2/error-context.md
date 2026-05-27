# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: portal.spec.ts >> ShipNow Portal - Internal Pages E2E Tests >> Responsive Design >> should show mobile-friendly login on small screens
- Location: e2e/portal.spec.ts:152:5

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByPlaceholder(/you@example\.com/i).or(getByRole('heading', { name: /welcome back/i }))
Expected: visible
Error: strict mode violation: getByPlaceholder(/you@example\.com/i).or(getByRole('heading', { name: /welcome back/i })) resolved to 2 elements:
    1) <h2 class="text-2xl font-bold text-white">Welcome Back</h2> aka getByRole('heading', { name: 'Welcome Back' })
    2) <input value="" required="" type="email" autocomplete="email" placeholder="you@example.com" class="w-full pl-12 pr-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"/> aka getByRole('textbox', { name: 'you@example.com' })

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for getByPlaceholder(/you@example\.com/i).or(getByRole('heading', { name: /welcome back/i }))

```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - generic [ref=e5]:
    - img "AirPak Express" [ref=e8]
    - button "User Portal" [ref=e10] [cursor=pointer]:
      - img [ref=e11]
      - text: User Portal
    - generic [ref=e14]:
      - img [ref=e15]
      - generic [ref=e19]: 2FA Protected Login
    - generic [ref=e20]:
      - generic [ref=e21]:
        - heading "Welcome Back" [level=2] [ref=e22]
        - paragraph [ref=e23]: Sign in to your account
      - generic [ref=e24]:
        - generic [ref=e25]:
          - generic [ref=e26]: Email Address
          - generic [ref=e27]:
            - img [ref=e28]
            - textbox "you@example.com" [ref=e31]
        - generic [ref=e32]:
          - generic [ref=e33]: Password
          - generic [ref=e34]:
            - img [ref=e35]
            - textbox "••••••••" [ref=e38]
            - button "Show password" [ref=e39] [cursor=pointer]:
              - img [ref=e40]
        - button "Forgot password?" [ref=e44] [cursor=pointer]
      - generic [ref=e45] [cursor=pointer]:
        - generic [ref=e49]: I'm not a robot
        - generic [ref=e50]: reCAPTCHA
      - button "Sign In with 2FA" [disabled] [ref=e51]:
        - text: Sign In with 2FA
        - img [ref=e52]
      - paragraph [ref=e54]:
        - text: Don't have an account?
        - button "Sign up" [ref=e55] [cursor=pointer]
  - generic [ref=e56] [cursor=pointer]:
    - generic [ref=e59]: Created by MiniMax Agent
    - generic [ref=e60]: ×
```

# Test source

```ts
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
> 158 |       await expect(page.getByPlaceholder(/you@example\.com/i).or(page.getByRole('heading', { name: /welcome back/i }))).toBeVisible();
      |                                                                                                                         ^ Error: expect(locator).toBeVisible() failed
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