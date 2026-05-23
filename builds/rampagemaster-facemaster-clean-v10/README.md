# RampageMASTER FaceMaster Clean v10

Clean-up and revision checkpoint. This build fixes the remaining FaceMaster anatomy issue: the face was visible but static/floating and not connected to the body the way the original facial engine intended.

## Rule

Revision only. No new taxonomy categories, no new gene engine, no haptics, no LiveOps overlay, no duplicate runtime families.

## Kept source stack

- Kaiju Facial Anatomy Core V8.1
- Expanded Taxonomy + Aging V5.4
- GigaPet v6 game runtime
- KAIJU_ANATOMY bridge table
- Existing city, destruction, upgrades, missions, admin console, and action buttons

## Fix

- `drawFaceOverlay()` no longer receives a guessed center/size.
- The body renderer now passes the actual pixel head box: `headX`, `headY`, `headW`, `headH` projected into world coordinates.
- The face overlay draws only inside that exact box.
- Interactive gaze was restored: existing pointer tracking controls iris/pupil offset; idle gaze animates when no pointer is present.
- V8.1 source data remains active: `FACE.computePhenotype()` supplies expression/surface/glow/teeth; `FACE.buildEyeRig()` supplies legal eye layout.
- Details are SVG-like and snapped: skull planes, cheek structure, brows, eyes, iris/pupils, mouth/teeth, horns/crests, surface marks, glow.
- `window.__RM_FACE_GRID__` now reports `version: clean-v10`, exact head box, eye count, and gaze mode.

## Debug

- `node --check` passed on both script blocks.
- Headless Chromium `page.set_content()` smoke test passed: 3 eggs, hatch, UNLEASH, visible city, visible kaiju, clean-v10 face grid generated, pointer gaze recorded, and no page errors.

## Local artifacts

- `rampagemaster_facemaster_clean_v10.html`
- `rampagemaster_facemaster_clean_v10_package.zip`
- `rampagemaster_facemaster_clean_v10_debug_report.txt`
- `facemaster_face_grid_v10.svg`