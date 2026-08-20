import assert from 'node:assert/strict';
import {
  buildCharacterEngine,
  characterEngineSummary,
  getOptionsForCategory,
  resolveOptionAnimation,
  resolvePalette,
  validateSelection
} from '../src/modules/characterEngine.js';

const engine = buildCharacterEngine({
  categories: [
    { CategoryID: 'CAT_EYE', MutuallyExclusive: true },
    { CategoryID: 'CAT_OUT', MutuallyExclusive: true },
    { CategoryID: 'CAT_PROP', MutuallyExclusive: false }
  ],
  featureOptions: [
    { OptionID: 'EYE_A', CategoryID: 'CAT_EYE', Status: 'ACTIVE', SortOrder: 1, AnimClip_Idle: 'missing_idle', DefaultPaletteID: 'PAL_MISSING' },
    { OptionID: 'EYE_B', CategoryID: 'CAT_EYE', Status: 'ACTIVE', SortOrder: 2, AnimClip_Idle: 'idle_stand' },
    { OptionID: 'TIE', CategoryID: 'CAT_PROP', Status: 'ACTIVE', AnimClip_Action: 'missing_action' },
    { OptionID: 'COAT_WHITE', CategoryID: 'CAT_OUT', Status: 'ACTIVE' },
    { OptionID: 'COAT_GRAY', CategoryID: 'CAT_OUT', Status: 'ACTIVE' },
    { OptionID: 'PHONE', CategoryID: 'CAT_PROP', Status: 'ACTIVE' },
    { OptionID: 'WAVE', CategoryID: 'CAT_PROP', Status: 'ACTIVE' }
  ],
  compatibilityRules: [
    { RuleID: 'R1', RuleType: 'REQUIRE', OptionID_A: 'TIE', OptionID_B: 'COAT_WHITE' },
    { RuleID: 'R2', RuleType: 'REQUIRE', OptionID_A: 'TIE', OptionID_B: 'COAT_GRAY' },
    { RuleID: 'R3', RuleType: 'CONFLICT', OptionID_A: 'PHONE', OptionID_B: 'WAVE' },
    { RuleID: 'R4', RuleType: 'SUGGEST', OptionID_A: 'PHONE', OptionID_B: 'COAT_WHITE' }
  ],
  colorPalettes: [
    { PaletteID: 'PAL_NONE', Zone: null }
  ],
  animationMeta: [
    { AnimClipID: 'idle_stand' },
    { AnimClipID: 'walk_cycle' },
    { AnimClipID: 'talk_mouth_open' },
    { AnimClipID: 'action_generic' }
  ],
  poses: [{ PoseID: 'POSE_01' }],
  assetRegistry: [{ AssetID: 'AST_1', LinkedOptionID: 'EYE_A' }],
  validation: { issueCount: 2 }
});

assert.equal(getOptionsForCategory(engine, 'CAT_EYE').length, 2);

const redTieGrayCoat = validateSelection(engine, ['TIE', 'COAT_GRAY']);
assert.equal(redTieGrayCoat.valid, true, 'REQUIRE rows for the same source option must be OR alternatives');

const missingCoat = validateSelection(engine, ['TIE']);
assert.equal(missingCoat.valid, false);
assert.deepEqual(missingCoat.missingRequirements[0].anyOf, ['COAT_WHITE', 'COAT_GRAY']);

const propConflict = validateSelection(engine, ['PHONE', 'WAVE']);
assert.equal(propConflict.valid, false);
assert.equal(propConflict.conflicts[0].RuleID, 'R3');

const eyeConflict = validateSelection(engine, ['EYE_A', 'EYE_B']);
assert.equal(eyeConflict.valid, false);
assert.equal(eyeConflict.exclusiveCategoryViolations.length, 1);

const animation = resolveOptionAnimation(engine, 'EYE_A', 'idle');
assert.deepEqual(animation, { requested: 'missing_idle', resolved: 'idle_stand', missing: true, fallback: true });

const palette = resolvePalette(engine, 'PAL_MISSING');
assert.equal(palette.missing, true);
assert.equal(palette.resolved, 'PAL_NONE');

assert.deepEqual(characterEngineSummary(engine), {
  categories: 3,
  featureOptions: 7,
  compatibilityRules: 4,
  palettes: 1,
  animationClips: 4,
  poses: 1,
  assets: 1,
  sourceIssues: 2
});

console.log('character engine adapter: ok');
