import { Page, Request, Response } from '@playwright/test';

/**
 * Helper functions for E2E tests
 */

export async function waitForElementToBeVisible(
  page: Page,
  selector: string,
  timeout = 5000
): Promise<void> {
  await page.waitForSelector(selector, { state: 'visible', timeout });
}

export async function fillForm(
  page: Page,
  fields: Record<string, string>
): Promise<void> {
  for (const [selector, value] of Object.entries(fields)) {
    await page.fill(selector, value);
  }
}

export async function clickAndWait(
  page: Page,
  selector: string,
  waitMs = 500
): Promise<void> {
  await page.click(selector);
  await page.waitForTimeout(waitMs);
}

export async function dismissDialog(
  page: Page,
  action: 'accept' | 'dismiss' = 'accept'
): Promise<void> {
  page.on('dialog', async (dialog) => {
    if (action === 'accept') {
      await dialog.accept();
    } else {
      await dialog.dismiss();
    }
  });
}

export function interceptApiCalls(
  page: Page,
  urlPattern: string,
  handler: (request: Request) => void
): void {
  page.route(urlPattern, (route) => {
    const request = route.request();
    handler(request);
    route.continue();
  });
}

export async function simulateRecaptcha(page: Page): Promise<void> {
  // Click the reCAPTCHA checkbox if visible
  const recaptcha = page.getByText(/i'?m not a robot/i);
  if (await recaptcha.isVisible()) {
    await recaptcha.click();
    // Wait for verification
    await page.waitForTimeout(1500);
  }
}

export async function loginAsTestUser(
  page: Page,
  email = 'test@example.com',
  password = 'TestPassword123'
): Promise<void> {
  await page.goto('/auth');

  const emailInput = page.getByPlaceholder(/you@example\.com/i);
  const passwordInput = page.getByPlaceholder(/••••••••/i);

  await emailInput.fill(email);
  await passwordInput.fill(password);

  // Complete reCAPTCHA
  await simulateRecaptcha(page);

  // Submit
  await page.getByRole('button', { name: /sign in/i }).click();

  // Wait for redirect
  await page.waitForURL(/\/(dashboard|auth)/, { timeout: 10000 });
}

export async function logout(page: Page): Promise<void> {
  // Click user menu
  const userMenu = page.locator('[data-testid="user-menu"]').or(page.locator('button:has-text("User")'));
  if (await userMenu.isVisible()) {
    await userMenu.click();
    await page.waitForTimeout(300);

    // Click logout
    const logoutBtn = page.getByText(/logout|sign out/i);
    if (await logoutBtn.isVisible()) {
      await logoutBtn.click();
    }
  }
}

export async function takeScreenshot(
  page: Page,
  name: string
): Promise<void> {
  await page.screenshot({
    path: `e2e/screenshots/${name}-${Date.now()}.png`,
    fullPage: true,
  });
}

export function generateTestEmail(): string {
  const timestamp = Date.now();
  return `test-${timestamp}@example.com`;
}