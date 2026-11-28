(() => {
  'use strict';

  const ROOM_MS = 6 * 60 * 1000;
  const TIME_MS = 4 * 60 * 1000;
  const WEATHER_MS = 5 * 60 * 1000;
  const ROOMS = ['living', 'bedroom', 'garden'];
  const TIMES = ['morning', 'afternoon', 'evening', 'night'];
  const WEATHER = ['clear', 'cloudy', 'rain', 'snow'];
  const LABELS = {
    living: 'Living room', bedroom: 'Dreamy bedroom', garden: 'Flower garden',
    morning: 'Morning', afternoon: 'Afternoon', evening: 'Evening', night: 'Night',
    clear: 'Clear skies', cloudy: 'Cloudy', rain: 'Rain', snow: 'Snow'
  };
  const $ = (selector, root = document) => root.querySelector(selector);
  let lastSignature = '';

  function pairSeed() {
    let partner = '';
    try { partner = localStorage.getItem('cuteBunnyBearSelectedFriend:v1') || ''; } catch {}
    const own = typeof me !== 'undefined' ? String(me?.id || '') : String(window.currentUser?.id || '');
    return [own, partner].filter(Boolean).sort().join(':') || 'cute-bunny-bearfriend-world';
  }

  function hash(value) {
    let h = 2166136261;
    for (let i = 0; i < value.length; i++) {
      h ^= value.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return h >>> 0;
  }

  function weatherFor(slot) {
    const seed = pairSeed();
    const previousIndex = hash(seed + ':' + (slot - 1)) % WEATHER.length;
    const choices = WEATHER.filter((item, index) => index !== previousIndex);
    return choices[hash(seed + ':' + slot) % choices.length];
  }

  function stateAt(now = Date.now()) {
    const roomSlot = Math.floor(now / ROOM_MS);
    const timeSlot = Math.floor(now / TIME_MS);
    const weatherSlot = Math.floor(now / WEATHER_MS);
    return {
      room: ROOMS[((roomSlot % ROOMS.length) + ROOMS.length) % ROOMS.length],
      time: TIMES[((timeSlot % TIMES.length) + TIMES.length) % TIMES.length],
      weather: weatherFor(weatherSlot)
    };
  }

  function cloud(x, y, scale, opacity) {
    return '<g transform="translate(' + x + ' ' + y + ') scale(' + scale + ')" fill="#fff" opacity="' + opacity + '">' +
      '<ellipse cx="0" cy="7" rx="31" ry="10"/><ellipse cx="13" cy="0" rx="19" ry="14"/><ellipse cx="-13" cy="2" rx="16" ry="12"/>' +
      '</g>';
  }

  function windowArt(time, weather) {
    const night = time === 'night';
    const sky = '<linearGradient id="bearWorldSky" x1="0" y1="0" x2="0" y2="1">' +
      '<stop offset="0" stop-color="' + (night ? '#20254f' : time === 'evening' ? '#f08d83' : time === 'morning' ? '#ffd4bd' : '#8fd0f2') + '"/>' +
      '<stop offset="1" stop-color="' + (night ? '#51558b' : time === 'evening' ? '#f8c7a6' : time === 'morning' ? '#fff0e3' : '#e8f6ff') + '"/>' +
      '</linearGradient>';
    const sun = night
      ? '<circle cx="300" cy="182" r="14" fill="#fff3c7"/><circle cx="306" cy="176" r="14" fill="#424a79"/>'
      : '<circle cx="' + (time === 'evening' ? 320 : 282) + '" cy="' + (time === 'morning' ? 181 : 173) + '" r="16" fill="' + (time === 'evening' ? '#ffad73' : '#ffe29a') + '"/>';
    const stars = night ? Array.from({length: 15}, (_, i) =>
      '<circle cx="' + (265 + (i * 29) % 68) + '" cy="' + (164 + (i * 17) % 62) + '" r="' + (i % 3 ? 1.2 : 2) + '" fill="#fff"/>'
    ).join('') : '';
    const clouds = weather === 'clear' ? '' : cloud(280, 183, .8, weather === 'cloudy' ? .88 : .55) + cloud(324, 207, .65, weather === 'cloudy' ? .8 : .45);
    return '<defs>' + sky + '</defs><rect x="258" y="155" width="84" height="80" fill="url(#bearWorldSky)"/>' +
      stars + sun + clouds;
  }

  function roomArt(room, time, weather) {
    const wall = room === 'bedroom' ? '#eee5f7' : '#fbe5ec';
    const floor = room === 'bedroom' ? '#dfc8d7' : '#f0cfae';
    if (room === 'garden') {
      const skyTop = time === 'night' ? '#20254f' : time === 'evening' ? '#ef927f' : time === 'morning' ? '#ffd7c0' : '#91d2ef';
      const skyBottom = time === 'night' ? '#565b8d' : time === 'evening' ? '#f8c7a8' : '#eaf7ff';
      const stars = time === 'night' ? Array.from({length: 22}, (_, i) =>
        '<circle cx="' + (105 + (i * 47) % 390) + '" cy="' + (133 + (i * 31) % 105) + '" r="' + (i % 4 ? 1 : 1.7) + '" fill="#fff" opacity=".85"/>'
      ).join('') : '';
      return '<defs><linearGradient id="bearWorldOutdoor" x1="0" y1="0" x2="0" y2="1"><stop stop-color="' + skyTop + '"/><stop offset="1" stop-color="' + skyBottom + '"/></linearGradient></defs>' +
        '<rect x="90" y="120" width="420" height="270" fill="url(#bearWorldOutdoor)"/>' + stars +
        (weather === 'clear' ? '' : cloud(220, 177, 1.1, weather === 'cloudy' ? .9 : .55) + cloud(405, 205, .9, weather === 'cloudy' ? .82 : .5)) +
        '<circle cx="430" cy="173" r="18" fill="' + (time === 'night' ? '#fff1c6' : '#ffe2a0') + '" opacity="' + (weather === 'cloudy' || weather === 'rain' ? '.5' : '.95') + '"/>' +
        '<path d="M90 290 Q160 235 245 282 T410 270 T510 265 V390 H90Z" fill="#b9d7a9"/>' +
        '<path d="M90 315 Q180 275 275 310 T510 296 V390 H90Z" fill="#91bd8a"/>' +
        '<path d="M90 346 Q180 322 270 344 T510 330 V390 H90Z" fill="#80ad7d"/>' +
        '<path d="M90 365 Q180 348 260 364 T510 350" fill="none" stroke="#d7e6bb" stroke-width="3" opacity=".65"/>' +
        '<g fill="#f6d3e3"><circle cx="145" cy="291" r="4"/><circle cx="180" cy="306" r="3"/><circle cx="456" cy="292" r="4"/><circle cx="480" cy="312" r="3"/></g>';
    }

    const stripes = Array.from({length: 16}, (_, i) =>
      '<path d="M' + (100 + i * 27) + ' 120 V292" stroke="' + (room === 'bedroom' ? '#d9c8ec' : '#f4c8d8') + '" stroke-width="2" opacity=".34"/>'
    ).join('');
    const roomWindow = '<rect x="252" y="149" width="96" height="92" rx="12" fill="#fff" stroke="#e8c6d4" stroke-width="4"/>' +
      '<defs><clipPath id="bearWorldWindowClip"><rect x="258" y="155" width="84" height="80" rx="8"/></clipPath></defs>' +
      '<g clip-path="url(#bearWorldWindowClip)">' + windowArt(time, weather) + '</g>' +
      '<path d="M300 155V235M258 195H342" stroke="#fff" stroke-width="3"/>' +
      '<rect x="246" y="240" width="108" height="8" rx="4" fill="#f3d3df"/>';
    const furniture = room === 'living'
      ? '<rect x="120" y="256" width="154" height="47" rx="15" fill="#e6b4c6" stroke="#cf91ab" stroke-width="3"/><rect x="130" y="267" width="134" height="35" rx="12" fill="#f8dbe5"/><path d="M137 303v12m120-12v12" stroke="#b98778" stroke-width="6" stroke-linecap="round"/>' +
        '<rect x="390" y="254" width="62" height="42" rx="7" fill="#e8c5a8"/><path d="M421 254v-26" stroke="#9e7a62" stroke-width="4"/><path d="M406 228h30l-7-19h-16z" fill="#fff0c5" stroke="#d9b98c" stroke-width="2"/>'
      : '<rect x="145" y="251" width="310" height="53" rx="15" fill="#d4b5e5"/><rect x="137" y="279" width="326" height="43" rx="13" fill="#fff" stroke="#d9c5e8" stroke-width="3"/><rect x="143" y="296" width="314" height="26" rx="10" fill="#f2c4d5"/><path d="M155 322v15m290-15v15" stroke="#b58da7" stroke-width="6" stroke-linecap="round"/><path d="M420 250q22-25 44 0" fill="none" stroke="#c59bdc" stroke-width="6"/>';
    return '<rect x="90" y="120" width="420" height="270" fill="' + wall + '"/>' + stripes + roomWindow +
      '<rect x="90" y="292" width="420" height="98" fill="' + floor + '"/>' +
      '<path d="M90 320H510M90 350H510M90 380H510" stroke="#fff" stroke-width="2" opacity=".32"/>' +
      furniture +
      '<ellipse cx="300" cy="357" rx="115" ry="21" fill="#f7d3e2" stroke="#fff" stroke-width="4" stroke-dasharray="3 8" opacity=".9"/>' +
      '<path d="M115 292h22v-38q-11-16-22 0z" fill="#8ebc8a"/><path d="M115 255q-19-16-12-28 18 0 20 20 8-22 24-16 2 18-22 26" fill="#9bc995"/>';
  }

  function weatherArt(weather) {
    if (weather === 'clear') return '';
    if (weather === 'cloudy') return cloud(185, 165, .9, .58) + cloud(390, 184, 1.1, .62);
    const particles = Array.from({length: 34}, (_, i) => {
      const x = 102 + (i * 61) % 396;
      const y = 128 + (i * 37) % 244;
      if (weather === 'snow') return '<circle class="bear-world-snowflake" cx="' + x + '" cy="' + y + '" r="' + (1.3 + (i % 3) * .65) + '" fill="#fff" opacity=".85" style="--flake-delay:-' + (i % 9) + 's"/>';
      return '<path class="bear-world-raindrop" d="M' + x + ' ' + y + ' l-5 13" stroke="#8caed0" stroke-width="1.8" stroke-linecap="round" opacity=".78" style="--rain-delay:-' + (i % 8) * .17 + 's"/>';
    }).join('');
    return '<g class="bear-world-weather">' + particles + '</g>';
  }

  function backdropMarkup(state) {
    const scene = roomArt(state.room, state.time, state.weather);
    const tint = state.time === 'night' ? '#25265e' : state.time === 'evening' ? '#ff9b76' : state.time === 'morning' ? '#ffd9b6' : '#fff';
    const opacity = state.time === 'night' ? .23 : state.time === 'evening' ? .12 : state.time === 'morning' ? .07 : .025;
    return '<svg class="bear-world-svg" viewBox="90 120 420 270" preserveAspectRatio="xMidYMid slice" aria-hidden="true">' +
      scene + '<rect x="90" y="120" width="420" height="270" fill="' + tint + '" opacity="' + opacity + '" pointer-events="none"/>' +
      weatherArt(state.weather) + '</svg>';
  }

  function ensureLayer(scene) {
    let layer = $('.bear-world-backdrop', scene);
    if (layer) return layer;
    layer = document.createElement('div');
    layer.className = 'bear-world-backdrop';
    layer.setAttribute('aria-hidden', 'true');
    scene.insertBefore(layer, $('#bearPoseSvg', scene));
    return layer;
  }

  function applyState() {
    const scene = $('#coupleBearGame .couple-bears-scene');
    if (!scene || !$('#bearPoseSvg', scene)) return;
    const state = stateAt();
    const signature = [state.room, state.time, state.weather].join('|');
    if (signature === lastSignature && $('.bear-world-backdrop', scene)) return;
    lastSignature = signature;
    scene.dataset.worldRoom = state.room;
    scene.dataset.worldTime = state.time;
    scene.dataset.worldWeather = state.weather;
    TIMES.forEach(name => scene.classList.toggle('bear-time-' + name, name === state.time));
    scene.setAttribute('aria-label', 'Bearfriend home: ' + LABELS[state.room] + ', ' + LABELS[state.time] + ', ' + LABELS[state.weather]);
    const layer = ensureLayer(scene);
    layer.innerHTML = backdropMarkup(state);
    let status = $('.bear-world-status', scene);
    if (!status) {
      status = document.createElement('span');
      status.className = 'bear-world-status';
      status.setAttribute('aria-hidden', 'true');
      scene.appendChild(status);
    }
    status.textContent = LABELS[state.room] + ' · ' + LABELS[state.time] + ' · ' + LABELS[state.weather];
  }

  function install() {
    applyState();
    const observer = new MutationObserver(() => {
      if ($('#coupleBearGame .couple-bears-scene') && !$('.bear-world-backdrop', $('#coupleBearGame .couple-bears-scene'))) applyState();
    });
    observer.observe(document.body, { childList: true, subtree: true });
    window.setInterval(applyState, 15000);
    document.addEventListener('visibilitychange', () => { if (!document.hidden) applyState(); });
    window.addEventListener('focus', applyState);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', install, { once: true });
  else install();
})();
