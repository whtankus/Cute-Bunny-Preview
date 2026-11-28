/* bearfriend-home-view.js
   Glue between the app's Home section and the Bearfriend home scene.
   Load order:  bear-pose-engine.js  ->  bearfriend-home.js  ->  bearfriend-home-view.js  ->  app.js

   Usage (call from wherever the app renders Home):
     BearfriendHomeView.render(containerEl);    // draws the scene + controls and mounts it
     BearfriendHomeView.destroy(containerEl);   // call before Home is removed / re-rendered

   NOTE: bear-pose-engine.js now defines createBearfriendHomeEngine, so it no longer clashes with app.js's createBearPoseEngine. */
(function () {
  const FRAME = "<div class=\"bfh\" data-bearfriend-home>\n  <div class=\"bfh-scene couple-bears-scene\" id=\"scene\">\n    <svg id=\"bg\" viewBox=\"90 120 420 270\" preserveAspectRatio=\"xMidYMid slice\"></svg>\n    <svg id=\"bearPoseSvg\" viewBox=\"66.667 98 466.667 300\" preserveAspectRatio=\"xMidYMid slice\"></svg>\n    <svg id=\"fg\" viewBox=\"90 120 420 270\" preserveAspectRatio=\"xMidYMid slice\"></svg>\n    <canvas id=\"wx\"></canvas>\n    <div id=\"tint\"></div>\n    <div id=\"pops\"></div>\n  </div>";
  const ACTIONS = [["hug", "🤗", "Hug"], ["kiss", "💋", "Kiss"], ["flykiss", "😘", "Flying Kiss"], ["slap", "🖐️", "Playful Slap"], ["hands", "🫶", "Hold Hands"], ["feed", "🍓", "Feed"], ["sleep", "💤", "Sleep"], ["dance", "💃", "Dance"], ["pet", "🐾", "Pet"], ["tummy", "🫳", "Scratch Tummy"], ["idle", "🌸", "Relax"]];
  const ROOMS = [["living", "🛋️ Living"], ["kitchen", "🍳 Kitchen"], ["bedroom", "🛏️ Bedroom"], ["balcony", "🌆 Balcony"], ["garden", "🌷 Garden"]];

  function render(container) {
    if (!container) return null;
    destroy(container);
    container.innerHTML =
      FRAME +
      '<div class="bfh-controls" data-bfh-controls>' +
        '<div class="bfh-rooms" role="group" aria-label="Rooms">' +
          ROOMS.map(r => '<button type="button" data-room="' + r[0] + '">' + r[1] + '</button>').join('') +
        '</div>' +
        '<div class="bfh-acts" id="acts" role="group" aria-label="Bear actions">' +
          ACTIONS.map(a => '<button type="button" data-a="' + a[0] + '" aria-pressed="false" title="' + a[2] + '"><span>' + a[1] + '</span> ' + a[2] + '</button>').join('') +
        '</div>' +
      '</div></div>';
    const root = container.querySelector('[data-bearfriend-home]');
    window.BearfriendHome.mount(root);
    const BH = window.BearfriendHome;
    container.querySelectorAll('[data-room]').forEach(b => {
      b.onclick = () => BH.setScene(b.dataset.room, 'auto', 'clear');
    });
    // Bear Hugs progression delegates [data-couple-action] clicks and invokes the app's shared action handler.
    return root;
  }

  function destroy(container) {
    const root = container && container.querySelector && container.querySelector('[data-bearfriend-home]');
    if (root && window.BearfriendHome && window.BearfriendHome.unmount) window.BearfriendHome.unmount(root);
    if (container) container.innerHTML = '';
  }

  window.BearfriendHomeView = { render, destroy };
})();