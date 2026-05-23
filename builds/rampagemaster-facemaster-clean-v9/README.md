# RampageMASTER FaceMaster Clean v9

Clean-up and revision checkpoint. This build fixes the pixel clarity and scaling of the FaceMaster facial anatomy overlay.

## Rule

Revision only. No new taxonomy categories, no new gene engine, no haptics, no LiveOps overlay, no duplicate runtime families.

## Kept source stack

- Kaiju Facial Anatomy Core V8.1
- Expanded Taxonomy + Aging V5.4
- GigaPet v6 game runtime
- KAIJU_ANATOMY bridge table
- Existing city, destruction, upgrades, missions, admin console, and action buttons

## Facial anatomy fix

- Replaced the freeform v8 overlay with a standardized 64-unit pixel anatomy grid.
- Enlarged the in-game pixel head slightly for readability.
- Anchored the face overlay to the true current head box using `headX/headY/headW/headH` instead of hard-coded height math.
- Standardized facial distances:
  - browY = 23% of head height
  - eyeY = 36%
  - cheekY = 54%
  - mouthY = 70%
  - eye separation = 20% of head width
  - all values snap to one shared pixel unit
- The overlay still reads from `FACE.computePhenotype()` and `FACE.buildEyeRig()`.
- No `FACE.drawFace()` compositing remains in the game renderer.
- Added diagnostic packet: `window.__RM_FACE_GRID__`.

## SVG reference

A visual reference guide was generated locally: `facemaster_face_grid_v9.svg`.

## Debug

- `node --check` passed on both script blocks.
- Static regression checks passed.
- Headless Chromium `page.set_content()` smoke test passed: 3 eggs, hatch, UNLEASH, city visible, kaiju visible, v9 face grid generated, and no page errors.

## Local artifacts

- `rampagemaster_facemaster_clean_v9.html`
- `rampagemaster_facemaster_clean_v9_package.zip`
- `rampagemaster_facemaster_clean_v9_debug_report.txt`
- `facemaster_face_grid_v9.svg`