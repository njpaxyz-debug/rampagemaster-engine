# RampageMASTER FaceMaster Clean v13 — Outer Body Taxonomy / Anatomy Continuity

Clean-up/revision checkpoint following the working v9-v12 debug method.

## Scope

Improve outer kaiju body shape and taxonomy continuity while keeping the existing identity/DNA/randomizer pipeline.

## Rule

No new taxonomy categories, no new gene engine, no boot patch, no LiveOps shell, no haptics, and no new gameplay renderer entry point.

## Source stack kept

- `KAIJU_ANATOMY` remains the root species/body bridge.
- Expanded Taxonomy + Aging V5.4 remains the DNA/taxonomy/stage/skin source.
- FaceMaster V8.1 remains the facial anatomy/expression/eye/jaw/surface source.
- GigaPet v6 city/destruction/runtime remains the gameplay host.

## Implemented

- `resolveKaijuOuterBodyPlan(kt)` resolves visible body silhouette from existing species shape, V12 identity taxonomy, V5.4 skin package, DNA genome values, stage scale, and locomotion plan.
- `rmDrawTaxonomyOuterBack()` draws taxonomy-governed back silhouette features.
- `rmDrawTaxonomyOuterFront()` draws taxonomy-governed front silhouette features.
- The original preserved body renderer is still used as the core body.
- Outer silhouette now reacts to existing source data: winged, cephalopod, mineral, arthropod, stalker, brute, saurian render classes.
- Those render classes are not new taxonomy categories; they are visual constraints derived from existing shape/phylum/skin data.
- Head anchors are adjusted so the FaceMaster V8.1 face follows the body plan.
- Growth and Admin views now report the resolved outer body plan.

## Active draw path remains

```text
drawKaiju()
  -> drawKaijuBodyPreserved()
  -> drawGameplayFaceMasterLayer()
```

## Debug

- `node --check` passed on all script blocks.
- Static regression checks passed.
- Live browser screenshot was not run because the Playwright Chromium binary is not installed in this execution environment.

## Local artifacts generated in ChatGPT

- `rampagemaster_facemaster_clean_v13_body_taxonomy.html`
- `rampagemaster_facemaster_clean_v13_body_taxonomy_package.zip`
- `rampagemaster_facemaster_clean_v13_debug_report.txt`