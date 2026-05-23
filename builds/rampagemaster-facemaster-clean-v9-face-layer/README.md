# RampageMASTER FaceMaster Clean v9 — Kaiju Visibility Fix

Clean-path revision. This fixes the v8 bug where no kaiju appeared after hatching/release.

## Cause

v8 attempted to preserve the old body renderer by saving a reference to `drawKaiju`. Because JavaScript function declarations are hoisted, that saved reference could resolve to the later v8 `drawKaiju` wrapper instead of the original body renderer.

Result: `drawKaiju()` called itself recursively and hit `Maximum call stack size exceeded`, so the kaiju/city frame could not complete.

## Fix

No new systems were added.

- No new taxonomy categories.
- No new gene engine.
- No boot patch.
- No LiveOps overlay.
- No haptics.

The fix replaces the fragile captured renderer reference with an explicit preserved body renderer:

```js
function drawKaijuBodyPreserved(cx, gy, kt, frame, evo, atkAnim) { ... }
```

`drawKaiju()` remains the only gameplay kaiju entry point:

```text
drawKaiju()
  -> drawKaijuBodyPreserved()
  -> drawGameplayFaceMasterLayer()
```

## Verification

- `node --check` passed on both script blocks.
- Headless browser `set_content()` smoke test passed:
  - 3 eggs visible.
  - egg click produces hatch result.
  - UNLEASH hides egg screen.
  - valid `G.petType` exists.
  - canvas visible at 1280 x 900.
  - `drawKaiju`, `drawKaijuBodyPreserved`, and `drawGameplayFaceMasterLayer` exist.
  - `G.sequence.faceLayer` becomes true after render.
  - no `Maximum call stack` errors.
  - no page errors.
  - screenshot confirms visible city, kaiju body, and V8.1 FaceMaster face layer.

## Local artifacts

- `rampagemaster_facemaster_clean_v9_face_layer.html`
- `rampagemaster_facemaster_clean_v9_face_layer_package.zip`
- `rampagemaster_facemaster_clean_v9_debug_report.txt`
- `v9_after_start.png`
- `v9_attack_face.png`