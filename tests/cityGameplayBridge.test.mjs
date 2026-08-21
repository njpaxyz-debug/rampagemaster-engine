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
assert.equal(result.ok, true);
assert.equal(result.delta, 1);
assert.equal(result.baseScore, 80);
assert.equal(core.state.mission.progress, 1);
assert.equal(core.state.mission.score, 80);
assert.equal(core.state.mission.threat, 13);
host.city.collapseCount = 4;
result = processCityCollapseDelta(host, 1);
assert.equal(result.delta, 3);
assert.equal(result.completed, true);
assert.equal(core.state.campaign.missionsCompleted, 1);
assert.equal(core.state.mission.phase, 'complete');
assert.ok(core.state.wallet.bones >= 180);

const bossCore = createGameplayCore({ seed: { wallet: { bones: 0 }, campaign: { missionIndex: 3 } } });
bossCore.state.pet.hatched = true;
bossCore.beginCampaign(2);
assert.equal(bossCore.state.mission.mission.kind, 'boss');
const bossHost = {
  city: {
    collapseCount: 1,
    lastCollapse: 'tower',
    buildings: [{ id: 'tower', points: 60, hp: 0, campaignRole: 'commandTower' }]
  },
  gameplay: bossCore,
  gameplayCommands: {
    campaignScore: (...args) => bossCore.campaignScore(...args),
    campaignProgress: (...args) => bossCore.campaignProgress(...args),
    save: () => bossCore.snapshot()
  },
  themePacks: [{},{},{},{},{}]
};
result = processCityCollapseDelta(bossHost, 0);
assert.equal(result.bossDestroyed, true);
assert.equal(result.completed, true);
assert.equal(result.totalScoreBase, 305);
assert.equal(bossCore.state.mission.score, 305);
assert.equal(bossCore.state.mission.threat, 23);
assert.equal(bossCore.state.mission.phase, 'complete');
assert.equal(bossCore.state.campaign.missionsCompleted, 1);

console.log('city gameplay bridge: ok');