import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildCharacterEngine, characterEngineSummary, validateSelection } from '../src/modules/characterEngine.js';

const here = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.resolve(here, '../src/data/character-engine');
const read = (name) => JSON.parse(fs.readFileSync(path.join(dataDir, name), 'utf8'));

const categories = read('categories.json');
const f1 = read('feature-options-1.json');
const f2 = read('feature-options-2.json');
const f3 = read('feature-options-3.json');
const rules = read('compatibility-rules.json');
const palettes = read('color-palettes.json');
const animations = read('animation-meta.json');
const poses = read('poses.json');
const assets = read('asset-registry.json');
const validation = read('validation.json');

const engine = buildCharacterEngine({
  source: categories.source,
  categories: categories.categories,
  featureOptions: [...f1.featureOptions, ...f2.featureOptions, ...f3.featureOptions],
  compatibilityRules: rules.compatibilityRules,
  colorPalettes: palettes.colorPalettes,
  animationMeta: animations.animationMeta,
  poses: poses.poses,
  assetRegistry: assets.assetRegistry,
  validation: validation.validation
});

assert.deepEqual(characterEngineSummary(engine), {
  categories: 16,
  featureOptions: 31,
  compatibilityRules: 15,
  palettes: 23,
  animationClips: 31,
  poses: 8,
  assets: 20,
  sourceIssues: 55
});

assert.equal(engine.posesById.get('POSE_01').SpriteSheetRef, 'sprite_sheet_row1_col1');
assert.equal(engine.posesById.get('POSE_06').SpriteSheetRef, 'sprite_sheet_row2_col3');
assert.equal(engine.posesById.get('POSE_07').SpriteSheetRef, null, 'Designed poses must not masquerade as source-sheet cells');

const redTieWithWhiteCoat = validateSelection(engine, ['NECK_01', 'OUT_01']);
const redTieWithGrayCoat = validateSelection(engine, ['NECK_01', 'OUT_02']);
const redTieAlone = validateSelection(engine, ['NECK_01']);
assert.equal(redTieWithWhiteCoat.valid, true);
assert.equal(redTieWithGrayCoat.valid, true);
assert.equal(redTieAlone.valid, false);

const phoneAndWave = validateSelection(engine, ['PROP_01', 'PROP_04']);
assert.equal(phoneAndWave.valid, false);
assert.ok(phoneAndWave.conflicts.some((rule) => rule.RuleID === 'RUL_08'));

assert.equal(validation.validation.counts.missingAnimationClip, 54);
assert.equal(validation.validation.counts.missingPalette, 1);
assert.equal(validation.validation.issues.find((issue) => issue.type === 'missingPalette')?.value, 'PAL_JACKET_01');

console.log('character engine migrated data integrity: ok');
