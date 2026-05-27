import { test, expect } from '@playwright/test';

// Skip if auth is not set up - these tests need authenticated users
test.describe.skip('Dashboard E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to dashboard
    await page.goto('/dashboard');

    // If redirected to auth, skip this test
    const currentUrl = page.url();
    if (currentUrl.includes('/auth')) {
      test.skip();
    }
  });

  test.describe('Dashboard Layout', () => {
    test('should display dashboard header', async ({ page }) => {
      await expect(page.getByText(/shipnow portal/i)).toBeVisible();
    });

    test('should display sidebar navigation', async ({ page }) => {
      await expect(page.getByText(/dashboard/i)).toBeVisible();
      await expect(page.getByText(/shipments/i)).toBeVisible();
      await expect(page.getByText(/analytics/i)).toBeVisible();
      await expect(page.getByText(/settings/i)).toBeVisible();
    });

    test('should display user menu', async ({ page }) => {
      await expect(page.locator('[data-testid="user-menu"]')).toBeVisible();
    });
  });

  test.describe('Dashboard Stats', () => {
    test('should display metrics cards', async ({ page }) => {
      await expect(page.getByText(/total shipments/i)).toBeVisible();
      await expect(page.getByText(/pending/i)).toBeVisible();
      await expect(page.getByText(/in transit/i)).toBeVisible();
      await expect(page.getByText(/delivered/i)).toBeVisible();
    });

    test('should display activity chart', async ({ page }) => {
      await expect(page.getByText(/recent activity/i)).toBeVisible();
    });
  });

  test.describe('Quick Actions', () => {
    test('should have create shipment button', async ({ page }) => {
      await expect(page.getByRole('button', { name: /new shipment/i })).toBeVisible();
    });
  });
});