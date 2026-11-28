/* Bearfriend living world — extracted environment layer for the existing Bearfriend scene. */
(function () {
  "use strict";

  const ROOM_ORDER = ["living", "kitchen", "bedroom", "balcony", "garden"];
  const ROOM_LABELS = {
    living: "Living room",
    kitchen: "Kitchen",
    bedroom: "Bedroom",
    balcony: "Balcony",
    garden: "Garden"
  };
  const TIME_ORDER = ["morning", "afternoon", "evening", "night"];
  const TIME_LABELS = {
    morning: "Morning",
    afternoon: "Afternoon",
    evening: "Evening",
    night: "Night"
  };
  const WEATHER_LABELS = { clear: "Clear skies", rain: "Rainy", snow: "Snowfall" };
  const SKY = {
    morning: ["#ffd0b5", "#fff0e2"],
    afternoon: ["#8fd0f2", "#e4f5ff"],
    evening: ["#f08a73", "#fcd2b0"],
    night: ["#171a45", "#383d7a"]
  };
  const SEASON_COLORS = {
    spring: ["#bfe3b4", "#a9d99f", "#9fd493"],
    summer: ["#a9dca0", "#8fd081", "#82c874"],
    autumn: ["#ecd6a4", "#e0bc7c", "#d6ae6c"],
    winter: ["#f4f8fc", "#e3ecf5", "#d8e4f0"]
  };
  const reducedMotion = window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  let scene = null;
  let background = null;
  let weatherCanvas = null;
  let weatherContext = null;
  let tint = null;
  let meta = null;
  let observer = null;
  let animationFrame = 0;
  let intervals = [];
  let visible = false;
  let pageVisible = !document.hidden;
  let roomIndex = 0;
  let timeIndex = 0;
  let weather = "clear";
  let particles = [];
  let lastFrame = 0;

  function currentSeason() {
    const month = new Date().getMonth();
    if (month >= 2 && month <= 4) return "spring";
    if (month >= 5 && month <= 7) return "summer";
    if (month >= 8 && month <= 10) return "autumn";
    return "winter";
  }

  function initialTimeIndex() {
    const hour = new Date().getHours();
    if (hour >= 6 && hour < 11) return 0;
    if (hour >= 11 && hour < 17) return 1;
    if (hour >= 17 && hour < 20) return 2;
    return 3;
  }

  function cloud(x, y, scale, opacity) {
    return '<g class="bear-world-cloud" transform="translate(' + x + ' ' + y + ') scale(' + scale + ')" opacity="' + (opacity || ".8") + '" fill="#fff">' +
      '<ellipse rx="27" ry="9"/><ellipse cx="15" cy="-7" rx="16" ry="10"/><ellipse cx="-13" cy="-5" rx="14" ry="8"/></g>';
  }

  function windowScene() {
    return '<defs>' +
      '<linearGradient id="bear-world-window-sky" x1="0" y1="0" x2="0" y2="1"><stop id="bear-world-sky-top" offset="0" stop-color="#8fd0f2"/><stop id="bear-world-sky-bottom" offset="1" stop-color="#e4f5ff"/></linearGradient>' +
      '<radialGradient id="bear-world-sun-glow"><stop offset="0" stop-color="#ffe9a8" stop-opacity=".8"/><stop offset="1" stop-color="#ffe9a8" stop-opacity="0"/></radialGradient>' +
      '</defs>' +
      '<rect x="252" y="149" width="96" height="92" rx="12" fill="#fff" stroke="#e8c6d4" stroke-width="4"/>' +
      '<g clip-path="url(#bear-world-window-clip)"><rect x="258" y="155" width="84" height="80" fill="url(#bear-world-window-sky)"/>' +
      '<g id="bear-world-stars" opacity="0" fill="#fff">' +
      '<circle cx="268" cy="168" r="1.5"/><circle cx="287" cy="181" r="1"/><circle cx="313" cy="165" r="1.4"/><circle cx="330" cy="190" r="1.2"/><circle cx="277" cy="216" r="1"/><circle cx="320" cy="220" r="1.5"/><circle cx="300" cy="201" r="1"/></g>' +
      '<g id="bear-world-orb" transform="translate(300 185)"><circle r="23" fill="#ffd45e" opacity=".22"/><circle r="11" fill="#ffd45e"/></g>' +
      cloud(285, 185, .8, ".72") + cloud(325, 205, .7, ".68") +
      '</g><path d="M300 155V235M258 195H342" stroke="#fff" stroke-width="3"/>' +
      '<rect x="246" y="240" width="108" height="8" rx="4" fill="#f3d3df"/>' +
      '<path d="M244 140Q262 190 248 245H232V140Z M356 140Q338 190 352 245H368V140Z" fill="#f6b8cf"/>';
  }

  function livingRoom() {
    return '<rect width="600" height="400" fill="#fbe4ea"/>' +
      '<path d="' + Array.from({ length: 22 }, (_, i) => "M" + (i * 28) + " 120V292").join("") + '" stroke="#f5c9d8" stroke-width="3" opacity=".42"/>' +
      windowScene() +
      '<rect y="292" width="600" height="110" fill="#f0cfae"/><path d="M0 320H600M0 350H600M0 380H600" stroke="#e2b98f" stroke-width="2"/>' +
      '<rect x="22" y="226" width="112" height="66" rx="14" fill="#d99caf"/><rect x="14" y="254" width="130" height="48" rx="14" fill="#efc1cf"/>' +
      '<rect x="458" y="225" width="110" height="68" rx="12" fill="#cda8b8"/><rect x="450" y="256" width="126" height="46" rx="13" fill="#e7c2cf"/>' +
      '<ellipse cx="300" cy="338" rx="128" ry="25" fill="#f7c1d4" stroke="#fff" stroke-width="4" stroke-dasharray="2 8"/>' +
      '<rect x="72" y="174" width="36" height="54" rx="5" fill="#c99b78"/><path d="M90 174v-26" stroke="#8db27e" stroke-width="5"/><circle cx="90" cy="145" r="17" fill="#a8ce9b"/>' +
      '<rect x="488" y="178" width="4" height="85" fill="#c9a27a"/><path d="M470 180h40l-8-24h-24z" fill="#fff1c9" stroke="#e8c98a" stroke-width="2"/>';
  }

  function kitchenRoom() {
    let tiles = "";
    for (let y = 120; y < 292; y += 24) tiles += "M0 " + y + "H600";
    for (let row = 0; row < 8; row++) {
      for (let x = (row % 2) * 24; x < 600; x += 48) tiles += "M" + x + " " + (120 + row * 24) + "v24";
    }
    const cabinet = x => '<rect x="' + x + '" y="244" width="190" height="48" rx="4" fill="#e9b99a"/>' +
      '<rect x="' + (x - 6) + '" y="234" width="202" height="12" rx="5" fill="#fff" stroke="#efd9cb" stroke-width="2"/>' +
      '<path d="M' + (x + 47) + ' 247v43M' + (x + 95) + ' 247v43M' + (x + 143) + ' 247v43" stroke="#d9a07f" stroke-width="2"/>';
    return '<rect width="600" height="400" fill="#fff0e0"/><path d="' + tiles + '" stroke="#f0d3b2" stroke-width="2" fill="none" opacity=".85"/>' +
      windowScene() + cabinet(35) + cabinet(375) +
      '<rect y="292" width="600" height="110" fill="#f6e6d4"/><path d="' + Array.from({ length: 17 }, (_, i) => "M" + (i * 36) + " 292v108").join("") + '" stroke="#e8d2bb" stroke-width="2"/>' +
      '<rect x="210" y="215" width="180" height="19" rx="7" fill="#fff" stroke="#efd9cb" stroke-width="2"/>' +
      '<rect x="258" y="196" width="72" height="20" rx="7" fill="#f3d2dc"/><circle cx="278" cy="205" r="4" fill="#fff"/><circle cx="310" cy="205" r="4" fill="#fff"/>' +
      '<rect x="72" y="203" width="34" height="31" rx="7" fill="#f9d0dc" stroke="#fff" stroke-width="2"/><text x="89" y="224" font-size="18" text-anchor="middle">🍪</text>' +
      '<path d="M490 234v-20q0-13 15-13t15 13v20z" fill="#cfd8e6" stroke="#fff" stroke-width="2"/><path d="M520 212l12-9" stroke="#cfd8e6" stroke-width="4" stroke-linecap="round"/>';
  }

  function bedroomRoom() {
    return '<rect width="600" height="400" fill="#e9e1f4"/>' +
      '<path d="' + Array.from({ length: 20 }, (_, i) => "M" + (i * 31) + " 120V292").join("") + '" stroke="#d9c8eb" stroke-width="2" opacity=".35"/>' +
      windowScene() +
      '<rect y="292" width="600" height="110" fill="#d8c5b6"/>' +
      '<rect x="70" y="248" width="460" height="58" rx="16" fill="#b79acb"/><rect x="82" y="260" width="436" height="45" rx="13" fill="#f7eaf4"/>' +
      '<rect x="104" y="238" width="96" height="38" rx="12" fill="#fff8fb"/><rect x="400" y="238" width="96" height="38" rx="12" fill="#fff8fb"/>' +
      '<path d="M300 0v94M260 94h80" stroke="#c9a27a" stroke-width="2"/>' +
      '<path d="M270 95q-18 28-34 0M300 95q-18 28-34 0M330 95q-18 28-34 0" stroke="#c9a27a" stroke-width="1.8" fill="none"/>' +
      '<path d="M260 94l-7 13 14 0zM290 94l-7 13 14 0zM320 94l-7 13 14 0z" fill="#e9c6d4"/>' +
      '<rect x="26" y="218" width="58" height="74" rx="9" fill="#d7b38f"/><circle cx="55" cy="239" r="15" fill="#fff" stroke="#d9b48f" stroke-width="3"/>' +
      '<path d="M55 239v-9M55 239l8 5" stroke="#76566b" stroke-width="2" stroke-linecap="round"/>';
  }

  function balconyRoom() {
    let skyline = "";
    const buildings = [[96,40,70],[140,34,52],[178,52,88],[234,38,60],[276,46,96],[326,34,50],[362,56,80],[422,40,66],[466,44,90]];
    buildings.forEach((b, k) => {
      skyline += '<rect x="' + b[0] + '" y="' + (292 - b[2]) + '" width="' + b[1] + '" height="' + b[2] + '" rx="3" fill="#7d6fa6" opacity=".6"/>';
      for (let y = 0; y < Math.floor(b[2] / 16); y++) {
        for (let x = 0; x < Math.floor(b[1] / 12); x++) {
          if ((x * 7 + y * 3 + k * 5) % 5 < 2) skyline += '<rect x="' + (b[0] + 5 + x * 12) + '" y="' + (292 - b[2] + 7 + y * 16) + '" width="5" height="7" fill="#ffe9a8" opacity=".8"/>';
        }
      }
    });
    let lights = "";
    for (let i = 0; i < 12; i++) {
      const t = i / 11;
      lights += '<circle class="bear-world-twinkle" style="animation-delay:' + (i * .22).toFixed(2) + 's" cx="' + (90 + t * 420).toFixed(1) + '" cy="' + (142 + 96 * t * (1 - t) + 3).toFixed(1) + '" r="4.2" fill="' + ["#ffd36b","#ff9ec0","#c9a6ff","#8fd3ff"][i % 4] + '"/>';
    }
    return '<rect width="600" height="400" fill="url(#bear-world-window-sky)"/>' +
      '<g id="bear-world-stars" opacity="0" fill="#fff"><circle cx="120" cy="150" r="1.5"/><circle cx="188" cy="178" r="1"/><circle cx="280" cy="142" r="1.5"/><circle cx="420" cy="165" r="1.2"/><circle cx="500" cy="130" r="1"/></g>' +
      '<g id="bear-world-orb" transform="translate(300 185)"><circle r="34" opacity=".22"/><circle r="16"/></g>' +
      cloud(150,170,1.3) + cloud(330,150,1.1) + cloud(450,190,1.2) +
      '<path d="M0 270Q110 235 230 262T440 250T600 244V300H0Z" fill="#b9a6d6" opacity=".55"/>' +
      skyline + '<rect y="298" width="600" height="110" fill="#d9b48f"/><path d="M0 322H600M0 350H600M0 378H600" stroke="#c49a73" stroke-width="2"/>' +
      '<rect x="80" y="276" width="440" height="6" rx="3" fill="#fff"/>' +
      '<path d="M90 142Q300 190 510 142" stroke="#8a6a5a" fill="none" stroke-width="1.6"/>' + lights +
      '<g fill="#9ab88a"><path d="M30 294q-5-50 12-70 18 25 8 70z"/><path d="M552 294q-5-50 12-70 18 25 8 70z"/></g>';
  }

  function gardenRoom() {
    const season = currentSeason();
    const colors = SEASON_COLORS[season];
    let fence = "";
    for (let x = 70; x < 530; x += 24) {
      fence += '<rect x="' + x + '" y="266" width="12" height="36" rx="4" fill="#fff"/>';
    }
    let flowers = "";
    const flowerColors = season === "autumn" ? ["#e6a65e","#d88b55","#f0c87a"] :
      season === "winter" ? ["#e5eaf4","#d5c9e8","#f6dce7"] : ["#ff9ec0","#c9a6ff","#ffd36b"];
    [75,130,470,525].forEach((x, i) => {
      const c = flowerColors[i % flowerColors.length];
      flowers += '<g transform="translate(' + x + ' 322)"><path d="M0 0v-27" stroke="#6fa879" stroke-width="3"/><circle cx="0" cy="-31" r="6" fill="' + c + '"/><circle cx="-7" cy="-27" r="5" fill="' + c + '"/><circle cx="7" cy="-27" r="5" fill="' + c + '"/><circle cy="-31" r="2.5" fill="#ffe9a8"/></g>';
    });
    return '<rect width="600" height="400" fill="url(#bear-world-window-sky)"/>' +
      '<g id="bear-world-stars" opacity="0" fill="#fff"><circle cx="120" cy="150" r="1.5"/><circle cx="188" cy="178" r="1"/><circle cx="280" cy="142" r="1.5"/><circle cx="420" cy="165" r="1.2"/><circle cx="500" cy="130" r="1"/></g>' +
      '<g id="bear-world-orb" transform="translate(300 185)"><circle r="34" opacity=".22"/><circle r="16"/></g>' +
      cloud(150,170,1.3) + cloud(330,150,1.1) + cloud(450,190,1.2) +
      '<path d="M0 270Q110 215 230 262T440 250T600 240V400H0Z" fill="' + colors[0] + '"/>' +
      '<path d="M0 300Q140 255 300 290T600 280V400H0Z" fill="' + colors[1] + '"/>' +
      fence + '<rect x="80" y="278" width="440" height="5" fill="#fff"/>' +
      '<rect y="300" width="600" height="110" fill="' + colors[2] + '"/>' + flowers +
      '<g class="bear-world-butterfly" transform="translate(180 190)"><ellipse cx="-5" cy="-2" rx="6" ry="4" fill="#ffb3cf"/><ellipse cx="5" cy="-2" rx="6" ry="4" fill="#c9a6ff"/><path d="M0-5v10" stroke="#76566b"/></g>' +
      '<g class="bear-world-butterfly second" transform="translate(420 205)"><ellipse cx="-5" cy="-2" rx="6" ry="4" fill="#ffd36b"/><ellipse cx="5" cy="-2" rx="6" ry="4" fill="#8fd3ff"/><path d="M0-5v10" stroke="#76566b"/></g>' +
      '<path d="M480 276v-38h34v38M474 238l23-17 23 17" fill="#f6c1a0" stroke="#fff" stroke-width="2"/>';
  }

  function roomMarkup(room) {
    if (room === "kitchen") return kitchenRoom();
    if (room === "bedroom") return bedroomRoom();
    if (room === "balcony") return balconyRoom();
    if (room === "garden") return gardenRoom();
    return livingRoom();
  }

  function buildBackground() {
    if (!background) return;
    const room = ROOM_ORDER[roomIndex];
    background.innerHTML = roomMarkup(room);
    background.style.opacity = "1";
    paintAtmosphere();
    updateMeta();
    resetParticles();
  }

  function paintAtmosphere() {
    if (!background || !tint) return;
    const time = TIME_ORDER[timeIndex];
    const season = currentSeason();
    const sky = SKY[time];
    let top = sky[0];
    let bottom = sky[1];
    if (weather === "rain") {
      top = time === "night" ? "#454b69" : "#8d98a8";
      bottom = time === "night" ? "#737b91" : "#d0d5dc";
    } else if (weather === "snow") {
      top = time === "night" ? "#555e80" : "#c6d7e8";
      bottom = "#edf4fb";
    }
    const topStop = background.querySelector("#bear-world-sky-top");
    const bottomStop = background.querySelector("#bear-world-sky-bottom");
    if (topStop) topStop.setAttribute("stop-color", top);
    if (bottomStop) bottomStop.setAttribute("stop-color", bottom);
    const stars = background.querySelector("#bear-world-stars");
    if (stars) stars.style.opacity = time === "night" && weather === "clear" ? "1" : "0";
    const orb = background.querySelector("#bear-world-orb");
    if (orb) {
      const positions = {
        morning: [274, 183],
        afternoon: [300, 169],
        evening: [330, 192],
        night: [354, 177]
      };
      const point = positions[time];
      orb.setAttribute("transform", "translate(" + point[0] + " " + point[1] + ")");
      orb.querySelectorAll("circle").forEach((circle, index) => {
        circle.setAttribute("fill", time === "night" ? "#fff6cf" : time === "evening" ? "#ff9a5c" : "#ffd45e");
        if (index === 0) circle.setAttribute("opacity", weather === "clear" ? ".25" : ".08");
      });
      orb.style.opacity = weather === "clear" ? "1" : ".22";
    }
    background.querySelectorAll(".bear-world-cloud").forEach(cloudNode => {
      cloudNode.style.opacity = weather === "clear" ? ".72" : ".96";
      cloudNode.setAttribute("fill", weather === "rain" ? "#aeb7c4" : "#fff");
    });
    const seasonWash = {
      spring: "rgba(255,170,200,.07)",
      summer: "rgba(255,225,110,.06)",
      autumn: "rgba(255,140,60,.09)",
      winter: "rgba(150,190,255,.10)"
    }[season];
    const timeWash = {
      morning: "rgba(255,214,170,.10)",
      afternoon: "rgba(255,255,255,0)",
      evening: "rgba(255,128,70,.20)",
      night: "rgba(24,26,92,.38)"
    }[time];
    tint.style.background = "linear-gradient(" + seasonWash + "," + seasonWash + "),linear-gradient(" + timeWash + "," + timeWash + ")";
    tint.style.opacity = "1";
    updateMeta();
  }

  function updateMeta() {
    if (!meta) return;
    meta.textContent = ROOM_LABELS[ROOM_ORDER[roomIndex]] + " · " +
      TIME_LABELS[TIME_ORDER[timeIndex]] + " · " + WEATHER_LABELS[weather];
    meta.dataset.room = ROOM_ORDER[roomIndex];
    meta.dataset.time = TIME_ORDER[timeIndex];
    meta.dataset.weather = weather;
  }

  function resetParticles() {
    particles = [];
    const count = weather === "clear" && currentSeason() === "summer" ? 0 : 95;
    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random(),
        y: Math.random(),
        speed: .35 + Math.random() * .9,
        sway: Math.random() * Math.PI * 2,
        size: 1 + Math.random() * 2
      });
    }
  }

  function resizeCanvas() {
    if (!weatherCanvas || !weatherContext) return null;
    const rect = weatherCanvas.getBoundingClientRect();
    if (!rect.width || !rect.height) return null;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const width = Math.round(rect.width * dpr);
    const height = Math.round(rect.height * dpr);
    if (weatherCanvas.width !== width || weatherCanvas.height !== height) {
      weatherCanvas.width = width;
      weatherCanvas.height = height;
    }
    weatherContext.setTransform(dpr, 0, 0, dpr, 0, 0);
    return { width: rect.width, height: rect.height };
  }

  function drawWeather(now) {
    if (!visible || !pageVisible || !weatherContext) return;
    const size = resizeCanvas();
    if (!size) {
      animationFrame = requestAnimationFrame(drawWeather);
      return;
    }
    const ctx = weatherContext;
    const dt = lastFrame ? Math.min(.05, (now - lastFrame) / 1000) : .016;
    lastFrame = now;
    ctx.clearRect(0, 0, size.width, size.height);
    const season = currentSeason();
    const leafFall = weather === "clear" && season === "autumn";
    const petals = weather === "clear" && season === "spring";
    if (weather === "rain" || weather === "snow" || leafFall || petals) {
      particles.forEach(p => {
        p.y += p.speed * dt * (weather === "rain" ? 2.8 : 1.0);
        p.x += weather === "rain" ? -.08 * dt : Math.sin(p.sway + p.y * 8) * .025 * dt;
        if (p.y > 1.08) { p.y = -.04; p.x = Math.random(); }
        if (p.x < -.05) p.x = 1.05;
        const x = p.x * size.width;
        const y = p.y * size.height;
        if (weather === "rain") {
          ctx.strokeStyle = "rgba(125,150,180,.58)";
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.lineTo(x - 2, y + 9 * p.size);
          ctx.stroke();
        } else if (weather === "snow") {
          ctx.fillStyle = "rgba(255,255,255,.9)";
          ctx.beginPath();
          ctx.arc(x, y, p.size * 1.1, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.fillStyle = leafFall ? "rgba(221,139,66,.8)" : "rgba(255,174,205,.8)";
          ctx.beginPath();
          ctx.ellipse(x, y, p.size * 1.6, p.size, p.sway, 0, Math.PI * 2);
          ctx.fill();
        }
      });
    }
    if (!reducedMotion) animationFrame = requestAnimationFrame(drawWeather);
  }

  function chooseWeather() {
    const season = currentSeason();
    const choices = season === "winter"
      ? ["clear", "clear", "rain", "snow", "snow"]
      : ["clear", "clear", "rain", "rain"];
    let next = weather;
    while (next === weather && choices.length > 1) next = choices[Math.floor(Math.random() * choices.length)];
    weather = next;
    paintAtmosphere();
    resetParticles();
  }

  function start() {
    if (visible || !pageVisible || !scene || !scene.isConnected) return;
    visible = true;
    lastFrame = 0;
    if (!reducedMotion) animationFrame = requestAnimationFrame(drawWeather);
    intervals.push(setInterval(() => {
      roomIndex = (roomIndex + 1) % ROOM_ORDER.length;
      buildBackground();
    }, 6 * 60 * 1000));
    intervals.push(setInterval(() => {
      timeIndex = (timeIndex + 1) % TIME_ORDER.length;
      paintAtmosphere();
    }, 4 * 60 * 1000));
    intervals.push(setInterval(chooseWeather, 3 * 60 * 1000));
  }

  function stop() {
    if (!visible) return;
    visible = false;
    if (animationFrame) cancelAnimationFrame(animationFrame);
    animationFrame = 0;
    lastFrame = 0;
    intervals.forEach(clearInterval);
    intervals = [];
  }

  function onVisibilityChange() {
    pageVisible = !document.hidden;
    if (pageVisible && scene && scene.isConnected) {
      if (!observer) start();
    } else {
      stop();
    }
  }

  function destroy() {
    stop();
    if (observer) observer.disconnect();
    observer = null;
    document.removeEventListener("visibilitychange", onVisibilityChange);
    scene = background = weatherCanvas = weatherContext = tint = meta = null;
    particles = [];
  }

  function init() {
    destroy();
    scene = document.querySelector("#coupleBearGame .couple-bears-scene");
    background = document.getElementById("bearWorldBg");
    weatherCanvas = document.getElementById("bearWorldWeather");
    tint = document.getElementById("bearWorldTint");
    meta = document.getElementById("bearWorldMeta");
    if (!scene || !background || !weatherCanvas || !tint) return;
    weatherContext = weatherCanvas.getContext("2d");
    roomIndex = 0;
    timeIndex = initialTimeIndex();
    weather = "clear";
    chooseWeather();
    buildBackground();
    document.addEventListener("visibilitychange", onVisibilityChange);
    if ("IntersectionObserver" in window) {
      observer = new IntersectionObserver(entries => {
        const entry = entries[entries.length - 1];
        if (entry && entry.isIntersecting && pageVisible) start();
        else stop();
      }, { threshold: .08 });
      observer.observe(scene);
    } else {
      start();
    }
  }

  window.initBearfriendWorld = init;
  window.destroyBearfriendWorld = destroy;
})();