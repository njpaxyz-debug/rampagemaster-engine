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
const wallet = createWallet({ bones: 320, opal: 1 });

const kaiju = MotionEngine.createKaijuMotion({
  seed: 'rampagemaster-hires-module-bridge',
  taxonomy,
  phenotype,
  x: 180,
  y: city.groundY,
  city
});

let intent = 'rampage';
let previous = performance.now();
let lastState = null;
let lastHit = null;
let debugOverlay = true;

modeButtons.forEach((button) => {
  button.addEventListener('click', () => {
    const next = button.dataset.rampageIntent;
    if (next === 'theme') return cycleTheme();
    if (next === 'convert') return convertCurrency(wallet, 'bones', 1);
    if (next === 'debug') {
      debugOverlay = !debugOverlay;
      return;
    }
    intent = next;
    modeButtons.forEach((btn) => btn.classList.toggle('is-active', btn === button));
  });
});

canvas.addEventListener('pointerdown', (event) => {
  const rect = canvas.getBoundingClientRect();
  const x = ((event.clientX - rect.left) / rect.width) * canvas.width;
  const y = ((event.clientY - rect.top) / rect.height) * canvas.height;
  kaiju.manualTarget = { x, y };
  intent = y < city.groundY - 36 ? 'rampage' : 'patrol';
  modeButtons.forEach((btn) => btn.classList.toggle('is-active', btn.dataset.rampageIntent === intent));
});

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
  kaiju.city = city;
  kaiju.y = city.groundY;
}

function resize() {
  const ratio = Math.min(window.devicePixelRatio || 1, 2);
  const rect = canvas.getBoundingClientRect();
  canvas.width = Math.max(320, Math.round(rect.width * ratio));
  canvas.height = Math.max(320, Math.round(rect.height * ratio));
  city.width = canvas.width;
  city.groundY = Math.round(canvas.height * 0.74);
  kaiju.y = city.groundY;
}

function applyRampageDamage(state) {
  if (intent !== 'rampage') return;
  const building = damageNearestBuilding(city, state.position.x, 0.018 + (phenotype.terror / 1000));
  if (building && building.hp <= 0 && lastHit !== building.id) {
    lastHit = building.id;
    awardCityValue(wallet, building, 1 + city.panic / 200);
  }
}

function renderDebug(state) {
  if (!debugPanel) return;
  debugPanel.textContent = JSON.stringify({
    engine: MotionEngine.VERSION,
    sourcePath: 'src/index.modular.html -> src/app.js -> high-res modules -> src/animation/index.js',
    activeTheme: city.theme.name,
    wallet: walletSummary(wallet),
    intent,
    motion: {
      state: state.state,
      gait: state.gait,
      target: state.target,
      position: state.position,
      pose: state.pose,
      biomech: state.biomech
    },
    city: {
      buildings: city.buildings.length,
      citizens: city.citizens.length,
      panic: Math.round(city.panic),
      militaryPresence: Math.round(city.militaryPresence),
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

  const state = MotionEngine.updateMotion(kaiju, dt, {
    city,
    intent,
    manualTarget: kaiju.manualTarget
  });
  state.time = now / 1000;
  lastState = state;

  applyRampageDamage(state);
  updateHighResCity(city, dt, state);
  drawHighResCity(ctx, city, { debugOverlay });
  drawHighResKaiju(ctx, state, taxonomy, phenotype);
  renderDebug(state);

  requestAnimationFrame(frame);
}

applyThemeToDocument(theme);
resize();
window.addEventListener('resize', resize);
requestAnimationFrame(frame);

window.RampageMaster = {
  MotionEngine,
  city,
  kaiju,
  wallet,
  themePacks: THEME_PACKS,
  get state() {
    return lastState;
  },
  setIntent(nextIntent) {
    intent = nextIntent;
  },
  cycleTheme,
  convertBones() {
    return convertCurrency(wallet, 'bones', 1);
  }
};
