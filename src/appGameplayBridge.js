import { loadCharacterEngine } from './modules/characterEngine.js';
import { createGameplayCore } from './modules/gameplayCore.js';

const CURRENCIES = ['bones', 'opal', 'quartz', 'fossils', 'oil', 'petrol', 'diamond'];

function copyWallet(target = {}, source = {}) {
  for (const currency of CURRENCIES) {
    if (currency in source || currency in target) target[currency] = Math.max(0, Math.floor(source[currency] || 0));
  }
  return target;
}

function shareHostWallet(core, hostWallet) {
  copyWallet(hostWallet, core.state.wallet);
  core.state.wallet = hostWallet;
  core.state.pet.wallet = hostWallet;
  return core;
}

export async function attachGameplayBridge(host, options = {}) {
  if (!host?.wallet) throw new Error('RampageMaster gameplay bridge requires a host wallet.');
  const core = createGameplayCore({
    seed: { wallet: host.wallet, pet: options.pet || {}, hatch: options.hatch || {} },
    economyProfile: options.economyProfile || 'master20260509',
    characterEngine: options.characterEngine || null,
    ...(options.storage ? { storage: options.storage } : {}),
    storageKey: options.storageKey || 'rampagemaster_pilot_gameplay'
  });
  core.state.wallet = host.wallet;
  core.state.pet.wallet = host.wallet;

  const characterEngine = options.characterEngine || await loadCharacterEngine(options.characterEngineOptions || {});
  core.setCharacterEngine(characterEngine);

  host.gameplay = core;
  host.characterEngine = characterEngine;
  host.gameplayCommands = Object.freeze({
    setName: (name) => core.setName(name),
    chooseEgg: (eggId) => core.chooseEgg(eggId),
    care: (action, context) => core.care(action, context),
    hatchTap: (tap, hatchOptions) => core.hatchTap(tap, hatchOptions),
    useItem: (itemId) => core.useItem(itemId),
    buy: (itemId) => core.buy(itemId),
    convert: (routeId, count) => core.convert(routeId, count),
    enterArcade: (mode) => core.enterArcade(mode),
    settleArcade: (score, mode) => core.settleArcade(score, mode),
    beginCampaign: (district) => core.beginCampaign(district),
    campaignScore: (base, reason) => core.campaignScore(base, reason),
    campaignProgress: (amount, campaignOptions) => core.campaignProgress(amount, campaignOptions),
    failCampaign: (reason) => core.failCampaign(reason),
    save: () => core.save(),
    load: () => {
      core.load();
      shareHostWallet(core, host.wallet);
      return core.snapshot();
    },
    export: (exportOptions) => core.export(exportOptions),
    import: (text) => {
      const result = core.import(text);
      if (result.ok) shareHostWallet(core, host.wallet);
      return result;
    },
    importLegacy: (input) => {
      const result = core.importLegacy(input);
      if (result.ok) shareHostWallet(core, host.wallet);
      return result;
    },
    clearSave: () => core.clearSave()
  });
  return { host, core, characterEngine };
}

async function waitForHost(timeoutMs = 8000) {
  const start = performance.now();
  while (performance.now() - start < timeoutMs) {
    if (window.RampageMaster?.wallet) return window.RampageMaster;
    await new Promise((resolve) => requestAnimationFrame(resolve));
  }
  throw new Error('RampageMaster host did not become ready for gameplay bridge.');
}

if (typeof window !== 'undefined' && typeof document !== 'undefined') {
  waitForHost()
    .then((host) => attachGameplayBridge(host))
    .then(({ host }) => {
      document.body.dataset.gameplayBridge = 'ready';
      window.dispatchEvent(new CustomEvent('rampagemaster:gameplay-ready', { detail: { version: host.gameplay.state.version } }));
    })
    .catch((error) => {
      console.error('[RampageMaster gameplay bridge]', error);
      document.body.dataset.gameplayBridge = 'error';
    });
}
