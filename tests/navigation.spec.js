const { test, expect } = require('@playwright/test');

test.describe('Navigation & Header E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to homepage before each test
    await page.goto('/');
  });

  test('should load the homepage and show logo', async ({ page }) => {
    // Verify the page title or logo text is present in the nav bar
    const navLogo = page.locator('nav a').first();
    await expect(navLogo).toBeVisible();
    await expect(navLogo).toContainText('Furni');
    await expect(navLogo).toContainText('AI');
  });

  test('should navigate to the Campaign Studio page', async ({ page }) => {
    // Click on Campaign Studio link in the navigation menu
    const studioLink = page.locator('nav a:has-text("Campaign Studio")').first();
    await expect(studioLink).toBeVisible();
    await studioLink.click();

    // Verify navigation and check URL and page header with compilation timeout margin
    await expect(page).toHaveURL(/\/studio/, { timeout: 15000 });
    await expect(page.locator('h1')).toContainText('Campaign');
    await expect(page.locator('h1')).toContainText('Studio');
  });

  test('should navigate to the Builder page', async ({ page }) => {
    const builderLink = page.locator('nav a:has-text("Builder")').first();
    await expect(builderLink).toBeVisible();
    await builderLink.click();

    await expect(page).toHaveURL(/\/builder/, { timeout: 15000 });
  });

  test('should navigate to the Gallery page', async ({ page }) => {
    const galleryLink = page.locator('nav a:has-text("Gallery")').first();
    await expect(galleryLink).toBeVisible();
    await galleryLink.click();

    await expect(page).toHaveURL(/\/gallery/, { timeout: 15000 });
  });

  test('should navigate to the Pricing page', async ({ page }) => {
    const pricingLink = page.locator('nav a:has-text("Pricing")').first();
    await expect(pricingLink).toBeVisible();
    await pricingLink.click();

    await expect(page).toHaveURL(/\/pricing/, { timeout: 15000 });
  });

  test('should navigate to the About page', async ({ page }) => {
    const aboutLink = page.locator('nav a:has-text("About")').first();
    await expect(aboutLink).toBeVisible();
    await aboutLink.click();

    await expect(page).toHaveURL(/\/about/, { timeout: 15000 });
  });

  test('should toggle dark/light theme options', async ({ page }) => {
    // Get theme toggle button
    const themeToggle = page.locator('button[aria-label*="Switch to"]').first();
    await expect(themeToggle).toBeVisible();
    
    // Check toggle functionality by clicking
    await themeToggle.click();
    // Verify toggle didn't crash the page and still exists
    await expect(themeToggle).toBeVisible();
  });
});
