# RampageMASTER FaceMaster Clean v12 — Source-Governed Identity Randomizer

Clean-up/revision checkpoint following the working v9/v10/v11 debug method.

## Scope

Make the existing data govern the whole creature so randomization creates many coherent kaiju while preserving anatomy, palette, movement, and evolution logic.

## Rule

No new taxonomy categories, no new gene engine, no boot patch, no LiveOps shell, no haptics, and no new gameplay renderer entry point.

## Source stack kept

- `KAIJU_ANATOMY` remains the root species/body-shape bridge.
- Expanded Taxonomy + Aging V5.4 remains the DNA/taxonomy/stage/skin/phenotype/motion source.
- FaceMaster V8.1 remains the facial anatomy/expression/eye/jaw/surface source.
- GigaPet v6 city/destruction/runtime remains the gameplay host.

## Implemented

- `RampageIdentityV12` creates a complete identity packet for each egg.
- Each egg now previews a generated identity, not only a generic egg label.
- Identity packet includes seed, base species, generated name, DNA specimen, taxonomy, skin package, palette, stats, face plan, locomotion plan, and genetic markers.
- Hatch preserves the selected identity.
- Start game writes `G.identity` and `G.dna.identity`, then uses the identity DNA specimen and HP/stat outputs.
- Palette now comes from species colors + V5.4 skin package + seed identity palette.
- FaceMaster V8.1 face selection is constrained by taxonomy/body shape.
- Locomotion/idle motion is constrained by taxonomy/body shape.
- Growth tab now includes an Identity Packet readout.
- Admin panel now includes V12 identity inspector and reroll tools.

## Active draw path remains

```text
drawKaiju()
  -> drawKaijuBodyPreserved()
  -> drawGameplayFaceMasterLayer()
```

## Debug

- `node --check` passed on both script blocks.
- Headless Chromium `set_content()` smoke test passed.
- Verified egg -> hatch -> city -> identity -> DNA -> FaceMaster layer -> admin reroll palette.

## Local artifacts generated in ChatGPT

- `rampagemaster_facemaster_clean_v12_identity_randomizer.html`
- `rampagemaster_facemaster_clean_v12_identity_randomizer_package.zip`
- `rampagemaster_facemaster_clean_v12_debug_report.txt`
- `v12_after_start.png`