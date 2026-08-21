const clamp = (value, min = 0, max = 100) => Math.max(min, Math.min(max, Number(value) || 0));

export const MASTER_CARE_RULES = Object.freeze({
  feed: Object.freeze({ food: 22, clean: -4, bond: 2, xp: 7 }),
  play: Object.freeze({ minEnergy: 12, joy: 24, energy: -12, bond: 4, xp: 11 }),
  clean: Object.freeze({ clean: 32, joy: 4, xp: 6 }),
  rest: Object.freeze({ energy: 30, bedEnergy: 42, health: 8, food: -5, xp: 0 }),
  train: Object.freeze({ minEnergy: 18, minFood: 16, energy: -18, food: -10, bones: 22, luckyBones: 32, xp: 18 }),
  explore: Object.freeze({ energyCost: 13, metroEnergyCost: 8, clean: -7, bones: 30, luckyBones: 42, xp: 14 }),
  rampage: Object.freeze({ minEnergy: 20, energy: -20, clean: -12, joy: 9, bones: 35, luckyBones: 50, bonesPerBuilding: 8, xp: 20, xpPerBuilding: 5 }),
  consume: Object.freeze({ food: 8, clean: -3, bond: 1, bones: 12, luckyBones: 18, xp: 3 })
});

export const MASTER_ITEM_RULES = Object.freeze({
  snack: Object.freeze({ food: 34, xp: 5 }),
  toy: Object.freeze({ joy: 35, bond: 4, xp: 6 }),
  soap: Object.freeze({ clean: 38, xp: 4 }),
  bait: Object.freeze({ spawnCitizens: 8, xp: 0 }),
  relic: Object.freeze({ bond: 32, xpDirect: 35, capXpBelowLevel: 99 })
});

export function createPetProgressionState(seed = {}) {
  return {
    hatched: seed.hatched ?? false,
    name: seed.name ?? 'Mochi',
    level: Math.max(1, Math.floor(seed.level ?? 1)),
    xp: clamp(seed.xp ?? 0, 0, 99),
    bond: clamp(seed.bond ?? 0),
    food: clamp(seed.food ?? 78),
    joy: clamp(seed.joy ?? 70),
    energy: clamp(seed.energy ?? 82),
    clean: clamp(seed.clean ?? 86),
    health: clamp(seed.health ?? 100),
    wallet: { bones: Math.max(0, Math.floor(seed.wallet?.bones ?? 180)), ...(seed.wallet || {}) },
    inventory: { snack: 0, toy: 0, soap: 0, bait: 0, relic: 0, ...(seed.inventory || {}) },
    upgrades: { metro: false, bed: false, lucky: false, vault: false, ...(seed.upgrades || {}) },
    personality: seed.personality ?? null,
    speciesEvolution: seed.speciesEvolution ?? 'Mature'
  };
}

function applyDelta(state, delta = {}) {
  for (const key of ['food', 'joy', 'energy', 'clean', 'health', 'bond']) {
    if (delta[key]) state[key] = clamp(state[key] + delta[key]);
  }
}

export function grantXP(state, amount = 0) {
  state.xp = Math.max(0, Math.floor(state.xp || 0)) + Math.max(0, Math.floor(amount || 0));
  let levels = 0;
  let bones = 0;
  while (state.xp >= 100) {
    state.xp -= 100;
    state.level = Math.max(1, Math.floor(state.level || 1)) + 1;
    state.wallet.bones = Math.max(0, Math.floor(state.wallet.bones || 0)) + 25;
    state.bond = clamp(state.bond + 3);
    levels += 1;
    bones += 25;
  }
  return { levels, bones, level: state.level, xp: state.xp };
}

export function getPetMood(state) {
  if (!state.hatched) return 'incubating';
  if (state.health < 35) return 'hurt';
  if (state.food < 25) return 'hungry';
  if (state.clean < 25) return 'grimy';
  if (state.energy < 25) return 'sleepy';
  if (state.joy < 25) return 'bored';
  if (state.bond > 80) return 'loyal';
  return state.personality || 'alert';
}

export function getPetStage(state, evolutionName = state.speciesEvolution || 'Mature') {
  if (!state.hatched) return 'Egg';
  if ((state.level || 1) >= 12) return evolutionName;
  if ((state.level || 1) >= 6) return 'Juvenile';
  return 'Baby';
}

export function applyCareAction(state, action, context = {}) {
  if (!state?.wallet || !state?.upgrades) throw new Error('Invalid pet progression state');
  if (!state.hatched && action !== 'rest') return { ok: false, reason: 'hatch-required', action };
  const rule = MASTER_CARE_RULES[action];
  if (!rule) return { ok: false, reason: 'unknown-action', action };

  if (action === 'play' && state.energy < rule.minEnergy) return { ok: false, reason: 'low-energy', required: rule.minEnergy, action };
  if (action === 'train' && (state.energy < rule.minEnergy || state.food < rule.minFood)) {
    return { ok: false, reason: 'needs-food-and-energy', requiredEnergy: rule.minEnergy, requiredFood: rule.minFood, action };
  }
  if (action === 'explore') {
    const cost = state.upgrades.metro ? rule.metroEnergyCost : rule.energyCost;
    if (state.energy < cost) return { ok: false, reason: 'low-energy', required: cost, action };
    applyDelta(state, { energy: -cost, clean: rule.clean });
    const gained = state.upgrades.lucky ? rule.luckyBones : rule.bones;
    state.wallet.bones += gained;
    return { ok: true, action, bones: gained, xp: grantXP(state, rule.xp) };
  }
  if (action === 'rampage') {
    if (state.energy < rule.minEnergy) return { ok: false, reason: 'low-energy', required: rule.minEnergy, action };
    const hits = Math.max(0, Math.floor(context.buildingsHit || 0));
    applyDelta(state, { energy: rule.energy, clean: rule.clean, joy: rule.joy });
    const gained = (state.upgrades.lucky ? rule.luckyBones : rule.bones) + hits * rule.bonesPerBuilding;
    state.wallet.bones += gained;
    return { ok: true, action, buildingsHit: hits, bones: gained, xp: grantXP(state, rule.xp + hits * rule.xpPerBuilding) };
  }
  if (action === 'consume') {
    applyDelta(state, rule);
    const gained = state.upgrades.lucky ? rule.luckyBones : rule.bones;
    state.wallet.bones += gained;
    return { ok: true, action, bones: gained, xp: grantXP(state, rule.xp) };
  }
  if (action === 'rest') {
    applyDelta(state, { energy: state.upgrades.bed ? rule.bedEnergy : rule.energy, health: rule.health, food: rule.food });
    return { ok: true, action, xp: { levels: 0, bones: 0, level: state.level, xp: state.xp } };
  }
  if (action === 'train') {
    applyDelta(state, { energy: rule.energy, food: rule.food });
    const gained = state.upgrades.lucky ? rule.luckyBones : rule.bones;
    state.wallet.bones += gained;
    return { ok: true, action, bones: gained, xp: grantXP(state, rule.xp) };
  }

  applyDelta(state, rule);
  return { ok: true, action, xp: grantXP(state, rule.xp || 0) };
}

export function applyInventoryItem(state, itemId) {
  const rule = MASTER_ITEM_RULES[itemId];
  if (!rule) return { ok: false, reason: 'unknown-item', itemId };
  if ((state.inventory?.[itemId] || 0) < 1) return { ok: false, reason: 'empty-inventory', itemId };
  state.inventory[itemId] -= 1;
  if (itemId === 'relic') {
    state.bond = clamp(state.bond + rule.bond);
    state.xp = clamp(state.xp + rule.xpDirect, 0, rule.capXpBelowLevel);
    return { ok: true, itemId, xp: state.xp, bond: state.bond };
  }
  applyDelta(state, rule);
  return { ok: true, itemId, spawnCitizens: rule.spawnCitizens || 0, xp: grantXP(state, rule.xp || 0) };
}
