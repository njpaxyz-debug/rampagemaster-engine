import assert from 'node:assert/strict';
import { applyArcadeReward, arcadeSpawnDelay, createArcadeProgression, payArcadeEntry, settleArcadeRound } from '../src/modules/arcadeProgression.js';

const wallet = { bones: 2, opal: 1, quartz: 0 };
assert.equal(payArcadeEntry(wallet, 'basic').ok, true); assert.equal(wallet.bones, 1);
assert.equal(payArcadeEntry(wallet, 'premium').ok, true); assert.equal(wallet.opal, 0);
const progress = createArcadeProgression({ wins: 19, streak: 3, best: 8 });
const reward = settleArcadeRound(progress, 9, 'premium');
assert.equal(reward.win, true); assert.equal(reward.boss, true); assert.equal(reward.bones, 54); assert.equal(reward.opal, 1); assert.equal(reward.quartz, 1); assert.equal(progress.wins, 20); assert.equal(progress.streak, 4); assert.equal(progress.best, 9);
applyArcadeReward(wallet, reward); assert.equal(wallet.bones, 55); assert.equal(wallet.opal, 1); assert.equal(wallet.quartz, 1);
assert.ok(arcadeSpawnDelay(10) < arcadeSpawnDelay(0));
console.log('arcade progression: ok');
