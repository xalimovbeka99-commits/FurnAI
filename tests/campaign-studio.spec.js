const { test, expect } = require('@playwright/test');

test.describe('Campaign Concept Studio E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the Campaign Studio page before each test
    await page.goto('/studio');
  });

  test('should load the campaign studio forms correctly', async ({ page }) => {
    // Verify header title
    await expect(page.locator('h1')).toContainText('Campaign');
    await expect(page.locator('h1')).toContainText('Concept');
    await expect(page.locator('h1')).toContainText('Studio');

    // Verify input fields exist
    await expect(page.locator('textarea[placeholder*="monitor stand"]')).toBeVisible();
    await expect(page.locator('textarea[placeholder*="pre-orders"]')).toBeVisible();
    await expect(page.locator('input[placeholder*="Creative professionals"]')).toBeVisible();
    await expect(page.locator('select')).toBeVisible();

    // Verify suggest template section header is visible
    await expect(page.locator('text=Or choose a pre-configured scenario')).toBeVisible();
  });

  test('should populate fields when clicking suggestion presets', async ({ page }) => {
    // Find the first suggestion preset button (Modular Walnut desk organizer)
    const suggestionBtn = page.locator('button:has-text("Modular Walnut desk organizer")');
    await expect(suggestionBtn).toBeVisible();
    await suggestionBtn.click();

    // Verify the inputs are populated with corresponding suggestion details
    const productTextarea = page.locator('textarea[placeholder*="monitor stand"]');
    await expect(productTextarea).toHaveValue('Modular Walnut desk organizer with magnetic phone rest');

    const briefTextarea = page.locator('textarea[placeholder*="pre-orders"]');
    await expect(briefTextarea).toHaveValue('Increase holiday sales by offering a premium gift bundle');

    const audienceInput = page.locator('input[placeholder*="Creative professionals"]');
    await expect(audienceInput).toHaveValue('Remote software engineers and aesthetic desk creators');
  });

  test('should run full campaign synthesis lifecycle', async ({ page }) => {
    // 1. Populate form using a preset
    const presetBtn = page.locator('button:has-text("Ergonomic steel standing frame desk")');
    await expect(presetBtn).toBeVisible();
    await presetBtn.click();

    // 2. Submit synthesis request
    const submitBtn = page.locator('button[type="submit"]:has-text("Synthesize Campaign")');
    await expect(submitBtn).toBeVisible();
    await submitBtn.click();

    // 3. Assert loading state elements are displayed immediately
    const loadingHeader = page.locator('h3:has-text("Campaign Synthesis Engine Active")');
    await expect(loadingHeader).toBeVisible();

    // Assert that loading step descriptions are visible
    await expect(page.locator('text=[01/04] Establishing Client-Server Request handshake')).toBeVisible();

    // 4. Wait for results to return (increase timeout since API or fallback simulation might take time)
    // Note: Playwright waits for locator assertions dynamically, up to the default timeout (or custom timeout).
    const conceptHeader = page.locator('text=Concept Spec');
    await expect(conceptHeader).toBeVisible({ timeout: 20000 });

    // Assert generated campaign results are rendered
    await expect(page.locator('div[class*="border-emerald-500"], div[class*="border-amber-500"]')).toBeVisible();
    
    // Check main concept title is displayed
    const conceptTitle = page.locator('h3:not(:has-text("Campaign Synthesis Engine Active"))').first();
    await expect(conceptTitle).not.toBeEmpty();

    // 5. Test tab switching and interactions
    // Tab "Copy Variants" is default active. Assert that copy variants card items are displayed
    await expect(page.locator('text=Copy Copy 📋').first()).toBeVisible();

    // Switch to Visual Direction tab
    const visualTab = page.locator('button:has-text("Visual Direction")');
    await expect(visualTab).toBeVisible();
    await visualTab.click();
    
    // Assert visual direction image/prompt components load
    await expect(page.locator('text=Copy Prompt 📋').first()).toBeVisible();

    // Switch to Launch Checklist tab
    const checklistTab = page.locator('button:has-text("Launch Checklist")');
    await expect(checklistTab).toBeVisible();
    await checklistTab.click();

    // Assert checklist list loaded
    await expect(page.locator('text=Copy List 📋')).toBeVisible();

    // 6. Test checkbox toggle functionality
    const checklistItem = page.locator('div[class*="cursor-pointer"]:has-text("✓")').first();
    // Initially items are unchecked, checkmark element won't show the checkmark '✓' inside the checkmark box.
    // Actually, in page.js, the checkmark box displays `isDone && "✓"`.
    // Let's locate the first list item container to toggle it.
    const firstChecklistRow = page.locator('div[class*="cursor-pointer"]:has-text("Checklist") + div div[class*="cursor-pointer"]').first();
    if (await firstChecklistRow.count() > 0) {
      await expect(firstChecklistRow.locator('text=✓')).not.toBeVisible();
      await firstChecklistRow.click();
      await expect(firstChecklistRow.locator('text=✓')).toBeVisible();
      // Click again to untoggle
      await firstChecklistRow.click();
      await expect(firstChecklistRow.locator('text=✓')).not.toBeVisible();
    } else {
      // Fallback selector for checklist item rows
      const checkboxTextItem = page.locator('div[class*="cursor-pointer"]:has-text("Launch")').locator('..').locator('div[class*="cursor-pointer"]').first();
      await checkboxTextItem.click();
      await expect(checkboxTextItem.locator('text=✓')).toBeVisible();
    }
  });
});
