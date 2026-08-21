import assert from 'node:assert/strict';
import { chooseEgg, createHatchState, dnaFromGenomeSeed, recordHatchTap, seedFromTapPattern } from '../src/modules/hatchDna.js';

const state = createHatchState({ eggId: 'ember', name: 'Mochi' });
assert.equal(recordHatchTap(state, { x: 10.2, y: 20.8, dt: 101 }, { nonce: 42 }).remaining, 2);
assert.equal(recordHatchTap(state, { x: 30, y: 40, dt: 202 }, { nonce: 42 }).remaining, 1);
const hatched = recordHatchTap(state, { x: 50, y: 60, dt: 303 }, { nonce: 42 });
assert.equal(hatched.hatched, true); assert.match(hatched.dna, /^[0-9a-f]{16}$/);
const expectedSeed = seedFromTapPattern({ eggId: 'ember', name: 'Mochi', taps: state.taps, nonce: 42 });
assert.equal(hatched.genomeSeed, expectedSeed); assert.equal(hatched.dna, dnaFromGenomeSeed(expectedSeed, state));
assert.equal(recordHatchTap(state, { x: 1, y: 1, dt: 1 }).reason, 'already-hatched');
const fresh = createHatchState(); fresh.taps.push({ x: 1, y: 2, dt: 3 }); chooseEgg(fresh, 'tide'); assert.equal(fresh.taps.length, 0); assert.equal(fresh.eggId, 'tide');
console.log('hatch dna: ok');
