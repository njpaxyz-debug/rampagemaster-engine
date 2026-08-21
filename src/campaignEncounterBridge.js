import {
  RESPONSE_SOURCE,
  RESPONSE_TAP_DAMAGE,
  armCommandTower,
  createEncounterState,
  damageResponseUnit,
  disarmCommandTower,
  maybeSpawnResponse,
  updateResponseMotion
} from './modules/campaignEncounterEntities.js';

const clamp = (value, min, max) => Math.max(min, Math.min(max, Number(value) || 0));
const DAY_MS = RESPONSE_SOURCE.decorativeShotIntervalMs;

export function hitTestResponseUnit(encounter, x, y) {
  const units = encounter?.units || [];
  for (let i = units.length - 1; i >= 0; i -= 1) {
    const unit = units[i];
    if (!unit || unit.dead) continue;
    const w = unit.type === 'drone' ? 34 : 42;
    const h = unit.type === 'drone' ? 24 : 28;
    if (x >= unit.x - w / 2 && x <= unit.x + w / 2 && y >= unit.y - h / 2 && y <= unit.y + h / 2) return unit;
  }
  return null;
}

export function applyResponseHit(host, encounter, unit, damage = RESPONSE_TAP_DAMAGE, random = Math.random) {
  const session = host?.gameplay?.state?.mission;
  if (!session || session.phase !== 'active') return { ok: false, reason: 'inactive-mission' };
  const result = damageResponseUnit(encounter, unit, damage, { missionKind: session.mission?.kind, random });
  if (!result.ok || !result.killed) return result;
  host.gameplayCommands.campaignScore(result.scoreBase, 'RESPONSE BROKEN');
  session.threat = clamp((session.threat || 0) + result.threatDelta, 0, 100);
  let campaignResult = null;
  if (result.progressDelta > 0) campaignResult = host.gameplayCommands.campaignProgress(result.progressDelta, { districtCount: host.themePacks?.length || 1 });
  host.gameplayCommands.save();
  host.gameplayPanels?.render?.();
  return { ...result, campaignResult };
}

export function applyEncounterPickup(host, pickup) {
  if (!host?.gameplay?.state || !pickup || pickup.dead) return { ok: false, reason: 'missing-pickup' };
  const state = host.gameplay.state;
  const pet = state.pet || {};
  if (pickup.type === 'heal') {
    const maxHealth = Math.max(1, Number(pet.maxHealth || pet.health || 100));
    const amount = Math.ceil(maxHealth * 0.18);
    pet.maxHealth = maxHealth;
    pet.health = Math.min(maxHealth, Number(pet.health || maxHealth) + amount);
    pickup.dead = true;
    return { ok: true, type: 'heal', amount };
  }
  if (pickup.type === 'rage') {
    state.rampageMeter = clamp((state.rampageMeter || 0) + 28, 0, 100);
    pickup.dead = true;
    return { ok: true, type: 'rage', amount: 28 };
  }
  if (pickup.type === 'bones') {
    const amount = 35 + Math.max(0, Number(state.district) || 0) * 12;
    state.wallet.bones = (state.wallet.bones || 0) + amount;
    pickup.dead = true;
    return { ok: true, type: 'bones', amount };
  }
  return { ok: false, reason: 'unknown-pickup' };
}

export function missionToken(gameplayState) {
  const session = gameplayState?.mission;
  if (!session || session.phase !== 'active') return null;
  return `${gameplayState.campaign?.missionIndex || 0}:${session.mission?.kind || 'unknown'}:${session.mission?.title || ''}`;
}

export function syncEncounterMission(host, runtime) {
  const state = host?.gameplay?.state;
  const session = state?.mission;
  const token = missionToken(state);
  if (!token) {
    if (runtime.encounter.missionToken) disarmCommandTower(host?.city);
    runtime.encounter = createEncounterState();
    return { active: false, token: null };
  }
  if (runtime.encounter.missionToken !== token) {
    disarmCommandTower(host?.city);
    runtime.encounter = createEncounterState({ missionToken: token });
    if (session.mission?.kind === 'boss') {
      const tower = armCommandTower(host.city, state.campaign?.rank || 1, token);
      runtime.encounter.bossId = tower?.id || null;
    }
  } else if (session.mission?.kind === 'boss' && runtime.encounter.bossId) {
    const tower = host.city?.buildings?.find((building) => building.id === runtime.encounter.bossId);
    if (!tower) runtime.encounter.bossId = armCommandTower(host.city, state.campaign?.rank || 1, token)?.id || null;
  }
  return { active: true, token, kind: session.mission?.kind };
}

function updateDecorativeShots(host, runtime, frames) {
  const encounter = runtime.encounter;
  const state = host.state;
  if (!state?.position) return;
  const now = Date.now();
  if (now - runtime.lastMilitaryShot >= DAY_MS) {
    const unit = encounter.units.find((candidate) => !candidate.dead && Math.abs(candidate.x - state.position.x) < 250);
    if (unit) {
      const sx = unit.x;
      const sy = unit.y - (unit.type === 'drone' ? 0 : 14);
      const tx = state.position.x;
      const ty = state.position.y - 80;
      const distance = Math.max(1, Math.hypot(tx - sx, ty - sy));
      const speed = 84;
      encounter.shots.push({ x: sx, y: sy, vx: ((tx - sx) / distance) * speed, vy: ((ty - sy) / distance) * speed, lifeFrames: 120, type: unit.type, decorative: true });
      runtime.lastMilitaryShot = now;
      try { localStorage.setItem('rm8_last_military_shot', String(now)); } catch (_) {}
    }
  }
  const dt = frames / 60;
  encounter.shots.forEach((shot) => {
    shot.x += shot.vx * dt;
    shot.y += shot.vy * dt;
    shot.lifeFrames -= frames;
  });
  encounter.shots = encounter.shots.filter((shot) => shot.lifeFrames > 0);
}

function collectNearbyPickups(host, runtime) {
  const pos = host.state?.position;
  if (!pos) return;
  for (const pickup of runtime.encounter.pickups) {
    if (pickup.dead) continue;
    if (Math.hypot(pickup.x - pos.x, pickup.y - (pos.y - 30)) <= 58) applyEncounterPickup(host, pickup);
  }
  runtime.encounter.pickups = runtime.encounter.pickups.filter((pickup) => !pickup.dead && pickup.lifeFrames > 0);
}

export function updateCampaignEncounter(host, runtime, frames = 1, random = Math.random) {
  const synced = syncEncounterMission(host, runtime);
  if (!synced.active) return { ok: true, active: false };
  const state = host.gameplay.state;
  const session = state.mission;
  session.threat = clamp((session.threat || 0) - 0.0035 * frames, 0, 100);
  const city = host.city;
  const spawn = maybeSpawnResponse(runtime.encounter, {
    frames,
    threat: session.threat,
    district: state.district,
    rank: state.campaign?.rank || 1,
    width: city?.width || 1280,
    groundY: city?.groundY || 420,
    random
  });
  updateResponseMotion(runtime.encounter, { frames, petX: host.state?.position?.x || 0, width: city?.width || 1280 });
  updateDecorativeShots(host, runtime, frames);
  collectNearbyPickups(host, runtime);
  return { ok: true, active: true, spawned: spawn.spawned, units: runtime.encounter.units.length, bossId: runtime.encounter.bossId };
}

function drawBar(ctx, x, y, w, pct, color) {
  ctx.fillStyle = 'rgba(0,0,0,.65)'; ctx.fillRect(x, y, w, 5);
  ctx.fillStyle = color; ctx.fillRect(x + 1, y + 1, Math.max(0, (w - 2) * clamp(pct, 0, 1)), 3);
}

export function drawCampaignEncounter(ctx, host, runtime) {
  const encounter = runtime.encounter;
  if (!ctx || !host?.gameplay?.state?.mission || host.gameplay.state.mission.phase !== 'active') return;
  for (const unit of encounter.units) {
    if (unit.dead) continue;
    const flash = unit.flash > 0 ? '#ffffff' : (unit.type === 'drone' ? '#00d4ff' : '#718096');
    ctx.save(); ctx.translate(Math.round(unit.x), Math.round(unit.y));
    if (unit.type === 'drone') {
      ctx.fillStyle = flash; ctx.fillRect(-15, -6, 30, 12);
      ctx.fillStyle = '#111827'; ctx.fillRect(-7, -12, 14, 7);
      ctx.fillStyle = '#39ff14'; ctx.fillRect(-22, -2, 8, 3); ctx.fillRect(14, -2, 8, 3);
      ctx.fillStyle = '#ff4f7a'; ctx.fillRect(-2, 6, 4, 4);
    } else {
      ctx.fillStyle = flash; ctx.fillRect(-19, -9, 38, 16);
      ctx.fillStyle = '#303a48'; ctx.fillRect(-11, -15, 22, 8);
      ctx.fillStyle = '#c9d2df'; ctx.fillRect(8, -13, 20, 4);
      ctx.fillStyle = '#111'; ctx.fillRect(-15, 7, 8, 5); ctx.fillRect(7, 7, 8, 5);
    }
    ctx.restore();
    drawBar(ctx, unit.x - 18, unit.y - (unit.type === 'drone' ? 23 : 28), 36, unit.hp / Math.max(1, unit.maxHp), '#ff5c6a');
  }
  for (const shot of encounter.shots) {
    ctx.fillStyle = shot.type === 'drone' ? '#ff4db8' : '#ffd55c';
    ctx.beginPath(); ctx.arc(shot.x, shot.y, shot.type === 'drone' ? 3 : 4, 0, Math.PI * 2); ctx.fill();
  }
  for (const pickup of encounter.pickups) {
    const y = pickup.y + Math.sin(pickup.bob || 0) * 3;
    const color = pickup.type === 'heal' ? '#65e69b' : pickup.type === 'rage' ? '#ff783d' : '#ffcc44';
    ctx.fillStyle = color; ctx.fillRect(pickup.x - 6, y - 6, 12, 12);
    ctx.fillStyle = '#fff'; ctx.fillRect(pickup.x - 2, y - 2, 4, 4);
  }
  const bossId = encounter.bossId;
  if (bossId) {
    const boss = host.city?.buildings?.find((building) => building.id === bossId);
    if (boss && boss.hp > 0) {
      ctx.save(); ctx.strokeStyle = '#ffd76b'; ctx.lineWidth = 3; ctx.setLineDash([8, 5]);
      ctx.strokeRect(boss.x - 5, boss.y - 14, boss.w + 10, boss.h + 18); ctx.setLineDash([]);
      ctx.fillStyle = '#ffd76b'; ctx.font = '900 13px ui-monospace,monospace'; ctx.fillText('COMMAND TOWER', boss.x + 4, boss.y - 18); ctx.restore();
      drawBar(ctx, boss.x, boss.y - 10, boss.w, boss.hp / Math.max(1, boss.max), '#ffd76b');
    }
  }
}

function decorateCampaignPanel(host, runtime) {
  const drawer = document.querySelector('#rmGameplayDrawer');
  if (!drawer) return;
  const session = host?.gameplay?.state?.mission;
  if (!session || session.phase !== 'active') return;
  const oldWarning = [...drawer.querySelectorAll('.rmWarning')].find((node) => node.textContent.includes('not yet connected'));
  if (!oldWarning) return;
  if (session.mission.kind === 'response') oldWarning.textContent = `Response layer online · ${runtime.encounter.units.length} active unit${runtime.encounter.units.length === 1 ? '' : 's'} · fire is decorative/non-damaging.`;
  else if (session.mission.kind === 'boss') {
    const boss = host.city?.buildings?.find((building) => building.id === runtime.encounter.bossId);
    oldWarning.textContent = boss ? `Command tower online · HP ${Math.ceil(boss.hp)}/${Math.ceil(boss.max)} · destroy the marked tower.` : 'Command tower target is arming.';
  }
}

export function attachCampaignEncounterBridge(host = window.RampageMaster) {
  if (!host?.gameplayCommands || !host?.city) throw new Error('Campaign encounter bridge requires gameplay and city APIs.');
  const mainCanvas = document.querySelector('[data-rampage-canvas]');
  if (!mainCanvas) throw new Error('Campaign encounter bridge requires the high-res canvas.');
  const overlay = document.createElement('canvas');
  overlay.dataset.rampageEncounterCanvas = 'true';
  overlay.setAttribute('aria-hidden', 'true');
  overlay.style.cssText = 'position:fixed;inset:0;width:100vw;height:100vh;z-index:4;pointer-events:none;';
  document.body.appendChild(overlay);
  const ctx = overlay.getContext('2d');
  let last = performance.now();
  const runtime = {
    encounter: createEncounterState(),
    stopped: false,
    lastMilitaryShot: (() => { try { return Number(localStorage.getItem('rm8_last_military_shot') || 0); } catch (_) { return 0; } })()
  };

  const pointer = (event) => {
    const session = host.gameplay?.state?.mission;
    if (!session || session.phase !== 'active' || !runtime.encounter.units.length) return;
    const rect = mainCanvas.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * mainCanvas.width;
    const y = ((event.clientY - rect.top) / rect.height) * mainCanvas.height;
    const unit = hitTestResponseUnit(runtime.encounter, x, y);
    if (!unit) return;
    event.preventDefault(); event.stopImmediatePropagation();
    applyResponseHit(host, runtime.encounter, unit);
  };
  mainCanvas.addEventListener('pointerdown', pointer, true);

  const frame = (now) => {
    if (runtime.stopped) return;
    overlay.width = mainCanvas.width; overlay.height = mainCanvas.height;
    const frames = Math.min(3, Math.max(0.25, ((now - last) / 1000) * 60 || 1)); last = now;
    updateCampaignEncounter(host, runtime, frames);
    ctx.clearRect(0, 0, overlay.width, overlay.height);
    drawCampaignEncounter(ctx, host, runtime);
    decorateCampaignPanel(host, runtime);
    requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);
  const api = {
    get state() { return runtime.encounter; },
    hit(unitId, damage = RESPONSE_TAP_DAMAGE) {
      const unit = runtime.encounter.units.find((candidate) => candidate.id === unitId);
      return unit ? applyResponseHit(host, runtime.encounter, unit, damage) : { ok: false, reason: 'missing-unit' };
    },
    stop() { runtime.stopped = true; mainCanvas.removeEventListener('pointerdown', pointer, true); overlay.remove(); disarmCommandTower(host.city); }
  };
  host.campaignEncounter = api;
  document.body.dataset.campaignEncounterBridge = 'ready';
  return api;
}

function autoAttach() {
  try {
    if (window.RampageMaster?.gameplayCommands && !window.RampageMaster.campaignEncounter) attachCampaignEncounterBridge(window.RampageMaster);
  } catch (error) {
    console.error('[RampageMaster campaign encounter bridge]', error);
    document.body.dataset.campaignEncounterBridge = 'error';
  }
}

if (typeof window !== 'undefined' && typeof document !== 'undefined') {
  window.addEventListener('rampagemaster:gameplay-ready', autoAttach);
  if (window.RampageMaster?.gameplayCommands) autoAttach();
}
