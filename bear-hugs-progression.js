(() => {
'use strict';

const LEGACY_SELECTED_KEY = 'cuteBunnyBearSelectedFriend:v1';
const SELECTED_KEY_PREFIX = 'cuteBunnyBearSelectedFriend:v2:';
const LOVE_KEY = 'cuteBunnyBearLove:v1';
const EQUIPPED_KEY_PREFIX = 'cuteBunnyBearEquippedRewards:v1:';
const ACTIONS = new Set(['hug', 'kiss', 'flykiss', 'slap', 'hands', 'dance', 'pet', 'feed', 'sleep', 'tummy', 'idle']);
const REWARDS = [
  { id: 'sunset-meadow', level: 2, slot: 'background', previewClass: 'preview-forest', name: 'Whispering Forest', icon: '🌲', kind: 'Garden background', detail: 'A peaceful forest clearing with soft light and tiny fireflies', rarity: 'Rare' },
  { id: 'strawberry-hat', level: 5, slot: 'accessory', previewClass: 'preview-caps', name: 'Berry Bestie Caps', icon: '🧢', kind: 'Matching accessories', detail: 'A pair of adorable little caps for both bears', rarity: 'Rare' },
  { id: 'honey-bear', level: 8, slot: 'skin', previewClass: 'preview-honey', name: 'Golden Honey Bears', icon: '🍯', kind: 'Bear appearance', detail: 'A warm golden makeover with a soft honey glow', rarity: 'Epic' },
  { id: 'starry-set', level: 11, slot: 'background', previewClass: 'preview-starry', name: 'Moonlit Dreamscape', icon: '🌙', kind: 'Magical background', detail: 'A dreamy night sky, glowing stars and royal crowns', rarity: 'Legendary' }
];

const $ = (selector, root = document) => root.querySelector(selector);
const esc = value => String(value ?? '').replace(/[&<>"']/g, char => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
}[char]));
const getFriends = () => typeof friends !== 'undefined' && Array.isArray(friends) ? friends : [];
const getMe = () => typeof me !== 'undefined' ? me : null;
const getSupabase = () => typeof sb !== 'undefined' ? sb : null;
function selectedStorageKey(userId = getMe()?.id) {
  return userId ? SELECTED_KEY_PREFIX + String(userId) : '';
}
function saveSelectedFriend(id) {
  selectedFriendId = String(id || '');
  const key = selectedStorageKey();
  if (!key) return;
  try {
    if (selectedFriendId) localStorage.setItem(key, selectedFriendId);
    else localStorage.removeItem(key);
    localStorage.removeItem(LEGACY_SELECTED_KEY);
  } catch {}
}
function restoreSelectedFriend() {
  const user = getMe();
  if (!user?.id || !Array.isArray(partnerRequests)) return;
  const key = selectedStorageKey(user.id);
  let saved = '';
  try { saved = localStorage.getItem(key) || localStorage.getItem(LEGACY_SELECTED_KEY) || ''; } catch {}
  const accepted = partnerRequests.filter(row => row.status === 'accepted' &&
    (String(row.sender_id) === String(user.id) || String(row.recipient_id) === String(user.id)))
    .sort((a, b) => String(b.created_at || '').localeCompare(String(a.created_at || '')));
  const isValid = id => accepted.some(row => String(row.sender_id) === String(id) || String(row.recipient_id) === String(id));
  const chosen = isValid(saved) ? saved : accepted.length
    ? (String(accepted[0].sender_id) === String(user.id) ? String(accepted[0].recipient_id) : String(accepted[0].sender_id))
    : '';
  if (chosen !== selectedFriendId) {
    selectedFriendId = chosen;
    try { if (chosen) localStorage.setItem(key, chosen); else localStorage.removeItem(key); } catch {}
  }
  try { localStorage.removeItem(LEGACY_SELECTED_KEY); } catch {}
  updatePartnerChip();
  if (chosen) {
    void ensurePeerChannel(chosen);
    void loadSharedProgress();
  } else {
    sharedPoints = 0;
    equippedRewardIds = [];
    updateUI();
  }
}

let selectedFriendId = '';
let sharedPoints = 0;
let lastSharedAction = '';
let equippedRewardIds = [];
let actionInFlight = false;
let sharedProgressPairKey = '';
let sharedProgressInitialized = false;
let progressChannel = null;
let progressTopic = '';
let originalTrigger = typeof window.triggerBearAction === 'function' ? window.triggerBearAction : null;
let originalCloseRealtime = typeof window.closeRealtime === 'function' ? window.closeRealtime : null;
let ownChannel = null;
let ownTopic = '';
let ownReady = false;
let ownPromise = null;
let peerChannel = null;
let peerTopic = '';
let peerReady = false;
let peerPromise = null;
let peerGeneration = 0;
let pendingRemoteAction = null;
let pendingAction = null;
let bearFriendSearchResults = [];
let bearFriendSearchSequence = 0;
let requestChannel = null;
let requestTopic = '';
let requestRefreshTimer = null;

function getPoints() {
  return Math.max(0, Number(sharedPoints) || 0);
}
function announceSharedLevelUp(previousPoints, nextPoints) {
  const previousLevel = getLevel(previousPoints).level;
  const nextLevel = getLevel(nextPoints).level;
  if (nextLevel <= previousLevel) return;
  const unlocked = REWARDS.filter(reward => reward.level > previousLevel && reward.level <= nextLevel);
  if (!unlocked.length) return;
  const names = unlocked.map(reward => reward.name).join(', ');
  if (typeof toast === 'function') toast('New Bear Hugs reward unlocked: ' + names + ' ♡');
  else setStatus('New Bear Hugs reward unlocked: ' + names + ' ♡');
}
async function loadSharedProgress() {
  const user = getMe(), client = getSupabase();
  if (!user?.id || !selectedFriendId || !client || !isAcceptedPartner(selectedFriendId)) {
    sharedPoints = 0;
    lastSharedAction = '';
    sharedProgressPairKey = '';
    sharedProgressInitialized = false;
    updateUI();
    return;
  }
  const [low, high] = [String(user.id), String(selectedFriendId)].sort();
  const pairKey = low + ':' + high;
  if (pairKey !== sharedProgressPairKey) {
    sharedProgressPairKey = pairKey;
    sharedPoints = 0;
    lastSharedAction = '';
    sharedProgressInitialized = false;
  }
  const { data, error } = await client.from('bear_partner_progress')
    .select('love_points,last_action')
    .eq('partner_low', low)
    .eq('partner_high', high)
    .maybeSingle();
  if (error) {
    console.warn('Shared Bear Hugs progress could not load:', error.message || error);
    setStatus('Your shared Love Meter could not load. Please try again. ♡');
    return;
  }
  const previousPoints = sharedPoints;
  sharedPoints = Math.max(0, Number(data?.love_points) || 0);
  lastSharedAction = String(data?.last_action || '');
  loadEquippedRewards(pairKey);
  if (sharedProgressInitialized) announceSharedLevelUp(previousPoints, sharedPoints);
  sharedProgressInitialized = true;
  updateUI();
}
async function recordSharedAction(action, partnerId = selectedFriendId) {
  const user = getMe(), client = getSupabase();
  if (!user?.id || !partnerId || !client || !isAcceptedPartner(partnerId)) return false;
  const { data, error } = await client.rpc('record_bear_hug_action', { p_partner_id: partnerId, p_action: action });
  if (error) {
    console.warn('Shared Bear Hugs points could not be saved:', error.message || error);
    setStatus('Your bear moment was sent, but its Love Meter points could not be saved. ♡');
    return false;
  }
  const previousPoints = sharedPoints;
  sharedPoints = Math.max(0, Number(data) || 0);
  lastSharedAction = action;
  if (sharedProgressInitialized) announceSharedLevelUp(previousPoints, sharedPoints);
  sharedProgressInitialized = true;
  updateUI();
  return true;
}
function getLevel(points) {
  if (points < 100) return { level: 1, previous: 0, next: 100 };
  if (points < 150) return { level: 2, previous: 100, next: 150 };
  if (points < 200) return { level: 3, previous: 150, next: 200 };
  if (points < 350) return { level: 4, previous: 200, next: 350 };
  const level = 5 + Math.floor((points - 350) / 300);
  const previous = 350 + (level - 5) * 300;
  return { level, previous, next: previous + 300 };
}
function loadEquippedRewards(pairKey = sharedProgressPairKey) {
  try {
    const saved = JSON.parse(localStorage.getItem(EQUIPPED_KEY_PREFIX + pairKey) || '[]');
    equippedRewardIds = Array.isArray(saved) ? saved.filter(id => REWARDS.some(reward => reward.id === id)) : [];
  } catch { equippedRewardIds = []; }
}
function saveEquippedRewards() {
  if (!sharedProgressPairKey) return;
  try { localStorage.setItem(EQUIPPED_KEY_PREFIX + sharedProgressPairKey, JSON.stringify(equippedRewardIds)); } catch {}
}
function equipReward(id) {
  const reward = REWARDS.find(item => item.id === id);
  if (!reward || getLevel(getPoints()).level < reward.level) return;
  const active = equippedRewardIds.includes(id);
  if (active) equippedRewardIds = equippedRewardIds.filter(item => item !== id);
  else {
    if (reward.slot === 'background') equippedRewardIds = equippedRewardIds.filter(item => !REWARDS.some(other => other.id === item && other.slot === 'background'));
    equippedRewardIds = [...equippedRewardIds, id];
  }
  saveEquippedRewards();
  updateUI();
}
function updateUI() {
  const root = $('#coupleBearGame');
  if (!root) return;
  const points = getPoints(), level = getLevel(points);
  const percent = Math.max(0, Math.min(100, ((points - level.previous) / (level.next - level.previous)) * 100));
  const nextReward = REWARDS.find(reward => level.level < reward.level);
  const newlyUnlocked = REWARDS.filter(reward => level.level >= reward.level);
  let panel = $('#bearProgressionPanel', root);
  if (!panel) {
    panel = document.createElement('section');
    panel.id = 'bearProgressionPanel';
    panel.className = 'bear-progression-panel';
    const footer = $('.couple-bear-footer', root);
    if (footer) footer.insertAdjacentElement('afterend', panel);
    else root.appendChild(panel);
  }
  if (!panel.dataset.rewardHandler) {
    panel.dataset.rewardHandler = 'true';
    panel.addEventListener('click', event => {
      const button = event.target.closest('[data-bear-equip]');
      if (button) equipReward(button.dataset.bearEquip);
    });
  }
  const rewardCards = REWARDS.map((reward, index) => {
    const unlocked = level.level >= reward.level;
    const applied = equippedRewardIds.includes(reward.id);
    const previousReward = REWARDS[index - 1];
    const progressLabel = unlocked ? (applied ? 'Currently in your scene' : 'Ready to use') : (reward.level - level.level) + ' level' + (reward.level - level.level === 1 ? '' : 's') + ' away';
    return '<article class="bear-reward ' + (unlocked ? 'is-unlocked' : 'is-locked') + (applied ? ' is-applied' : '') + (nextReward?.id === reward.id ? ' is-next' : '') + '">' +
      '<div class="bear-reward-preview ' + reward.previewClass + '" aria-hidden="true"><span>' + reward.icon + '</span><i>✦</i><small>🐻　♡　🐻</small></div>' +
      '<div class="bear-reward-copy"><span class="bear-reward-kicker">' + reward.rarity + ' · LEVEL ' + reward.level + '</span><b>' + reward.name + '</b><small>' + reward.detail + '</small></div>' +
      '<div class="bear-reward-bottom"><span class="bear-reward-state">' + progressLabel + '</span>' +
      (unlocked ? '<button type="button" class="bear-reward-apply" data-bear-equip="' + reward.id + '" aria-pressed="' + applied + '">' + (applied ? 'Unequip' : 'Use reward') + '</button>' : '<span class="bear-reward-lock">🔒 ' + reward.kind + '</span>') +
      '</div></article>';
  }).join('');
  const rewardSummary = nextReward
    ? '<div class="bear-next-reward"><div class="bear-next-reward-art ' + nextReward.previewClass + '">' + nextReward.icon + '</div><div><small>NEXT TREASURE · LEVEL ' + nextReward.level + '</small><b>' + nextReward.name + '</b><span>' + Math.max(0, nextReward.level - level.level) + ' level' + (nextReward.level - level.level === 1 ? '' : 's') + ' to unlock · keep sharing little moments</span></div></div>'
    : '<div class="bear-next-reward bear-all-unlocked"><div class="bear-next-reward-art preview-starry">✧</div><div><small>THE COLLECTION IS YOURS</small><b>Every treasure unlocked!</b><span>Keep growing your shared Love Meter together.</span></div></div>';
  panel.innerHTML =
    '<div class="bear-meter-topline"><span>♡ YOUR SHARED LOVE JOURNEY</span><strong>LEVEL ' + level.level + '</strong></div>' +
    '<div class="bear-level-heading"><span class="bear-level-heart">♡</span><span><small>EVERY LITTLE MOMENT COUNTS</small><b>' + points.toLocaleString() + ' love points</b></span><strong>' + Math.round(percent) + '%<small>to Level ' + (level.level + 1) + '</small></strong></div>' +
    '<div class="bear-level-track" role="progressbar" aria-label="Progress to Bear Hugs level ' + (level.level + 1) + '" aria-valuemin="0" aria-valuemax="100" aria-valuenow="' + Math.round(percent) + '"><span style="width:' + percent + '%"></span></div>' +
    '<div class="bear-level-next"><span>' + (level.next - points).toLocaleString() + ' points left</span><span>' + level.next.toLocaleString() + ' points · Level ' + (level.level + 1) + '</span></div>' +
    rewardSummary +
    '<section class="bear-rewards"><div class="bear-rewards-heading"><div><b>Your little treasures</b><small>' + newlyUnlocked.length + ' of ' + REWARDS.length + ' rewards unlocked · unlock together, equip anytime</small></div><span class="bear-reward-count">' + newlyUnlocked.length + '/' + REWARDS.length + '</span></div><div class="bear-rewards-list">' +
    rewardCards + '</div></section>';
  const scene = $('.couple-bears-scene', root);
  if (scene) {
    scene.classList.toggle('bear-reward-sunset', equippedRewardIds.includes('sunset-meadow'));
    scene.classList.toggle('bear-reward-strawberry', equippedRewardIds.includes('strawberry-hat'));
    scene.classList.toggle('bear-reward-honey', equippedRewardIds.includes('honey-bear'));
    scene.classList.toggle('bear-reward-starry', equippedRewardIds.includes('starry-set'));
    const hats = scene.querySelectorAll('#rewardHat0, #rewardHat1');
    hats.forEach(hat => hat.setAttribute('visibility', equippedRewardIds.includes('strawberry-hat') ? 'visible' : 'hidden'));
  }
}
function partnerProfileFromRows(id) {
  for (const row of partnerRequests) {
    const sender = Array.isArray(row.sender) ? row.sender[0] : row.sender;
    const recipient = Array.isArray(row.recipient) ? row.recipient[0] : row.recipient;
    if (String(row.sender_id) === String(id) && sender) return sender;
    if (String(row.recipient_id) === String(id) && recipient) return recipient;
  }
  return null;
}
function getSelectedFriend() {
  return getFriends().find(friend => String(friend?.id) === selectedFriendId) || partnerProfileFromRows(selectedFriendId);
}
function setStatus(message) {
  const status = $('#coupleBearStatus');
  if (status) status.textContent = message;
}
let partnerRequests = [];
async function loadPartnerRequests() {
  const user = getMe(), client = getSupabase();
  if (!user?.id || !client) return;
  const { data, error } = await client.from('bear_partner_requests')
    .select('id,sender_id,recipient_id,status,created_at,sender:profiles!bear_partner_requests_sender_id_fkey(id,username,display_name,mascot),recipient:profiles!bear_partner_requests_recipient_id_fkey(id,username,display_name,mascot)')
    .or('sender_id.eq.' + user.id + ',recipient_id.eq.' + user.id)
    .order('created_at', { ascending: false }).limit(100);
  if (error) {
    console.warn('Bear Partner requests could not load:', error.message || error);
    partnerRequests = [];
    setStatus('Bearfriend requests could not load. Please try again. ♡');
    return false;
  }
  partnerRequests = data || [];
  restoreSelectedFriend();
  return true;
}
function isAcceptedPartner(id) {
  const uid = String(getMe()?.id || '');
  return partnerRequests.some(row => row.status === 'accepted' &&
    ((String(row.sender_id) === uid && String(row.recipient_id) === String(id)) ||
     (String(row.recipient_id) === uid && String(row.sender_id) === String(id))));
}
function requestFor(id) {
  const uid = String(getMe()?.id || '');
  return partnerRequests.find(row =>
    (String(row.sender_id) === uid && String(row.recipient_id) === String(id)) ||
    (String(row.recipient_id) === uid && String(row.sender_id) === String(id)));
}
function renderPickerList() {
  const modal = $('#bearFriendPicker');
  if (!modal) return;
  const uid = String(getMe()?.id || '');
  const incoming = partnerRequests.filter(row => row.status === 'pending' && String(row.recipient_id) === uid);
  const candidates = [...new Map([...getFriends(), ...(typeof friendResults !== 'undefined' ? friendResults : []), ...bearFriendSearchResults]
    .filter(friend => friend?.id && String(friend.id) !== uid)
    .map(friend => [String(friend.id), friend])).values()];

  const requestsHtml = incoming.length
    ? incoming.map(row => {
        const sender = Array.isArray(row.sender) ? row.sender[0] : row.sender || {};
        return '<article class="bear-request-row"><span class="bear-friend-avatar">' + esc(sender.mascot || '🐰') + '</span><span class="bear-request-copy"><b>' + esc(sender.display_name || sender.displayName || sender.username || 'A friend') + '</b><small>@' + esc(sender.username || '') + ' wants to be your Bearfriend</small></span><button class="bear-request-accept" data-bear-accept="' + esc(row.id) + '">Accept</button><button class="bear-request-decline" data-bear-decline="' + esc(row.id) + '" aria-label="Decline request">×</button></article>';
      }).join('')
    : '<div class="bear-request-empty">No Bearfriend requests yet. New requests will appear here. ♡</div>';

  const peopleHtml = candidates.length ? candidates.map(friend => {
    const id = String(friend.id), req = requestFor(id);
    let action = isAcceptedPartner(id)
      ? '<button class="bear-friend-choice-action is-accepted" data-bear-select="' + esc(id) + '">Choose Bearfriend</button>'
      : req?.status === 'pending' && String(req.sender_id) === uid
        ? '<span class="bear-request-state">Request sent</span><button class="bear-request-cancel" data-bear-cancel="' + esc(req.id) + '">Cancel</button>'
        : req?.status === 'pending'
          ? '<button class="bear-request-accept" data-bear-accept="' + esc(req.id) + '">Accept</button>'
          : '<button class="bear-friend-choice-action" data-bear-invite="' + esc(id) + '">Request Bearfriend</button>';
    return '<article class="bear-friend-choice"><span class="bear-friend-avatar">' + esc(friend.mascot || '🐰') + '</span><span class="bear-friend-choice-copy"><b>' + esc(friend.display_name || friend.displayName || friend.username || 'Friend') + '</b><small>@' + esc(friend.username || '') + '</small></span>' + action + '</article>';
  }).join('') : '<div class="bear-no-friends">Your friend list is empty. Search for a username above, or add friends from the Friends tab. ♡</div>';

  $('.bear-friend-picker-list', modal).innerHTML =
    '<section class="bear-request-section"><h4>Requests to be your Bearfriend</h4>' + requestsHtml + '</section>' +
    '<section class="bear-request-section"><h4>Request a friend to be your Bearfriend</h4>' + peopleHtml + '</section>';
}

async function sendPartnerInvite(id) {
  const user = getMe(), client = getSupabase();
  if (!user?.id || !client) return;
  await loadPartnerRequests();
  const existing = requestFor(id);
  if (existing?.status === 'accepted') { await chooseFriend(id); return; }
  if (existing?.status === 'pending') {
    if (String(existing.recipient_id) === String(user.id)) await answerPartnerInvite(existing.id, true);
    else setStatus('Your Bearfriend request is waiting for a reply. ♡');
    return;
  }
  const { error } = await client.from('bear_partner_requests').insert({ sender_id: user.id, recipient_id: id, status: 'pending' });
  if (error) { console.warn('Bearfriend request failed:', error.message || error); setStatus('Your Bearfriend request could not be sent. Please try again. ♡'); return; }
  await loadPartnerRequests();
  renderPickerList();
  setStatus('Bearfriend request sent. ♡');
}
async function cancelPartnerRequest(id) {
  const user = getMe(), client = getSupabase();
  if (!user?.id || !client) return;
  const { data, error } = await client.from('bear_partner_requests')
    .delete().eq('id', id).eq('sender_id', user.id).eq('status', 'pending')
    .select('id').maybeSingle();
  if (error || !data) {
    console.warn('Bearfriend request cancellation failed:', error?.message || error);
    setStatus('That request could not be cancelled. Please refresh and try again. ♡');
    return;
  }
  await loadPartnerRequests();
  renderPickerList();
  setStatus('Bearfriend request cancelled. ♡');
}
async function answerPartnerInvite(id, accept) {
  const user = getMe(), client = getSupabase();
  const { data, error } = await client.from('bear_partner_requests')
    .update({ status: accept ? 'accepted' : 'rejected', responded_at: new Date().toISOString() })
    .eq('id', id).eq('recipient_id', user.id).eq('status', 'pending')
    .select('sender_id').maybeSingle();
  if (error || !data) { console.warn('Bearfriend response failed:', error?.message || 'No matching pending request'); setStatus('Could not update that Bearfriend request. Please retry. ♡'); return; }
  await loadPartnerRequests();
  renderPickerList();
  if (accept) await chooseFriend(String(data.sender_id));
}
function ensurePicker() {
  if ($('#bearFriendPicker')) return;
  const modal = document.createElement('div');
  modal.id = 'bearFriendPicker';
  modal.className = 'bear-friend-picker hidden';
  modal.innerHTML = '<section class="bear-friend-picker-card" role="dialog" aria-modal="true" aria-labelledby="bearFriendPickerTitle"><button type="button" class="bear-friend-picker-close" aria-label="Close">×</button><span class="bear-picker-art">🐻 ♡ 🐻</span><small>YOUR LITTLE BEARFRIEND SPACE</small><h3 id="bearFriendPickerTitle">Become Bearfriends?</h3><p>Accept a request from a friend, or send one to someone you love. Your bears play together after both of you accept.</p><form class="bear-friend-search" id="bearFriendSearchForm"><input id="bearFriendSearchInput" type="search" maxlength="24" autocomplete="off" spellcheck="false" placeholder="Find a friend by username…" aria-label="Find a friend by username"><button type="submit">Find</button></form><div class="bear-friend-picker-list"><div class="bear-no-friends">Loading your requests and friends… ♡</div></div><p class="bear-picker-footnote">You can change your Bearfriend later. ♡</p></section>';
  document.body.appendChild(modal);
  modal.addEventListener('click', event => {
    if (event.target === modal || event.target.closest('.bear-friend-picker-close')) {
      pendingAction = null; modal.classList.add('hidden'); return;
    }
    const invite = event.target.closest('[data-bear-invite]');
    if (invite) { void sendPartnerInvite(invite.dataset.bearInvite); return; }
    const accept = event.target.closest('[data-bear-accept]');
    if (accept) { void answerPartnerInvite(accept.dataset.bearAccept, true); return; }
    const decline = event.target.closest('[data-bear-decline]');
    if (decline) { void answerPartnerInvite(decline.dataset.bearDecline, false); return; }
    const cancel = event.target.closest('[data-bear-cancel]');
    if (cancel) { void cancelPartnerRequest(cancel.dataset.bearCancel); return; }
    const select = event.target.closest('[data-bear-select]');
    if (select) void chooseFriend(select.dataset.bearSelect);
  });
  modal.addEventListener('submit', event => {
    if (!event.target.matches('#bearFriendSearchForm')) return;
    event.preventDefault();
    void searchBearFriends();
  });
}
async function searchBearFriends() {
  const input = $('#bearFriendSearchInput');
  const query = String(input?.value || '').trim();
  if (!query) { setStatus('Type a username to find your friend. ♡'); return; }
  if (!/^[a-zA-Z0-9_]{1,24}$/.test(query)) { setStatus('Usernames use letters, numbers, and underscores. ♡'); return; }
  if (typeof api !== 'function') { setStatus('Friend search is not available right now. ♡'); return; }
  const sequence = ++bearFriendSearchSequence;
  const list = $('.bear-friend-picker-list', $('#bearFriendPicker'));
  if (list) list.innerHTML = '<div class="bear-no-friends">Finding your friend… ♡</div>';
  try {
    const results = await api('/users?q=' + encodeURIComponent(query));
    if (sequence !== bearFriendSearchSequence) return;
    bearFriendSearchResults = Array.isArray(results) ? results : [];
    renderPickerList();
    if (!bearFriendSearchResults.length) setStatus('No matching friend found. Check the username and try again. ♡');
  } catch (error) {
    console.warn('Bearfriend friend search failed:', error?.message || error);
    if (list) list.innerHTML = '<div class="bear-no-friends">Could not search right now. Please try again. ♡</div>';
  }
}
async function openPicker(action = null) {
  if (action) pendingAction = action;
  ensurePicker();
  const modal = $('#bearFriendPicker');
  modal.classList.remove('hidden');
  $('.bear-friend-picker-list', modal).innerHTML = '<div class="bear-no-friends">Loading your requests and friends… ♡</div>';
  const needsFriendRefresh = !getFriends().length && !(typeof friendResults !== 'undefined' && friendResults.length) && typeof refresh === 'function';
  if (needsFriendRefresh) {
    try { await refresh(); } catch (error) { console.warn('Friends could not refresh for Bearfriend picker:', error?.message || error); }
  }
  await loadPartnerRequests();
  renderPickerList();
}
function updatePartnerChip() {
  const root = $('#coupleBearGame');
  if (!root) return;
  let chip = $('.bear-partner-chip', root);
  if (!chip) {
    chip = document.createElement('button');
    chip.type = 'button';
    chip.className = 'bear-partner-chip';
    root.insertBefore(chip, $('.couple-bears-scene', root));
    chip.addEventListener('click', () => openPicker());
  }
  const friend = getSelectedFriend();
  chip.textContent = friend && isAcceptedPartner(selectedFriendId)
    ? '♡ Bearfriends with ' + (friend.display_name || friend.displayName || friend.username || 'Friend') + ' · Change'
    : '♡ Choose a Bearfriend';
}
function updateConnectionStatus() {
  if (!getSelectedFriend()) return;
  if (peerReady && ownReady) setStatus('Connected with ' + (getSelectedFriend().display_name || getSelectedFriend().displayName || getSelectedFriend().username || 'your friend') + '. Choose a little action together. ♡');
}
function closeChannel(channel) {
  const client = getSupabase();
  if (channel && client) {
    try { void client.removeChannel(channel); } catch {}
  }
}
function ensureOwnChannel() {
  const client = getSupabase();
  const user = getMe();
  if (!client || !user?.id) return Promise.resolve(false);
  const topic = 'cute-bunny-bear-actions-' + String(user.id);
  if (ownChannel && ownTopic === topic && ownReady) return Promise.resolve(true);
  if (ownChannel && ownTopic === topic && ownPromise) return ownPromise;
  closeChannel(ownChannel);
  ownChannel = null;
  ownTopic = topic;
  ownReady = false;
  ownPromise = new Promise(resolve => {
    let settled = false;
    const finish = value => {
      if (settled) return;
      settled = true;
      ownPromise = null;
      if (!value) {
        closeChannel(ownChannel);
        ownChannel = null;
        ownTopic = '';
        ownReady = false;
      }
      resolve(value);
    };
    const channel = client.channel(topic, { config: { broadcast: { self: false, ack: true } } })
      .on('broadcast', { event: 'bear-action' }, ({ payload }) => receiveAction(payload));
    ownChannel = channel;
    channel.subscribe(status => {
      if (channel !== ownChannel) return;
      ownReady = status === 'SUBSCRIBED';
      if (ownReady) {
        updateConnectionStatus();
        finish(true);
      } else if (['CHANNEL_ERROR', 'TIMED_OUT', 'CLOSED'].includes(status)) {
        ownReady = false;
        finish(false);
        console.warn('Bear Hugs receive channel status:', status);
      }
    });
    setTimeout(() => finish(ownReady), 6000);
  });
  return ownPromise;
}
async function ensurePeerChannel(friendId) {
  const client = getSupabase();
  if (!client || !friendId) return false;
  const topic = 'cute-bunny-bear-actions-' + String(friendId);
  if (peerChannel && peerTopic === topic && peerReady) return true;
  if (peerChannel && peerTopic === topic && peerPromise) return peerPromise;
  if (peerTopic !== topic) {
    peerGeneration++;
    closeChannel(peerChannel);
    peerChannel = null;
    peerTopic = topic;
    peerReady = false;
    peerPromise = null;
  }
  if (!peerChannel) peerChannel = client.channel(topic, { config: { broadcast: { self: false, ack: true } } });
  if (peerReady) return true;
  const generation = peerGeneration;
  const channel = peerChannel;
  peerPromise = new Promise(resolve => {
    let settled = false;
    const finish = value => {
      if (settled) return;
      settled = true;
      if (generation === peerGeneration) {
        peerPromise = null;
        if (!value) {
          closeChannel(peerChannel);
          peerChannel = null;
          peerTopic = '';
          peerReady = false;
        }
      }
      resolve(value);
    };
    channel.subscribe(status => {
      if (generation !== peerGeneration || channel !== peerChannel) return;
      peerReady = status === 'SUBSCRIBED';
      if (peerReady) {
        updateConnectionStatus();
        finish(true);
      } else if (['CHANNEL_ERROR', 'TIMED_OUT', 'CLOSED'].includes(status)) {
        peerReady = false;
        finish(false);
        console.warn('Bear Hugs send channel status:', status);
      }
    });
    setTimeout(() => finish(peerReady), 6000);
  });
  return peerPromise;
}
async function chooseFriend(id) {
  const friend = [...getFriends(), ...(typeof friendResults !== 'undefined' ? friendResults : []), partnerProfileFromRows(id)].find(item => item && String(item?.id) === String(id));
  if (!friend) return;
  await loadPartnerRequests();
  if (!isAcceptedPartner(id)) {
    setStatus('A Bearfriend request must be accepted before playing together. ♡');
    await openPicker();
    return;
  }
  saveSelectedFriend(String(friend.id));
  $('#bearFriendPicker')?.classList.add('hidden');
  updatePartnerChip();
  setStatus('Connecting your two little bears… ♡');
  const results = await Promise.all([ensureOwnChannel(), ensurePeerChannel(selectedFriendId)]);
  if (results.every(Boolean)) updateConnectionStatus();
  else setStatus('Your partner is selected, but the live connection is still reconnecting. Try an action again shortly. ♡');
  await loadSharedProgress();
  if (pendingAction) {
    const action = pendingAction;
    pendingAction = null;
    runLocalAction(action);
  }
}
async function sendAction(action, partnerId = selectedFriendId) {
  const friend = getFriends().find(item => String(item?.id) === String(partnerId)) || partnerProfileFromRows(partnerId);
  const user = getMe();
  const client = getSupabase();
  if (!friend || !user?.id || !client || !isAcceptedPartner(partnerId)) {
    setStatus('Choose a friend before starting your little moment. ♡');
    openPicker();
    return false;
  }
  const connected = await ensurePeerChannel(partnerId);
  if (!connected || !peerChannel) {
    setStatus('Your bears are trying to reconnect. Please try that action again in a moment. ♡');
    return false;
  }
  const payload = {
    action,
    userId: String(user.id),
    toUserId: String(partnerId),
    gender: user.gender || null,
    sentAt: Date.now()
  };
  try {
    const result = await peerChannel.send({ type: 'broadcast', event: 'bear-action', payload });
    if (result !== 'ok') {
      console.warn('Bear Hugs action was not delivered:', result);
      setStatus('That little moment could not reach your friend. Please try again. ♡');
      return false;
    }
    return true;
  } catch (error) {
    console.warn('Bear Hugs action send failed:', error?.message || error);
    setStatus('That little moment could not reach your friend. Please try again. ♡');
    return false;
  }
}
function applyRemoteAction(action, payload) {
  if (!ACTIONS.has(action)) return;
  const root = $('#coupleBearGame');
  if (root && typeof originalTrigger === 'function') {
    originalTrigger(action, { remote: true, gender: payload.gender });
    updateUI();
    const sender = getFriends().find(friend => String(friend?.id) === String(payload.userId));
    setStatus((sender?.display_name || sender?.displayName || sender?.username || 'Your friend') +
      ' chose ' + (action === 'hands' ? 'to hold paws' : action) + '. ♡');
  } else {
    // The sender records shared points once through the database RPC.
    // Never award a second copy on the receiving browser.
    pendingRemoteAction = { action, payload };
  }
}
function receiveAction(payload) {
  const user = getMe();
  if (!payload || !user?.id) return;
  if (String(payload.toUserId || '') !== String(user.id)) return;
  if (String(payload.userId || '') === String(user.id)) return;
  const senderIsFriend = getFriends().some(friend => String(friend?.id) === String(payload.userId)) || !!partnerProfileFromRows(payload.userId);
  if (!senderIsFriend || !isAcceptedPartner(payload.userId) || !ACTIONS.has(String(payload.action || ''))) return;
  // The recipient automatically pairs with the friend who initiated the shared action.
  saveSelectedFriend(String(payload.userId));
  updatePartnerChip();
  void ensurePeerChannel(selectedFriendId);
  applyRemoteAction(String(payload.action), payload);
}
function flushPendingRemoteAction() {
  if (!pendingRemoteAction || !$('#coupleBearGame') || typeof originalTrigger !== 'function') return;
  const pending = pendingRemoteAction;
  pendingRemoteAction = null;
  const scene = $('.couple-bears-scene');
  if (scene) scene.dataset.action = pending.action;
  if (typeof bearPoseEngine !== 'undefined') bearPoseEngine?.play(pending.action, String(pending.payload.gender || '').toLowerCase() === 'female' ? 1 : 0);
  const sender = getFriends().find(friend => String(friend?.id) === String(pending.payload.userId));
  setStatus((sender?.display_name || sender?.displayName || sender?.username || 'Your friend') +
    ' chose ' + (pending.action === 'hands' ? 'to hold paws' : pending.action) + '. ♡');
  updateUI();
}
async function runLocalAction(action) {
  if (!ACTIONS.has(action) || actionInFlight) return;
  if (!selectedFriendId || !getSelectedFriend() || !isAcceptedPartner(selectedFriendId)) {
    openPicker(action);
    return;
  }
  if (typeof originalTrigger === 'function') {
    actionInFlight = true;
    originalTrigger(action, { remote: true, gender: getMe()?.gender });
    updateUI();
  } else {
    setStatus('The bear animation is still loading. Please try again in a moment. ♡');
    return;
  }
  const partnerId = selectedFriendId;
  try {
    const delivered = await sendAction(action, partnerId);
    if (delivered) await recordSharedAction(action, partnerId);
  } finally {
    actionInFlight = false;
  }
}
function ensureProgressChannel() {
  const client = getSupabase(), user = getMe();
  if (!client || !user?.id) return;
  const topic = 'cute-bunny-bear-progress-' + String(user.id);
  if (progressChannel && progressTopic === topic) return;
  closeChannel(progressChannel);
  progressChannel = client.channel(topic)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'bear_partner_progress' }, () => {
      void loadSharedProgress();
    })
    .subscribe(status => {
      if (['CHANNEL_ERROR', 'TIMED_OUT', 'CLOSED'].includes(status)) {
        console.warn('Shared Bear Hugs progress updates unavailable:', status);
      }
    });
  progressTopic = topic;
}
function ensureRequestChannel() {
  const client = getSupabase(), user = getMe();
  if (!client || !user?.id) return;
  const topic = 'cute-bunny-bear-requests-' + String(user.id);
  if (requestChannel && requestTopic === topic) return;
  closeChannel(requestChannel);
  requestChannel = null;
  requestTopic = topic;
  requestChannel = client.channel(topic)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'bear_partner_requests' }, () => {
      if (requestRefreshTimer) clearTimeout(requestRefreshTimer);
      requestRefreshTimer = setTimeout(async () => {
        requestRefreshTimer = null;
        const loaded = await loadPartnerRequests();
        if (!loaded) return;
        restoreSelectedFriend();
        updatePartnerChip();
        updateUI();
        if (!$('#bearFriendPicker')?.classList.contains('hidden')) renderPickerList();
      }, 180);
    })
    .subscribe(status => {
      if (['CHANNEL_ERROR', 'TIMED_OUT', 'CLOSED'].includes(status)) console.warn('Bearfriend live request updates unavailable:', status);
    });
}
function startBearHugsRealtime() {
  ensureRequestChannel();
  ensureProgressChannel();
  void ensureOwnChannel();
  const userId = String(getMe()?.id || '');
  if (userId && !partnerRequests.some(row => String(row.sender_id) === userId || String(row.recipient_id) === userId)) {
    void loadPartnerRequests().then(loaded => {
      if (!loaded) return;
      restoreSelectedFriend();
      if (selectedFriendId && getSelectedFriend()) void ensurePeerChannel(selectedFriendId);
    });
  } else if (selectedFriendId && getSelectedFriend()) {
    void ensurePeerChannel(selectedFriendId);
  } else if (userId) {
    void loadPartnerRequests().then(loaded => {
      if (loaded) restoreSelectedFriend();
    });
  }
}
function closeBearHugsRealtime() {
  closeChannel(requestChannel);
  closeChannel(progressChannel);
  progressChannel = null;
  progressTopic = '';
  requestChannel = null;
  requestTopic = '';
  if (requestRefreshTimer) { clearTimeout(requestRefreshTimer); requestRefreshTimer = null; }
  closeChannel(ownChannel);
  closeChannel(peerChannel);
  ownChannel = peerChannel = null;
  ownTopic = peerTopic = '';
  ownReady = peerReady = false;
  ownPromise = peerPromise = null;
  peerGeneration++;
}

function install() {
  if (window.__cuteBunnyBearHugsFixed) return;
  window.__cuteBunnyBearHugsFixed = true;
  ensurePicker();

  // Delegate from document because the app replaces #content on every render.
  document.addEventListener('click', event => {
    const root = event.target.closest?.('#coupleBearGame');
    if (!root) return;
    const actionButton = event.target.closest('[data-couple-action]');
    const sceneTap = !actionButton && event.target.closest('.couple-bears-scene, #bearPoseSvg');
    if (!actionButton && !sceneTap) return;
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();
    const action = actionButton ? actionButton.dataset.coupleAction : 'pet';
    if (!selectedFriendId || !getSelectedFriend() || !isAcceptedPartner(selectedFriendId)) {
      void openPicker(action);
      return;
    }
    runLocalAction(action);
  }, true);

  if (typeof window.startBearRealtime === 'function') window.startBearRealtime = startBearHugsRealtime;
  if (typeof window.publishBearAction === 'function') window.publishBearAction = () => {};
  if (typeof window.closeRealtime === 'function') {
    window.closeRealtime = function() {
      closeBearHugsRealtime();
      return originalCloseRealtime ? originalCloseRealtime.apply(this, arguments) : undefined;
    };
  }

  let observedGameRoot = $('#coupleBearGame');
  const observer = new MutationObserver(() => {
    const currentRoot = $('#coupleBearGame');
    if (currentRoot === observedGameRoot) return;
    observedGameRoot = currentRoot;
    if (currentRoot) {
      updatePartnerChip();
      updateUI();
      flushPendingRemoteAction();
      // The Bearfriend chooser is intentionally opened by the first bear interaction,
      // not by an automatic page-load popup. This keeps the experience predictable.
    }
  });
  observer.observe(document.body, { childList: true, subtree: true });

  window.addEventListener('storage', event => {
    if (event.key === LOVE_KEY) updateUI();
    if (event.key === selectedStorageKey()) {
      selectedFriendId = localStorage.getItem(selectedStorageKey()) || '';
      updatePartnerChip();
      if (selectedFriendId) { void ensurePeerChannel(selectedFriendId); void loadSharedProgress(); }
    }
  });
  window.addEventListener('focus', () => {
    void loadPartnerRequests().then(() => {
      if (selectedFriendId && isAcceptedPartner(selectedFriendId)) startBearHugsRealtime();
    });
    startBearHugsRealtime();
  });
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) startBearHugsRealtime();
  });

  startBearHugsRealtime();
  updatePartnerChip();
  updateUI();
  void loadPartnerRequests().then(() => {
    restoreSelectedFriend();
    if (selectedFriendId) startBearHugsRealtime();
  });
}
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', install, { once: true });
else install();
})();