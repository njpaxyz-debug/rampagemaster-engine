# RampageMASTER Unified Best v3

This folder is reserved for the modular v3 build package created from the RampageMASTER consolidation pass.

The local package generated in ChatGPT includes:

- `rampagemaster_unified_best_v3_single.html` — one-click bundled playable HTML.
- `rampagemaster_v3_modular/index.html` — modular shell.
- `styles.css` — shared responsive design system.
- `src/app.bundle.js` — current runtime bundle.
- `src/canon-data.js` — canon checklist/data contract.
- `src/dna-engine.js` — DNA/taxonomy contract.
- `src/city-engine.js` — destruction/citylife contract.
- `src/economy-engine.js` — Bank/Mall economy contract.
- `src/arcade-engine.js` — microgame lifecycle contract.
- `src/ui-renderer.js` — UI/playfield contract.

## v3 upgrades

- Reframed the city viewport so the canvas no longer fights the sheet/dock layout.
- Upgraded destruction logic with building HP, cracks, rubble, smoke, collapse states, delayed regeneration, and collapse rewards.
- Upgraded citizen visibility with outlined silhouettes, panic rings, flee forces, and feeding collision.
- Extended taxonomy/DNA from a light skeleton to a 20-gene matrix with taxonomy scoring, kingdom/phylum/genus signatures, phenotype outputs, aging marks, eye-lock, and mood values.
- Kept native feedback/haptics deferred by design.

The downloadable package remains the source of truth for this v3 checkpoint unless/until all files are pushed into this repository.