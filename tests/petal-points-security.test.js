const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const migration = fs.readFileSync(path.join(root, 'supabase/migrations/202611250001_verify_petal_reward_activity.sql'), 'utf8');

test('Petal Points grants validate persisted quest evidence', () => {
  assert.match(migration, /create or replace function private\\.daily_quest_slot_complete/);
  assert.match(migration, /create or replace function public\\.grant_petal_points/);
  assert.match(migration, /private\\.daily_quest_slot_complete\\(uid, reward_day, reward_slot\\)/);
  assert.match(migration, /The daily chest can only be claimed for today/);
  assert.match(migration, /Weekly reward must belong to the current week/);
  assert.match(migration, /Not enough verified daily quest sets/);
  assert.match(migration, /bear_hug_action_receipts/);
  assert.match(migration, /public\\.memory_likes/);
  assert.match(migration, /public\\.memories/);
  assert.match(migration, /on conflict \\(user_id, grant_key\\) do nothing/);
  assert.match(migration, /revoke all on function public\\.grant_petal_points/);
});
