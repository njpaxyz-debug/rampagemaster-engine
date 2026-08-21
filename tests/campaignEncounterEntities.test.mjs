import assert from 'node:assert/strict';
import {
  armCommandTower,
  bossCampaignScore,
  createEncounterState,
  createResponseUnit,
  damageResponseUnit,
  maybeSpawnResponse,
  responseHp,
  responseMaxUnits,
  selectCommandTower
} from '../src/modules/campaignEncounterEntities.js';

assert.equal(responseMaxUnits(34, 0), 2);
assert.equal(responseMaxUnits(100, 4), 6);
assert.equal(responseHp('drone', 0, 1), 35);
assert.equal(responseHp('tank', 0, 1), 54);

const rolls = [0.2, 0.2, 0.5, 0.1];
let ri = 0;
const random = () => rolls[ri++ % rolls.length];
const unit = createResponseUnit({ district: 0, rank: 1, width: 1000, groundY: 500, random, id: 'u1' });
assert.equal(unit.type, 'drone');
assert.equal(unit.x, -20);
assert.equal(unit.hp, 35);

const encounter = createEncounterState({ units: [unit] });
const hit = damageResponseUnit(encounter, 'u1', 35, { missionKind: 'response', random: () => 0.1 });
assert.equal(hit.killed, true);
assert.equal(hit.scoreBase, 160);
assert.equal(hit.progressDelta, 1);
assert.equal(hit.threatDelta, -8);
assert.equal(hit.pickup, 'heal');

const spawn = createEncounterState({ spawnTimerFrames: 0 });
const spawnRolls = [0.9, 0.9, 0.2, 0.3];
let si = 0;
const spawned = maybeSpawnResponse(spawn, {
  frames: 1,
  threat: 34,
  district: 0,
  rank: 1,
  width: 1000,
  groundY: 500,
  random: () => spawnRolls[si++ % spawnRolls.length]
});
assert.equal(spawned.spawned, true);
assert.equal(spawned.unit.type, 'tank');
assert.equal(spawned.unit.hp, 54);
assert.equal(spawn.spawnTimerFrames, 210);

const city = {
  buildings: [
    { id: 'a', h: 100, w: 80, points: 10, max: 10, hp: 10 },
    { id: 'b', h: 200, w: 70, points: 20, max: 12, hp: 12 }
  ]
};
assert.equal(selectCommandTower(city).id, 'b');
const boss = armCommandTower(city, 1, 'm1');
assert.equal(boss.max, 12 * 2.38);
assert.equal(boss.hp, boss.max);
assert.equal(bossCampaignScore(2), 305);

console.log('campaign encounter entities: ok');
