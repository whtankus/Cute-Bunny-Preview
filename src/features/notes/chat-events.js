/* Notes composer keyboard and submit behaviour. Loaded after app.js. */
(() => {
  'use strict';

  document.addEventListener('click', event => {
    const picker = event.target.closest('#chatPhotoPicker');
    if (picker) {
      event.preventDefault();
      document.querySelector('#chatPhotoInput')?.click();
      return;
    }

    const remove = event.target.closest('[data-chat-photo-remove]');
    if (remove) {
      event.preventDefault();
      const id = remove.getAttribute('data-chat-photo-remove');
      const selected = notesSelectedPhotos.find(item => item.clientPhotoId === id);
      if (selected?.previewUrl?.startsWith('blob:')) URL.revokeObjectURL(selected.previewUrl);
      notesSelectedPhotos = notesSelectedPhotos.filter(item => item.clientPhotoId !== id);
      window.renderNotesPhotoSelection?.();
      return;
    }

    const openPhoto = event.target.closest('[data-chat-open-photo]');
    if (openPhoto && typeof window.openPhotoLightbox === 'function') {
      const img = openPhoto.querySelector('img');
      const message = openPhoto.closest('.chat-message');
      const ownerId = message?.dataset.owner || '';
      const photoId = openPhoto.dataset.chatOpenPhoto || '';
      void window.openPhotoLightbox(photoId, {
        id: photoId, kind: 'photo', owner_id: ownerId,
        storagePath: img?.dataset.storagePath || '',
        contentType: img?.dataset.contentType || '',
        author: { id: ownerId },
        previewUrl: img?.currentSrc || img?.getAttribute('src') || ''
      });
    }
  });

  document.addEventListener('change', event => {
    if (event.target.id !== 'chatPhotoInput') return;
    const input = event.target;
    const files = [...(input.files || [])];
    const room = Math.max(0, 3 - notesSelectedPhotos.length);
    if (files.length > room) window.toast?.('You can attach up to three photos ♡');
    files.slice(0, room).forEach(file => {
      const validType = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(file.type);
      const validSize = file.size <= 8 * 1024 * 1024;
      if (!validType) { window.toast?.('Choose a JPG, PNG, WebP, or GIF image.'); return; }
      if (!validSize) { window.toast?.('Each photo must be under 8 MB.'); return; }
      notesSelectedPhotos.push({
        clientPhotoId: crypto.randomUUID(), file, previewUrl: URL.createObjectURL(file)
      });
    });
    input.value = '';
    window.renderNotesPhotoSelection?.();
  });

  document.addEventListener('input', event => {
    if (event.target.id === 'chatInput') window.syncChatComposerState?.(event.target);
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
