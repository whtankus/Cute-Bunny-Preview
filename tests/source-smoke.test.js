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

test('Bear Hugs restores saved partners and keeps reward progression wired', () => {
  const bear = read('bear-hugs-progression.js');
  const styles = read('bear-hugs-progression.css');
  const html = read('index.html');
  assert.doesNotThrow(() => new vm.Script(bear, { filename: 'bear-hugs-progression.js' }));
  assert.match(bear, /Checking your saved Bearfriend connection/);
  assert.match(bear, /await loadPartnerRequests\(\)/);
  assert.match(bear, /set_bear_hug_equipment/);
  assert.match(bear, /data-bear-equip/);
  assert.match(bear, /bear-care-milestone/);
  assert.match(styles, /bear-reward-apply:disabled/);
  assert.match(styles, /bear-visual-cap/);
  assert.match(html, /bear-hugs-level-rewards-20261124-2/);
});

test('Bear Hugs uses one fixed level and a Care Point-based treasure collection', () => {
  const bear = read('bear-hugs-progression.js');
  const styles = read('bear-hugs-progression.css');
  assert.match(bear, /BEAR LEVEL<\\/small><b>1<\\/b>/);
  assert.doesNotMatch(bear, /reward\\.level|nextReward\\.level/);
  assert.match(bear, /unlockPoints: 100/);
  assert.match(bear, /unlockPoints: 350/);
  assert.match(bear, /unlockPoints: 1250/);
  assert.match(bear, /unlockPoints: 2150/);
  assert.match(bear, /unlockPoints: 3050/);
  assert.match(bear, /bear-reward-progress-pips/);
  assert.match(bear, /unlockedCount \\+ ' of ' \\+ REWARDS\\.length/);
  assert.match(styles, /bear-reward-pip\\.is-filled/);
  assert.match(styles, /bear-reward-count b/);
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

test('Virtual Buddy feature and its 3D module are fully removed', () => {
  const app = read('app.js');
  const html = read('index.html');
  const css = read('style.css');
  const sw = read('sw.js');
  const build = read('scripts/build-preview.js');
  const workflow = read('.github/workflows/deploy-pages.yml');
  assert.doesNotMatch(app, /renderVirtualPet|careForVirtualPet|readVirtualPet|data-care-pet|virtualBuddy3D/);
  assert.doesNotMatch(html, /virtual-buddy-3d/);
  assert.doesNotMatch(css, /sg-bunny-three|sg-virtual-pet|sg-pet-playground|Virtual Buddy/);
  assert.doesNotMatch(sw, /virtual-buddy-3d/);
  assert.doesNotMatch(build, /virtual-buddy-3d/);
  assert.doesNotMatch(workflow, /virtual-buddy-3d/);
  assert.ok(!fs.existsSync(path.join(root, 'virtual-buddy-3d.js')));
});


test('streak entry button and thumbnail play boing on pointer and keyboard activation', () => {
  const app = read('app.js');
  const start = app.indexOf('// Streak entry uses capture phase');
  const end = app.indexOf('// Homepage feature cards', start);
  const handlers = app.slice(start, end);
  assert.match(handlers, /if \(streakButton\) playCuteSound\('boing'\)/);
  assert.match(handlers, /playCuteSound\('boing'\);\s*openStreakGarden\(\);/);
});
