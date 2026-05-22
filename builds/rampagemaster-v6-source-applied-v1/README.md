# RampageMASTER v6 Source-Applied Visual Gameplay Build

This checkpoint applies the separate existing modules into the current `gigapet_v6_best one yet.html` game.

## Source rule

Only already-uploaded/existing code is integrated. No invented taxonomy categories, no invented gene expansion, and native feedback/haptics remains deferred.

## Sources applied

- `gigapet_v6_best one yet.html`: current playable game shell, HUD, canvas renderer, city/destruction loop, care, upgrades, specials, missions, minimap, save/load.
- `rampagemaster_source_integrated_v1/src/dna-source-integrated.js`: source-integrated DNA/taxonomy/facial/idle adapter based on uploaded source files.
- `Kaiju Facial Anatomy CoreV8.1.html`: facial phenotype, eye rig, expression and anatomy API already embedded through the source-integrated module.
- `facial_anatomy_engine_v3.jsx`: projection/tint/smootherstep helper concepts adapted for overlay depth polish.

## Gameplay upgrades

- Creates a DNA specimen at hatch/load.
- Connects feed, play, heal, attack, city drift, breath, roar, stamp, upgrades, and level-up events to the existing V54 culture/evolution functions.
- Draws the existing v6 kaiju body first, then overlays source-derived DNA anatomy details: glow, plates, crystals/fungal/flora marks, wings, tendrils, arthropod legs, serpentine coils, horns, V8 eye logic, and v3-style depth glints.
- HUD now displays kingdom, phylum, stage, base form, and idle/motion loop from the source-integrated packet.

## Local artifacts generated

- `rampagemaster_v6_source_applied.html`
- `rampagemaster_v6_source_applied_package.zip`

## Debug result

The generated single HTML script passed `node --check`.