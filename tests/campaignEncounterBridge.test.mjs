import assert from 'node:assert/strict';
import { createGameplayCore } from '../src/modules/gameplayCore.js';
import { createEncounterState } from '../src/modules/campaignEncounterEntities.js';
import { applyEncounterPickup, applyResponseHit, hitTestResponseUnit, syncEncounterMission } from '../src/campaignEncounterBridge.js';

function commands(core) {
  return {
    campaignScore: (...args) => core.campaignScore(...args),
    campaignProgress: (...args) => core.campaignProgress(...args),
    save: () => core.snapshot()
  };
}

const core = createGameplayCore({ seed: { wallet: { bones: 0 }, campaign: { missionIndex: 2 } } });
core.state.pet.hatched = true;
core.beginCampaign(0);
assert.equal(core.state.mission.mission.kind, 'response');
const unit = { id: 'u1', type: 'drone', x: 100, y: 100, hp: 5, maxHp: 35, dead: false };
const encounter = createEncounterState({ units: [unit] });
const host = { gameplay: core, gameplayCommands: commands(core), themePacks: [{},{},{}] };
assert.equal(hitTestResponseUnit(encounter, 100, 100)?.id, 'u1');
const kill = applyResponseHit(host, encounter, unit, 5, () => 0.99);
assert.equal(kill.killed, true);
assert.equal(core.state.mission.progress, 1);
assert.equal(core.state.mission.score, 160);
assert.equal(Math.round(core.state.mission.threat), 26);

const rage = { type: 'rage', dead: false };
assert.equal(applyEncounterPickup(host, rage).amount, 28);
assert.equal(core.state.rampageMeter, 28);
const bones = { type: 'bones', dead: false };
assert.equal(applyEncounterPickup(host, bones).amount, 35);
assert.equal(core.state.wallet.bones, 35);

const bossCore = createGameplayCore({ seed: { campaign: { missionIndex: 3 } } });
bossCore.state.pet.hatched = true;
bossCore.beginCampaign(1);
const bossHost = {
  gameplay: bossCore,
  city: { buildings: [{ id: 'a', h: 100, w: 80, points: 10, max: 10, hp: 10 }, { id: 'tower', h: 220, w: 90, points: 40, max: 12, hp: 12 }] }
};
const runtime = { encounter: createEncounterState() };
const synced = syncEncounterMission(bossHost, runtime);
assert.equal(synced.kind, 'boss');
assert.equal(runtime.encounter.bossId, 'tower');
assert.equal(bossHost.city.buildings[1].campaignRole, 'commandTower');
assert.equal(bossHost.city.buildings[1].max, 12 * 2.38);

console.log('campaign encounter bridge: ok');