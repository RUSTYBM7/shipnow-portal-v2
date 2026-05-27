# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: portal.spec.ts >> ShipNow Portal - Internal Pages E2E Tests >> Authentication Guards >> should redirect to login when accessing portal without auth
- Location: e2e/portal.spec.ts:6:5

# Error details

```
Error: expect(received).toBeTruthy()

Received: false
```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - generic [ref=e3]:
    - complementary [ref=e4]:
      - link "AirPakShipNow" [ref=e6] [cursor=pointer]:
        - /url: /
        - img [ref=e8]
        - generic [ref=e12]: AirPakShipNow
      - navigation [ref=e13]:
        - link "Dashboard" [ref=e14] [cursor=pointer]:
          - /url: /portal
          - img [ref=e15]
          - generic [ref=e20]: Dashboard
        - link "New Shipment New" [ref=e21] [cursor=pointer]:
          - /url: /portal/create
          - img [ref=e22]
          - generic [ref=e24]: New Shipment
          - generic [ref=e25]: New
        - link "Shipments" [ref=e26] [cursor=pointer]:
          - /url: /portal/shipments
          - img [ref=e27]
          - generic [ref=e31]: Shipments
        - link "Tracking" [ref=e32] [cursor=pointer]:
          - /url: /portal/tracking
          - img [ref=e33]
          - generic [ref=e36]: Tracking
        - link "Payments" [ref=e37] [cursor=pointer]:
          - /url: /portal/payments
          - img [ref=e38]
          - generic [ref=e40]: Payments
        - link "Rewards" [ref=e41] [cursor=pointer]:
          - /url: /portal/rewards
          - img [ref=e42]
          - generic [ref=e46]: Rewards
        - link "Support" [ref=e47] [cursor=pointer]:
          - /url: /portal/support
          - img [ref=e48]
          - generic [ref=e50]: Support
        - link "Settings" [ref=e51] [cursor=pointer]:
          - /url: /portal/settings
          - img [ref=e52]
          - generic [ref=e55]: Settings
      - generic [ref=e56]:
        - link "U User bronze Member" [ref=e57] [cursor=pointer]:
          - /url: /portal/profile
          - generic [ref=e58]: U
          - generic [ref=e59]:
            - paragraph [ref=e60]: User
            - paragraph [ref=e61]: bronze Member
        - button "Sign Out" [ref=e62] [cursor=pointer]:
          - img [ref=e63]
          - generic [ref=e66]: Sign Out
    - generic [ref=e67]:
      - banner [ref=e68]:
        - generic [ref=e69]:
          - img [ref=e70]
          - textbox "Search shipments..." [ref=e73]
        - generic [ref=e74]:
          - button "3" [ref=e76] [cursor=pointer]:
            - img [ref=e77]
            - generic [ref=e80]: "3"
          - link "U" [ref=e81] [cursor=pointer]:
            - /url: /portal/profile
      - generic [ref=e82]:
        - generic [ref=e83]:
          - heading "Dashboard" [level=1] [ref=e84]
          - paragraph [ref=e85]: Welcome back, John!
        - generic [ref=e86]:
          - button "New Shipment Create a new shipment" [ref=e87] [cursor=pointer]:
            - img [ref=e89]
            - paragraph [ref=e91]: New Shipment
            - paragraph [ref=e92]: Create a new shipment
          - button "Track Package Track your orders" [ref=e93] [cursor=pointer]:
            - img [ref=e95]
            - paragraph [ref=e98]: Track Package
            - paragraph [ref=e99]: Track your orders
          - button "Support Chat with us" [ref=e100] [cursor=pointer]:
            - img [ref=e102]
            - paragraph [ref=e104]: Support
            - paragraph [ref=e105]: Chat with us
          - button "Rewards View points & perks" [ref=e106] [cursor=pointer]:
            - img [ref=e108]
            - paragraph [ref=e112]: Rewards
            - paragraph [ref=e113]: View points & perks
        - generic [ref=e114]:
          - button "Active Shipments 3 +3 this week" [ref=e115] [cursor=pointer]:
            - generic [ref=e116]:
              - generic [ref=e117]:
                - paragraph [ref=e118]: Active Shipments
                - paragraph [ref=e119]: "3"
                - paragraph [ref=e120]: +3 this week
              - img [ref=e122]
            - img [ref=e126]
          - button "In Transit 1 2 arriving today" [ref=e128] [cursor=pointer]:
            - generic [ref=e129]:
              - generic [ref=e130]:
                - paragraph [ref=e131]: In Transit
                - paragraph [ref=e132]: "1"
                - paragraph [ref=e133]: 2 arriving today
              - img [ref=e135]
            - img [ref=e140]
          - button "Delivered 2 +12 this month" [ref=e142] [cursor=pointer]:
            - generic [ref=e143]:
              - generic [ref=e144]:
                - paragraph [ref=e145]: Delivered
                - paragraph [ref=e146]: "2"
                - paragraph [ref=e147]: +12 this month
              - img [ref=e149]
            - img [ref=e152]
          - button "Total Shipments 5 +5 this month" [ref=e154] [cursor=pointer]:
            - generic [ref=e155]:
              - generic [ref=e156]:
                - paragraph [ref=e157]: Total Shipments
                - paragraph [ref=e158]: "5"
                - paragraph [ref=e159]: +5 this month
              - img [ref=e161]
            - img [ref=e163]
        - generic [ref=e165]:
          - generic [ref=e166]:
            - generic [ref=e167]:
              - img [ref=e168]
              - heading "AI Insights" [level=3] [ref=e170]
              - generic [ref=e171]: Beta
            - generic [ref=e172]:
              - generic [ref=e174]:
                - img [ref=e176]
                - generic [ref=e179]:
                  - generic [ref=e180]:
                    - heading "Save 23% on your next shipment" [level=4] [ref=e181]
                    - button [ref=e182] [cursor=pointer]:
                      - img [ref=e183]
                  - paragraph [ref=e186]: Switching to bulk monthly billing could save you $142/month.
                  - button "Take action" [ref=e187] [cursor=pointer]:
                    - text: Take action
                    - img [ref=e188]
              - generic [ref=e191]:
                - img [ref=e193]
                - generic [ref=e195]:
                  - generic [ref=e196]:
                    - heading "Package arriving early" [level=4] [ref=e197]
                    - button [ref=e198] [cursor=pointer]:
                      - img [ref=e199]
                  - paragraph [ref=e202]: "Shipment #APK88421 is predicted to arrive 1.5 days ahead of schedule."
                  - button "Take action" [ref=e203] [cursor=pointer]:
                    - text: Take action
                    - img [ref=e204]
              - generic [ref=e207]:
                - img [ref=e209]
                - generic [ref=e211]:
                  - generic [ref=e212]:
                    - heading "Verify your address" [level=4] [ref=e213]
                    - button [ref=e214] [cursor=pointer]:
                      - img [ref=e215]
                  - paragraph [ref=e218]: Your default delivery address needs verification to avoid delays.
                  - button "Take action" [ref=e219] [cursor=pointer]:
                    - text: Take action
                    - img [ref=e220]
          - generic [ref=e222]:
            - generic [ref=e223]:
              - heading "Recent Shipments" [level=3] [ref=e224]
              - button "View All" [ref=e225] [cursor=pointer]
            - generic [ref=e226]:
              - button "APK20240525001234 London, United Kingdom In Transit May 23" [ref=e227] [cursor=pointer]:
                - generic [ref=e228]:
                  - img [ref=e230]
                  - generic [ref=e234]:
                    - paragraph [ref=e235]: APK20240525001234
                    - paragraph [ref=e236]: London, United Kingdom
                - generic [ref=e237]:
                  - text: In Transit
                  - paragraph [ref=e238]: May 23
              - button "APK20240524001233 Sydney, Australia Delivered May 20" [ref=e239] [cursor=pointer]:
                - generic [ref=e240]:
                  - img [ref=e242]
                  - generic [ref=e246]:
                    - paragraph [ref=e247]: APK20240524001233
                    - paragraph [ref=e248]: Sydney, Australia
                - generic [ref=e249]:
                  - text: Delivered
                  - paragraph [ref=e250]: May 20
              - button "APK20240523001232 New York, United States Pending May 23" [ref=e251] [cursor=pointer]:
                - generic [ref=e252]:
                  - img [ref=e254]
                  - generic [ref=e258]:
                    - paragraph [ref=e259]: APK20240523001232
                    - paragraph [ref=e260]: New York, United States
                - generic [ref=e261]:
                  - text: Pending
                  - paragraph [ref=e262]: May 23
              - button "APK20240522001231 Tokyo, Japan Delivered May 18" [ref=e263] [cursor=pointer]:
                - generic [ref=e264]:
                  - img [ref=e266]
                  - generic [ref=e270]:
                    - paragraph [ref=e271]: APK20240522001231
                    - paragraph [ref=e272]: Tokyo, Japan
                - generic [ref=e273]:
                  - text: Delivered
                  - paragraph [ref=e274]: May 18
              - button "APK20240521001230 Paris, France Pending May 21" [ref=e275] [cursor=pointer]:
                - generic [ref=e276]:
                  - img [ref=e278]
                  - generic [ref=e282]:
                    - paragraph [ref=e283]: APK20240521001230
                    - paragraph [ref=e284]: Paris, France
                - generic [ref=e285]:
                  - text: Pending
                  - paragraph [ref=e286]: May 21
  - generic [ref=e287] [cursor=pointer]:
    - generic [ref=e290]: Created by MiniMax Agent
    - generic [ref=e291]: ×
```

# Test source

```ts
  1   | import { test, expect } from '@playwright/test';
  2   | 
  3   | test.describe('ShipNow Portal - Internal Pages E2E Tests', () => {
  4   |   // Test that pages properly redirect to login when unauthenticated
  5   |   test.describe('Authentication Guards', () => {
  6   |     test('should redirect to login when accessing portal without auth', async ({ page }) => {
  7   |       await page.goto('/portal/dashboard');
  8   |       await page.waitForTimeout(1000);
  9   | 
  10  |       // Should redirect to login page or show login UI
  11  |       const url = page.url();
  12  |       const hasLoginUI = await page.getByRole('button', { name: /sign in/i }).isVisible()
  13  |         .catch(() => page.getByText(/welcome back/i).isVisible())
  14  |         .catch(() => false);
  15  | 
> 16  |       expect(url.includes('/login') || url.includes('/auth') || url === '/' || hasLoginUI).toBeTruthy();
      |                                                                                            ^ Error: expect(received).toBeTruthy()
  17  |     });
  18  | 
  19  |     test('should show login page at root when not authenticated', async ({ page }) => {
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
```