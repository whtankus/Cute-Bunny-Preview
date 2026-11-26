/* Keep the reply composer in the dedicated bottom dock. The quote preview
   lives inside the composer, so replying never relocates the input over a photo. */
(() => {
  const keepComposerDocked = () => {
    const page = document.querySelector('#content .chat-page');
    const thread = page?.querySelector('#chatThread');
    const composer = page?.querySelector('#chatComposer');
    if (!page || !thread || !composer) return;
    if (composer.parentElement !== page) page.append(composer);
    page.classList.remove('is-reply-inline');
  };
  const observeContent = () => {
    const content = document.getElementById('content');
    if (!content || content.__cbComposerDockObserver) return;
    const observer = new MutationObserver(keepComposerDocked);
    observer.observe(content, { childList:true, subtree:true });
    content.__cbComposerDockObserver = observer;
    keepComposerDocked();
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', observeContent, { once:true });
  else observeContent();
  document.addEventListener('click', event => {
    if (event.target.closest('#nav [data-page="notes"]')) requestAnimationFrame(keepComposerDocked);
  });
})();
