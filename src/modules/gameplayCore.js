import { createHatchState, recordHatchTap, selectCharacterEngineOptions } from './hatchDna.js';
import { applyCareAction, applyInventoryItem, createPetProgressionState } from './petProgression.js';
import { createProgressionWallet, convertProgressionCurrency, purchaseMasterShopItem } from './economyProgression.js';
import { applyArcadeReward, createArcadeProgression, payArcadeEntry, settleArcadeRound } from './arcadeProgression.js';
import { createStateStore } from './persistence.js';
import { validateSelection } from './characterEngine.js';

export const GAMEPLAY_CORE_VERSION = 'pilot-gameplay-core-1';

export function createGameplayState(seed = {}, options = {}) {
  const economyProfile = options.economyProfile || seed.economyProfile || 'master20260509';
  const wallet = createProgressionWallet(economyProfile, seed.wallet || { bones: 180 });
  const pet = createPetProgressionState({ ...(seed.pet || {}), wallet });
  pet.wallet = wallet;
  return {
    version: GAMEPLAY_CORE_VERSION,
    economyProfile,
    wallet,
    pet,
    hatch: createHatchState({ name: pet.name, ...(seed.hatch || {}) }),
    genome: seed.genome || null,
    arcade: createArcadeProgression(seed.arcade || {}),
    inventory: pet.inventory,
    upgrades: pet.upgrades,
    skins: seed.skins || {},
    skin: seed.skin || 'base',
    lastAction: seed.lastAction || null
  };
}

export function normalizeGameplayState(raw = {}, options = {}) {
  return createGameplayState(raw, { economyProfile: options.economyProfile || raw.economyProfile });
}

export function createGameplayCore({ seed = {}, economyProfile = seed.economyProfile || 'master20260509', characterEngine = null, storage = undefined, storageKey = 'rampagemaster_pilot_gameplay' } = {}) {
  let state = createGameplayState(seed, { economyProfile });
  let engine = characterEngine;
  const store = createStateStore({
    key: storageKey,
    ...(storage ? { storage } : {}),
    normalize: (value) => normalizeGameplayState(value, { economyProfile: value?.economyProfile || economyProfile })
  });

  const syncReferences = () => {
    state.pet.wallet = state.wallet;
    state.inventory = state.pet.inventory;
    state.upgrades = state.pet.upgrades;
    return state;
  };

  const api = {
    get state() { return state; },
    get characterEngine() { return engine; },
    setCharacterEngine(nextEngine) { engine = nextEngine; return api; },
    snapshot() { return JSON.parse(JSON.stringify(state)); },
    hatchTap(tap, options = {}) {
      const result = recordHatchTap(state.hatch, tap, options);
      if (result.hatched) {
        state.pet.hatched = true;
        state.pet.bond = Math.max(state.pet.bond, 15);
        state.pet.xp = Math.max(state.pet.xp, 25);
        state.hatch.name = state.pet.name;
        const selectedOptions = engine ? selectCharacterEngineOptions(engine, result.genomeSeed) : [];
        const validation = engine ? validateSelection(engine, selectedOptions) : null;
        state.genome = { seed: result.genomeSeed, dna: result.dna, selectedOptions, validation };
      }
      state.lastAction = { type: 'hatchTap', at: Date.now(), result: { ok: result.ok, hatched: result.hatched, remaining: result.remaining ?? 0 } };
      return result;
    },
    care(action, context = {}) {
      const result = applyCareAction(state.pet, action, context);
      state.lastAction = { type: 'care', action, at: Date.now(), result };
      syncReferences();
      return result;
    },
    useItem(itemId) {
      const result = applyInventoryItem(state.pet, itemId);
      state.lastAction = { type: 'item', itemId, at: Date.now(), result };
      syncReferences();
      return result;
    },
    convert(routeId, count = 1) {
      const result = convertProgressionCurrency(state.wallet, routeId, count, { profile: state.economyProfile, vaultDiscount: Boolean(state.upgrades.vault) });
      state.lastAction = { type: 'convert', routeId, at: Date.now(), result };
      return result;
    },
    buy(itemId) {
      const result = purchaseMasterShopItem(state, itemId);
      state.lastAction = { type: 'buy', itemId, at: Date.now(), result };
      syncReferences();
      return result;
    },
    enterArcade(mode = state.arcade.mode) {
      const result = payArcadeEntry(state.wallet, mode);
      if (result.ok) state.arcade.mode = mode;
      state.lastAction = { type: 'arcadeEntry', mode, at: Date.now(), result };
      return result;
    },
    settleArcade(score, mode = state.arcade.mode) {
      const reward = settleArcadeRound(state.arcade, score, mode);
      applyArcadeReward(state.wallet, reward);
      state.lastAction = { type: 'arcadeReward', mode, at: Date.now(), result: reward };
      return reward;
    },
    save() { syncReferences(); store.save(state); return api.snapshot(); },
    load() {
      const loaded = store.load(null);
      if (loaded) state = loaded;
      syncReferences();
      return api.snapshot();
    },
    clearSave() { store.clear(); },
    export(options = {}) { syncReferences(); return store.export(state, { version: GAMEPLAY_CORE_VERSION, ...options }); },
    import(text) {
      const result = store.import(text);
      if (result.ok) { state = result.state; syncReferences(); }
      return result;
    }
  };
  return api;
}
