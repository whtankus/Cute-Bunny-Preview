(() => {
'use strict';

const SELECTED_KEY = 'cuteBunnyBearSelectedFriend:v1';
const LOVE_KEY = 'cuteBunnyBearLove:v1';
const ACTIONS = new Set(['hug', 'kiss', 'hands', 'dance', 'pet', 'feed', 'sleep', 'idle']);
const REWARDS = [
  { level: 2, name: 'Enchanted Forest', icon: '🌲', detail: 'A peaceful forest scene' },
  { level: 3, name: 'Little Picnic Basket', icon: '🧺', detail: 'A shared picnic accessory', coming: true },
  { level: 4, name: 'Matching Flower Crowns', icon: '🌼', detail: 'A tiny crown for each bear', coming: true },
  { level: 5, name: 'Matching Cute Caps', icon: '🧢', detail: 'One cute cap for each bear' }
];

const $ = (selector, root = document) => root.querySelector(selector);
const esc = value => String(value ?? '').replace(/[&<>"']/g, char => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
}[char]));
const getFriends = () => typeof friends !== 'undefined' && Array.isArray(friends) ? friends : [];
const getMe = () => typeof me !== 'undefined' ? me : null;
const getSupabase = () => typeof sb !== 'undefined' ? sb : null;

let selectedFriendId = localStorage.getItem(SELECTED_KEY) || '';
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
let pendingRemoteAction = null;
let pendingAction = null;

function getPoints() {
  try { return Math.max(0, Number(localStorage.getItem(LOVE_KEY)) || 0); }
  catch { return 0; }
}
function addPoints(amount) {
  try { localStorage.setItem(LOVE_KEY, String(getPoints() + amount)); }
  catch {}
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
function updateUI() {
  const root = $('#coupleBearGame');
  if (!root) return;
  const points = getPoints();
  const level = getLevel(points);
  const percent = Math.max(0, Math.min(100, ((points - level.previous) / (level.next - level.previous)) * 100));
  const meter = $('.bear-love-meter', root);
  if (meter) {
    meter.innerHTML =
      '<div class="bear-level-heading"><span class="bear-level-heart">♡</span>' +
      '<span><small>YOUR LITTLE LOVE JOURNEY</small><b>Level ' + level.level + '</b></span>' +
      '<strong>' + points + ' <small>love points</small></strong></div>' +
      '<div class="bear-level-track" role="progressbar" aria-label="Progress to next Bear Hugs level" aria-valuemin="0" aria-valuemax="100" aria-valuenow="' + Math.round(percent) + '">' +
      '<span style="width:' + percent + '%"></span></div>' +
      '<p class="bear-level-next">' + (level.next - points) + ' points to level ' + (level.level + 1) + '</p>';
  }
  let rewards = $('.bear-rewards', root);
  if (!rewards) {
    rewards = document.createElement('section');
    rewards.className = 'bear-rewards';
    rewards.innerHTML = '<div class="bear-rewards-heading"><span>🎁</span><div><b>Little level rewards</b><small>Collect sweet things as your love grows</small></div></div><div class="bear-rewards-list"></div>';
    root.appendChild(rewards);
  }
  const rewardList = $('.bear-rewards-list', rewards);
  if (rewardList) rewardList.innerHTML = REWARDS.map(reward =>
    '<article class="bear-reward ' + (level.level >= reward.level ? 'is-unlocked' : 'is-locked') + '">' +
    '<span class="bear-reward-icon">' + reward.icon + '</span><span class="bear-reward-copy"><b>' + reward.name +
    '</b><small>' + reward.detail + '</small></span><span class="bear-reward-status">' +
    (level.level >= reward.level ? 'Unlocked' : reward.coming ? 'Coming soon' : 'Locked') + '</span></article>'
  ).join('');
  const scene = $('.couple-bears-scene', root);
  if (scene) {
    scene.classList.toggle('bear-forest-unlocked', level.level >= 2);
    scene.classList.toggle('bear-caps-unlocked', level.level >= 5);
  }
}
function getSelectedFriend() {
  return getFriends().find(friend => String(friend?.id) === selectedFriendId);
}
function setStatus(message) {
  const status = $('#coupleBearStatus');
  if (status) status.textContent = message;
}
function ensurePicker() {
  if ($('#bearFriendPicker')) return;
  const modal = document.createElement('div');
  modal.id = 'bearFriendPicker';
  modal.className = 'bear-friend-picker hidden';
  modal.innerHTML =
    '<section class="bear-friend-picker-card" role="dialog" aria-modal="true" aria-labelledby="bearFriendPickerTitle">' +
    '<button type="button" class="bear-friend-picker-close" aria-label="Close">×</button>' +
    '<span class="bear-picker-art">🐻 ♡ 🐻</span><small>A LITTLE MOMENT TOGETHER</small>' +
    '<h3 id="bearFriendPickerTitle">Who should join you?</h3>' +
    '<p>Choose a friend to connect your two bears. Both of you will see each other’s actions live.</p>' +
    '<div class="bear-friend-picker-list"></div><p class="bear-picker-footnote">You can change your Bear Hugs partner any time.</p></section>';
  document.body.appendChild(modal);
  modal.addEventListener('click', event => {
    if (event.target === modal || event.target.closest('.bear-friend-picker-close')) {
      modal.classList.add('hidden');
      return;
    }
    const choice = event.target.closest('[data-bear-friend-id]');
    if (choice) void chooseFriend(choice.dataset.bearFriendId);
  });
}
function openPicker(action = null) {
  if (action) pendingAction = action;
  ensurePicker();
  const modal = $('#bearFriendPicker');
  const list = $('.bear-friend-picker-list', modal);
  const options = getFriends().filter(friend => friend?.id && String(friend.id) !== String(getMe()?.id || ''));
  list.innerHTML = options.length ? options.map(friend => {
    const id = String(friend.id);
    const name = friend.display_name || friend.displayName || friend.username || 'Friend';
    return '<button type="button" class="bear-friend-choice ' + (id === selectedFriendId ? 'is-selected' : '') +
      '" data-bear-friend-id="' + esc(id) + '"><span class="bear-friend-avatar">' + esc(friend.mascot || '🐰') +
      '</span><span><b>' + esc(name) + '</b><small>@' + esc(friend.username || '') +
      '</small></span><span class="bear-friend-check">' + (id === selectedFriendId ? '✓' : '♡') + '</span></button>';
  }).join('') : '<div class="bear-no-friends">Your little circle is empty. Add a friend in the Friends tab first. ♡</div>';
  modal.classList.remove('hidden');
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
    chip.addEventListener('click', openPicker);
  }
  const friend = getSelectedFriend();
  chip.textContent = friend
    ? '♡ Playing with ' + (friend.display_name || friend.displayName || friend.username || 'Friend') + ' · Change'
    : '♡ Choose a friend to play together';
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
    closeChannel(peerChannel);
    peerChannel = null;
    peerTopic = topic;
    peerReady = false;
  }
  if (!peerChannel) peerChannel = client.channel(topic, { config: { broadcast: { self: false, ack: true } } });
  if (peerReady) return true;
  peerPromise = new Promise(resolve => {
    let settled = false;
    const finish = value => {
      if (settled) return;
      settled = true;
      peerPromise = null;
      if (!value) {
        closeChannel(peerChannel);
        peerChannel = null;
        peerTopic = '';
        peerReady = false;
      }
      resolve(value);
    };
    peerChannel.subscribe(status => {
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
  const friend = getFriends().find(item => String(item?.id) === String(id));
  if (!friend) return;
  selectedFriendId = String(friend.id);
  try { localStorage.setItem(SELECTED_KEY, selectedFriendId); } catch {}
  $('#bearFriendPicker')?.classList.add('hidden');
  updatePartnerChip();
  setStatus('Connecting your two little bears… ♡');
  const results = await Promise.all([ensureOwnChannel(), ensurePeerChannel(selectedFriendId)]);
  if (results.every(Boolean)) updateConnectionStatus();
  else setStatus('Your partner is selected, but the live connection is still reconnecting. Try an action again shortly. ♡');
  if (pendingAction) {
    const action = pendingAction;
    pendingAction = null;
    runLocalAction(action);
  }
}
async function sendAction(action) {
  const friend = getSelectedFriend();
  const user = getMe();
  const client = getSupabase();
  if (!friend || !user?.id || !client) {
    setStatus('Choose a friend before starting your little moment. ♡');
    openPicker();
    return false;
  }
  const connected = await ensurePeerChannel(friend.id);
  if (!connected || !peerChannel) {
    setStatus('Your bears are trying to reconnect. Please try that action again in a moment. ♡');
    return false;
  }
  const payload = {
    action,
    userId: String(user.id),
    toUserId: String(friend.id),
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
    addPoints(2);
    pendingRemoteAction = { action, payload };
  }
}
function receiveAction(payload) {
  const user = getMe();
  if (!payload || !user?.id) return;
  if (String(payload.toUserId || '') !== String(user.id)) return;
  if (String(payload.userId || '') === String(user.id)) return;
  const senderIsFriend = getFriends().some(friend => String(friend?.id) === String(payload.userId));
  if (!senderIsFriend || !ACTIONS.has(String(payload.action || ''))) return;
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
function runLocalAction(action) {
  if (!ACTIONS.has(action)) return;
  if (!getSelectedFriend()) {
    openPicker();
    return;
  }
  if (typeof originalTrigger === 'function') {
    originalTrigger(action, { remote: true, gender: getMe()?.gender });
    updateUI();
  } else {
    setStatus('The bear animation is still loading. Please try again in a moment. ♡');
    return;
  }
  void sendAction(action);
}
function startBearHugsRealtime() {
  void ensureOwnChannel();
  if (selectedFriendId && getSelectedFriend()) void ensurePeerChannel(selectedFriendId);
}
function closeBearHugsRealtime() {
  closeChannel(ownChannel);
  closeChannel(peerChannel);
  ownChannel = peerChannel = null;
  ownTopic = peerTopic = '';
  ownReady = peerReady = false;
  ownPromise = peerPromise = null;
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
    if (!getSelectedFriend()) {
      openPicker(actionButton ? actionButton.dataset.coupleAction : 'pet');
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

  const observer = new MutationObserver(() => {
    if ($('#coupleBearGame')) {
      updatePartnerChip();
      updateUI();
      flushPendingRemoteAction();
    }
  });
  observer.observe(document.body, { childList: true, subtree: true });

  window.addEventListener('storage', event => {
    if (event.key === LOVE_KEY) updateUI();
    if (event.key === SELECTED_KEY) {
      selectedFriendId = localStorage.getItem(SELECTED_KEY) || '';
      updatePartnerChip();
    }
  });
  window.addEventListener('focus', startBearHugsRealtime);
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) startBearHugsRealtime();
  });

  if (selectedFriendId && !getSelectedFriend()) selectedFriendId = '';
  startBearHugsRealtime();
  updatePartnerChip();
  updateUI();
}
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', install, { once: true });
else install();
})();