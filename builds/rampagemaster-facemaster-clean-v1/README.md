# RampageMASTER FaceMaster Clean v1

This checkpoint cleans the spliced `3553311f0_gigakaiju_facemaster.html` build into a stable playable single-file runtime.

## Source rule

Only existing uploaded code was salvaged and reorganized. No new kaiju taxonomy categories, no new invented gene engine, and native feedback/haptics remains deferred.

## Salvaged pieces

- `Kaiju Facial Anatomy Core V8.1` retained as the face/eye/expression engine.
- `Expanded Taxonomy + Aging V5.4` retained as the taxonomy, stage, skin, motion, and culture engine.
- `GigaPet v6 main game engine` retained as the playable city-rampage runtime.
- `KAIJU_ANATOMY` retained as the bridge table between game monsters, anatomy profiles, phylum labels, idle motion, and face profiles.
- Admin console retained.

## Removed / divided

- Removed the duplicate LiveOps/Mission Shell overlay module because it created a fourth UI layer over the already-existing HUD, missions, status, and upgrades panels.
- Removed the unused LiveOps hook patch.
- Resolved the fatal duplicate declaration: old `const KAIJU = [...]` became `const LEGACY_KAIJU = [...]`; enriched runtime now uses `const KAIJU = Object.values(KAIJU_ANATOMY)` exactly once.

## Repairs

- Added canon aliases after source modules load:
  - `FACE = globalThis.KaijuFaceAnatomyCoreV81`
  - `TAX = globalThis.ExpandedTaxonomyV54`
- Added a small boot checkpoint that calls the existing `initEggs()` only if the egg screen is visible and the egg tray is empty.
- Preserved existing egg pools, `selectEgg`, `hatchEgg`, `startGame`, city generation, destruction, upgrades, missions, and renderer behavior.

## Debug result

- `node --check` passed against the extracted script.
- Runtime smoke test passed through: load -> 3 eggs -> egg click -> hatch result -> start game -> render frames -> action buttons.

## Local artifact

The working artifact generated in ChatGPT is:

- `rampagemaster_facemaster_clean_v1.html`
- `rampagemaster_facemaster_clean_v1_package.zip`
