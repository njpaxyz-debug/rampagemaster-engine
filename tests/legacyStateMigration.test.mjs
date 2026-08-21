import assert from 'node:assert/strict';
import { detectRampageStateFormat, migrateLegacyRampageState } from '../src/modules/legacyStateMigration.js';

const master = { version: 'MASTER_2026_05_09', egg: 'ember', hatchTaps: [{x:1,y:2,dt:3}], hatched: true, name: 'Mochi', level: 4, xp: 20, bond: 30, food: 60, joy: 70, energy: 80, clean: 90, health: 95, wallet: { bones: 123, opal: 2, quartz: 1, fossils: 0, oil: 0 }, inventory: { snack: 1 }, upgrades: { metro: true }, features: { seed: 42, dna: 'abcd', personality: 'curious', body: 'round' }, dna: 'abcd' };
assert.equal(detectRampageStateFormat(master), 'master20260509'); const m = migrateLegacyRampageState(master); assert.equal(m.ok, true); assert.equal(m.seed.wallet.bones, 123); assert.equal(m.seed.pet.food, 60); assert.equal(m.seed.genome.legacyFeatures.body, 'round'); assert.equal(m.seed.genome.selectedOptions.length, 0); assert.equal(m.warnings.length, 1);
const v12 = { version: '8.0', bones: 900, opal: 3, quartz: 2, petrol: 1, diamond: 0, petHP: 88, petMaxHP: 140, petType: 2, arcadeWins: 7, arcadeStreak: 2, campaign: { rank: 3, xp: 100, missionIndex: 6 }, district: 2, districtUnlocked: [true,true,true] };
const envelope = { version: '8.0', state: v12, customMonster: { name: 'Forge Beast', dna: { genus: 'Dracotherium', family: 'draco', personality: 'curious' } } };
assert.equal(detectRampageStateFormat(envelope), 'marketV12'); const v = migrateLegacyRampageState(envelope); assert.equal(v.ok, true); assert.equal(v.seed.economyProfile, 'marketV12'); assert.equal(v.seed.wallet.petrol, 1); assert.equal(v.seed.pet.name, 'Forge Beast'); assert.equal(v.seed.campaign.rank, 3); assert.equal(v.warnings.length, 2);
assert.equal(migrateLegacyRampageState('{bad').reason, 'invalid-json');
console.log('legacy state migration: ok');
