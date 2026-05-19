import { getThemePack } from './themePacks.js';

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
const seeded = (seed) => {
  let h = 2166136261;
  for (const char of String(seed)) h = Math.imul(h ^ char.charCodeAt(0), 16777619);
  return () => ((h = Math.imul(h ^ (h >>> 15), 2246822507)) >>> 0) / 4294967296;
};

export function createHighResCity(options = {}) {
  const theme = getThemePack(options.themeId || 'metroGlass');
  const random = seeded(`${theme.id}:${options.seed || 'city'}`);
  const width = options.width || 1280;
  const groundY = options.groundY || 420;
  const density = clamp(options.density ?? 1.2, 0.7, 2.2);
  const buildings = [];
  let x = -40;
  let index = 0;

  while (x < width + 80) {
    const w = Math.round((46 + random() * 88) * density);
    const h = Math.round((120 + random() * 210) * (0.82 + density * 0.12));
    const y = groundY - h;
    const material = index % 2 ? theme.palette.buildingAlt : theme.palette.building;
    const max = Math.round(5 + random() * 7 + density);
    buildings.push({
      id: `b${index}`,
      x,
      y,
      w,
      h,
      hp: max,
      max,
      material,
      trim: theme.palette.trim,
      window: theme.palette.window,
      detailSeed: random(),
      roofType: Math.floor(random() * 5),
      damageState: 'intact',
      fire: 0,
      deadAt: 0,
      rebuild: 0,
      hitFlash: 0,
      points: Math.round(12 + h / 18 + w / 16)
    });
    x += w + Math.round(random() * 10);
    index += 1;
  }

  const citizens = Array.from({ length: Math.max(8, Math.round(buildings.length * 0.78)) }, (_, i) => ({
    id: `c${i}`,
    x: random() * width,
    y: groundY,
    occupation: ['commuter', 'vendor', 'tourist', 'worker', 'skater', 'artist'][Math.floor(random() * 6)],
    rarity: random() > 0.88 ? 'rare' : random() > 0.62 ? 'uncommon' : 'common',
    fear: random() * 0.48,
    value: random() > 0.88 ? 18 : random() > 0.62 ? 9 : 4,
    spawnClock: random() * 10
  }));

  return {
    id: `city:${theme.id}`,
    width,
    groundY,
    theme,
    density,
    buildings,
    citizens,
    panic: 0,
    militaryPresence: 0,
    geography: options.geography || 'urban basin',
    weather: options.weather || 'clear',
    timezoneOffset: options.timezoneOffset ?? 0,
    rebuiltCount: 0,
    collapseCount: 0,
    lastCollapse: null
  };
}

export function updateHighResCity(city, dt, kaijuState = {}) {
  const kaijuX = kaijuState.position?.x ?? 0;
  city.panic = clamp(city.panic - dt * 4.5, 0, 100);
  city.militaryPresence = clamp(city.militaryPresence + dt * city.panic * 0.015, 0, 100);

  for (const citizen of city.citizens) {
    const proximity = clamp(1 - Math.abs(citizen.x - kaijuX) / 340, 0, 1);
    citizen.fear = clamp(citizen.fear + proximity * dt * 1.4 - dt * 0.12, 0, 1);
    const direction = citizen.x < kaijuX ? -1 : 1;
    citizen.x += direction * (18 + citizen.fear * 76) * dt;
    if (citizen.x < -20) citizen.x = city.width + 20;
    if (citizen.x > city.width + 20) citizen.x = -20;
  }

  const now = performance.now();
  for (const building of city.buildings) {
    building.hitFlash = Math.max(0, building.hitFlash - dt * 4);
    const damage = 1 - building.hp / building.max;
    building.damageState = building.hp <= 0 ? 'collapsed' : damage > 0.8 ? 'collapsing' : damage > 0.5 ? 'critical' : damage > 0.25 ? 'cracked' : 'intact';
    if (building.damageState === 'critical' || building.damageState === 'collapsing') building.fire += dt;
    if (building.hp <= 0 && !building.deadAt) {
      building.deadAt = now;
      city.collapseCount += 1;
      city.lastCollapse = building.id;
    }
    if (building.deadAt) {
      const elapsed = now - building.deadAt;
      if (elapsed > 22000) building.rebuild = clamp((elapsed - 22000) / 13000, 0, 1);
      if (building.rebuild >= 1) {
        building.hp = building.max;
        building.deadAt = 0;
        building.rebuild = 0;
        building.fire = 0;
        building.damageState = 'intact';
        city.rebuiltCount += 1;
      }
    }
  }
}

export function damageNearestBuilding(city, x, amount = 1) {
  let best = null;
  let bestDistance = Infinity;
  for (const building of city.buildings) {
    if (building.hp <= 0) continue;
    const center = building.x + building.w / 2;
    const distance = Math.abs(center - x);
    if (distance < bestDistance) {
      best = building;
      bestDistance = distance;
    }
  }
  if (!best || bestDistance > 150) return null;
  best.hp = clamp(best.hp - amount, 0, best.max);
  best.hitFlash = 1;
  city.panic = clamp(city.panic + amount * 4.5, 0, 100);
  return best;
}

export function drawHighResCity(ctx, city, options = {}) {
  const { width, groundY, theme } = city;
  const p = theme.palette;
  const height = ctx.canvas.height;
  const hour = (new Date().getHours() + city.timezoneOffset + 24) % 24;
  const night = hour < 6 || hour > 20;
  const sky = ctx.createLinearGradient(0, 0, 0, height);
  sky.addColorStop(0, night ? '#030716' : p.skyTop);
  sky.addColorStop(0.58, p.skyMid);
  sky.addColorStop(0.74, p.ground);
  sky.addColorStop(1, '#020205');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, width, height);

  ctx.fillStyle = night ? 'rgba(255,255,255,.55)' : 'rgba(255,255,255,.18)';
  for (let i = 0; i < 72; i++) {
    const x = (i * 97 + 23) % width;
    const y = 18 + ((i * 53) % Math.max(80, groundY * 0.55));
    ctx.fillRect(x, y, i % 4 === 0 ? 2 : 1, i % 5 === 0 ? 2 : 1);
  }

  for (const building of city.buildings) drawBuilding(ctx, city, building);
  drawGround(ctx, city);
  drawCitizens(ctx, city);

  if (city.militaryPresence > 20) drawMilitaryScan(ctx, city);

  if (options.debugOverlay) {
    ctx.fillStyle = 'rgba(255,255,255,.7)';
    ctx.font = '12px ui-monospace, monospace';
    ctx.fillText(`${theme.name} · panic ${Math.round(city.panic)} · collapses ${city.collapseCount} · rebuild ${city.rebuiltCount}`, 14, height - 18);
  }
}

function drawBuilding(ctx, city, building) {
  const { groundY } = city;
  if (building.hp <= 0 && building.rebuild === 0) {
    drawRubble(ctx, building, groundY);
    return;
  }

  const rebuildHeight = building.rebuild > 0 ? building.h * building.rebuild : building.h;
  const y = groundY - rebuildHeight;
  const damage = 1 - building.hp / building.max;
  ctx.fillStyle = building.rebuild > 0 ? 'rgba(30,38,56,.72)' : building.material;
  ctx.fillRect(building.x, y, building.w, rebuildHeight);

  if (building.hitFlash > 0) {
    ctx.fillStyle = `rgba(255, 215, 107, ${0.32 * building.hitFlash})`;
    ctx.fillRect(building.x, y, building.w, rebuildHeight);
  }

  ctx.fillStyle = building.trim;
  ctx.globalAlpha = 0.7;
  ctx.fillRect(building.x - 1, y, building.w + 2, 4);
  ctx.globalAlpha = 1;

  drawWindows(ctx, building, y, rebuildHeight, damage);
  drawRoof(ctx, building, y);
  drawArchitectureDetails(ctx, city, building, y, rebuildHeight);

  if (damage > 0.22) drawCracks(ctx, building, y, rebuildHeight, damage);
  if (damage > 0.55 || building.fire > 0.5) drawFire(ctx, building, y, rebuildHeight, damage);
}

function drawWindows(ctx, building, y, h, damage) {
  const cols = Math.max(2, Math.floor(building.w / 22));
  const rows = Math.max(2, Math.floor(h / 28));
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const broken = damage > 0.25 && Math.sin(row * 5.7 + col * 3.1 + building.detailSeed * 10) > 0.75 - damage * 0.42;
      const x = building.x + 8 + col * ((building.w - 16) / cols);
      const wy = y + 18 + row * ((h - 34) / rows);
      ctx.fillStyle = broken ? 'rgba(0,0,0,.75)' : building.window;
      ctx.globalAlpha = broken ? 1 : 0.32 + Math.abs(Math.sin(row + col + building.detailSeed)) * 0.35;
      ctx.fillRect(x, wy, Math.max(6, building.w / cols - 10), Math.max(8, h / rows - 12));
      ctx.globalAlpha = 1;
    }
  }
}

function drawRoof(ctx, building, y) {
  ctx.strokeStyle = building.trim;
  ctx.lineWidth = 2;
  if (building.roofType === 1) {
    ctx.beginPath();
    ctx.moveTo(building.x + building.w * 0.5, y);
    ctx.lineTo(building.x + building.w * 0.5, y - 24);
    ctx.stroke();
  } else if (building.roofType === 2) {
    ctx.fillStyle = building.trim;
    ctx.fillRect(building.x + building.w * 0.2, y - 10, building.w * 0.6, 10);
  } else if (building.roofType === 3) {
    ctx.beginPath();
    ctx.moveTo(building.x, y);
    ctx.lineTo(building.x + building.w * 0.5, y - 22);
    ctx.lineTo(building.x + building.w, y);
    ctx.stroke();
  }
}

function drawArchitectureDetails(ctx, city, building, y, h) {
  const detail = city.theme.detail;
  ctx.strokeStyle = 'rgba(255,245,214,.16)';
  ctx.lineWidth = 1;
  if (detail.includes('fire escapes') || detail.includes('catwalks')) {
    for (let yy = y + 28; yy < y + h - 20; yy += 52) {
      ctx.strokeRect(building.x + building.w - 20, yy, 16, 14);
      ctx.beginPath();
      ctx.moveTo(building.x + building.w - 20, yy + 14);
      ctx.lineTo(building.x + building.w - 36, yy + 34);
      ctx.stroke();
    }
  }
  if (detail.includes('flower pots') || detail.includes('planter boxes')) {
    ctx.fillStyle = '#39ff14';
    for (let xx = building.x + 12; xx < building.x + building.w - 12; xx += 44) {
      ctx.fillRect(xx, y + h - 22, 10, 5);
    }
  }
}

function drawCracks(ctx, building, y, h, damage) {
  ctx.strokeStyle = 'rgba(0,0,0,.78)';
  ctx.lineWidth = 1.8;
  const count = Math.floor(damage * 9);
  for (let i = 0; i < count; i++) {
    const sx = building.x + 10 + ((i * 37 + building.detailSeed * 80) % Math.max(12, building.w - 20));
    const sy = y + 18 + ((i * 51 + building.detailSeed * 90) % Math.max(20, h - 42));
    ctx.beginPath();
    ctx.moveTo(sx, sy);
    ctx.lineTo(sx + Math.sin(i) * 20, sy + 18 + i * 2);
    ctx.lineTo(sx + Math.cos(i * 1.7) * 10, sy + 36 + i);
    ctx.stroke();
  }
}

function drawFire(ctx, building, y, h, damage) {
  const flames = Math.max(2, Math.floor(building.w / 28));
  for (let i = 0; i < flames; i++) {
    const x = building.x + 12 + i * (building.w / flames);
    const fh = 18 + Math.sin(performance.now() * 0.008 + i) * 8 + damage * 22;
    const grad = ctx.createLinearGradient(x, y + h - fh, x, y + h);
    grad.addColorStop(0, 'rgba(255,80,0,0)');
    grad.addColorStop(0.55, '#ff6e00');
    grad.addColorStop(1, '#ffd76b');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.ellipse(x, y + h - 4, 8, fh, 0, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawRubble(ctx, building, groundY) {
  ctx.fillStyle = '#18130f';
  ctx.beginPath();
  ctx.moveTo(building.x, groundY);
  for (let i = 0; i <= 8; i++) {
    ctx.lineTo(building.x + (building.w * i) / 8, groundY - 8 - ((i * 17 + building.detailSeed * 40) % 28));
  }
  ctx.lineTo(building.x + building.w, groundY);
  ctx.fill();
}

function drawGround(ctx, city) {
  ctx.fillStyle = city.theme.palette.ground;
  ctx.fillRect(0, city.groundY, city.width, ctx.canvas.height - city.groundY);
  ctx.strokeStyle = 'rgba(255,215,107,.26)';
  ctx.setLineDash([36, 24]);
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(0, city.groundY + 24);
  ctx.lineTo(city.width, city.groundY + 24);
  ctx.stroke();
  ctx.setLineDash([]);
}

function drawCitizens(ctx, city) {
  for (const citizen of city.citizens) {
    ctx.fillStyle = citizen.rarity === 'rare' ? '#b06cff' : citizen.rarity === 'uncommon' ? '#ffd76b' : '#dbe8ff';
    ctx.globalAlpha = 0.55 + citizen.fear * 0.45;
    ctx.beginPath();
    ctx.arc(citizen.x, city.groundY - 18, citizen.rarity === 'rare' ? 5 : 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillRect(citizen.x - 2, city.groundY - 14, 4, 12);
    if (citizen.fear > 0.7) {
      ctx.fillStyle = '#ff4f7a';
      ctx.fillRect(citizen.x + 5, city.groundY - 30, 2, 8);
    }
    ctx.globalAlpha = 1;
  }
}

function drawMilitaryScan(ctx, city) {
  ctx.save();
  ctx.globalAlpha = Math.min(0.5, city.militaryPresence / 180);
  ctx.strokeStyle = '#00d4ff';
  ctx.lineWidth = 1.5;
  for (let i = 0; i < 3; i++) {
    const x = (performance.now() * 0.025 + i * city.width * 0.35) % city.width;
    ctx.beginPath();
    ctx.moveTo(x, 40 + i * 20);
    ctx.lineTo(x + Math.sin(performance.now() * 0.002 + i) * 80, city.groundY);
    ctx.stroke();
  }
  ctx.restore();
}
