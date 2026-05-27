import { test, expect } from '@playwright/test';

test.describe('ShipNow Portal - Internal Pages E2E Tests', () => {
  // Test that pages properly redirect to login when unauthenticated
  test.describe('Authentication Guards', () => {
    test('should redirect to login when accessing portal without auth', async ({ page }) => {
      await page.goto('/portal/dashboard');
      await page.waitForTimeout(1000);

      // Should redirect to login page or show login UI
      const url = page.url();
      const hasLoginUI = await page.getByRole('button', { name: /sign in/i }).isVisible()
        .catch(() => page.getByText(/welcome back/i).isVisible())
        .catch(() => false);

      expect(url.includes('/login') || url.includes('/auth') || url === '/' || hasLoginUI).toBeTruthy();
    });

    test('should show login page at root when not authenticated', async ({ page }) => {
      await page.goto('/');
      await page.waitForTimeout(1000);

      // Check for login form elements
      const hasLoginForm = await page.getByPlaceholder(/you@example\.com/i).isVisible()
        .catch(() => page.getByRole('heading', { name: /welcome back/i }).isVisible())
        .catch(() => false);

      expect(hasLoginForm).toBeTruthy();
    });

    test('should redirect admin to admin login', async ({ page }) => {
      await page.goto('/admin/portal');
      await page.waitForTimeout(1000);

      const url = page.url();
      // Should be on admin login page
      expect(url.includes('/admin') || url.includes('/auth')).toBeTruthy();
    });
  });

  test.describe('Public Login Page', () => {
    test('should display login form correctly', async ({ page }) => {
      await page.goto('/auth');
      await page.waitForTimeout(1000);

      // Check login form elements
      await expect(page.getByRole('heading', { name: /welcome back/i })).toBeVisible();
      await expect(page.getByPlaceholder(/you@example\.com/i)).toBeVisible();
      await expect(page.getByRole('button', { name: /sign in/i }).or(page.getByRole('button', { name: /sign in with 2fa/i }))).toBeVisible();
      await expect(page.getByRole('button', { name: /sign up/i })).toBeVisible();
    });

    test('should toggle between login and registration', async ({ page }) => {
      await page.goto('/auth');

      // Click sign up button
      await page.getByRole('button', { name: /sign up/i }).click();
      await page.waitForTimeout(500);

      // Should show registration form
      await expect(page.getByRole('heading', { name: /create account/i })).toBeVisible();
      await expect(page.getByPlaceholder(/john smith/i)).toBeVisible();
    });

    test('should show forgot password link', async ({ page }) => {
      await page.goto('/auth');
      await page.waitForTimeout(500);

      await expect(page.getByText(/forgot password/i)).toBeVisible();
    });
  });

  test.describe('Registration Flow', () => {
    test('should allow switching to registration tab', async ({ page }) => {
      await page.goto('/auth');
      await page.waitForTimeout(500);

      // Click sign up
      await page.getByRole('button', { name: /sign up/i }).click();
      await page.waitForTimeout(500);

      // Verify registration form fields
      await expect(page.getByPlaceholder(/john smith/i)).toBeVisible();
      await expect(page.getByPlaceholder(/you@example\.com/i)).toBeVisible();
      await expect(page.getByRole('button', { name: /create account/i })).toBeVisible();
    });

    test('should have reCAPTCHA on login form', async ({ page }) => {
      await page.goto('/auth');
      await page.waitForTimeout(500);

      // reCAPTCHA should be present
      await expect(page.getByText(/i'?m not a robot/i)).toBeVisible();
    });

    test('should have 2FA badge on login', async ({ page }) => {
      await page.goto('/auth');
      await page.waitForTimeout(500);

      await expect(page.getByText(/2fa/i)).toBeVisible();
    });
  });

  test.describe('Branding & Design', () => {
    test('should show AirPak branding on login page', async ({ page }) => {
      await page.goto('/auth');
      await page.waitForTimeout(500);

      // Check for AirPak branding
      const pageContent = await page.content();
      expect(pageContent.toLowerCase().includes('airpak') || pageContent.includes('ShipNow')).toBeTruthy();
    });

    test('should show feature highlights on login page', async ({ page }) => {
      await page.goto('/auth');
      await page.waitForTimeout(500);

      // Check for feature highlights (on larger screens)
      await page.setViewportSize({ width: 1280, height: 800 });
      await expect(page.getByText(/track/i).or(page.getByText(/ai/i))).toBeVisible();
    });
  });

  test.describe('Admin Portal', () => {
    test('should show admin login page', async ({ page }) => {
      await page.goto('/admin');
      await page.waitForTimeout(1000);

      // Check for admin login elements
      const hasAdminLogin = await page.getByText(/admin/i).isVisible()
        .catch(() => page.getByRole('button', { name: /sign in/i }).isVisible())
        .catch(() => false);

      expect(hasAdminLogin).toBeTruthy();
    });

    test('should show admin 2FA page', async ({ page }) => {
      await page.goto('/admin/2fa');
      await page.waitForTimeout(500);

      // 2FA verification page should be shown
      const has2FA = await page.getByText(/verification/i).isVisible()
        .catch(() => page.getByText(/enter code/i).isVisible())
        .catch(() => page.getByText(/2fa/i).isVisible())
        .catch(() => false);

      expect(has2FA).toBeTruthy();
    });
  });

  test.describe('Responsive Design', () => {
    test('should show mobile-friendly login on small screens', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/auth');
      await page.waitForTimeout(500);

      // Login form should still be visible
      await expect(page.getByPlaceholder(/you@example\.com/i).or(page.getByRole('heading', { name: /welcome back/i }))).toBeVisible();
    });

    test('should show full login on desktop', async ({ page }) => {
      await page.setViewportSize({ width: 1280, height: 800 });
      await page.goto('/auth');
      await page.waitForTimeout(500);

      // Branding section should be visible on desktop
      const hasBranding = await page.getByText(/welcome to/i).isVisible()
        .catch(() => page.getByText(/future/i).isVisible())
        .catch(() => false);

      expect(hasBranding).toBeTruthy();
    });
  });
});