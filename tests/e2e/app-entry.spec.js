const { test, expect } = require('@playwright/test');

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('#welcome')).toBeVisible();
});

test('welcome screen renders with a usable primary action', async ({ page }) => {
  await expect(page).toHaveTitle(/Cute Bunny/);
  await expect(page.getByRole('heading', { name: /Cute Bunny/ })).toBeVisible();
  await expect(page.getByRole('button', { name: /Let's begin/ })).toBeVisible();
});

test('welcome action opens the registration form', async ({ page }) => {
  await page.getByRole('button', { name: /Let's begin/ }).click();

  await expect(page.locator('#authGate')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Create your account' })).toBeVisible();
  await expect(page.locator('#authEmail')).toHaveAttribute('type', 'email');
  await expect(page.locator('#authDisplay')).toBeVisible();
  await expect(page.locator('#authUser')).toBeVisible();
  await expect(page.locator('#authPass')).toHaveAttribute('autocomplete', 'new-password');
});

test('registration and sign-in modes switch without losing the welcome flow', async ({ page }) => {
  await page.getByRole('button', { name: /Let's begin/ }).click();
  await page.locator('#authSwitch').click();

  await expect(page.getByRole('heading', { name: 'Welcome back ♡' })).toBeVisible();
  await expect(page.locator('#authEmail')).toHaveAttribute('type', 'text');
  await expect(page.locator('#authEmail')).toHaveAttribute('placeholder', 'Username or email');
  await expect(page.locator('#authDisplay')).toBeHidden();
  await expect(page.locator('#authUser')).toBeHidden();
  await expect(page.locator('#authPass')).toHaveAttribute('autocomplete', 'current-password');

  await page.locator('#authSwitch').click();
  await expect(page.getByRole('heading', { name: 'Create your account' })).toBeVisible();
  await expect(page.locator('#authDisplay')).toBeVisible();
  await expect(page.locator('#authUser')).toBeVisible();
});

test('welcome screen fits the viewport without horizontal page overflow', async ({ page }) => {
  const dimensions = await page.evaluate(() => ({
    viewport: document.documentElement.clientWidth,
    page: document.documentElement.scrollWidth
  }));
  expect(dimensions.page).toBeLessThanOrEqual(dimensions.viewport + 1);
  await expect(page.getByRole('button', { name: /Let's begin/ })).toBeInViewport();
});
