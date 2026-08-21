import assert from 'node:assert/strict';
import { createGameplayCore } from '../src/modules/gameplayCore.js';
import { citizenCampaignScore, consumeCityCitizen, hitTestCitizen, nearestCitizen, updateCitizenRespawns } from '../src/citizenGameplayBridge.js';

const core = createGameplayCore({ seed: { wallet: { bones: 0 }, campaign: { missionIndex: 1 } } });
core.state.pet.hatched = true;
core.beginCampaign(0);
assert.equal(core.state.mission.mission.kind, 'feed');
const citizen = { id: 'c1', x: 100, y: 420, value: 4, rarity: 'common', fear: 0, spawnClock: 0 };
const city = { width: 1000, groundY: 420, panic: 0, citizens: [citizen] };
const host = {
  city,
  gameplay: core,
  gameplayCommands: {
    care: (...args) => core.care(...args),
    campaignScore: (...args) => core.campaignScore(...args),
    campaignProgress: (...args) => core.campaignProgress(...args),
    save: () => core.snapshot()
  },
  themePacks: [{},{},{}]
};
const runtime = { respawn: [] };
assert.equal(citizenCampaignScore(citizen), 36);
assert.equal(nearestCitizen(city, 120)?.citizen.id, 'c1');
assert.equal(hitTestCitizen(city, 100, 402)?.citizen.id, 'c1');
const result = consumeCityCitizen(host, runtime, citizen, () => 0, 1000);
assert.equal(result.ok, true);
assert.equal(city.citizens.length, 0);
assert.equal(core.state.mission.progress, 1);
assert.equal(core.state.mission.score, 36);
assert.equal(core.state.pet.food, 86);
assert.equal(core.state.pet.clean, 83);
assert.equal(core.state.wallet.bones, 12);
assert.equal(runtime.respawn[0].at, 11000);
assert.equal(updateCitizenRespawns(host, runtime, 10999, () => 0), 0);
assert.equal(updateCitizenRespawns(host, runtime, 11000, () => 0), 1);
assert.equal(city.citizens.length, 1);
assert.equal(city.citizens[0].x, -20);
assert.equal(city.citizens[0].fear, 0);

console.log('citizen gameplay bridge: ok');