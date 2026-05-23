# RampageMASTER FaceMaster Clean v7

Clean-up and revision checkpoint. This build fixes the reported no-visible-city/no-visible-kaiju state after release.

## Rule

Revision only. No new taxonomy categories, no new gene engine, no haptics, no LiveOps overlay, no duplicate runtime families.

## Kept source stack

- Kaiju Facial Anatomy Core V8.1
- Expanded Taxonomy + Aging V5.4
- GigaPet v6 game runtime
- KAIJU_ANATOMY bridge table
- Existing city, destruction, upgrades, missions, admin console, and action buttons

## Fix

v7 adds a small runtime checkpoint that uses the existing renderer only:

- `startGame()` sets the selected kaiju id, exposes `window.G` for diagnostics, hides the egg screen, then calls `ensureCityRuntime()`.
- `continueSavedGame()` does the same.
- `ensureCityRuntime()` confirms canvas size/visibility, active kaiju id, city buildings, and draws one immediate city frame.
- the normal animation loop is requested if it has not already started.
- the anatomy-driven kaiju renderer is wrapped in a fallback to the original legacy kaiju renderer so a face/anatomy overlay failure cannot erase the kaiju.

## Debug

- `node --check` passed on both script blocks.
- Headless browser `set_content()` smoke test passed:
  - 3 eggs visible
  - egg click -> hatch result
  - UNLEASH -> egg overlay hidden
  - valid petType
  - canvas visible
  - buildings generated
  - kaiju rendered in screenshot
  - feed/play/heal/attack/breath/roar/stamp/arcade/train/theme actions run without page errors

## Local artifacts

- `rampagemaster_facemaster_clean_v7.html`
- `rampagemaster_facemaster_clean_v7_package.zip`
- `rampagemaster_facemaster_clean_v7_debug_report.txt`