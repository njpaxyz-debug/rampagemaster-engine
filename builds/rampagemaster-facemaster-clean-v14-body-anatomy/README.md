# RampageMASTER FaceMaster Clean v14 — Body Anatomy / Taxonomy Mathematics

Clean-up/revision checkpoint following the working v9-v13 method.

## Scope

Extend the same taxonomy details from the FaceMaster face layer into the outer body. Increase body detail, skeletal structure, and taxonomy visibility so each creature reads as a natural kaiju. Hatch creatures as babies and expose the evolution-track mathematics.

## Rule

No new taxonomy categories, no new gene engine, no boot patch, no LiveOps shell, no haptics, and no new gameplay renderer entry point.

## Source stack kept

- `KAIJU_ANATOMY` remains the root species/body bridge.
- Expanded Taxonomy + Aging V5.4 remains the DNA/taxonomy/stage/skin/source-math engine.
- FaceMaster V8.1 remains the facial anatomy/expression/eye/jaw/surface source.
- Existing city/destruction/runtime remains the gameplay host.

## Active draw path remains

```text
drawKaiju()
  -> drawKaijuBodyPreserved()
  -> drawGameplayFaceMasterLayer()
```

## Implemented

- `resolveKaijuBodyAnatomyV14(kt)` resolves body anatomy from existing V12 identity, V5.4 taxonomy, V5.4 genome fields, active skin package, species shape, and life stage.
- `rmDrawTaxonomySkeletonV14()` draws skeletal/rib/limb/nerve structure over the preserved city body using V5.4 SYSTEMS colors.
- Hatched kaiju now render as baby-stage bodies, not full-size adults.
- Body scale and FaceMaster head ratio both come from V5.4 AGE_STAGES.
- Growth/Admin readouts expose V14 body anatomy, stage math, skeleton counts, proportions, and age formula.

## Evolution math

```text
ageMinutes = 12 baby base + level×42 + care×8 + training×34 + destroyedBuildings×1.2 + arcadeBonus18 + evo×520
stage = highest ExpandedTaxonomyV54.AGE_STAGES row whose minAge/minStability are met
```

## Debug

- `node --check` passed on all script blocks.
- Headless Chromium `set_content()` smoke test passed.
- Sequence verified: egg -> hatch -> baby body -> city -> FaceMaster face -> taxonomy body skeleton -> action/growth stage change.

## Local artifacts generated in ChatGPT

- `rampagemaster_facemaster_clean_v14_body_anatomy.html`
- `rampagemaster_facemaster_clean_v14_body_anatomy_package.zip`
- `rampagemaster_facemaster_clean_v14_debug_report.txt`
- `rampagemaster_facemaster_clean_v14_debug_report.json`
- `v14_after_start.png`