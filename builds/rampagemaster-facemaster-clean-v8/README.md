# RampageMASTER FaceMaster Clean v8

Clean-up and revision checkpoint. This build addresses the visible-city state from v7 while rescaling and repairing the FaceMaster anatomy overlay.

## Rule

Revision only. No new taxonomy categories, no new gene engine, no haptics, no LiveOps overlay, no duplicate runtime families.

## Kept source stack

- Kaiju Facial Anatomy Core V8.1
- Expanded Taxonomy + Aging V5.4
- GigaPet v6 game runtime
- KAIJU_ANATOMY bridge table
- Existing city, destruction, upgrades, missions, admin console, and action buttons

## Issues identified

1. The v7 face overlay used `FACE.drawFace()`, which draws its own dark square background and border. That pasted a FaceMaster preview window onto the kaiju instead of drawing anatomy onto the kaiju.
2. The face overlay size was too large: `base * 2.0`.
3. The face anchor was wrong: it used the head top minus half-height, placing the overlay above the actual pixel head.
4. There were not enough active-id diagnostics while debugging release/render states.

## Fix

- `drawFaceOverlay()` now uses `FACE.computePhenotype()` and `FACE.buildEyeRig()` as data only.
- No full FaceMaster canvas is drawn onto the game canvas.
- Facial detail is transparent and composited directly onto the existing pixel head.
- Face overlay scale is reduced to `base * 0.92`.
- Head anchor is corrected to the true pixel-head center.
- Existing V8.1 expression, eye-rig, skin/surface, rage, hunger, and happiness logic still drive the detail pass.
- Added lightweight diagnostics: `window.__RM_ACTIVE_KAIJU_ID__` and `window.__RM_NEAR_BUILDING_COUNT__`.

## Debug

- `node --check` passed on both script blocks.
- Headless browser `set_content()` smoke test passed: 3 eggs, hatch, UNLEASH, visible city, visible kaiju, no page errors.

## Local artifacts

- `rampagemaster_facemaster_clean_v8.html`
- `rampagemaster_facemaster_clean_v8_package.zip`
- `rampagemaster_facemaster_clean_v8_debug_report.txt`