(() => {
  'use strict';
  const ROOT = '#coupleBearGame';
  const ROOMS = [
    { id:'living', label:'Living room', icon:'🛋️', background:'linear-gradient(180deg,#f8e9ee 0%,#f5dce2 58%,#d9c4b5 100%)' },
    { id:'kitchen', label:'Kitchen', icon:'🍪', background:'linear-gradient(180deg,#fff1dc 0%,#f7dfc8 58%,#c9b39c 100%)' },
    { id:'bedroom', label:'Bedroom', icon:'🛏️', background:'linear-gradient(180deg,#e8e4f7 0%,#d8d1ec 58%,#b8accb 100%)' },
    { id:'balcony', label:'Balcony', icon:'🌙', background:'linear-gradient(180deg,#c9d8ef 0%,#e8d7e8 58%,#b5b6c9 100%)' },
    { id:'garden', label:'Garden', icon:'🌷', background:'linear-gradient(180deg,#e3f0d9 0%,#c9e0bd 58%,#9bb88e 100%)' }
  ];
  const TIMES = [
    { id:'morning', label:'Morning', icon:'🌅', tint:'rgba(255,218,150,.10)' },
    { id:'afternoon', label:'Afternoon', icon:'☀️', tint:'rgba(255,244,190,.08)' },
    { id:'evening', label:'Evening', icon:'🌇', tint:'rgba(242,157,133,.18)' },
    { id:'night', label:'Night', icon:'🌙', tint:'rgba(42,48,91,.42)' }
  ];
  const WEATHER = [
    { id:'clear', label:'Clear skies', icon:'☀️' },
    { id:'rain', label:'Rain', icon:'🌧️' },
    { id:'snow', label:'Snow', icon:'❄️' },
    { id:'petals', label:'Falling petals', icon:'🌸' }
  ];
  let cleanup = null;

  function initBearfriendWorld() {
    cleanup?.();
    const root = document.querySelector(ROOT);
    const scene = root?.querySelector('.couple-bears-scene');
    const svg = root?.querySelector('#bearPoseSvg');
    if (!root || !scene || !svg) return;

    const backdrop = scene.querySelector('.bearfriend-world-backdrop') || document.createElement('div');
    backdrop.className = 'bearfriend-world-backdrop';
    backdrop.setAttribute('aria-hidden','true');
    if (!backdrop.parentNode) scene.insertBefore(backdrop, scene.firstChild);

    const canvas = scene.querySelector('.bearfriend-world-weather') || document.createElement('canvas');
    canvas.className = 'bearfriend-world-weather';
    canvas.setAttribute('aria-hidden','true');
    if (!canvas.parentNode) scene.insertBefore(canvas, svg.nextSibling);

    // The original pose engine paints a fixed meadow behind the bears. Keep its
    // character layers and sleep effects, but let the world layer own the scenery.
    [...svg.children].forEach(node => {
      if (node.tagName.toLowerCase() !== 'defs' &&
          !['bears','fx','berry','blk','pil'].includes(node.id)) node.style.opacity = '0';
    });

    const controls = root.querySelector('.bearfriend-world-controls');
    const roomLabel = root.querySelector('[data-world-label="room"]');
    const timeLabel = root.querySelector('[data-world-label="time"]');
    const weatherLabel = root.querySelector('[data-world-label="weather"]');
    const roomButtons = [...(controls?.querySelectorAll('[data-world-room]') || [])];
    const timeButton = controls?.querySelector('[data-world-cycle="time"]');
    const weatherButton = controls?.querySelector('[data-world-cycle="weather"]');
    const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    let roomIndex = 0, timeIndex = currentTimeIndex(), weatherIndex = 0;
    let roomTimer = 0, timeTimer = 0, weatherTimer = 0, raf = 0, resizeObserver = null;
    let particles = [];
    const ctx = canvas.getContext('2d');

    function currentTimeIndex() {
      const h = new Date().getHours();
      return h < 11 ? 0 : h < 17 ? 1 : h < 20 ? 2 : 3;
    }
    function setRoom(index, announce = false) {
      roomIndex = (index + ROOMS.length) % ROOMS.length;
      const room = ROOMS[roomIndex];
      scene.dataset.worldRoom = room.id;
      backdrop.style.background = room.background;
      if (roomLabel) roomLabel.textContent = room.icon + ' ' + room.label;
      roomButtons.forEach((button,i) => button.setAttribute('aria-pressed', String(i === roomIndex)));
      if (announce) status(room.label + ' time!');
    }
    function setTime(index, announce = false) {
      timeIndex = (index + TIMES.length) % TIMES.length;
      const time = TIMES[timeIndex];
      scene.dataset.worldTime = time.id;
      backdrop.style.setProperty('--world-time-tint', time.tint);
      if (timeLabel) timeLabel.textContent = time.icon + ' ' + time.label;
      if (announce) status('It is now ' + time.label.toLowerCase() + ' in Bearfriend.');
    }
    function setWeather(index, announce = false) {
      weatherIndex = index;
      const weather = WEATHER[index];
      scene.dataset.worldWeather = weather.id;
      if (weatherLabel) weatherLabel.textContent = weather.icon + ' ' + weather.label;
      particles = Array.from({length: weather.id === 'clear' ? 0 : 90}, () => ({
        x:Math.random(), y:Math.random(), speed:.25 + Math.random()*.8,
        drift:(Math.random()-.5)*.5, size:1 + Math.random()*2.5,
        rotation:Math.random()*Math.PI*2
      }));
      if (announce) status('The weather changed to ' + weather.label.toLowerCase() + '.');
    }
    function status(message) {
      const el = root.querySelector('#coupleBearStatus');
      if (el) el.textContent = message;
    }
    function randomWeather() {
      const choices = WEATHER.map((_,i)=>i).filter(i=>i!==weatherIndex);
      setWeather(choices[Math.floor(Math.random()*choices.length)], true);
    }
    function draw() {
      if (!scene.isConnected) return;
      const rect = scene.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = Math.max(1, Math.round(rect.width*dpr)), h = Math.max(1, Math.round(rect.height*dpr));
      if (canvas.width !== w || canvas.height !== h) { canvas.width=w; canvas.height=h; }
      ctx.clearRect(0,0,w,h);
      const weather = WEATHER[weatherIndex].id;
      if (weather === 'clear') return;
      const scale = Math.max(1, rect.width/420)*dpr;
      particles.forEach(p => {
        p.y += p.speed * (weather === 'rain' ? .012 : .0035);
        p.x += p.drift * .0015 + (weather === 'rain' ? -.003 : 0);
        p.rotation += .008;
        if (p.y > 1.05) { p.y = -.05; p.x = Math.random(); }
        if (p.x < -.05) p.x = 1.05;
        const x=p.x*w, y=p.y*h;
        if (weather === 'rain') {
          ctx.strokeStyle='rgba(120,155,205,.58)';ctx.lineWidth=1.1*scale;
          ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x-3*scale,y+10*scale);ctx.stroke();
        } else if (weather === 'snow') {
          ctx.fillStyle='rgba(255,255,255,.9)';ctx.beginPath();ctx.arc(x,y,p.size*scale,0,Math.PI*2);ctx.fill();
        } else {
          ctx.save();ctx.translate(x,y);ctx.rotate(p.rotation);
          ctx.fillStyle='rgba(255,171,197,.82)';ctx.beginPath();ctx.ellipse(0,0,3.5*scale,1.8*scale,0,0,Math.PI*2);ctx.fill();ctx.restore();
        }
      });
      if (!reducedMotion) raf=requestAnimationFrame(draw);
    }
    function cycleRoom() { setRoom(roomIndex+1,true); }
    function cycleTime() { setTime(timeIndex+1,true); }
    function cycleWeather() { randomWeather(); }
    const roomHandlers = roomButtons.map((button,i) => {
      const handler = () => setRoom(i,true);
      button.addEventListener('click',handler);
      return [button,handler];
    });
    timeButton?.addEventListener('click',cycleTime);
    weatherButton?.addEventListener('click',cycleWeather);

    setRoom(0); setTime(timeIndex); setWeather(Math.floor(Math.random()*WEATHER.length));
    roomTimer = window.setInterval(cycleRoom, 6*60*1000);
    timeTimer = window.setInterval(cycleTime, 4*60*1000);
    weatherTimer = window.setInterval(cycleWeather, 3*60*1000);
    if (reducedMotion) draw(); else raf=requestAnimationFrame(draw);
    if ('ResizeObserver' in window) {
      resizeObserver = new ResizeObserver(()=>{ if (reducedMotion) draw(); });
      resizeObserver.observe(scene);
    } else window.addEventListener('resize', draw);

    cleanup = () => {
      clearInterval(roomTimer); clearInterval(timeTimer); clearInterval(weatherTimer);
      cancelAnimationFrame(raf); resizeObserver?.disconnect();
      window.removeEventListener('resize', draw);
      roomHandlers.forEach(([button,handler])=>button.removeEventListener('click',handler));
      timeButton?.removeEventListener('click',cycleTime);
      weatherButton?.removeEventListener('click',cycleWeather);
    };
  }
  window.initBearfriendWorld = initBearfriendWorld;
  window.destroyBearfriendWorld = () => { cleanup?.(); cleanup=null; };
})();