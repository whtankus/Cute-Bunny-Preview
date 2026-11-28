(() => {
  'use strict';

  if (window.__cuteBunnyBearfriendWorldInstalled) return;
  window.__cuteBunnyBearfriendWorldInstalled = true;

  const ROOM_ORDER = ['living', 'kitchen', 'bedroom', 'balcony', 'garden'];
  const ROOM_META = {
    living: { label: 'Living room', icon: '🛋️', sky: '#f8dfe8', ground: '#f0cfae' },
    kitchen: { label: 'Kitchen', icon: '🍪', sky: '#fff0dc', ground: '#ead0b8' },
    bedroom: { label: 'Bedroom', icon: '🛏️', sky: '#e8def7', ground: '#d8c6ec' },
    balcony: { label: 'Balcony', icon: '🌙', sky: '#b9c4e7', ground: '#cdb9dc' },
    garden: { label: 'Garden', icon: '🌷', sky: '#c7e6d2', ground: '#a9d39e' }
  };
  const TIME_ORDER = ['morning', 'afternoon', 'evening', 'night'];
  const TIME_LABELS = {
    morning: 'Morning light',
    afternoon: 'Sunny afternoon',
    evening: 'Golden evening',
    night: 'Moonlit night'
  };
  const WEATHER_LABELS = { clear: '☀️ Clear', rain: '🌧️ Rain', snow: '❄️ Snow' };
  const active = new Map();

  // Register before the Bear Hugs progression listener: a completed drag is
  // movement, not a tap, so it must not accidentally send an extra pet action.
  document.addEventListener('click', event => {
    const bunny = event.target.closest?.('.bear-world-bunny');
    if (!bunny) return;
    if (Date.now() < (Number(bunny.dataset.noClickUntil) || 0)) {
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
    }
  }, true);

  function currentTimeIndex() {
    const hour = new Date().getHours();
    return hour >= 6 && hour < 11 ? 0 : hour >= 11 && hour < 17 ? 1 : hour >= 17 && hour < 20 ? 2 : 3;
  }

  function nextDifferent(values, current) {
    const choices = values.filter(value => value !== current);
    return choices[Math.floor(Math.random() * choices.length)] || values[0];
  }

  function makeControls(root) {
    const existing = root.querySelector('.bear-world-panel');
    if (existing) return existing;
    const panel = document.createElement('section');
    panel.className = 'bear-world-panel';
    panel.setAttribute('aria-label', 'Bearfriend living world');
    panel.innerHTML =
      '<div class="bear-world-heading"><div><b>Our little world</b><small>Rooms, weather and time change while you play</small></div>' +
      '<div class="bear-world-readout"><span data-world-time></span><span data-world-weather></span></div></div>' +
      '<div class="bear-world-room-list" role="group" aria-label="Choose a room">' +
      ROOM_ORDER.map(room => '<button type="button" data-world-room="' + room + '" aria-pressed="false"><span>' + ROOM_META[room].icon + '</span><b>' + ROOM_META[room].label + '</b></button>').join('') +
      '</div><div class="bear-world-footer"><span data-world-hint>Automatic room change in 6 minutes</span>' +
      '<div class="bear-world-nav"><button type="button" data-world-step="-1" aria-label="Previous room">‹</button><button type="button" data-world-step="1" aria-label="Next room">›</button></div></div>';
    const scene = root.querySelector('.couple-bears-scene');
    if (scene) scene.insertAdjacentElement('afterend', panel);
    else root.appendChild(panel);
    return panel;
  }

  function makeAtmosphere(scene) {
    let overlay = scene.querySelector('.bear-world-atmosphere');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.className = 'bear-world-atmosphere';
      overlay.setAttribute('aria-hidden', 'true');
      overlay.innerHTML = '<span class="bear-world-glow"></span><span class="bear-world-weather-particles"></span>' +
        '<span class="bear-world-sparkle sparkle-a">✦</span><span class="bear-world-sparkle sparkle-b">✧</span>';
      scene.appendChild(overlay);
    }
    return overlay;
  }

  function makeBunny(scene) {
    let bunny = scene.querySelector('.bear-world-bunny');
    if (!bunny) {
      bunny = document.createElement('button');
      bunny.type = 'button';
      bunny.className = 'bear-world-bunny';
      bunny.textContent = '🐰';
      bunny.setAttribute('aria-label', 'Pet or drag the little bunny');
      bunny.title = 'Tap to cuddle · hold and drag to move';
      bunny.style.left = '13%';
      bunny.style.top = '76%';
      scene.appendChild(bunny);
    }
    return bunny;
  }

  function updateWeatherParticles(scene, weather) {
    const holder = scene.querySelector('.bear-world-weather-particles');
    if (!holder) return;
    holder.replaceChildren();
    const count = weather === 'clear' ? 0 : weather === 'rain' ? 18 : 14;
    for (let i = 0; i < count; i++) {
      const particle = document.createElement('i');
      particle.style.left = (4 + Math.random() * 92).toFixed(1) + '%';
      particle.style.animationDelay = (-Math.random() * 5).toFixed(2) + 's';
      particle.style.animationDuration = (weather === 'rain' ? 0.65 + Math.random() * 0.7 : 4 + Math.random() * 5).toFixed(2) + 's';
      holder.appendChild(particle);
    }
  }

  function applyState(controller, announce = false) {
    const { scene, panel, state } = controller;
    if (!scene.isConnected || !panel.isConnected) return;
    const room = ROOM_META[state.room];
    scene.dataset.bearRoom = state.room;
    scene.dataset.bearTime = state.time;
    scene.dataset.bearWeather = state.weather;
    scene.style.setProperty('--bear-room-sky', room.sky);
    scene.style.setProperty('--bear-room-ground', room.ground);
    const svg = scene.querySelector('#bearPoseSvg');
    const groundPaths = svg ? svg.querySelectorAll(':scope > path') : [];
    if (groundPaths[0]) groundPaths[0].setAttribute('fill', room.sky);
    if (groundPaths[1]) groundPaths[1].setAttribute('fill', room.ground);

    const timeReadout = panel.querySelector('[data-world-time]');
    const weatherReadout = panel.querySelector('[data-world-weather]');
    if (timeReadout) timeReadout.textContent = '◷ ' + TIME_LABELS[state.time];
    if (weatherReadout) weatherReadout.textContent = WEATHER_LABELS[state.weather];
    panel.querySelectorAll('[data-world-room]').forEach(button => {
      const selected = button.dataset.worldRoom === state.room;
      button.setAttribute('aria-pressed', String(selected));
      button.classList.toggle('is-active', selected);
    });
    scene.classList.toggle('bear-world-is-night', state.time === 'night');
    scene.classList.toggle('bear-world-is-evening', state.time === 'evening');
    scene.classList.toggle('bear-world-is-rainy', state.weather === 'rain');
    scene.classList.toggle('bear-world-is-snowy', state.weather === 'snow');
    const bunny = scene.querySelector('.bear-world-bunny');
    if (bunny) {
      bunny.classList.toggle('is-sleeping', state.time === 'night');
      bunny.textContent = state.time === 'night' ? '🐰💤' : '🐰';
    }
    updateWeatherParticles(scene, state.weather);
    if (announce) {
      const status = rootStatus(controller.root);
      if (status) status.textContent = room.label + ' · ' + TIME_LABELS[state.time] + ' · ' + WEATHER_LABELS[state.weather];
    }
  }

  function rootStatus(root) {
    return root.querySelector('#coupleBearStatus');
  }

  function moveRoom(controller, direction, announce = true) {
    const index = ROOM_ORDER.indexOf(controller.state.room);
    controller.state.room = ROOM_ORDER[(index + direction + ROOM_ORDER.length) % ROOM_ORDER.length];
    applyState(controller, announce);
  }

  function connectBunny(controller) {
    const bunny = controller.bunny;
    let pointer = null;
    let holdTimer = 0;
    let didMove = false;
    let startX = 0;
    let startY = 0;
    let startLeft = 0;
    let startTop = 0;

    bunny.addEventListener('pointerdown', event => {
      if (event.button !== undefined && event.button !== 0) return;
      event.preventDefault();
      event.stopPropagation();
      pointer = event.pointerId;
      didMove = false;
      startX = event.clientX;
      startY = event.clientY;
      const rect = controller.scene.getBoundingClientRect();
      startLeft = (parseFloat(bunny.style.left) || 13) / 100 * rect.width;
      startTop = (parseFloat(bunny.style.top) || 76) / 100 * rect.height;
      try { bunny.setPointerCapture(pointer); } catch {}
      bunny.classList.add('is-held');
      controller.dragging = true;
      clearTimeout(holdTimer);
      holdTimer = window.setTimeout(() => {
        if (pointer !== null && !didMove) bunny.classList.add('is-purring');
      }, 420);
    });

    bunny.addEventListener('pointermove', event => {
      if (pointer === null || event.pointerId !== pointer) return;
      const dx = event.clientX - startX;
      const dy = event.clientY - startY;
      if (Math.hypot(dx, dy) > 5) {
        didMove = true;
        clearTimeout(holdTimer);
        bunny.classList.remove('is-purring');
      }
      if (!didMove) return;
      const rect = controller.scene.getBoundingClientRect();
      const left = Math.max(3, Math.min(92, ((startLeft + dx) / Math.max(1, rect.width)) * 100));
      const top = Math.max(12, Math.min(88, ((startTop + dy) / Math.max(1, rect.height)) * 100));
      bunny.style.left = left.toFixed(1) + '%';
      bunny.style.top = top.toFixed(1) + '%';
    });

    const finish = event => {
      if (pointer === null || (event && event.pointerId !== pointer)) return;
      clearTimeout(holdTimer);
      pointer = null;
      bunny.classList.remove('is-held', 'is-purring');
      controller.dragging = false;
      bunny.classList.add('is-hopping');
      window.setTimeout(() => bunny.classList.remove('is-hopping'), 650);
      // A normal pointer tap produces one native click. The progression
      // module routes it through the existing accepted-partner flow. A drag
      // suppresses that synthetic click and is handled as bunny movement.
      if (didMove) {
        bunny.dataset.noClickUntil = String(Date.now() + 450);
        const left = parseFloat(bunny.style.left) || 13;
        const top = parseFloat(bunny.style.top) || 76;
        if (left <= 5) {
          moveRoom(controller, -1, true);
          bunny.style.left = '86%';
          bunny.style.top = '76%';
        } else if (left >= 89) {
          moveRoom(controller, 1, true);
          bunny.style.left = '5%';
          bunny.style.top = '76%';
        } else {
          const heads = [{ left: 28, top: 25 }, { left: 72, top: 25 }];
          const target = heads
            .map((point, index) => ({ ...point, index, distance: Math.hypot(left - point.left, top - point.top) }))
            .sort((a, b) => a.distance - b.distance)[0];
          if (target && Math.abs(left - target.left) < 15 && Math.abs(top - target.top) < 18) {
            window.clearTimeout(controller.ridingTimer);
            bunny.classList.add('is-riding');
            bunny.style.left = target.left + '%';
            bunny.style.top = target.top + '%';
            controller.ridingTimer = window.setTimeout(() => {
              const other = heads[1 - target.index];
              bunny.style.left = other.left + '%';
              bunny.style.top = other.top + '%';
              controller.ridingTimer = window.setTimeout(() => {
                bunny.classList.remove('is-riding');
                bunny.style.left = '50%';
                bunny.style.top = '76%';
              }, 520);
            }, 520);
          }
        }
      }
      didMove = false;
    };
    bunny.addEventListener('pointerup', finish);
    bunny.addEventListener('pointercancel', finish);
    bunny.addEventListener('lostpointercapture', finish);
  }

  function scheduleWander(controller) {
    const delay = 9000 + Math.random() * 7000;
    controller.wanderTimer = window.setTimeout(() => {
      if (!controller.root.isConnected) return;
      if (!document.hidden && !controller.dragging && controller.state.time !== 'night') {
        const left = 10 + Math.random() * 78;
        const top = 65 + Math.random() * 22;
        controller.bunny.style.left = left.toFixed(1) + '%';
        controller.bunny.style.top = top.toFixed(1) + '%';
        controller.bunny.classList.add('is-hopping');
        window.setTimeout(() => controller.bunny.classList.remove('is-hopping'), 650);
      }
      scheduleWander(controller);
    }, delay);
  }

  function initialise(root) {
    if (!root || active.has(root)) return;
    const scene = root.querySelector('.couple-bears-scene');
    if (!scene) return;
    const panel = makeControls(root);
    const overlay = makeAtmosphere(scene);
    const bunny = makeBunny(scene);
    const state = {
      room: 'living',
      time: TIME_ORDER[currentTimeIndex()],
      weather: 'clear'
    };
    const controller = { root, scene, panel, overlay, bunny, state, timers: [], wanderTimer: 0, dragging: false };
    active.set(root, controller);
    connectBunny(controller);

    panel.addEventListener('click', event => {
      const roomButton = event.target.closest('[data-world-room]');
      if (roomButton && panel.contains(roomButton)) {
        state.room = roomButton.dataset.worldRoom;
        applyState(controller, true);
        return;
      }
      const stepButton = event.target.closest('[data-world-step]');
      if (stepButton && panel.contains(stepButton)) moveRoom(controller, Number(stepButton.dataset.worldStep) || 1);
    });

    controller.timers.push(window.setInterval(() => moveRoom(controller, 1, true), 6 * 60 * 1000));
    controller.timers.push(window.setInterval(() => {
      const index = TIME_ORDER.indexOf(state.time);
      state.time = TIME_ORDER[(index + 1) % TIME_ORDER.length];
      applyState(controller, true);
    }, 4 * 60 * 1000));
    controller.timers.push(window.setInterval(() => {
      state.weather = nextDifferent(Object.keys(WEATHER_LABELS), state.weather);
      applyState(controller, true);
    }, 6 * 60 * 1000));
    applyState(controller);
    scheduleWander(controller);
  }

  function dispose(root, controller) {
    controller.timers.forEach(window.clearInterval);
    window.clearTimeout(controller.wanderTimer);
    window.clearTimeout(controller.ridingTimer);
    active.delete(root);
  }

  function reconcile() {
    for (const [root, controller] of active) {
      if (!root.isConnected) dispose(root, controller);
    }
    const root = document.querySelector('#coupleBearGame');
    if (root) initialise(root);
  }

  const observer = new MutationObserver(reconcile);
  const install = () => {
    if (document.body) {
      observer.observe(document.body, { childList: true, subtree: true });
      reconcile();
    }
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', install, { once: true });
  else install();
})();
