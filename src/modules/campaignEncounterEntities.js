export const RESPONSE_SOURCE = Object.freeze({
  build: 'RampageMaster_DEPLOYMENT_DEFINITIVE_v12.html / embedded city RM3 + RM8 safety patch',
  tapDamage: 5,
  dropChance: 0.72,
  decorativeShotIntervalMs: 24 * 60 * 60 * 1000
});

export const RESPONSE_TAP_DAMAGE = RESPONSE_SOURCE.tapDamage;

const clamp = (value, min, max) => Math.max(min, Math.min(max, Number(value) || 0));

export function createEncounterState(seed = {}) {
  return {
    units: Array.isArray(seed.units) ? seed.units.map((unit) => ({ ...unit })) : [],
    shots: Array.isArray(seed.shots) ? seed.shots.map((shot) => ({ ...shot })) : [],
    pickups: Array.isArray(seed.pickups) ? seed.pickups.map((pickup) => ({ ...pickup })) : [],
    spawnTimerFrames: Number.isFinite(Number(seed.spawnTimerFrames)) ? Number(seed.spawnTimerFrames) : 90,
    sequence: Math.max(0, Math.floor(seed.sequence || 0)),
    bossId: seed.bossId || null,
    missionToken: seed.missionToken || null
  };
}

export function responseMaxUnits(threat = 0, district = 0) {
  return Math.min(6, 1 + Math.floor(Math.max(0, Number(threat) || 0) / 22) + Math.floor(Math.max(0, Number(district) || 0) / 2));
}

export function responseHp(type, district = 0, rank = 1) {
  const base = type === 'tank' ? 52 : 34;
  return Math.floor(base * (1 + Math.max(0, Number(district) || 0) * 0.22 + Math.max(1, Number(rank) || 1) * 0.055));
}

export function createResponseUnit({ district = 0, rank = 1, width = 1280, groundY = 420, random = Math.random, id = null } = {}) {
  const droneThreshold = Math.min(0.95, 0.58 + Math.max(0, Number(district) || 0) * 0.03);
  const drone = random() < droneThreshold;
  const edge = random() < 0.5 ? -20 : Math.max(20, Number(width) || 1280) + 20;
  const hp = responseHp(drone ? 'drone' : 'tank', district, rank);
  const y = drone
    ? clamp(70 + random() * 185, 48, Math.max(60, (Number(groundY) || 420) - 70))
    : Math.max(28, (Number(groundY) || 420) - 10);
  return {
    id: id || `response-${Date.now().toString(36)}-${Math.floor(random() * 1e7).toString(36)}`,
    type: drone ? 'drone' : 'tank',
    x: edge,
    y,
    vx: edge < 0 ? 27 : -27,
    hp,
    maxHp: hp,
    flash: 0,
    dead: false
  };
}

export function maybeSpawnResponse(encounter, context = {}) {
  if (!encounter) return { ok: false, reason: 'missing-encounter' };
  const frames = Math.max(0, Number(context.frames) || 0);
  encounter.spawnTimerFrames -= frames;
  const threat = Math.max(0, Number(context.threat) || 0);
  if (encounter.spawnTimerFrames > 0 || threat < 14) return { ok: true, spawned: false, spawnTimerFrames: encounter.spawnTimerFrames };
  const alive = encounter.units.filter((unit) => !unit.dead).length;
  const maxUnits = responseMaxUnits(threat, context.district);
  if (alive >= maxUnits) {
    encounter.spawnTimerFrames = 95;
    return { ok: true, spawned: false, maxUnits, alive, spawnTimerFrames: encounter.spawnTimerFrames };
  }
  encounter.sequence += 1;
  const unit = createResponseUnit({
    district: context.district,
    rank: context.rank,
    width: context.width,
    groundY: context.groundY,
    random: context.random || Math.random,
    id: `response-${encounter.sequence}`
  });
  encounter.units.push(unit);
  encounter.spawnTimerFrames = Math.max(95, 250 - Math.floor(threat * 1.2));
  return { ok: true, spawned: true, unit, maxUnits, spawnTimerFrames: encounter.spawnTimerFrames };
}

export function rollResponsePickup(random = Math.random) {
  if (random() >= RESPONSE_SOURCE.dropChance) return null;
  const roll = random();
  return roll < 0.34 ? 'heal' : roll < 0.68 ? 'rage' : 'bones';
}

export function damageResponseUnit(encounter, unitOrId, damage = RESPONSE_TAP_DAMAGE, context = {}) {
  if (!encounter) return { ok: false, reason: 'missing-encounter' };
  const unit = typeof unitOrId === 'object' ? unitOrId : encounter.units.find((candidate) => candidate.id === unitOrId);
  if (!unit || unit.dead) return { ok: false, reason: 'missing-unit' };
  unit.hp = Math.max(0, Number(unit.hp || 0) - Math.max(0, Number(damage) || 0));
  unit.flash = 1;
  if (unit.hp > 0) return { ok: true, killed: false, unit, damage: Math.max(0, Number(damage) || 0) };
  unit.dead = true;
  const pickup = rollResponsePickup(context.random || Math.random);
  if (pickup) encounter.pickups.push({ id: `pickup-${unit.id}`, type: pickup, x: unit.x, y: unit.y, lifeFrames: 720, bob: 0 });
  return {
    ok: true,
    killed: true,
    unit,
    scoreBase: unit.type === 'tank' ? 220 : 160,
    progressDelta: context.missionKind === 'response' ? 1 : 0,
    threatDelta: -8,
    pickup
  };
}

export function updateResponseMotion(encounter, { frames = 1, petX = 0, width = 1280 } = {}) {
  if (!encounter) return encounter;
  const f = Math.max(0, Number(frames) || 0);
  for (const unit of encounter.units) {
    if (unit.dead) continue;
    unit.flash = Math.max(0, Number(unit.flash || 0) - f / 5);
    const dx = Number(petX || 0) - unit.x;
    if (unit.type === 'drone') {
      unit.vx += Math.sign(dx) * 0.018 * f * 60;
      unit.vx = clamp(unit.vx, -48, 48);
      unit.x += unit.vx * (f / 60);
      unit.y += Math.sin((unit.x + unit.y) * 0.035) * 0.18 * f;
    } else {
      unit.vx = Math.sign(dx || unit.vx || 1) * 14.4;
      unit.x += unit.vx * (f / 60);
    }
    unit.x = clamp(unit.x, -18, Math.max(18, Number(width) || 1280) + 18);
  }
  encounter.units = encounter.units.filter((unit) => !unit.dead);
  for (const pickup of encounter.pickups) {
    pickup.lifeFrames -= f;
    pickup.bob = (pickup.bob || 0) + 0.08 * f;
  }
  encounter.pickups = encounter.pickups.filter((pickup) => pickup.lifeFrames > 0 && !pickup.dead);
  return encounter;
}

export function commandTowerScore(building) {
  return (Number(building?.h) || 0) * 1.5 + (Number(building?.points) || 0) * 2 + (Number(building?.w) || 0);
}

export function selectCommandTower(city) {
  const buildings = city?.buildings || [];
  const existing = buildings.find((building) => building?.campaignRole === 'commandTower');
  if (existing) return existing;
  const available = buildings.filter((building) => building && !building.deadAt && Number(building.max) > 0);
  const tower = available.sort((a, b) => commandTowerScore(b) - commandTowerScore(a))[0] || null;
  if (tower) tower.campaignRole = 'commandTower';
  return tower;
}

export function armCommandTower(city, rank = 1, missionToken = 'boss') {
  const tower = selectCommandTower(city);
  if (!tower) return null;
  if (tower.bossMissionToken === missionToken) return tower;
  const baseMax = Number(tower.campaignBaseMax || tower.max || 1);
  tower.campaignBaseMax = baseMax;
  tower.bossMultiplier = 2.3 + Math.max(1, Number(rank) || 1) * 0.08;
  tower.max = baseMax * tower.bossMultiplier;
  tower.hp = tower.max;
  tower.bossMissionToken = missionToken;
  tower.campaignRole = 'commandTower';
  return tower;
}

export function disarmCommandTower(city) {
  const tower = city?.buildings?.find((building) => building?.campaignRole === 'commandTower');
  if (!tower) return null;
  if (tower.campaignBaseMax) {
    tower.max = tower.campaignBaseMax;
    tower.hp = Math.min(Number(tower.hp || 0), tower.max);
  }
  tower.bossMissionToken = null;
  tower.bossMultiplier = null;
  return tower;
}

export function bossCampaignScore(district = 0) {
  return 255 + Math.max(0, Number(district) || 0) * 25;
}
