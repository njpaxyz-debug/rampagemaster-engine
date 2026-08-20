# Drive asset + animation migration checkpoint

## What moved into the modular engine

1. **Reptile Scientist six-pose sheet** — production-scaled WebP derived from the Drive PNG. The source is a real 3×2 pose sheet: idle, walk, think, phone, wave, alternate stand.
2. **Mythic Four archetype composite** — retained as a visual/reference asset only. It is not treated as a regular animation atlas.
3. **Pose semantics** from `CharacterEngine_FeatureMap` — used to name and route the six real poses.
4. **Procedural pose interpolation** — bob/sway/scale/jitter layered over the six real poses so the engine can animate without inventing nonexistent source frames.
5. **Direct city deployment adapter** — distilled from `RampageMaster_DEPLOYMENT_DEFINITIVE_v12.html`. The useful contract is: wait for `RM_CITY_INSTALL`, call it directly, require `ready=true`, and surface explicit success/error state.

## What was intentionally not migrated

- Conceptual workbook frame ranges as if they were real sheet coordinates. The supplied source sheet only contains six poses.
- Vigil/Horde assets or unrelated game systems.
- Monolithic page-global deployment state from v12 when the same behavior can be expressed as an isolated module.
- The Mythic Four composite as an automatic frame grid.

## Integration contract

`src/animation/index.js` remains the stable animation entrypoint. The v7.6.3 biomechanical engine continues to own locomotion/state timing; `driveSpriteSheetAnimator.js` is a visual pose lane that can render Drive-backed art from those states.

The current main renderer is not replaced wholesale. Use the Drive sprite lane as an alternate skin/render target until smoke tests confirm parity. This preserves the existing high-resolution procedural kaiju fallback and single-file export strategy.
