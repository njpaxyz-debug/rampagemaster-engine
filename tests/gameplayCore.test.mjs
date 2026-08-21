import assert from 'node:assert/strict';
import { buildCharacterEngine } from '../src/modules/characterEngine.js';
import { createGameplayCore } from '../src/modules/gameplayCore.js';
import { createMemoryStorage } from '../src/modules/persistence.js';

const engine = buildCharacterEngine({
  categories: [{ CategoryID: 'CAT_BODY', MutuallyExclusive: true }],
  featureOptions: [{ OptionID: 'BODY_A', CategoryID: 'CAT_BODY', Status: 'ACTIVE', SortOrder: 1 }],
  compatibilityRules: [], colorPalettes: [], animationMeta: [], poses: [], assetRegistry: []
});
const storage = createMemoryStorage();
const core = createGameplayCore({ characterEngine: engine, storage, seed: { wallet: { bones: 100 }, pet: { name: 'Mochi' } } });
assert.equal(core.state.pet.hatched, false);
core.hatchTap({ x: 10, y: 10, dt: 1 }, { nonce: 99 });
core.hatchTap({ x: 20, y: 20, dt: 2 }, { nonce: 99 });
const hatch = core.hatchTap({ x: 30, y: 30, dt: 3 }, { nonce: 99 });
assert.equal(hatch.hatched, true); assert.equal(core.state.pet.hatched, true); assert.equal(core.state.genome.selectedOptions[0], 'BODY_A'); assert.equal(core.state.genome.validation.valid, true);
assert.equal(core.care('feed').ok, true);
assert.equal(core.convert('bo').ok, true); assert.equal(core.state.wallet.opal, 1);
core.state.wallet.bones = 45; assert.equal(core.buy('snack').ok, true); assert.equal(core.state.inventory.snack, 3);
core.state.wallet.opal = 1; assert.equal(core.enterArcade('premium').ok, true); const reward = core.settleArcade(9, 'premium'); assert.equal(reward.quartz, 1); assert.equal(core.state.wallet.quartz, 1);
core.save(); const dna = core.state.hatch.dna; const fresh = createGameplayCore({ characterEngine: engine, storage }); fresh.load(); assert.equal(fresh.state.hatch.dna, dna); assert.equal(fresh.state.pet.hatched, true);
const exported = core.export(); const imported = fresh.import(exported); assert.equal(imported.ok, true); assert.equal(fresh.state.genome.dna, core.state.genome.dna);
console.log('gameplay core: ok');
