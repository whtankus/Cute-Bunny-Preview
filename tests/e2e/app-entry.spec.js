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


test('registration rejects an invalid username before contacting Supabase', async ({ page }) => {
  await page.getByRole('button', { name: /Let's begin/ }).click();
  await page.locator('#authEmail').fill('bunny-test@example.invalid');
  await page.locator('#authDisplay').fill('Bunny Tester');
  await page.locator('#authUser').fill('ab');
  await page.locator('#authPass').fill('test-password-123');

  await page.locator('#authSubmit').click();

  await expect(page.locator('#authError')).toContainText(
    'Choose a username with 3–24 letters, numbers, or underscores.'
  );
  await expect(page.locator('#authGate')).toBeVisible();
});

test('sign-in displays Supabase invalid-credentials errors without entering the app', async ({ page }) => {
  await page.getByRole('button', { name: /Let's begin/ }).click();
  await page.locator('#authSwitch').click();

  await page.route('**/auth/v1/token?grant_type=password', async route => {
    await route.fulfill({
      status: 400,
      contentType: 'application/json',
      body: JSON.stringify({
        code: 'invalid_credentials',
        message: 'Invalid login credentials'
      })
    });
  });

  await page.locator('#authEmail').fill('bunny-test@example.invalid');
  await page.locator('#authPass').fill('incorrect-test-password');
  await page.locator('#authSubmit').click();

  await expect(page.locator('#authError')).toContainText('Invalid login credentials');
  await expect(page.locator('#authGate')).toBeVisible();
  await expect(page.locator('#app')).toBeHidden();
  await expect(page.locator('#authSubmit')).toBeEnabled();
});

test('main navigation keeps all five sections and accessible labels', async ({ page }) => {
  const nav = page.locator('#nav');
  const buttons = nav.locator('button[data-page]');

  await expect(nav).toHaveAttribute('aria-label', 'Main navigation');
  await expect(buttons).toHaveCount(5);
  await expect(buttons.nth(0)).toHaveAttribute('data-page', 'home');
  await expect(buttons.nth(0)).toContainText('Home');
  await expect(buttons.nth(1)).toHaveAttribute('data-page', 'gallery');
  await expect(buttons.nth(1)).toContainText('Photos');
  await expect(buttons.nth(2)).toHaveAttribute('data-page', 'music');
  await expect(buttons.nth(2)).toContainText('Music');
  await expect(buttons.nth(3)).toHaveAttribute('data-page', 'notes');
  await expect(buttons.nth(3)).toContainText('Notes');
  await expect(buttons.nth(4)).toHaveAttribute('data-page', 'friends');
  await expect(buttons.nth(4)).toContainText('Friends');
});

test('navigation buttons retain their raised 3D styling on desktop and mobile', async ({ page }) => {
  const styles = await page.locator('#nav button[data-page]').evaluateAll(buttons =>
    buttons.map(button => {
      const style = getComputedStyle(button);
      return {
        borderRadius: style.borderRadius,
        boxShadow: style.boxShadow,
        backgroundImage: style.backgroundImage,
        transitionProperty: style.transitionProperty
      };
    })
  );

  expect(styles).toHaveLength(5);
  for (const style of styles) {
    expect(style.borderRadius).toBe('15px');
    expect(style.boxShadow).not.toBe('none');
    expect(style.backgroundImage).toContain('linear-gradient');
    expect(style.transitionProperty).toContain('transform');
  }
});

async function mountSettingsHarness(page) {
  await page.evaluate(() => {
    document.querySelector('#profileSettingsMount')?.remove();
    const mount = document.createElement('div');
    mount.id = 'profileSettingsMount';
    const trigger = document.createElement('button');
    trigger.type = 'button';
    trigger.id = 'profileSettingsTrigger';
    trigger.setAttribute('aria-expanded', 'false');
    trigger.textContent = 'Settings';
    mount.append(trigger);
    document.body.append(mount);
  });
}

test('settings panel opens and closes without leaving its trigger expanded', async ({ page }) => {
  await mountSettingsHarness(page);
  const trigger = page.locator('#profileSettingsTrigger');

  await trigger.dispatchEvent('click');
  const panel = page.locator('#profileSettingsPanel');
  await expect(panel).toBeVisible();
  await expect(trigger).toHaveAttribute('aria-expanded', 'true');
  await expect(panel.locator('[data-settings-tab]')).toHaveCount(4);
  await expect(panel.locator('[data-settings-section="account"]')).toBeVisible();

  await page.locator('#profileSettingsClose').dispatchEvent('click');
  await expect(panel).toBeHidden();
  await expect(trigger).toHaveAttribute('aria-expanded', 'false');
});

test('settings tabs switch sections and clicking outside dismisses the panel', async ({ page }) => {
  await mountSettingsHarness(page);
  const trigger = page.locator('#profileSettingsTrigger');
  await trigger.dispatchEvent('click');

  const appearanceTab = page.locator('[data-settings-tab="appearance"]');
  await appearanceTab.dispatchEvent('click');
  await expect(appearanceTab).toHaveAttribute('aria-selected', 'true');
  await expect(page.locator('[data-settings-section="appearance"]')).toBeVisible();
  await expect(page.locator('[data-settings-section="account"]')).toBeHidden();

  await page.evaluate(() => document.body.dispatchEvent(new MouseEvent('click', { bubbles: true })));
  await expect(page.locator('#profileSettingsPanel')).toBeHidden();
  await expect(trigger).toHaveAttribute('aria-expanded', 'false');
});

test('appearance choices update the selected theme and buddy without saving', async ({ page }) => {
  await mountSettingsHarness(page);
  await page.locator('#profileSettingsTrigger').dispatchEvent('click');
  await page.locator('[data-settings-tab="appearance"]').dispatchEvent('click');

  const sage = page.locator('[data-settings-theme-choice="sage"]');
  await sage.dispatchEvent('click');
  await expect(page.locator('#settingsThemeValue')).toHaveValue('sage');
  await expect(sage).toHaveAttribute('aria-checked', 'true');
  await expect(page.locator('body')).toHaveAttribute('data-theme', 'sage');

  const kitty = page.locator('[data-settings-buddy-choice="🐱"]');
  await kitty.dispatchEvent('click');
  await expect(page.locator('#settingsBuddyValue')).toHaveValue('🐱');
  await expect(kitty).toHaveAttribute('aria-checked', 'true');
  await expect(page.locator('#profileSettingsSave')).toBeEnabled();
});
