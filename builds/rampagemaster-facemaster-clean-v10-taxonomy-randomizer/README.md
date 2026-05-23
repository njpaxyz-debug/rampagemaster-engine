# RampageMASTER FaceMaster Clean v10 — Taxonomy Randomizer / Skin Color Bridge

Clean-up/revision checkpoint following the working v9 debug method.

## Scope

Continue the phased upgrade by connecting the randomizer, admin access, visible DNA taxonomy, skin texture, and evolution stages.

## Rule

No new taxonomy categories, no new gene engine, no boot patch, no LiveOps shell, no haptics, and no new gameplay renderer entry point.

## Kept source stack

- FaceMaster V8.1 renderer remains the gameplay face layer.
- Expanded Taxonomy + Aging V5.4 remains the DNA/taxonomy/stage/skin source.
- KAIJU_ANATOMY remains the species bridge table.
- GigaPet v6 city/destruction/runtime remains the gameplay host.

## Implemented

- `ensureKaijuDnaState(kt, reason)` keeps an active V5.4 DNA specimen for the selected kaiju.
- `syncDnaCultureFromGameplay(reason, minutes)` lets feed, play, heal, train, arcade, destruction, city themes, and level-ups visibly affect DNA age/culture/stage.
- `computeKaijuVisualPalette(kt, G)` marries the original species colors with the active V5.4 skin package and evolution level.
- `drawKaijuBodyPreserved()` now uses the computed DNA/skin palette.
- `buildGameplayFaceSelection()` now reads the active DNA phenotype and maps it into existing V8.1 variables/surfaces.
- `drawFaceMasterSprite()` lightly tints the V8.1 face with the active color/skin palette.
- Growth tab now shows DNA taxonomy, age stage, skin package, swatches, evolution path, motion track, visible tags, and gene bars.
- Admin now includes Random Kaiju, Reroll DNA, Age +240m, Age +900m, skin package buttons, and clear skin override.

## Debug

- `node --check` passed on both script blocks.
- Headless Chromium `set_content()` smoke test passed through egg -> hatch -> city -> face layer -> DNA readout -> admin randomizer tools.

## Artifacts generated in ChatGPT

- `rampagemaster_facemaster_clean_v10_taxonomy_randomizer.html`
- `rampagemaster_facemaster_clean_v10_package.zip`
- `rampagemaster_facemaster_clean_v10_debug_report.txt`
- `v10_after_start.png`