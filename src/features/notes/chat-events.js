/* Notes composer keyboard and submit behaviour. Loaded after app.js. */
(() => {
  'use strict';

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
