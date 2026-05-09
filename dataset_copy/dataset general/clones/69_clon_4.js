import { test, expect } from '@playwright/test';

test.describe('my web application', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('../../static/index.html');
  });

  test('confirms site content and identification code', async ({ page }) => {
    const siteBrandElement = page.locator('a.brand');
    await expect(siteBrandElement).toHaveText('BaaS (1234)');
  });

});