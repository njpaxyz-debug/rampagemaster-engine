import { chooseEgg, createHatchState, getEggSpecies, recordHatchTap, selectCharacterEngineOptions } from './hatchDna.js';
import { applyCareAction, applyInventoryItem, createPetProgressionState } from './petProgression.js';
import { createProgressionWallet, convertProgressionCurrency, purchaseMasterShopItem } from './economyProgression.js';
import { applyArcadeReward, createArcadeProgression, payArcadeEntry, settleArcadeRound } from './arcadeProgression.js';
import { createStateStore } from './persistence.js';
import { addCampaignProgress, addCampaignScore, campaignMissionComplete, completeCampaignMission, createCampaignState, createMissionSession, failCampaignMission } from './campaignProgression.js';
import { validateSelection } from './characterEngine.js';
import { migrateLegacyRampageState } from './legacyStateMigration.js';

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
    campaign: createCampaignState(seed.campaign || {}),
    mission: seed.mission || null,
    district: Math.max(0, Math.floor(seed.district || 0)),
    districtsUnlocked: Array.isArray(seed.districtsUnlocked) ? [...seed.districtsUnlocked] : [true],
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
    setName(name) {
      const clean = String(name || '').trim().slice(0, 18) || 'Mochi';
      state.pet.name = clean;
      state.hatch.name = clean;
      state.lastAction = { type: 'setName', at: Date.now(), name: clean };
      return clean;
    },
    chooseEgg(eggId) {
      const result = chooseEgg(state.hatch, eggId);
      if (result.ok) {
        const species = getEggSpecies(eggId);
        state.pet.personality = species.trait;
        state.pet.speciesEvolution = species.evolution;
      }
      state.lastAction = { type: 'chooseEgg', at: Date.now(), result };
      return result;
    },
    hatchTap(tap, options = {}) {
      const result = recordHatchTap(state.hatch, tap, options);
      if (result.hatched) {
        state.pet.hatched = true;
        state.pet.bond = Math.max(state.pet.bond, 15);
        state.pet.xp = Math.max(state.pet.xp, 25);
        state.hatch.name = state.pet.name;
        const species = getEggSpecies(state.hatch.eggId);
        state.pet.personality = state.pet.personality || species.trait;
        state.pet.speciesEvolution = species.evolution;
        const selectedOptions = engine ? selectCharacterEngineOptions(engine, result.genomeSeed) : [];
        const validation = engine ? validateSelection(engine, selectedOptions) : null;
        state.genome = { seed: result.genomeSeed, dna: result.dna, selectedOptions, validation, eggSpecies: species.id };
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
    beginCampaign(district = state.district) {
      state.district = Math.max(0, Math.floor(district || 0));
      state.mission = createMissionSession(state.campaign, state.district);
      state.lastAction = { type: 'campaignStart', at: Date.now(), mission: state.mission.mission.title };
      return state.mission;
    },
    campaignScore(base, reason) {
      if (!state.mission) return { ok: false, reason: 'no-mission' };
      const result = addCampaignScore(state.campaign, state.mission, base, reason);
      state.lastAction = { type: 'campaignScore', at: Date.now(), result };
      return result;
    },
    campaignProgress(amount = 1, options = {}) {
      if (!state.mission) return { ok: false, reason: 'no-mission' };
      addCampaignProgress(state.mission, amount);
      const complete = campaignMissionComplete(state.mission, options);
      if (!complete) return { ok: true, complete: false, progress: state.mission.progress };
      const result = completeCampaignMission({ campaign: state.campaign, session: state.mission, wallet: state.wallet, pet: state.pet, districtsUnlocked: state.districtsUnlocked, districtCount: Math.max(1, options.districtCount || state.districtsUnlocked.length) });
      state.lastAction = { type: 'campaignComplete', at: Date.now(), result };
      return { ...result, complete: true };
    },
    failCampaign(reason) {
      if (!state.mission) return { ok: false, reason: 'no-mission' };
      const result = failCampaignMission(state.mission, reason);
      state.lastAction = { type: 'campaignFail', at: Date.now(), result };
      return result;
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
    },
    importLegacy(input) {
      const migration = migrateLegacyRampageState(input);
      if (!migration.ok) return migration;
      state = createGameplayState(migration.seed, { economyProfile: migration.seed.economyProfile || economyProfile });
      syncReferences();
      state.lastAction = { type: 'legacyImport', format: migration.format, at: Date.now(), warnings: migration.warnings };
      return { ...migration, state: api.snapshot() };
    }
  };
  return api;
}
