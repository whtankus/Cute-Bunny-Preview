const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '..');
const read = relative => fs.readFileSync(path.join(root, relative), 'utf8');

test('core browser scripts parse without syntax errors', () => {
  for (const file of ['app.js', 'sw.js', 'scripts/build-preview.js']) {
    assert.doesNotThrow(() => new vm.Script(read(file), { filename: file }), file);
  }
});

test('the app shell references local stylesheets that exist', () => {
  const html = read('index.html');
  const stylesheets = [...html.matchAll(/<link\b[^>]*rel=["']stylesheet["'][^>]*href=["']([^"']+)["'][^>]*>/gi)]
    .map(match => match[1]);
  assert.ok(stylesheets.length >= 2, 'expected the main and polish stylesheets');

  for (const href of stylesheets) {
    if (/^https?:\/\//i.test(href)) continue;
    const file = decodeURIComponent(href.split('?')[0].replace(/^\.\//, ''));
    assert.ok(fs.existsSync(path.join(root, file)), 'missing stylesheet: ' + file);
  }
});

test('runtime scripts load configuration before the application', () => {
  const html = read('index.html');
  const configIndex = html.indexOf('src="supabase-config.js"');
  const appIndex = html.indexOf('src="app.js');
  assert.notEqual(configIndex, -1, 'Supabase configuration script must be present');
  assert.notEqual(appIndex, -1, 'application script must be present');
  assert.ok(configIndex < appIndex, 'configuration must load before app.js');
});

test('offline shell keeps navigation fallback and notification handling', () => {
  const sw = read('sw.js');
  assert.match(sw, /self\.addEventListener\(["']install["']/);
  assert.match(sw, /self\.addEventListener\(["']activate["']/);
  assert.match(sw, /self\.addEventListener\(["']fetch["']/);
  assert.match(sw, /cache\.match\(["']\.\/index\.html["']\)/);
  assert.match(sw, /self\.addEventListener\(["']notificationclick["']/);
});

test('build script copies the app shell and emits generated configuration', () => {
  const build = read('scripts/build-preview.js');
  for (const asset of ['index.html', 'app.js', 'style.css', 'polish.css', 'sw.js', 'manifest.webmanifest']) {
    assert.ok(build.includes("'" + asset + "'"), 'build asset list must include ' + asset);
  }
  assert.match(build, /SUPABASE_URL/);
  assert.match(build, /SUPABASE_PUBLISHABLE_KEY/);
});

test('Notes typing uses the same shared Broadcast channel as the working Cute Bunny app', () => {
  const app = read('app.js');
  assert.match(app, /sb\.channel\(['"]cute-bunny-notes-typing['"]\)/);
  assert.match(app, /\.on\(['"]broadcast['"], \{ event: ['"]typing['"] \}/);
  assert.match(app, /notesTypingChannelReady = true/);
  assert.match(app, /notesTypingQueuedState = null/);
  assert.doesNotMatch(app, /config: \{ private: true \}/);
  assert.doesNotMatch(app, /syncNotesTypingFriendChannels/);
  assert.doesNotMatch(app, /notesTypingFriendChannels/);
});

test('Virtual Buddy keeps its existing care controls while adding moods and compact reactions', () => {
  const app = read('app.js');
  const css = read('style.css');
  assert.match(app, /function getVirtualPetMood\(pet\)/);
  for (const mood of ['hungry', 'sleepy', 'delighted', 'loved', 'calm']) {
    assert.ok(app.includes("key: '" + mood + "'"), 'missing buddy mood: ' + mood);
  }
  const three = read('virtual-buddy-3d.js');
  assert.match(app, /id="virtualBuddy3D"/);
  assert.match(app, /data-action="/);
  assert.match(three, /three\.module\.js/);
  assert.match(three, /WebGLRenderer/);
  assert.match(three, /function buildBunny/);
  assert.match(three, /requestAnimationFrame/);
  assert.match(css, /\.sg-bunny-three-host/);
  assert.match(css, /\.sg-bunny-three-canvas/);

  assert.match(app, /lastActionType/);
  for (const action of ['feed', 'play', 'cuddle']) {
    assert.ok(app.includes('data-care-pet="' + action + '"'), 'missing existing care action: ' + action);
    assert.ok(css.includes('.sg-pet-action-' + action), 'missing care reaction: ' + action);
  }
  assert.match(css, /@media\s*\(prefers-reduced-motion:\s*reduce\)/);
  assert.match(app, /class="sg-pet-playground sg-pet-mood-/);
});
