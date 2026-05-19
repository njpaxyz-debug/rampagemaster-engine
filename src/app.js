import MotionEngine from './animation/index.js';
import { createHighResCity, updateHighResCity, damageNearestBuilding, drawHighResCity } from './modules/cityHighRes.js';
import { getThemePack, applyThemeToDocument, THEME_PACKS } from './modules/themePacks.js';
import { drawHighResKaiju } from './modules/visualHighRes.js';
import { createWallet, awardCityValue, convertCurrency, walletSummary } from './modules/economyHighRes.js';
import { getSourceLineage } from './modules/bestSourceRegistry.js';

const canvas = document.querySelector('[data-rampage-canvas]');
const ctx = canvas.getContext('2d');
const debugPanel = document.querySelector('[data-rampage-debug]');
const modeButtons = [...document.querySelectorAll('[data-rampage-intent]')];
const toast = document.querySelector('[data-rampage-toast]');
const hud = document.querySelector('[data-rampage-hud]');

const taxonomy = {
  kingdom: 'Kaiju',
  phylum: 'draco',
  genus: 'Giga-Rex',
  species: 'Giga-Rex High Resolution Bridge'
};

const phenotype = {
  height: 82,
  bulk: 76,
  agility: 44,
  wings: 34,
  tentacles: 8,
  armor: 62,
  rage: 68,
  cute: 26,
  terror: 86,
  glow: 72
};

let themeIndex = 0;
let theme = getThemePack(THEME_PACKS[themeIndex].id);
let city = createHighResCity({ themeId: theme.id, seed: 'hires-city', width: 1280, groundY: 420, density: 1.28 });
let graph = MotionEngine.buildRouteGraph({ worldSpan: city.width, buildings: city.buildings });
const wallet = createWallet({ bones: 320, opal: 1 });
const motionLab = MotionEngine.createMotionLab({
  species: 'ember',
  stage: 'mature',
  personality: 'aggressive-curious',
  anatomy: {
    face: { eyes: 0.8, brow: 0.7, jaw: 0.65 },
    hands: { claw: 0.75, grip: 0.82 },
    feet: { stance: 0.74, toes: 0.68 }
  },
  pressure: { threat: 0.82, novelty: 0.68, comfort: 0.2, hunger: 0.4, noise: 0.8 }
});

let motion = MotionEngine.createKaijuMotion({ x: 180, yOffset: 0, targetX: 260, mode: 'patrol' });
let petX = 180;
let intent = 'rampage';
let previous = performance.now();
let lastState = null;
let debugOverlay = true;
let score = 0;
let combo = 0;
let comboTimer = 0;
let screenShake = 0;
let flash = 0;
let lastToast = 0;
let autoDamageClock = 0;
let graphRefreshClock = 0;

modeButtons.forEach((button) => {
  button.addEventListener('click', () => {
    const next = button.dataset.rampageIntent;
    if (next === 'theme') return cycleTheme();
    if (next === 'convert') return convertBones();
    if (next === 'debug') {
      debugOverlay = !debugOverlay;
      showToast(debugOverlay ? 'Debug overlay on' : 'Debug overlay off');
      return;
    }
    intent = next;
    motion.timer = 0;
    modeButtons.forEach((btn) => btn.classList.toggle('is-active', btn === button));
    showToast(`${next.toUpperCase()} mode`);
  });
});

canvas.addEventListener('pointerdown', (event) => {
  const rect = canvas.getBoundingClientRect();
  const x = ((event.clientX - rect.left) / rect.width) * canvas.width;
  const y = ((event.clientY - rect.top) / rect.height) * canvas.height;
  petX = x;
  motion.x = x;
  motion.timer = 0;
  intent = y < city.groundY - 36 ? 'rampage' : 'patrol';
  modeButtons.forEach((btn) => btn.classList.toggle('is-active', btn.dataset.rampageIntent === intent));
  if (intent === 'rampage') strikeBuilding(x, 3.25, 'DIRECT HIT');
});

function showToast(message) {
  if (!toast) return;
  lastToast = performance.now();
  toast.textContent = message;
  toast.classList.add('is-visible');
}

function cycleTheme() {
  themeIndex = (themeIndex + 1) % THEME_PACKS.length;
  theme = getThemePack(THEME_PACKS[themeIndex].id);
  applyThemeToDocument(theme);
  city = createHighResCity({
    themeId: theme.id,
    seed: `hires-city:${theme.id}`,
    width: canvas.width || 1280,
    groundY: Math.round((canvas.height || 560) * 0.74),
    density: 1.28 + theme.tier * 0.05
  });
  graph = MotionEngine.buildRouteGraph({ worldSpan: city.width, buildings: city.buildings });
  petX = Math.min(petX, city.width - 80);
  motion = MotionEngine.createKaijuMotion({ x: petX, yOffset: 0, targetX: petX + 120, mode: 'patrol' });
  showToast(`Theme: ${theme.name}`);
}

function convertBones() {
  const result = convertCurrency(wallet, 'bones', 1);
  showToast(result.ok ? 'Converted Bones → Opal' : result.reason);
}

function resize() {
  const ratio = Math.min(window.devicePixelRatio || 1, 2);
  const rect = canvas.getBoundingClientRect();
  canvas.width = Math.max(320, Math.round(rect.width * ratio));
  canvas.height = Math.max(320, Math.round(rect.height * ratio));
  city.width = canvas.width;
  city.groundY = Math.round(canvas.height * 0.74);
  graph = MotionEngine.buildRouteGraph({ worldSpan: city.width, buildings: city.buildings });
}

function strikeBuilding(x, amount = 1, label = 'SMASH') {
  const building = damageNearestBuilding(city, x, amount);
  if (!building) return null;
  screenShake = Math.min(1.5, screenShake + 0.22 + amount * 0.08);
  flash = Math.min(1, flash + 0.18);
  combo += 1;
  comboTimer = 2.2;
  if (building.hp <= 0) {
    const gained = awardCityValue(wallet, building, 1 + combo * 0.08);
    score += gained;
    screenShake = 1.4;
    flash = 0.8;
    graph = MotionEngine.buildRouteGraph({ worldSpan: city.width, buildings: city.buildings });
    showToast(`COLLAPSE +${gained}◆ · ${combo}x`);
  } else if (performance.now() - lastToast > 450) {
    showToast(`${label} · ${building.damageState.toUpperCase()} · ${combo}x`);
  }
  return building;
}

function autoRampageDamage(dt, state) {
  if (intent !== 'rampage') return;
  autoDamageClock += dt;
  const cadence = 0.14;
  if (autoDamageClock < cadence) return;
  autoDamageClock = 0;
  const hitX = state.position.x + (state.facing || 1) * 40;
  strikeBuilding(hitX, 0.95 + phenotype.terror / 180, 'CLAW');
}

function makeVisualState(now) {
  return {
    state: motion.mode,
    gait: motion.bioGait,
    target: motion.toNode,
    position: {
      x: petX,
      y: city.groundY - (motion.yOffset || 0)
    },
    facing: motion.facing || 1,
    time: now / 1000,
    pose: {
      bob: Math.sin((motion.step || 0) * Math.PI * 2) * 7,
      sway: Math.sin((motion.step || 0) * Math.PI * 2 + 0.8) * 5,
      scale: 1
    },
    phase: {
      step: motion.step || 0,
      torso: (motion.step || 0) * 0.6,
      tail: (motion.step || 0) * 0.45
    },
    limbs: {
      leftFoot: Math.sin((motion.step || 0) * Math.PI * 2),
      rightFoot: Math.sin((motion.step || 0) * Math.PI * 2 + Math.PI)
    },
    biomech: {
      phylum: motion.bioPhylum,
      gait: motion.bioGait,
      cog: motion.cog,
      ik: motion.ikPrecision
    }
  };
}

function renderHud() {
  if (!hud) return;
  hud.innerHTML = `
    <div><b>Score</b><span>${score}</span></div>
    <div><b>Wallet</b><span>${walletSummary(wallet)}</span></div>
    <div><b>Combo</b><span>${combo}x</span></div>
    <div><b>Panic</b><span>${Math.round(city.panic)}%</span></div>
    <div><b>Collapses</b><span>${city.collapseCount}</span></div>
    <div><b>Theme</b><span>${city.theme.name}</span></div>
  `;
}

function renderDebug(state) {
  if (!debugPanel) return;
  debugPanel.textContent = JSON.stringify({
    engine: MotionEngine.version || MotionEngine.RAMPAGEMASTER_MOTION_ENGINE_VERSION,
    visibleChanges: ['default src/index.html launcher', 'auto rampage damage', 'building collapse payouts', 'panic HUD', 'theme cycling', 'currency conversion'],
    sourcePath: 'src/index.html -> src/app.js -> high-res modules -> src/animation/index.js',
    activeTheme: city.theme.name,
    score,
    wallet: walletSummary(wallet),
    intent,
    motion: {
      mode: motion.mode,
      surface: motion.surface,
      route: motion.route,
      bioGait: motion.bioGait,
      x: motion.x,
      yOffset: motion.yOffset,
      toNode: motion.toNode,
      intent: motion.intent
    },
    visualState: state,
    city: {
      buildings: city.buildings.length,
      citizens: city.citizens.length,
      panic: Math.round(city.panic),
      militaryPresence: Math.round(city.militaryPresence),
      collapseCount: city.collapseCount,
      rebuiltCount: city.rebuiltCount,
      geography: city.geography,
      weather: city.weather
    },
    lineage: getSourceLineage()
  }, null, 2);
}

function frame(now) {
  const dt = Math.min(0.05, (now - previous) / 1000 || 0.016);
  previous = now;

  comboTimer -= dt;
  if (comboTimer <= 0) combo = 0;
  if (toast && performance.now() - lastToast > 1300) toast.classList.remove('is-visible');
  graphRefreshClock += dt;
  if (graphRefreshClock > 2) {
    graphRefreshClock = 0;
    graph = MotionEngine.buildRouteGraph({ worldSpan: city.width, buildings: city.buildings });
  }

  const updated = MotionEngine.updateMotion({
    dt,
    motionLab,
    motion,
    graph,
    petX,
    energy: intent === 'rampage' ? 100 : intent === 'idle' ? 40 : 74,
    level: 8,
    random: Math.random
  });
  motion = updated.motion;
  petX = updated.petX;

  const visualState = makeVisualState(now);
  lastState = visualState;
  autoRampageDamage(dt, visualState);
  updateHighResCity(city, dt, visualState);

  ctx.save();
  if (screenShake > 0) {
    ctx.translate((Math.random() - 0.5) * screenShake * 18, (Math.random() - 0.5) * screenShake * 10);
    screenShake = Math.max(0, screenShake - dt * 2.4);
  }
  drawHighResCity(ctx, city, { debugOverlay });
  drawHighResKaiju(ctx, visualState, taxonomy, phenotype);
  ctx.restore();

  if (flash > 0) {
    ctx.fillStyle = `rgba(255, 215, 107, ${flash * 0.16})`;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    flash = Math.max(0, flash - dt * 2.6);
  }

  renderHud();
  renderDebug(visualState);
  requestAnimationFrame(frame);
}

applyThemeToDocument(theme);
resize();
window.addEventListener('resize', resize);
requestAnimationFrame(frame);
showToast('Gameplay visible: Rampage auto-smashes buildings. Click towers for direct hits.');

window.RampageMaster = {
  MotionEngine,
  get city() { return city; },
  get motion() { return motion; },
  wallet,
  themePacks: THEME_PACKS,
  get state() { return lastState; },
  setIntent(nextIntent) { intent = nextIntent; },
  cycleTheme,
  convertBones,
  smash(x = petX) { return strikeBuilding(x, 4, 'MANUAL SMASH'); }
};
