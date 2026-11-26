const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');

test('Supabase client factory validates configuration and passes stable auth options', () => {
  const context = { window: {} };
  vm.runInNewContext(read('src/services/supabase-client.js'), context);
  const createClient = context.window.CuteBunnyServices.createSupabaseClient;
  assert.equal(createClient(null, { supabaseUrl: 'https://example.supabase.co', supabaseAnonKey: 'key' }), null);
  assert.equal(createClient({ createClient() {} }, { supabaseUrl: '', supabaseAnonKey: 'key' }), null);
  let received;
  const sdk = { createClient: (...args) => (received = args, { ready: true }) };
  const client = createClient(sdk, { supabaseUrl: 'https://example.supabase.co', supabaseAnonKey: 'public-key' });
  assert.equal(client.ready, true);
  assert.equal(received[0], 'https://example.supabase.co');
  assert.equal(received[1], 'public-key');
  assert.deepEqual(JSON.parse(JSON.stringify(received[2])), { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true } });
});

test('API service delegates registration through the injected Supabase client', async () => {
  const context = { window: { location: { href: 'https://cute-bunny.example/' } }, FormData, URL, console };
  vm.runInNewContext(read('src/services/api.js'), context);
  let received;
  const client = { auth: { signUp: async options => { received = options; return { data: { session: null, user: { id: 'user-1' } }, error: null }; } } };
  const api = context.window.CuteBunnyServices.createApi({
    client,
    getCurrentUser: () => null,
    fetchFriendHeartCounts: async () => new Map(),
    themes: ['rose']
  });
  const result = await api('/auth/register', { method: 'POST', body: JSON.stringify({ email: 'bunny@example.com', password: 'safe-password', username: 'bunny', displayName: 'Bunny' }) });
  assert.equal(result.user.id, 'user-1');
  assert.equal(result.needsEmailConfirm, true);
  assert.equal(received.options.data.username, 'bunny');
  assert.equal(received.options.data.display_name, 'Bunny');
});

test('media optimizer keeps unsupported and GIF uploads unchanged', async () => {
  const context = { window: { CuteBunnyServices: {} }, console };
  vm.runInNewContext(read('src/services/media-optimizer.js'), context);
  const optimize = context.window.CuteBunnyServices.optimizePhotoUpload;
  const gif = { type: 'image/gif', name: 'memory.gif', size: 500 };
  const text = { type: 'text/plain', name: 'note.txt', size: 10 };
  assert.equal(await optimize(gif), gif);
  assert.equal(await optimize(text), text);
});

test('core DOM helpers expose query and HTML escaping without changing text content', () => {
  const element = { id: 'content' };
  const context = { window: {}, document: { querySelector: selector => selector === '#content' ? element : null } };
  vm.runInNewContext(read('src/core/dom.js'), context);
  assert.equal(context.window.CuteBunnyCore.query('#content'), element);
  assert.equal(context.window.CuteBunnyCore.escapeHtml('<b>&"'), '&lt;b&gt;&amp;&quot;');
});


test("feature modules are loaded before app.js", () => {
 const html = read("index.html");
 const appIndex = html.indexOf("src=\"app.js?v=36\"");
 for (const feature of ["home","photos","notes","music","friends","notifications","profile","streak"]) {
  const script = "src=\"src/features/" + feature + "/" + feature + ".js\"";
  assert.ok(html.indexOf(script) >= 0, feature + " module exists in HTML");
  assert.ok(html.indexOf(script) < appIndex, feature + " loads before app.js");
  assert.match(read("src/features/" + feature + "/" + feature + ".js"), /^\/\* .* feature functions/);
 }
});
