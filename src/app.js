import MotionEngine from './animation/index.js';

const canvas = document.querySelector('[data-rampage-canvas]');
const ctx = canvas.getContext('2d');
const debugPanel = document.querySelector('[data-rampage-debug]');
const modeButtons = [...document.querySelectorAll('[data-rampage-intent]')];

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

const city = {
  width: 1280,
  groundY: 410,
  buildings: [
    { id: 'b0', x: 70, y: 238, w: 95, h: 172, hp: 5, max: 6 },
    { id: 'b1', x: 205, y: 180, w: 120, h: 230, hp: 3, max: 7 },
    { id: 'b2', x: 390, y: 252, w: 155, h: 158, hp: 5, max: 5 },
    { id: 'b3', x: 650, y: 145, w: 132, h: 265, hp: 2, max: 8 },
    { id: 'b4', x: 890, y: 210, w: 146, h: 200, hp: 6, max: 6 },
    { id: 'b5', x: 1095, y: 256, w: 105, h: 154, hp: 4, max: 4 }
  ],
  citizens: [
    { id: 'c0', x: 150, y: 410, fear: 0.55 },
    { id: 'c1', x: 565, y: 410, fear: 0.2 },
    { id: 'c2', x: 840, y: 410, fear: 0.9 },
    { id: 'c3', x: 1030, y: 410, fear: 0.35 }
  ]
};

const kaiju = MotionEngine.createKaijuMotion({
  seed: 'rampagemaster-src-modular-bridge',
  taxonomy: {
    kingdom: 'Kaiju',
    phylum: 'draco',
    genus: 'Giga-Rex',
    species: 'Giga-Rex Modular Bridge'
  },
  phenotype: {
    height: 78,
    bulk: 71,
    agility: 42,
    wings: 36,
    tentacles: 8,
    armor: 55,
    rage: 64,
    cute: 28,
    terror: 82
  },
  x: 180,
  y: city.groundY,
  city
});

let intent = 'rampage';
let previous = performance.now();
let lastState = null;

modeButtons.forEach((button) => {
  button.addEventListener('click', () => {
    intent = button.dataset.rampageIntent;
    modeButtons.forEach((btn) => btn.classList.toggle('is-active', btn === button));
  });
});

canvas.addEventListener('pointerdown', (event) => {
  const rect = canvas.getBoundingClientRect();
  const x = ((event.clientX - rect.left) / rect.width) * canvas.width;
  const y = ((event.clientY - rect.top) / rect.height) * canvas.height;
  kaiju.manualTarget = { x, y };
  intent = y < city.groundY - 40 ? 'rampage' : 'patrol';
  modeButtons.forEach((btn) => btn.classList.toggle('is-active', btn.dataset.rampageIntent === intent));
});

function resize() {
  const ratio = Math.min(window.devicePixelRatio || 1, 2);
  const rect = canvas.getBoundingClientRect();
  canvas.width = Math.round(rect.width * ratio);
  canvas.height = Math.round(rect.height * ratio);
  city.width = canvas.width;
  city.groundY = Math.round(canvas.height * 0.74);
  kaiju.y = city.groundY;
}

function drawBackground() {
  const sky = ctx.createLinearGradient(0, 0, 0, canvas.height);
  sky.addColorStop(0, '#152050');
  sky.addColorStop(0.62, '#070916');
  sky.addColorStop(0.74, '#09070a');
  sky.addColorStop(1, '#030305');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.strokeStyle = 'rgba(57,255,20,.18)';
  ctx.lineWidth = 2;
  for (let y = 0; y < canvas.height; y += 24) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(canvas.width, y);
    ctx.stroke();
  }
}

function drawBuildings() {
  for (const building of city.buildings) {
    const damage = 1 - building.hp / building.max;
    ctx.fillStyle = damage > 0.65 ? '#3e1721' : '#111a2d';
    ctx.fillRect(building.x, building.y, building.w, city.groundY - building.y);

    ctx.fillStyle = damage > 0.65 ? 'rgba(255,79,122,.52)' : 'rgba(0,212,255,.46)';
    for (let y = building.y + 16; y < city.groundY - 12; y += 27) {
      for (let x = building.x + 12; x < building.x + building.w - 12; x += 24) {
        ctx.fillRect(x, y, 10, 13);
      }
    }

    if (damage > 0.35) {
      ctx.strokeStyle = 'rgba(0,0,0,.82)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(building.x + building.w * 0.24, building.y + 25);
      ctx.lineTo(building.x + building.w * 0.52, city.groundY - 40);
      ctx.lineTo(building.x + building.w * 0.45, city.groundY - 18);
      ctx.stroke();
    }
  }
}

function drawCitizens(state) {
  for (const citizen of city.citizens) {
    const near = clamp(1 - Math.abs(citizen.x - state.position.x) / 320, 0, 1);
    const panic = clamp(citizen.fear + near * 0.5, 0, 1);
    ctx.fillStyle = panic > 0.8 ? '#ff4f7a' : '#ffd76b';
    ctx.beginPath();
    ctx.arc(citizen.x, city.groundY - 18, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillRect(citizen.x - 4, city.groundY - 12, 8, 18);
  }
}

function drawKaiju(state) {
  const phase = state.phase || { step: 0, torso: 0 };
  const pose = state.pose || { bob: 0, sway: 0, scale: 1 };
  const limbs = state.limbs || { leftFoot: 0, rightFoot: 0 };
  const bob = Math.sin(phase.step * Math.PI * 2) * pose.bob;
  const sway = Math.sin(phase.torso * Math.PI * 2) * pose.sway;
  const scale = pose.scale || 1;
  const x = state.position.x;
  const y = state.position.y + bob;

  ctx.save();
  ctx.translate(x, y);
  ctx.scale(state.facing || 1, 1);

  ctx.fillStyle = 'rgba(0,0,0,.42)';
  ctx.beginPath();
  ctx.ellipse(0, 10, 74 * scale, 14 * scale, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = '#123b1f';
  ctx.lineWidth = 22 * scale;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(38 * scale, -78 * scale);
  ctx.quadraticCurveTo(120 * scale, -52 * scale + sway, 148 * scale, -8 * scale);
  ctx.stroke();

  ctx.fillStyle = '#123b1f';
  ctx.beginPath();
  ctx.ellipse(0, -120 * scale, 66 * scale, 90 * scale, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#39ff14';
  ctx.beginPath();
  ctx.ellipse(0, -124 * scale, 48 * scale, 66 * scale, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#123b1f';
  ctx.beginPath();
  ctx.ellipse(10 * scale, -214 * scale + sway, 44 * scale, 34 * scale, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#ffd76b';
  ctx.beginPath();
  ctx.arc(-10 * scale, -220 * scale + sway, 8 * scale, 0, Math.PI * 2);
  ctx.arc(24 * scale, -220 * scale + sway, 8 * scale, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = '#39ff14';
  ctx.lineWidth = 8 * scale;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(-30 * scale, -48 * scale);
  ctx.lineTo((-42 + limbs.leftFoot * 16) * scale, 0);
  ctx.moveTo(32 * scale, -48 * scale);
  ctx.lineTo((44 + limbs.rightFoot * 16) * scale, 0);
  ctx.stroke();

  ctx.restore();
}

function damageTarget(state) {
  if (intent !== 'rampage') return;
  const target = state.target;
  if (!target || target.kind !== 'building') return;
  const building = city.buildings.find((item) => item.id === target.id);
  if (!building) return;
  if (Math.abs(state.position.x - (building.x + building.w / 2)) < 40 && building.hp > 0) {
    building.hp = Math.max(0, building.hp - 0.012);
  }
}

function renderDebug(state) {
  if (!debugPanel) return;
  debugPanel.textContent = JSON.stringify({
    engine: MotionEngine.VERSION,
    source: 'src/app.js -> src/animation/index.js',
    intent,
    state: state.state,
    gait: state.gait,
    target: state.target,
    position: state.position,
    pose: state.pose,
    biomech: state.biomech
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
  lastState = state;
  damageTarget(state);

  drawBackground();
  drawBuildings();
  drawCitizens(state);
  drawKaiju(state);
  renderDebug(state);

  requestAnimationFrame(frame);
}

resize();
window.addEventListener('resize', resize);
requestAnimationFrame(frame);

window.RampageMaster = {
  MotionEngine,
  city,
  kaiju,
  get state() {
    return lastState;
  },
  setIntent(nextIntent) {
    intent = nextIntent;
  }
};
