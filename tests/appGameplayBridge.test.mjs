import assert from 'node:assert/strict';
import { buildCharacterEngine } from '../src/modules/characterEngine.js';
import { createMemoryStorage } from '../src/modules/persistence.js';
import { attachGameplayBridge } from '../src/appGameplayBridge.js';

const engine = buildCharacterEngine({ categories: [], featureOptions: [], compatibilityRules: [], colorPalettes: [], animationMeta: [], poses: [], assetRegistry: [] });
const host = { wallet: { bones: 100, opal: 0, quartz: 0, fossils: 0, oil: 0, lifetimeBones: 0 } };
const storage = createMemoryStorage();
await attachGameplayBridge(host, { characterEngine: engine, storage });
assert.ok(host.gameplay); assert.ok(host.gameplayCommands);
assert.equal(host.gameplayCommands.convert('bo').ok, true); assert.equal(host.wallet.bones, 0); assert.equal(host.wallet.opal, 1);
host.gameplay.state.pet.hatched = true; assert.equal(host.gameplayCommands.care('feed').ok, true);
host.gameplayCommands.save(); host.wallet.bones = 999; host.gameplayCommands.load(); assert.equal(host.wallet.bones, 0);
console.log('app gameplay bridge: ok');
