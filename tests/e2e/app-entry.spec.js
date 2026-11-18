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
    document.body.append(trigger, mount);
  });
}

async function mountSignedInApp(page) {
  await page.route('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2', route => route.abort());
  await page.addInitScript(() => {
    const profile = {
      id: 'e2e-user',
      username: 'bunny_tester',
      display_name: 'Bunny Tester',
      displayName: 'Bunny Tester',
      bio: '',
      theme: 'rose',
      mascot: '🐰',
      gender: null,
      created_at: '2026-01-01T00:00:00.000Z',
      login_streak: 1,
      last_login_date: new Date().toISOString().slice(0, 10),
      streak_timezone: 'UTC'
    };
    const session = {
      access_token: 'e2e-session-token',
      refresh_token: 'e2e-refresh-token',
      user: { id: profile.id, email: 'bunny@example.invalid' }
    };
    const rowsFor = table => {
      if (table === 'profiles') return profile;
      if (table === 'profile_private_settings') return { notification_preferences: { memories: true, buddy: true } };
      return [];
    };
    const makeQuery = table => {
      const state = { action: 'select' };
      let query;
      query = new Proxy({}, {
        get(_target, property) {
          if (property === 'then') {
            return (resolve, reject) => Promise.resolve({ data: rowsFor(table), error: null }).then(resolve, reject);
          }
          if (property === 'single') {
            return async () => ({ data: rowsFor(table), error: null });
          }
          if (property === 'maybeSingle') {
            return async () => ({
              data: table === 'profile_private_settings' ? rowsFor(table) : null,
              error: null
            });
          }
          if (['insert', 'update', 'upsert', 'delete'].includes(property)) {
            return (..._args) => { state.action = property; return query; };
          }
          if (['select', 'eq', 'neq', 'in', 'is', 'order', 'limit', 'range', 'ilike', 'gte', 'lte', 'match'].includes(property)) {
            return (..._args) => query;
          }
          return undefined;
        }
      });
      return query;
    };
    const makeChannel = () => {
      const channel = {
        on() { return channel; },
        subscribe() { return channel; },
        presenceState() { return {}; },
        async track() { return 'ok'; },
        async send() { return 'ok'; },
        async unsubscribe() { return 'ok'; }
      };
      return channel;
    };
    window.supabase = {
      createClient() {
        return {
          auth: {
            async getSession() { return { data: { session }, error: null }; },
            async getUser() { return { data: { user: session.user }, error: null }; },
            async signOut() { return { error: null }; }
          },
          from: makeQuery,
          async rpc(name) {
            if (name === 'record_login_streak_for_timezone') {
              return { data: { login_streak: 1, last_login_date: new Date().toISOString().slice(0, 10), streak_timezone: 'UTC' }, error: null };
            }
            return { data: [], error: null };
          },
          channel: makeChannel,
          async removeChannel() { return 'ok'; },
          storage: {
            from() {
              return {
                async createSignedUrl() { return { data: { signedUrl: 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%221%22 height=%221%22/%3E' }, error: null }; },
                async upload() { return { data: {}, error: null }; },
                async remove() { return { data: [], error: null }; }
              };
            }
          },
          functions: { async invoke() { return { data: {}, error: null }; } }
        };
      }
    };
  });
  await page.reload();
  await expect(page.locator('#app')).toBeVisible();
  await expect(page.locator('#nav')).toBeVisible();
}

test('signed-in user can open Photos and Music empty states', async ({ page }) => {
  await mountSignedInApp(page);

  await page.locator('#nav button[data-page="gallery"]').click();
  await expect(page.getByRole('heading', { name: /Photo garden/ })).toBeVisible();
  await expect(page.locator('[data-upload="photo"]')).toBeVisible();
  await expect(page.locator('.photo-garden-grid .empty')).toContainText('waiting for its first photo');

  await page.locator('#nav button[data-page="music"]').click();
  await expect(page.getByRole('heading', { name: /Cozy music/ })).toBeVisible();
  await expect(page.locator('[data-upload="song"]')).toBeVisible();
  await expect(page.locator('.music-grid .empty')).toContainText('Add a song file');
});

test('signed-in user can open Notes and use the empty conversation composer', async ({ page }) => {
  await mountSignedInApp(page);
  await page.locator('#nav button[data-page="notes"]').click();

  await expect(page.locator('#chatThread')).toBeVisible();
  await expect(page.locator('.chat-empty')).toContainText('Your conversation starts here');
  await expect(page.locator('#chatInput')).toBeVisible();
  await expect(page.locator('#chatInput')).toHaveAttribute('maxlength', '1000');
  await expect(page.locator('#chatSend')).toBeHidden();
});

test('signed-in app sections do not create horizontal overflow on mobile', async ({ page }) => {
  await mountSignedInApp(page);
  for (const section of ['gallery', 'music', 'notes', 'friends']) {
    await page.locator('#nav button[data-page="' + section + '"]').click();
    const dimensions = await page.evaluate(() => ({
      viewport: document.documentElement.clientWidth,
      page: document.documentElement.scrollWidth
    }));
    expect(dimensions.page, section + ' section overflowed horizontally').toBeLessThanOrEqual(dimensions.viewport + 1);
  }
});

test('settings panel opens and closes without leaving its trigger expanded', async ({ page }) => {
  await mountSettingsHarness(page);
  const trigger = page.locator('#profileSettingsTrigger');

  await trigger.click();
  const panel = page.locator('#profileSettingsPanel');
  await expect(panel).toBeVisible();
  await expect(trigger).toHaveAttribute('aria-expanded', 'true');
  await expect(panel.locator('[data-settings-tab]')).toHaveCount(4);
  await expect(panel.locator('[data-settings-section="account"]')).toBeVisible();

  await page.locator('#profileSettingsClose').click();
  await expect(panel).toBeHidden();
  await expect(trigger).toHaveAttribute('aria-expanded', 'false');
});

test('settings tabs switch sections and clicking outside dismisses the panel', async ({ page }) => {
  await mountSettingsHarness(page);
  const trigger = page.locator('#profileSettingsTrigger');
  await trigger.click();

  const appearanceTab = page.locator('[data-settings-tab="appearance"]');
  await appearanceTab.click();
  await expect(appearanceTab).toHaveAttribute('aria-selected', 'true');
  await expect(page.locator('[data-settings-section="appearance"]')).toBeVisible();
  await expect(page.locator('[data-settings-section="account"]')).toBeHidden();

  await page.evaluate(() => document.body.dispatchEvent(new MouseEvent('click', { bubbles: true })));
  await expect(page.locator('#profileSettingsPanel')).toBeHidden();
  await expect(trigger).toHaveAttribute('aria-expanded', 'false');
});

test('appearance choices update the selected theme and buddy without saving', async ({ page }) => {
  await mountSettingsHarness(page);
  await page.locator('#profileSettingsTrigger').click();
  await page.locator('[data-settings-tab="appearance"]').click();

  const sage = page.locator('[data-settings-theme-choice="sage"]');
  await sage.click();
  await expect(page.locator('#settingsThemeValue')).toHaveValue('sage');
  await expect(sage).toHaveAttribute('aria-checked', 'true');
  await expect(page.locator('body')).toHaveAttribute('data-theme', 'sage');

  const kitty = page.locator('[data-settings-buddy-choice="🐱"]');
  await kitty.click();
  await expect(page.locator('#settingsBuddyValue')).toHaveValue('🐱');
  await expect(kitty).toHaveAttribute('aria-checked', 'true');
  await expect(page.locator('#profileSettingsSave')).toBeEnabled();
});
