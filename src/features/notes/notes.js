/* notes feature functions; classic-script compatibility with current app state. */
'use strict';

function formatMessageTime(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const now = new Date(), yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const day = date.toDateString() === now.toDateString() ? 'Today' :
    date.toDateString() === yesterday.toDateString() ? 'Yesterday' :
    deviceDateFormatter.format(date);
  return day + ' · ' + deviceClockFormatter.format(date);
}

function formatNoteClock(value) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '' : deviceClockFormatter.format(date);
}

function noteDayLabel(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Little memories';
  const today = new Date(), yesterday = new Date(today);
  today.setHours(0, 0, 0, 0);
  yesterday.setDate(today.getDate() - 1);
  yesterday.setHours(0, 0, 0, 0);
  const day = new Date(date);
  day.setHours(0, 0, 0, 0);
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  return day.getTime() === today.getTime() ? 'Today' : day.getTime() === yesterday.getTime() ? 'Yesterday' : new Intl.DateTimeFormat(undefined, { weekday: 'long', month: 'long', day: 'numeric', timeZone }).format(date);
}

function chatMessageMarkup(m, showMeta = true, isContinuation = false, showSeen = false) {
  const owner = m.author || {};
  const ownerId = owner.id || m.owner_id || '';
  const mine = String(ownerId) === String(me?.id || '');
  const id = String(m.id);
  const liked = Number(m.like_count || 0) > 0;
  const messageValue = String(m.text || '');
  const messageCharacterCount = noteGraphemeSegmenter
    ? [...noteGraphemeSegmenter.segment(messageValue)].length
    : Array.from(messageValue).length;
  const messageWordCount = messageValue.trim() ? messageValue.trim().split(/\s+/u).length : 0;
  const isShortMessage = messageWordCount < 4;
  const hasHeartReaction = messageCharacterCount >= 6;
  const heartButton = hasHeartReaction
    ? `<span class="memory-heart-toggle reaction-heart-indicator${liked ? ' is-lit' : ''}" aria-hidden="true"><span class="heart-wallpaper-fill">♥</span><span class="heart-outline-glyph">${liked ? '♥' : '♡'}</span></span>`
    : '';
  const name = esc(owner.displayName || owner.display_name || owner.username || 'Friend');
  const handle = esc(owner.username || 'friend');
  const pet = esc(owner.mascot || '🐰');
  const messageText = esc(m.text || '');
  const createdAt = m.createdAt || m.created_at || '';
  const time = esc(formatNoteClock(createdAt));
  const editedLabel = m.edited_at ? '<small class="chat-edited-label">Edited</small>' : '';
  const senderTag = mine ? 'div' : 'button';
  const senderAttrs = mine ? '' : `type="button" data-friend-profile="${handle}" data-friend-id="${esc(ownerId)}" aria-label="Open ${name}'s profile"`;
  const senderMeta = showMeta ? `
        <${senderTag} class="chat-meta${mine ? '' : ' chat-sender-link'}" ${senderAttrs}>
          <span class="sender-pet" aria-hidden="true">${pet}</span>
          <b title="${name}">${name}</b>
          <small>@${handle}</small>
        </${senderTag}>
  ` : '';
  const seenLabel = m.last_seen_at ? formatSeenRelative(m.last_seen_at) : 'Seen';
  const seenReceipt = showSeen && mine && Number(m.seen_by_count || 0) > 0
    ? '<small class="chat-seen-receipt" data-seen-at="' + esc(m.last_seen_at || '') + '" aria-label="' + esc(seenLabel) + '">' + esc(seenLabel) + '</small>'
    : '';
  const replyTarget = m.reply_to_id ? feed.find(item => String(item.id) === String(m.reply_to_id)) : null;
  const replyAuthor = replyTarget?.author?.displayName || replyTarget?.author?.display_name || replyTarget?.author?.username || 'Original message';
  const replyText = replyTarget?.text || 'This message is no longer available';
  const replyMarkup = m.reply_to_id ? `<button type="button" class="chat-reply-preview" data-chat-jump="${esc(m.reply_to_id)}" aria-label="Jump to original message"><span class="chat-reply-preview-quote"><span class="chat-reply-preview-text">${esc(replyText)}</span></span></button>` : '';

  return `
    <div class="chat-message ${mine ? 'is-mine' : 'is-friend'}${liked ? ' is-loved' : ''}${m.isPending ? ' is-uploading' : ''}${isContinuation ? ' is-continuation' : ''}" data-kind="note" data-memory="${esc(id)}" data-owner="${esc(ownerId)}" data-like-count="${Number(m.like_count) || 0}" data-reaction-count="${Array.isArray(m.reactions) ? m.reactions.length : 0}">
      <div class="chat-message-content">
        ${senderMeta}
        <div class="chat-message-line">
          <time class="chat-message-time" datetime="${esc(createdAt)}">${time}</time>${editedLabel}
          <div class="chat-bubble-wrap">
            <div class="chat-bubble${hasHeartReaction ? '' : ' no-heart-reaction'}${isShortMessage ? ' is-short-message' : ''}" tabindex="0" data-chat-message-id="${esc(id)}" aria-label="Message from ${name}">
              ${heartButton}
              ${replyMarkup}
              <span class="chat-message-text" dir="auto">${messageText}</span>
            </div>
          </div>
        </div>
      </div>
      ${seenReceipt}
      ${m.isPending ? '<span class="memory-upload-status" role="status">Sending your message…</span>' : ''}
    </div>
  `;
}

function memoryCard(m, options = {}) {
  const owner = m.author || {};
  const name = esc(owner.displayName || owner.display_name || 'Friend');
  const handle = esc(owner.username || '');
  const pet = esc(owner.mascot || '🐰');
  const isLiked = Number(m.like_count || 0) > 0;
  const liked = isLiked ? ' is-loved' : '';
  const heartButton = `<span class="memory-heart-toggle reaction-heart-indicator${isLiked ? ' is-lit' : ''}" aria-hidden="true"><span class="heart-wallpaper-fill">♥</span><span class="heart-outline-glyph">${isLiked ? '♥' : '♡'}</span></span>`;
  const sorted = [me?.id, ...friends.map(f => f.id)].filter(Boolean).map(String).sort();
  const tone = sorted.indexOf(String(owner.id || m.owner_id || '')) % 2 ? 'tone-lavender' : 'tone-peach';
  const pending = pendingDeleteTimers.has(String(m.id)) ? ' is-pending-delete' : '';
  const uploading = m.isPending ? ' is-uploading' : '';
  const mine = String(owner.id || m.owner_id || '') === String(me?.id || '');

  let body = '';
  if (m.kind === 'photo') {
    body = `<div class="tile${liked}">${heartButton}<div class="photo-frame"><img class="feed-photo is-loading" loading="lazy" decoding="async" data-media="${esc(m.id)}" ${m.previewUrl ? `src="${esc(m.previewUrl)}"` : ""} alt="Shared photo" role="button" tabindex="0" aria-label="Open full photo" draggable="false"></div></div>`;
  } else if (m.kind === 'song') {
    const songAction = m.isPending ? '' : mine
      ? `<button class="song-download card-song-save card-song-delete" type="button" data-memory-delete="${esc(m.id)}" aria-label="Delete song">Delete</button>`
      : `<button class="song-download card-song-save" type="button" data-memory-download="${esc(m.id)}" aria-label="Save song">Save</button>`;
    body = `<div class="tile song-card${liked}">${heartButton}<button class="album-art play-song" data-play-song="${esc(m.id)}" aria-label="Play ${esc(m.fileName || 'song')}" aria-pressed="false" ${m.isPending ? "disabled" : ""}><span class="song-glyph" aria-hidden="true">🎼</span><span class="song-note" aria-hidden="true">♫</span></button><span class="memory-title song-title-label" title="${esc(m.fileName || m.text || 'A little song')}">${esc(m.fileName || m.text || 'A little song')}</span>${songAction}</div>`;
  } else {
    const isContinuation = m.kind === 'note' && !!options.isContinuation;
    body = chatMessageMarkup(m, !isContinuation, isContinuation);
  }

  const authorLine = m.kind === 'note' ? '' : `<div class="feed-by"><span class="sender-pet" aria-label="${pet}">${pet}</span> <b title="${name}">${name}</b> <small>@${handle}</small></div>`;
  const ownerIndicator = mine && m.kind !== 'note' ? `<span class="memory-owner-indicator" aria-hidden="true">Your memory</span>` : '';
  const continuationClass = m.kind === 'note' && options.isContinuation ? ' is-continuation' : '';
  return `<article class="feed-item ${tone}${pending}${uploading}${m.kind === 'note' ? ' home-note-memory' : ''}${continuationClass}" data-kind="${esc(m.kind)}" data-memory="${esc(m.id)}" data-owner="${esc(owner.id || m.owner_id || '')}">${authorLine}${body}${ownerIndicator}</article>`;
}

function syncChatReplyPreview() {
  const preview = $('#chatReplyingTo');
  if (!preview) return;
  const item = replyingToMessageId
    ? feed.find(memory => String(memory.id) === String(replyingToMessageId))
    : null;
  preview.hidden = !item;
  const replyOwnerId = String(item?.author?.id || item?.owner_id || '');
  const isMine = !!item && replyOwnerId === String(me?.id || '');
  preview.classList.toggle('is-mine', isMine);
  preview.classList.toggle('is-friend', !!item && !isMine);
  preview.innerHTML = item
    ? `<div class="chat-replying-content"><span class="chat-replying-message">${esc(item.text || 'Message unavailable')}</span></div><button type="button" data-chat-reply-cancel aria-label="Cancel reply">×</button>`
    : '';
}

function renderNotesPage(options = {}) {
  startNotesIncomingPoll();
  if (!seenRelativeInterval) {
    seenRelativeInterval = setInterval(() => {
      if (page !== 'notes') return;
      document.querySelectorAll('#chatSeenStatus[data-seen-at]').forEach(node => {
        const label = formatSeenRelative(node.dataset.seenAt);
        node.textContent = label;
        node.setAttribute('aria-label', label);
      });
    }, 15000);
  }
  const content = $('#content');
  if (!content) return;

  const chatNotes = feed
    .filter(m => m.kind === 'note' && !hiddenNoteIds.has(String(m.id)) && !pendingDeleteTimers.has(String(m.id)))
    .slice()
    .reverse();
  void markNotesDelivered(chatNotes);

  let previousLabel = '';
  let previousOwnerId = '';
  const messagesHtml = chatNotes.map(m => {
    const label = noteDayLabel(m.createdAt || m.created_at);
    const ownerId = String(m.author?.id || m.owner_id || '');
    const isNewDay = label !== previousLabel;
    const divider = isNewDay ? `<div class="chat-day-divider"><span>${esc(label)}</span></div>` : '';
    const isContinuation = !isNewDay && !!ownerId && ownerId === previousOwnerId;
    previousLabel = label;
    previousOwnerId = ownerId;
    return divider + chatMessageMarkup(m, !isContinuation, isContinuation, false);
  }).join('');
  const emptyMarkup = '<div class="chat-empty"><span>💌</span><b>Your conversation starts here</b><small>Send the first little hello ♡</small></div>';
  // The Seen indicator reflects the newest conversation note, and is shown
  // whenever that note has a reader cursor—even if the timestamp is unavailable.
  const latestNote = chatNotes
    .filter(note => !note.isPending)
    .slice()
    .sort((a, b) => new Date(b.createdAt || b.created_at || 0) - new Date(a.createdAt || a.created_at || 0))[0];
  const latestOwnerId = String(latestNote?.author?.id || latestNote?.owner_id || '');
  const latestIsMine = !!latestNote && latestOwnerId === String(me?.id || '');
  const latestHasBeenSeen = latestIsMine && Number(latestNote.seen_by_count || 0) > 0;
  const latestSeenAt = latestHasBeenSeen ? String(latestNote.last_seen_at || '') : '';
  const latestSeenLabel = latestHasBeenSeen
    ? (latestSeenAt ? formatSeenRelative(latestSeenAt) : 'Seen')
    : '';
  const olderControl = historySentinelMarkup('top');
  const existingThread = $('#chatThread');
  const updateSeenStatus = () => {
    const status = $('#chatSeenStatus');
    if (!status) return;
    status.hidden = !latestHasBeenSeen;
    status.textContent = latestSeenLabel;
    status.setAttribute('aria-label', latestSeenLabel || 'Not seen');
    if (latestSeenAt) status.dataset.seenAt = latestSeenAt;
    else delete status.dataset.seenAt;
  };
  updateSeenStatus();
  syncChatReplyPreview();

  // Do not rebuild an unchanged conversation on every realtime/status tick.
  // Keeping its message nodes mounted prevents scroll, focus and CSS animation jumps.
  const desiredThreadMarkup = olderControl + (messagesHtml || emptyMarkup);
  if (existingThread && existingThread.__cbNotesMarkup === desiredThreadMarkup) {
    syncNotesTypingIndicator();
    return;
  }

  // Reconcile message nodes by ID instead of replacing the whole thread.
  // Existing bubbles keep their DOM identity, so incoming messages and receipts
  // cannot restart entrance effects or make the conversation blink.
  if (existingThread) {
    const wasNearBottom =
      existingThread.scrollHeight - existingThread.scrollTop - existingThread.clientHeight < 72;
    const previousScrollTop = existingThread.scrollTop;
    const desiredRoot = document.createElement('div');
    desiredRoot.innerHTML = desiredThreadMarkup;
    const currentById = new Map(
      [...existingThread.querySelectorAll(':scope > .chat-message[data-memory]')]
        .map(node => [String(node.dataset.memory), node])
    );
    const currentDividers = [...existingThread.querySelectorAll(':scope > .chat-day-divider')];
    const usedDividers = new Set();
    const nextNodes = [];

    [...desiredRoot.children].forEach(desiredNode => {
      if (desiredNode.matches('.chat-message[data-memory]')) {
        const id = String(desiredNode.dataset.memory);
        const current = currentById.get(id);
        if (current) {
          // Message rows are immutable after delivery; live Seen/pending metadata
          // must not replace the bubble node or replay its entrance animation.
          const desiredReceipt = desiredNode.querySelector('.chat-seen-receipt');
          const currentReceipt = current.querySelector('.chat-seen-receipt');
          if (desiredReceipt && currentReceipt) {
            currentReceipt.textContent = desiredReceipt.textContent;
            currentReceipt.setAttribute('aria-label', desiredReceipt.getAttribute('aria-label') || 'Seen');
            if (desiredReceipt.dataset.seenAt) currentReceipt.dataset.seenAt = desiredReceipt.dataset.seenAt;
            else delete currentReceipt.dataset.seenAt;
          } else if (desiredReceipt && !currentReceipt) {
            current.append(desiredReceipt);
          } else if (!desiredReceipt && currentReceipt) {
            currentReceipt.remove();
          }
          const desiredText = desiredNode.querySelector('.chat-message-text')?.textContent;
          const currentText = current.querySelector('.chat-message-text');
          if (currentText && desiredText != null && currentText.textContent !== desiredText) currentText.textContent = desiredText;
          const desiredReply = desiredNode.querySelector('.chat-reply-preview');
          const currentReply = current.querySelector('.chat-reply-preview');
          if (desiredReply && currentReply) { currentReply.innerHTML = desiredReply.innerHTML; currentReply.dataset.chatJump = desiredReply.dataset.chatJump; }
          else if (desiredReply && !currentReply) current.querySelector('.chat-bubble')?.prepend(desiredReply);
          else if (!desiredReply && currentReply) currentReply.remove();
          const desiredReactions = desiredNode.querySelector('.chat-message-reactions');
          const currentReactions = current.querySelector('.chat-message-reactions');
          if (desiredReactions && currentReactions) currentReactions.replaceWith(desiredReactions);
          else if (desiredReactions && !currentReactions) current.querySelector('.chat-bubble-wrap')?.append(desiredReactions);
          else if (!desiredReactions && currentReactions) currentReactions.remove();
          const desiredTime = desiredNode.querySelector('.chat-message-time');
          const currentTime = current.querySelector('.chat-message-time');
          if (desiredTime && currentTime && currentTime.dateTime !== desiredTime.dateTime) {
            currentTime.dateTime = desiredTime.dateTime;
            currentTime.textContent = desiredTime.textContent;
          }
          current.classList.toggle('is-uploading', desiredNode.classList.contains('is-uploading'));
          current.classList.toggle('is-loved', desiredNode.classList.contains('is-loved'));
          current.setAttribute('data-like-count', desiredNode.getAttribute('data-like-count') || '0');
          current.setAttribute('data-reaction-count', desiredNode.getAttribute('data-reaction-count') || '0');
          nextNodes.push(current);
        } else {
          nextNodes.push(desiredNode);
        }
      } else if (desiredNode.matches('.chat-day-divider')) {
        const match = currentDividers.find(node =>
          !usedDividers.has(node) && node.textContent === desiredNode.textContent
        );
        if (match) {
          usedDividers.add(match);
          nextNodes.push(match);
        } else {
          nextNodes.push(desiredNode);
        }
      } else {
        const match = [...existingThread.children].find(node =>
          !nextNodes.includes(node) &&
          node.className === desiredNode.className &&
          node.outerHTML === desiredNode.outerHTML
        );
        nextNodes.push(match || desiredNode);
      }
    });

    // Keep nodes already in the correct position completely untouched.
    // Move only nodes whose order actually changed, then remove stale children.
    nextNodes.forEach((node, index) => {
      const atPosition = existingThread.children[index];
      if (atPosition !== node) existingThread.insertBefore(node, atPosition || null);
    });
    [...existingThread.children].forEach(node => {
      if (!nextNodes.includes(node) && node.id !== 'chatTypingIndicator') node.remove();
    });
    existingThread.__cbNotesMarkup = desiredThreadMarkup;
    syncNotesTypingIndicator();

    requestAnimationFrame(() => {
      if (!existingThread.isConnected) return;
      if (options.followLatest || wasNearBottom) {
        existingThread.scrollTop = existingThread.scrollHeight;
      } else {
        existingThread.scrollTop = Math.min(
          previousScrollTop,
          Math.max(0, existingThread.scrollHeight - existingThread.clientHeight)
        );
      }
      syncNotesKeyboardLayout();
      syncNotesSeenReceiptVisibility(existingThread);
      observeNoteSeenMessages();
    });
    return;
  }

  content.innerHTML = `
    <section class="chat-page" aria-label="Notes conversation">
      <div class="chat-thread" id="chatThread" aria-live="polite">
        ${olderControl}${messagesHtml || emptyMarkup}
        <div id="chatTypingIndicator" class="chat-typing-indicator" aria-live="polite" aria-atomic="true" hidden></div>
      </div>
      <form id="chatComposer" class="chat-composer" autocomplete="off">
        <div id="chatReplyingTo" class="chat-replying-to" ${replyingToMessageId ? '' : 'hidden'}></div>
        <small id="chatSeenStatus" class="chat-seen-receipt chat-seen-status" ${latestSeenAt ? 'data-seen-at="' + esc(latestSeenAt) + '"' : ''} aria-label="${esc(latestSeenLabel || "Not seen")}" ${latestHasBeenSeen ? "" : "hidden"}>${esc(latestSeenLabel)}</small>
        <div id="chatPhotoPreview" class="chat-photo-preview" hidden aria-label="Selected photos"></div>
        <input id="chatPhotoInput" type="file" accept="image/jpeg,image/png,image/webp,image/gif" multiple hidden>
        <div class="chat-composer-entry">
          <textarea id="chatInput" class="input" maxlength="1000" rows="1" enterkeyhint="enter" inputmode="text" autocapitalize="sentences" spellcheck="true" aria-multiline="true" placeholder="Write a little message…" aria-label="Write a little message"></textarea>
          <button type="button" class="chat-photo-attach" id="chatPhotoAttach" aria-label="Attach a photo" title="Choose a photo">
            <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
              <rect x="3.5" y="4.5" width="17" height="15" rx="3" fill="none" stroke="currentColor" stroke-width="1.8"/>
              <circle cx="9" cy="9.5" r="1.7" fill="currentColor"/>
              <path d="m5.5 17 5-5 3.2 3 2.4-2.2 2.5 4.2" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
        </div>
        <button type="submit" class="primary" id="chatSend" aria-label="Send message" hidden>💌</button>
      </form>
    </section>
  `;

  requestAnimationFrame(() => {
    syncNotesKeyboardLayout();
    const thread = $('#chatThread');
    if (thread) {
      thread.__cbNotesMarkup = olderControl + (messagesHtml || emptyMarkup);
      thread.scrollTop = thread.scrollHeight;
      syncNotesTypingIndicator();
    }
    syncNotesSeenReceiptVisibility(thread);
    observeNoteSeenMessages();
  });
}

window.pendingChatPhotoFiles = [];
window.pendingChatPhotoUrls = [];
const pendingChatPhotoFiles = window.pendingChatPhotoFiles;
const pendingChatPhotoUrls = window.pendingChatPhotoUrls;
const CHAT_PHOTO_MAX_COUNT = 3;
const CHAT_PHOTO_MAX_BYTES = 8 * 1024 * 1024;
const CHAT_PHOTO_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);

function syncChatPhotoPreview() {
  const preview = $('#chatPhotoPreview');
  if (!preview) return;
  preview.hidden = pendingChatPhotoFiles.length === 0;
  preview.innerHTML = pendingChatPhotoFiles.map((file, index) => `
    <span class="chat-photo-thumb">
      <img src="${esc(pendingChatPhotoUrls[index])}" alt="Selected photo ${index + 1}">
      <button type="button" data-chat-photo-remove="${index}" aria-label="Remove selected photo">×</button>
    </span>
  `).join('');
  syncChatComposerState($('#chatInput'));
}

function clearChatPhotoSelection() {
  pendingChatPhotoUrls.forEach(url => URL.revokeObjectURL(url));
  pendingChatPhotoFiles.length = 0;
  pendingChatPhotoUrls.length = 0;
  syncChatPhotoPreview();
}

async function uploadChatPhoto(file, previewUrl, caption, tempId) {
  const optimistic = {
    id: tempId, kind: 'photo', fileName: file.name, text: caption || file.name,
    contentType: file.type, createdAt: new Date().toISOString(), isPending: true,
    previewUrl, author: { id: me.id, username: me.username, displayName: me.displayName, mascot: me.mascot }
  };
  if (previewUrl) pendingMediaUrls.set(tempId, previewUrl);
  feed = [optimistic, ...feed];
  render();
  const form = new FormData();
  form.append('file', file);
  form.append('kind', 'photo');
  form.append('caption', caption || file.name);
  try {
    const saved = await api('/media', { method: 'POST', body: form });
    const item = {
      ...saved, createdAt: saved.created_at || optimistic.createdAt,
      fileName: saved.file_name || file.name, contentType: saved.content_type || file.type,
      storagePath: saved.storage_path, author: optimistic.author, previewUrl
    };
    feed = feed.map(memory => String(memory.id) === tempId ? item : memory);
    recordStreakDailyQuest('photo', file.name);
    render();
  } catch (error) {
    feed = feed.filter(memory => String(memory.id) !== tempId);
    pendingMediaUrls.delete(tempId);
    throw error;
  }
}

window.syncChatPhotoPreview = syncChatPhotoPreview;

async function sendChatMessage() {
  const field = $('#chatInput');
  const text = field?.value.trim() || '';
  const photos = pendingChatPhotoFiles.slice();
  const photoUrls = pendingChatPhotoUrls.slice();
  if (!text && !photos.length) return;
  const replyId = replyingToMessageId;
  const tempId = 'local-note-' + Date.now();
  const createdAt = new Date().toISOString();
  const optimistic = text ? {
    id: tempId, kind: 'note', text,
    reply_to_id: replyId ? Number(replyId) : null,
    createdAt, created_at: createdAt, isPending: true,
    author: { ...me, id: me?.id, displayName: me?.displayName || me?.username, mascot: me?.mascot || '🐰' }
  } : null;
  stopNotesTyping();
  if (field) {
    field.value = '';
    field.style.height = '';
    field.style.overflowY = 'hidden';
  }
  pendingChatPhotoFiles.length = 0;
  pendingChatPhotoUrls.length = 0;
  syncChatPhotoPreview();
  if (optimistic) feed = [optimistic, ...feed];
  hideMessageActions();
  renderNotesPage({ followLatest: true });
  const refocusComposer = (restoreDraft = false) => {
    const nextField = $('#chatInput');
    if (!nextField) return;
    if (restoreDraft && !nextField.value) nextField.value = text;
    nextField.focus({ preventScroll: true });
    syncChatComposerState(nextField);
    syncNotesKeyboardLayout();
  };
  refocusComposer();
  try {
    if (text) {
      const { data: saved, error: sendError } = await sb.from('memories')
        .insert({ owner_id: me.id, kind: 'note', text, reply_to_id: replyId ? Number(replyId) : null })
        .select('id,owner_id,kind,text,created_at,reply_to_id,edited_at').single();
      if (sendError) throw sendError;
      recordStreakNoteQuest(text);
      void loadKindnessEventStatus();
      if (replyingToMessageId === replyId) replyingToMessageId = null;
      const record = { ...saved, createdAt: saved.created_at, author: optimistic.author };
      feed = feed.map(memory => String(memory.id) === tempId ? record : memory);
    }
    renderNotesPage({ followLatest: true });
    for (let index = 0; index < photos.length; index++) {
      try {
        await uploadChatPhoto(photos[index], photoUrls[index], text, 'notes-photo-' + Date.now() + '-' + index);
      } catch (error) {
        toast(error?.message || 'A photo could not be uploaded.');
      } finally {
        URL.revokeObjectURL(photoUrls[index]);
      }
    }
    toast(photos.length ? 'Photo shared in Notes and added to Photos.' : 'Message sent.');
    refocusComposer();
  } catch (error) {
    if (optimistic) feed = feed.filter(memory => String(memory.id) !== tempId);
    if (replyId) replyingToMessageId = replyId;
    // Restore the selected photos when the note insert fails.
    photos.forEach((file, index) => {
      pendingChatPhotoFiles.push(file);
      pendingChatPhotoUrls.push(photoUrls[index]);
    });
    renderNotesPage({ followLatest: true });
    syncChatPhotoPreview();
    refocusComposer(true);
    toast(error.message || 'Your message could not be sent.');
  }
}

function openNoteComposer() {
  const myLatestNote = feed.find(m => m.kind === 'note' && String(m.author?.id || m.owner_id) === String(me?.id));
  const input = $('#igNoteInput');
  const clearBtn = $('#igNoteClear');
  if (input) input.value = myLatestNote ? myLatestNote.text : '';
  if (clearBtn) clearBtn.classList.toggle('hidden', !myLatestNote);
  $('#noteComposerGate').classList.remove('hidden');
  input?.focus();
}

async function saveIgNote() {
  const input = $('#igNoteInput'), text = input?.value.trim();
  if (!text) return toast('Write a little thought first ♡');
  $('#noteComposerGate').classList.add('hidden');
  try {
    const saved = await api('/memories', { method: 'POST', body: JSON.stringify({ kind: 'note', text }) });
    recordStreakNoteQuest(text);
    const record = { ...saved, createdAt: saved.created_at, author: { ...me, displayName: me?.displayName || me?.username, mascot: me?.mascot || '🐰' } };
    feed = [record, ...feed];
    renderNotesPage({ followLatest: true });
    toast('Your note is updated ♡');
  } catch (err) {
    toast(err.message);
  }
}

async function clearIgNote() {
  const myLatestNote = feed.find(m => m.kind === 'note' && String(m.author?.id || m.owner_id) === String(me?.id));
  $('#noteComposerGate').classList.add('hidden');
  if (myLatestNote) {
    try {
      await api('/memories/' + encodeURIComponent(myLatestNote.id), { method: 'DELETE' });
      feed = feed.filter(m => String(m.id) !== String(myLatestNote.id));
      renderNotesPage();
      toast('Your note was cleared ♡');
    } catch (e) {
      toast(e.message);
    }
  }
}

async function sendNotesTyping(isTyping) {
  const nextState = !!isTyping && page === 'notes' && !document.hidden;
  if (!notesTypingChannel || !me) return;
  if (!notesTypingChannelReady) {
    notesTypingQueuedState = nextState;
    return;
  }
  try {
    const result = await notesTypingChannel.send({
      type: 'broadcast',
      event: 'typing',
      payload: {
        user_id: String(me.id),
        username: me.username || 'Friend',
        display_name: me.displayName || me.display_name || me.username || 'Friend',
        is_typing: nextState,
        sent_at: Date.now()
      }
    });
    if (result !== 'ok') {
      notesTypingQueuedState = nextState;
      console.warn('Notes typing broadcast status:', result);
    }
  } catch (error) {
    notesTypingQueuedState = nextState;
    console.warn('Notes typing update could not be sent:', error?.message || error);
  }
}

function receiveNotesTyping(payload) {
  const userId = String(payload?.user_id || payload?.userId || payload?.profile_id || payload?.id || '');
  if (!userId || userId === String(me?.id || '')) return;

  // Broadcast membership is the source of truth here. A friend may not yet
  // exist in the local follow/feed cache, so filtering against those stale
  // lists can silently discard a valid typing event.
  const friend = friends.find(item => String(item.id || item.user_id || '') === userId);
  const knownAuthor = feed.find(item =>
    item.kind === 'note' &&
    String(item.author?.id || item.owner_id || '') === userId
  )?.author;

  // Do not compare a sender's wall clock with this device's clock.
  // Clock drift can make a valid friend's typing event look expired only to
  // one recipient. Expiry is handled locally from the moment the event arrives.
  const sentAt = Number(payload?.sent_at || 0);
  const existing = remoteTypingUsers.get(userId);
  // Ignore delayed packets so an older "stopped typing" event cannot erase
  // a newer active state after network jitter.
  if (existing?.lastSentAt && sentAt && sentAt < existing.lastSentAt) return;
  if (existing?.timer) clearTimeout(existing.timer);

  if (!payload.is_typing || page !== 'notes' || document.hidden) {
    remoteTypingUsers.delete(userId);
    syncNotesTypingIndicator();
    return;
  }

  const username = friend?.username || knownAuthor?.username || payload.username || 'Friend';
  const entry = {
    username,
    displayName: friend?.displayName || friend?.display_name ||
      knownAuthor?.displayName || knownAuthor?.display_name ||
      payload.display_name || username,
    presenceOnly: false,
    lastSentAt: sentAt || Date.now(),
    timer: setTimeout(() => {
      remoteTypingUsers.delete(userId);
      syncNotesTypingIndicator();
    }, NOTES_TYPING_EXPIRY_MS)
  };
  remoteTypingUsers.set(userId, entry);
  syncNotesTypingIndicator();
}

function updateNotesTypingPresence() {
  // Typing is Broadcast-only. Never call Presence.track() from typing handlers:
  // Supabase rate-limits Presence updates and closes the shared online channel.
}

function startNotesTyping() {
  if (!me || page !== 'notes' || document.hidden) return;
  const now = Date.now();
  if (!typingActive) {
    typingActive = true;
    typingLastSentAt = now;
    void sendNotesTyping(true);
    void updateNotesTypingPresence();
    typingHeartbeatTimer = setInterval(() => {
      if (!typingActive || page !== 'notes' || document.hidden) return;
      typingLastSentAt = Date.now();
      void sendNotesTyping(true);
      void updateNotesTypingPresence();
    }, NOTES_TYPING_HEARTBEAT_MS);
  }
  clearTimeout(typingStopTimer);
  typingStopTimer = setTimeout(stopNotesTyping, NOTES_TYPING_IDLE_MS);
}

function stopNotesTyping() {
  clearTimeout(typingStopTimer);
  typingStopTimer = null;
  if (typingHeartbeatTimer) clearInterval(typingHeartbeatTimer);
  typingHeartbeatTimer = null;
  if (!typingActive) return;
  typingActive = false;
  void sendNotesTyping(false);
  void updateNotesTypingPresence();
}

function syncNotesTypingFromPresence() {
  // Presence is reserved for online status. Typing is received only through
  // the dedicated Broadcast channel so Presence syncs cannot overwrite it.
}

function syncNotesTypingIndicator() {
  const thread = $('#chatThread');
  if (!thread || page !== 'notes') return;
  let indicator = $('#chatTypingIndicator');
  if (!indicator) {
    indicator = document.createElement('div');
    indicator.id = 'chatTypingIndicator';
    indicator.className = 'chat-typing-indicator';
    indicator.setAttribute('aria-live', 'polite');
    indicator.setAttribute('aria-atomic', 'true');
  }
  const names = [...remoteTypingUsers.values()].map(entry => entry.displayName);
  let label = '';
  if (names.length === 1) label = names[0] + ' is typing';
  else if (names.length === 2) label = names[0] + ' and ' + names[1] + ' are typing';
  else if (names.length >= 3) label = 'Several people are typing';
  indicator.hidden = !label;
  indicator.innerHTML = label
    ? '<span class="chat-typing-label">' + esc(label) + '</span><span class="chat-typing-dots" aria-hidden="true"><i></i><i></i><i></i></span>'
    : '';
  // It stays at the end of the conversation, after the newest message.
  if (indicator.parentElement !== thread) thread.append(indicator);
  if (label) {
    const nearLatest = thread.scrollHeight - thread.scrollTop - thread.clientHeight < 110;
    if (nearLatest) requestAnimationFrame(() => { thread.scrollTop = thread.scrollHeight; });
  }
}

function observeNoteSeenMessages() {
  noteSeenObserver?.disconnect();
  noteSeenObserver = null;
  const thread = $('#chatThread');
  if (!thread || page !== 'notes' || document.hidden || !me || !('IntersectionObserver' in window)) return;

  noteSeenObserver = new IntersectionObserver(entries => {
    if (page !== 'notes' || document.hidden || !document.hasFocus()) return;
    for (const entry of entries) {
      if (!entry.isIntersecting || entry.intersectionRatio < 0.55) continue;
      const message = entry.target;
      const ownerId = String(message.dataset.owner || '');
      const messageId = Number(message.dataset.memory);
      if (!ownerId || ownerId === String(me.id) || !Number.isSafeInteger(messageId) || messageId <= 0) continue;
      const item = feed.find(row => String(row.id) === String(messageId));
      if (!item || item.isPending || item.kind !== 'note') continue;
      queueNoteSeen(ownerId, messageId);
    }
  }, { root: thread, threshold: [0, 0.55] });

  thread.querySelectorAll('.chat-message[data-memory][data-owner]').forEach(message => noteSeenObserver.observe(message));
}

function queueNoteSeen(ownerId, messageId) {
  const owner = String(ownerId || '');
  const id = Number(messageId);
  if (!owner || owner === String(me?.id || '') || !Number.isSafeInteger(id) || id <= 0) return;
  const known = Math.max(noteSeenLastAck.get(owner) || 0, noteSeenPending.get(owner) || 0);
  if (id <= known) return;
  noteSeenPending.set(owner, id);
  // Coalesce all visible messages from the same friend into one highest-ID
  // cursor update instead of sending one RPC for every observer callback.
  if (!noteSeenDebounceTimer) {
    noteSeenDebounceTimer = setTimeout(() => {
      noteSeenDebounceTimer = null;
      void flushNoteSeenReceipts();
    }, 70);
  }
}

async function flushNoteSeenReceipts() {
  if (!sb || !me || page !== 'notes' || document.hidden || !document.hasFocus()) return;
  noteSeenDebounceTimer = null;
  const batch = [...noteSeenPending.entries()];
  noteSeenPending.clear();
  for (const [ownerId, messageId] of batch) {
    if (noteSeenInFlight.has(ownerId)) {
      noteSeenPending.set(ownerId, Math.max(noteSeenPending.get(ownerId) || 0, messageId));
      continue;
    }
    let retryDelay = 40;
    const request = (async () => {
      const { error } = await sb.rpc('mark_notes_seen', {
        p_owner_id: ownerId,
        p_last_read_message_id: messageId
      });
      if (error) throw error;
      noteSeenLastAck.set(ownerId, Math.max(noteSeenLastAck.get(ownerId) || 0, messageId));
    })();
    noteSeenInFlight.set(ownerId, request);
    request.catch(error => {
      console.warn('Notes seen receipt could not be saved:', error?.message || error);
      // Do not silently lose a read receipt on a transient network failure.
      if (page === 'notes' && !document.hidden) {
        noteSeenPending.set(ownerId, Math.max(noteSeenPending.get(ownerId) || 0, messageId));
        retryDelay = 1200;
      }
    }).finally(() => {
      noteSeenInFlight.delete(ownerId);
      if (noteSeenPending.size && page === 'notes' && !document.hidden) {
        clearTimeout(noteSeenDebounceTimer);
        noteSeenDebounceTimer = setTimeout(flushNoteSeenReceipts, retryDelay);
      }
    });
  }
}

function formatSeenRelative(value) {
  const timestamp = new Date(value).getTime();
  if (!Number.isFinite(timestamp)) return 'Seen';
  const elapsed = Math.max(0, Date.now() - timestamp);
  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;
  const week = 7 * day;
  const month = 30 * day;
  const year = 365 * day;

  if (elapsed < minute) return 'Seen';
  if (elapsed < hour) return 'Seen ' + Math.floor(elapsed / minute) + 'm';
  if (elapsed < day) {
    const count = Math.floor(elapsed / hour);
    return 'Seen ' + count + 'hr';
  }
  if (elapsed < week) {
    const count = Math.floor(elapsed / day);
    return 'Seen ' + count + (count === 1 ? 'day' : 'days');
  }
  if (elapsed < month) {
    const count = Math.floor(elapsed / week);
    return 'Seen ' + count + (count === 1 ? 'week' : 'weeks');
  }
  if (elapsed < year) {
    const count = Math.floor(elapsed / month);
    return 'Seen ' + count + (count === 1 ? 'month' : 'months');
  }
  const count = Math.floor(elapsed / year);
  return 'Seen ' + count + (count === 1 ? 'year' : 'years');
}

function hideSeenReceiptImmediately() {
  // A newly received friend message invalidates the previous Seen receipt at once.
  document.querySelectorAll('#chatThread .chat-seen-receipt').forEach(node => node.remove());
  for (const item of feed) {
    if (item.kind === 'note' && String(item.author?.id || item.owner_id) === String(me?.id || '')) {
      item.seen_by_count = 0;
      item.last_seen_at = null;
    }
  }
}

async function checkForIncomingFriendNote() {
  if (!sb || !me?.id || page !== 'notes' || document.hidden || notesIncomingPollInFlight) return;
  notesIncomingPollInFlight = true;
  try {
    const { data, error } = await sb.from('memories')
      .select('id,owner_id,kind,created_at')
      .eq('kind', 'note')
      .neq('owner_id', me.id)
      .order('created_at', { ascending: false })
      .order('id', { ascending: false })
      .limit(1)
      .maybeSingle();
    if (error) throw error;
    if (!data) return;
    const incomingId = String(data.id);
    if (lastObservedFriendNoteId === null) {
      lastObservedFriendNoteId = incomingId;
      return;
    }
    if (incomingId !== lastObservedFriendNoteId) {
      lastObservedFriendNoteId = incomingId;
      hideSeenReceiptImmediately();
      // Fetch the conversation in the background; the old Seen is already gone.
      const freshFeed = await api('/feed');
      // Merge the latest server rows into the in-memory feed. Replacing the
      // array here discards already-loaded photo/song pages and older history.
      mergeFeedRows(freshFeed);
      if (page === 'notes') renderNotesPage();
    }
  } catch (error) {
    console.warn('Incoming Notes check failed:', error?.message || error);
  } finally {
    notesIncomingPollInFlight = false;
  }
}

function startNotesIncomingPoll() {
  if (notesIncomingPollTimer) return;
  void checkForIncomingFriendNote();
  notesIncomingPollTimer = setInterval(() => {
    if (page === 'notes' && !document.hidden) void checkForIncomingFriendNote();
  }, 5000);
}

async function markNotesDelivered(messages = []) {
  if (!sb || !me?.id) return;
  const ids = messages
    .filter(item => item?.kind === 'note' && !item.isPending &&
      String(item.author?.id || item.owner_id || '') !== String(me.id))
    .map(item => Number(item.id)).filter(Number.isFinite)
    .filter(id => !noteDeliveredLocally.has(String(id)) && !noteDeliveryInFlight.has(String(id)));
  if (!ids.length) return;
  ids.forEach(id => noteDeliveryInFlight.add(String(id)));
  try {
    const { error } = await sb.rpc('mark_notes_delivered', { p_message_ids: ids });
    if (error) throw error;
    ids.forEach(id => noteDeliveredLocally.add(String(id)));
  } catch (error) {
    console.warn('Message delivery acknowledgement deferred:', error?.message || error);
  } finally {
    ids.forEach(id => noteDeliveryInFlight.delete(String(id)));
  }
}

async function refreshOwnNoteSeenStatus() {
  if (!me || !sb) return;
  if (seenStatusRefreshInFlight) {
    seenStatusRefreshQueued = true;
    return;
  }
  seenStatusRefreshInFlight = true;
  try {
    // Fetch the owner's newest note and read cursors directly in parallel.
    // This avoids the extra API wrapper request and its duplicate cursor query.
    const [{ data: latestOwnNote, error: latestError }, { data: cursors, error: cursorError }, { data: deliveries, error: deliveryError }] = await Promise.all([
      sb.from('memories').select('id').eq('owner_id', me.id).eq('kind', 'note')
        .order('id', { ascending: false }).limit(1).maybeSingle(),
      sb.from('note_read_cursors').select('reader_id,last_read_message_id,last_read_at')
        .eq('owner_id', me.id).order('last_read_message_id', { ascending: false }),
      sb.from('note_delivery_receipts').select('message_id,reader_id,delivered_at').eq('owner_id', me.id)
    ]);
    if (latestError) throw latestError;
    if (cursorError) throw cursorError;
    if (deliveryError) throw deliveryError;

    for (const item of feed) {
      if (item.kind !== 'note' || String(item.author?.id || item.owner_id) !== String(me.id)) continue;
      const messageId = Number(item.id) || 0;
      const readers = (cursors || []).filter(cursor => Number(cursor.last_read_message_id) >= messageId && messageId > 0);
      item.seen_by_count = readers.length;
      item.last_seen_at = readers.map(cursor => cursor.last_read_at).filter(Boolean).sort().at(-1) || null;
      item.delivered_by_count = (deliveries || []).filter(receipt => Number(receipt.message_id) === messageId).length;
    }

    const latestConversationNote = feed
      .filter(item => item.kind === 'note' && !item.isPending)
      .slice()
      .sort((a, b) => new Date(b.createdAt || b.created_at || 0) - new Date(a.createdAt || a.created_at || 0))[0];
    const latestConversationNoteIsMine = latestConversationNote &&
      String(latestConversationNote.author?.id || latestConversationNote.owner_id) === String(me.id);
    const latestOwnMessageId = Number(latestConversationNote?.id || 0);
    const latestOwnNoteId = Number(latestOwnNote?.id || 0);
    const seenCursors = (cursors || []).filter(cursor =>
      latestOwnMessageId > 0 && Number(cursor.last_read_message_id) >= latestOwnMessageId
    );

    if (latestConversationNoteIsMine && latestOwnMessageId <= latestOwnNoteId && seenCursors.length) {
      latestConversationNote.seen_by_count = seenCursors.length;
      latestConversationNote.last_seen_at = seenCursors
        .map(cursor => cursor.last_read_at)
        .filter(Boolean)
        .sort()
        .at(-1) || null;
    }
    if (page === 'notes') renderNotesPage();
  } catch (error) {
    console.warn('Notes seen status could not refresh:', error?.message || error);
  } finally {
    seenStatusRefreshInFlight = false;
    if (seenStatusRefreshQueued) {
      seenStatusRefreshQueued = false;
      clearTimeout(seenStatusRefreshTimer);
      seenStatusRefreshTimer = setTimeout(() => void refreshOwnNoteSeenStatus(), 0);
    }
  }
}

function handleNotesPageTransition(payload) {
  const senderId = String(payload?.user_id || payload?.userId || '');
  const senderUsername = String(payload?.username || '').trim().toLowerCase();
  if (!senderId && !senderUsername) return;
  if (page !== 'notes' || document.hidden) return;

  const ownId = String(me?.id || '');
  const ownUsername = String(me?.username || '').trim().toLowerCase();
  if ((senderId && senderId === ownId) ||
      (senderUsername && senderUsername === ownUsername)) return;

  const isFriend = (Array.isArray(friends) ? friends : []).some(friend => {
    const friendId = String(friend?.id || friend?.user_id || '');
    const friendUsername = String(friend?.username || '').trim().toLowerCase();
    return (!!senderId && !!friendId && senderId === friendId) ||
      (!!senderUsername && !!friendUsername && senderUsername === friendUsername);
  });
  if (!isFriend) return;

  const transition = String(payload?.transition || '').toLowerCase();
  if (transition !== 'entered' && transition !== 'left') return;
  triggerFriendPresenceSweep(senderId || senderUsername, transition);
}

async function sendNotesPageTransition(payload) {
  if (!payload) return;
  if (!notesActivityChannel || !notesActivityChannelReady) {
    pendingNotesPageTransitions.push(payload);
    if (pendingNotesPageTransitions.length > 20) pendingNotesPageTransitions.shift();
    return;
  }
  const channel = notesActivityChannel;
  try {
    const result = await channel.send({
      type: 'broadcast',
      event: 'notes_page_transition',
      payload
    });
    if (result !== 'ok') {
      console.warn('Notes page transition broadcast was not acknowledged:', result);
    }
  } catch (error) {
    console.warn('Notes page transition broadcast failed:', error?.message || error);
  }
}

async function clearActiveNotesNotifications() {
  if (!me || page !== 'notes') return;
  const userId = String(me.id);
  try {
    const rows = await api('/notifications');
    if (String(me?.id || '') !== userId || page !== 'notes') return;
    const noteRows = rows.filter(row => row.kind === 'note');
    if (!noteRows.length) return;
    const noteIds = new Set(noteRows.map(row => String(row.id)));
    notificationRows = notificationRows.filter(row => !noteIds.has(String(row.id)));
    updateNotificationBadge();
    await Promise.all(noteRows.map(row =>
      api('/notifications/' + encodeURIComponent(row.id), { method: 'DELETE' }).catch(error => {
        console.warn('Active Notes notification could not be dismissed:', error?.message || error);
      })
    ));
  } catch (error) {
    console.warn('Active Notes notifications could not be refreshed:', error?.message || error);
  }
}

function syncChatComposerState(field = $('#chatInput')) {
  const send = $('#chatSend');
  const composer = $('#chatComposer');
  if (!send || !composer) return;
  const hasMessage = !!field?.value.trim();
  composer.classList.toggle('has-message', hasMessage);
  send.hidden = !hasMessage;
  send.disabled = !hasMessage;
  send.setAttribute('aria-hidden', String(!hasMessage));
  send.setAttribute('aria-label', hasMessage ? 'Send message' : 'Write a message first');
}

function isTouchNotesViewport() {
  const touchDevice = window.matchMedia('(pointer: coarse)').matches || (navigator.maxTouchPoints || 0) > 0;
  return window.matchMedia('(max-width: 720px)').matches && touchDevice;
}

function syncNotesKeyboardLayout() {
  const notesPage = document.querySelector('.chat-page');
  if (!notesPage || page !== 'notes') {
    document.body.classList.remove('notes-keyboard-open');
    document.body.classList.remove('notes-header-hidden');
    notesHeaderLastScrollTop = null;
    notesKeyboardDismissed = false;
    document.documentElement.style.setProperty('--notes-keyboard-inset', '0px');
    document.documentElement.style.removeProperty('--notes-page-height');
    notesKeyboardFollowLatest = false;
    return;
  }

  const input = $('#chatInput');
  const thread = $('#chatThread');
  const composer = $('#chatComposer');
  const focused = document.activeElement === input;
  const viewport = window.visualViewport;
  const mobile = isTouchNotesViewport();
  const visualHeight = viewport?.height || window.innerHeight;
  const visualTop = viewport?.offsetTop || 0;
  const visibleViewportBottom = visualTop + visualHeight;
  const keyboardInset = Math.max(0, Math.round(window.innerHeight - visibleViewportBottom));
  const viewportHeightDrop = Math.max(0, window.innerHeight - visualHeight);
  const wasOpen = document.body.classList.contains('notes-keyboard-open');

  // Use separate open/close thresholds to avoid flicker while the keyboard animates.
  const viewportSuggestsKeyboard = viewport
    ? (
      keyboardInset > (wasOpen ? 48 : 100) ||
      viewportHeightDrop > (wasOpen ? 70 : 130) ||
      visualHeight < window.screen.height * 0.72
    )
    : window.innerHeight < window.screen.height * 0.72;
  const keyboardOpen = mobile && viewportSuggestsKeyboard && (focused || wasOpen);

  // Follow the newest message only when the reader was already at the bottom.
  // This keeps the latest conversation visible without pulling someone away
  // from older messages they were intentionally reading.
  if (keyboardOpen && !wasOpen && thread) {
    const distanceFromBottom = thread.scrollHeight - thread.scrollTop - thread.clientHeight;
    notesKeyboardFollowLatest = distanceFromBottom < 88;
  }

  notesPage.classList.toggle('notes-keyboard-open', keyboardOpen);
  document.body.classList.toggle('notes-keyboard-open', keyboardOpen);
  if (keyboardOpen && focused && !notesKeyboardDismissed) {
    document.body.classList.add('notes-header-hidden');
    notesHeaderLastScrollTop = thread?.scrollTop ?? notesHeaderLastScrollTop;
  } else if (wasOpen || notesKeyboardDismissed) {
    document.body.classList.remove('notes-header-hidden');
    notesHeaderLastScrollTop = thread?.scrollTop ?? null;
  }
  if (!keyboardOpen) notesKeyboardDismissed = false;
  document.documentElement.style.setProperty(
    '--notes-keyboard-inset',
    keyboardOpen ? keyboardInset + 'px' : '0px'
  );

  if (keyboardOpen) {
    // Constrain the message list to the visible viewport ending just above
    // the software keyboard, while keeping the top app header in its original place.
    const pageTop = notesPage.getBoundingClientRect().top;
    const availableHeight = Math.max(180, Math.floor(visibleViewportBottom - pageTop));
    document.documentElement.style.setProperty('--notes-page-height', availableHeight + 'px');

    // The composer floats over the bottom of the thread, so reserve its height
    // to ensure the last message can scroll fully into view above the input.
    if (thread) {
      const composerHeight = Math.ceil(composer?.getBoundingClientRect().height || 50);
      const bottomClearance = composerHeight + 20;
      thread.style.setProperty('padding-bottom', bottomClearance + 'px', 'important');
      thread.style.setProperty('scroll-padding-bottom', bottomClearance + 'px');
    }

    requestAnimationFrame(() => {
      if (!notesPage.isConnected || !thread?.isConnected || !notesKeyboardFollowLatest) return;
      thread.scrollTop = thread.scrollHeight;
    });
  } else {
    document.documentElement.style.removeProperty('--notes-page-height');
    thread?.style.removeProperty('padding-bottom');
    thread?.style.removeProperty('scroll-padding-bottom');
    notesKeyboardFollowLatest = false;
  }
}

function scheduleNotesKeyboardLayout() {
  if (notesKeyboardSyncFrame) return;
  notesKeyboardSyncFrame = requestAnimationFrame(() => {
    notesKeyboardSyncFrame = 0;
    syncNotesKeyboardLayout();
  });
}

function syncNotesSeenReceiptVisibility(thread = $('#chatThread')) {
  if (!thread) return;
  const status = $('#chatSeenStatus');
  if (!status) return;
  const distanceFromBottom = Math.max(0, thread.scrollHeight - thread.scrollTop - thread.clientHeight);
  const hasReceipt = status.getAttribute('aria-label') !== 'Not seen';
  status.hidden = !hasReceipt || distanceFromBottom > 32;
}
