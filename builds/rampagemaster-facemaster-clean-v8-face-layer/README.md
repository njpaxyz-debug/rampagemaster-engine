# RampageMASTER FaceMaster Clean v8 — Face Layer

Clean-path revision following the requested scope exactly: the rich FaceMaster V8.1 renderer becomes the gameplay face layer inside the city game. This is not a new screen, not an overlay panel, and not a boot patch.

## Required path implemented

| Step | Result |
|---|---|
| Locate `drawKaiju()` | Kept `drawKaiju()` as the single gameplay kaiju entry point. |
| Preserve old body shapes | Restored/preserved the old body dispatcher as `drawKaijuBodyPreserved()` using existing `drawRex2`, `drawWolf2`, `drawBear2`, `drawGolem2`, `drawKraken2`, `drawWing2`, and `drawCyborg2`. |
| Add `buildGameplayFaceSelection(kt, G, frame)` | Added adapter using existing `kt.faceProfile` plus existing FaceMaster V8.1 expression/idle vocabulary. |
| Add `drawFaceMasterSprite()` | Added offscreen transparent V8.1 face rendering and canvas compositing. |
| Add head anchors | Added anchors for rex, wolf, kraken, golem, wing, cyborg, and bear. |
| Disable/cover old face area | Added `coverLegacyFaceArea()` to cover only the low-res old face before drawing the V8.1 face. |
| Run smoke sequence | Smoke sequence passed in headless browser set_content test. |

## Clean-up rule

No new taxonomy categories, no new gene engine, no new LiveOps layer, no haptics, and no new boot patch.

## Technical note

The existing `KaijuFaceAnatomyCoreV81.drawFace()` was minimally extended with `opts.transparent` so it can render into an offscreen canvas without its standalone lab background/guide box. The gameplay renderer then composites that face sprite onto the old body silhouette.

## Local artifacts

- `rampagemaster_facemaster_clean_v8_face_layer.html`
- `rampagemaster_facemaster_clean_v8_face_layer_package.zip`
- `rampagemaster_facemaster_clean_v8_debug_report.txt`
- `v8_after_start.png`
- `v8_attack_face.png`