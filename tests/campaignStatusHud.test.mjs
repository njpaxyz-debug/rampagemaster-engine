import assert from 'node:assert/strict';
import { createGameplayCore } from '../src/modules/gameplayCore.js';
import { campaignHudModel } from '../src/campaignStatusHud.js';

const core = createGameplayCore({ seed: { campaign: { missionIndex: 2 } } });
core.state.pet.hatched = true;
core.beginCampaign(1);
core.state.mission.progress = 2;
core.state.mission.score = 420;
core.state.mission.combo = 3;
core.state.mission.threat = 52;
core.state.mission.timeFrames = 3599;
const host = { gameplay: core, campaignEncounter: { state: { units: [{ id: 'u1' }, { id: 'u2' }], bossId: null } }, city: { buildings: [] } };
let model = campaignHudModel(host);
assert.equal(model.active, true);
assert.equal(model.kind, 'response');
assert.equal(model.responseUnits, 2);
assert.equal(model.score, 420);
assert.equal(model.combo, 3);
assert.equal(model.threat, 52);
assert.equal(model.time, '1:00');

const bossCore = createGameplayCore({ seed: { campaign: { missionIndex: 3 } } });
bossCore.state.pet.hatched = true;
bossCore.beginCampaign(0);
const bossHost = { gameplay: bossCore, campaignEncounter: { state: { units: [], bossId: 'tower' } }, city: { buildings: [{ id: 'tower', hp: 18.4, max: 28.56 }] } };
model = campaignHudModel(bossHost);
assert.equal(model.kind, 'boss');
assert.deepEqual(model.bossHp, { hp: 18.4, max: 28.56 });

bossCore.state.mission.phase = 'complete';
assert.equal(campaignHudModel(bossHost).active, false);

console.log('campaign status HUD model: ok');