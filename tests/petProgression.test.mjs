import assert from 'node:assert/strict';
import { applyCareAction, applyInventoryItem, createPetProgressionState, getPetMood, getPetStage, grantXP } from '../src/modules/petProgression.js';

const pet = createPetProgressionState({ hatched: true, wallet: { bones: 0 }, inventory: { snack: 1, relic: 1 } });
let result = applyCareAction(pet, 'feed');
assert.equal(result.ok, true); assert.equal(pet.food, 100); assert.equal(pet.clean, 82); assert.equal(pet.bond, 2); assert.equal(pet.xp, 7);
pet.energy = 11; assert.equal(applyCareAction(pet, 'play').reason, 'low-energy');
pet.energy = 82; pet.food = 78; result = applyCareAction(pet, 'train'); assert.equal(result.bones, 22); assert.equal(pet.energy, 64); assert.equal(pet.food, 68);
pet.upgrades.lucky = true; result = applyCareAction(pet, 'explore'); assert.equal(result.bones, 42); assert.equal(pet.wallet.bones, 64);
result = applyCareAction(pet, 'rampage', { buildingsHit: 3 }); assert.equal(result.bones, 74);
applyInventoryItem(pet, 'snack'); assert.equal(pet.inventory.snack, 0);
pet.xp = 90; const levelResult = grantXP(pet, 20); assert.equal(levelResult.levels, 1); assert.equal(levelResult.bones, 25); assert.equal(pet.xp, 10);
pet.level = 6; assert.equal(getPetStage(pet), 'Juvenile'); pet.level = 12; assert.equal(getPetStage(pet, 'Giga Form'), 'Giga Form');
pet.health = 20; assert.equal(getPetMood(pet), 'hurt');
const egg = createPetProgressionState({ hatched: false }); assert.equal(applyCareAction(egg, 'feed').reason, 'hatch-required'); assert.equal(applyCareAction(egg, 'rest').ok, true);
console.log('pet progression: ok');
