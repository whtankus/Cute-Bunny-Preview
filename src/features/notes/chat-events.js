/* Notes composer keyboard and submit behaviour. Loaded after app.js. */
(() => {
  'use strict';

  document.addEventListener('click', event => {
    const attach = event.target.closest('#chatPhotoAttach');
    if (attach) {
      const input = document.getElementById('chatPhotoInput');
      if (input) { input.value = ''; input.click(); }
      return;
    }
    const remove = event.target.closest('[data-chat-photo-remove]');
    if (remove) {
      const index = Number(remove.dataset.chatPhotoRemove);
      if (!Number.isInteger(index) || !Array.isArray(window.pendingChatPhotoFiles)) return;
      const file = window.pendingChatPhotoFiles.splice(index, 1)[0];
      const url = window.pendingChatPhotoUrls.splice(index, 1)[0];
      if (url) URL.revokeObjectURL(url);
      if (typeof window.syncChatPhotoPreview === 'function') window.syncChatPhotoPreview();
      return;
    }
  });

  document.addEventListener('change', event => {
    if (event.target.id !== 'chatPhotoInput') return;
    const input = event.target;
    const files = [...(input.files || [])];
    input.value = '';
    if (!files.length) return;
    const pendingFiles = window.pendingChatPhotoFiles;
    const pendingUrls = window.pendingChatPhotoUrls;
    if (pendingFiles.length + files.length > 3) {
      if (typeof window.toast === 'function') window.toast('Choose up to three photos per message.');
      return;
    }
    for (const file of files) {
      if (file.size > 8 * 1024 * 1024) {
        if (typeof window.toast === 'function') window.toast('Each photo must be under 8 MB.');
        return;
      }
      if (!['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(file.type)) {
        if (typeof window.toast === 'function') window.toast('Choose JPG, PNG, WebP, or GIF images.');
        return;
      }
    }
    files.forEach(file => {
      pendingFiles.push(file);
      pendingUrls.push(URL.createObjectURL(file));
    });
    if (typeof window.syncChatPhotoPreview === 'function') window.syncChatPhotoPreview();
  });

  document.addEventListener('submit', event => {
    if (event.target.id !== 'chatComposer') return;
    event.preventDefault();
    if (typeof window.sendChatMessage === 'function') void window.sendChatMessage();
  });

  document.addEventListener('keydown', event => {
    if (
      event.target.id !== 'chatInput' ||
      event.key !== 'Enter' ||
      event.shiftKey ||
      event.isComposing ||
      event.keyCode === 229 ||
      typeof window.isTouchNotesViewport !== 'function' ||
      window.isTouchNotesViewport()
    ) return;

    // Desktop Enter sends; touch keyboards retain their native newline behaviour.
    event.preventDefault();
    if (typeof window.sendChatMessage === 'function') void window.sendChatMessage();
  });
})();
