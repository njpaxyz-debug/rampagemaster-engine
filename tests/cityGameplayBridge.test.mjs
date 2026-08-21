import assert from 'node:assert/strict';
import { createGameplayCore } from '../src/modules/gameplayCore.js';
import { processCityCollapseDelta } from '../src/cityGameplayBridge.js';

const core = createGameplayCore({ seed: { wallet: { bones: 0 } } });
core.state.pet.hatched = true;
core.beginCampaign(0);
const host = {
  city: { collapseCount: 1, lastCollapse: 'b0', buildings: [{ id: 'b0', points: 20 }] },
  gameplay: core,
  gameplayCommands: {
    campaignScore: (...args) => core.campaignScore(...args),
    campaignProgress: (...args) => core.campaignProgress(...args),
    save: () => core.snapshot()
  },
  themePacks: [{},{},{},{},{}]
};
let result = processCityCollapseDelta(host, 0);
assert.equal(result.ok, true); assert.equal(result.delta, 1); assert.equal(result.baseScore, 80); assert.equal(core.state.mission.progress, 1); assert.equal(core.state.mission.score, 80);
host.city.collapseCount = 4;
result = processCityCollapseDelta(host, 1);
assert.equal(result.delta, 3); assert.equal(result.completed, true); assert.equal(core.state.campaign.missionsCompleted, 1); assert.equal(core.state.mission.phase, 'complete'); assert.ok(core.state.wallet.bones >= 180);
console.log('city gameplay bridge: ok');
