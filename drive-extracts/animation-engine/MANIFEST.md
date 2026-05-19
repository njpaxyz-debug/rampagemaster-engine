# RampageMaster Animation Engine — Drive Extraction Manifest

Generated: 2026-05-18
Repository: `njpaxyz-debug/rampagemaster-engine`
Target branch: `master`

## Primary extracted file

- `rampagemaster_motion_biomech_engine_v7_6_3.extracted.js`

This is a clean JavaScript extraction of the animation-engine layer from the Drive checkpoint below.

## Drive source selected

### `rampagemaster_biomech_generator_v7_6_3.html`

- Drive file id: `1FqjDWhYgcEurfq9r4-Nxp5JJRSTK-3h5`
- Modified: `2026-05-10T13:49:44.000Z`
- Reason selected: this was the only Drive code checkpoint that directly matched the animation/motion/biomechanics searches and contains the consolidated engine blocks:
  - `RampageMaster v7.5 Motion Sandbox Reintegration`
  - `RampageMaster v7.6 Biomechanical Locomotion Patch`
  - `RampageMaster v7.6.3 — Restart / Reset / Kaiju Generator Activation`

## Other Drive RampageMaster files identified but not duplicated here

These files were found during the Drive scan, but were treated as broader gameplay/UI/archive checkpoints rather than animation-engine source files:

- `rampagemaster_master_v1.html`
  - Master playable single-file prototype shell.
  - Broad systems: Nest, Bank, Mall, Arcade, city simulation, save/export, DNA panel.

- `***rampagemaster5926.html`
  - Earlier HTML checkpoint.
  - Not selected because motion-specific searches pointed to v7.6.3 as the consolidated motion source.

- `rampagemaster_admin_proportions_v7_1.html`
  - Admin/proportions and citizen/world display checkpoint.
  - Relevant to scale/proportion but not the final animation engine source.

- `rampagemaster_unified_architecture_gameplay_v6_1.html`
  - Architecture/gameplay integration checkpoint.
  - Not a dedicated animation-engine file.

- `rampagemaster_skyline_intelligence_v5.html`
  - Skyline/environment intelligence checkpoint.
  - Useful for scene context but outside the extracted locomotion module.

- `rampagemaster_architecture_skins_v4.html`
  - Architecture skin system checkpoint.
  - Not animation-engine source.

- `rampagemaster_ux_theme_v3.html`
  - UX/theme checkpoint.
  - Not animation-engine source.

- `RAMPAGEMASTER_MASTER_INDEX.md`
  - Audit/index document.
  - Confirms the best master direction and identifies older v6/v7 files as archive/checkpoint lanes.

- `RAMPAGEMASTER SUPERIOR COMPONENTS`
  - Canon/component planning document.
  - Relevant to future integration, but not a code file.

- `Prioritized Scaffold for RampageMaster Performance and Gameplay Engine Optimization`
  - Planning/scaffold file.
  - Relevant to optimization roadmap, but not a code file.

## Extraction boundaries

Included:

- Species motion signatures.
- Stage definitions.
- Motion loop library.
- Anatomy defaults.
- Physics defaults.
- Epigenetic pressure defaults.
- Biomechanical taxonomy library.
- Species-to-phylum mapping.
- Route graph construction.
- Nearest-node lookup.
- BFS pathing.
- State-to-surface target selection.
- Weighted motion-state selection.
- Graph-path selection.
- Per-frame biomechanical motion update.
- Generator seed/reset record semantics.

Excluded from the extracted module:

- HTML shell.
- CSS.
- Canvas drawing routines.
- Mall, Bank, Arcade, economy, and inventory logic.
- Citizen/city simulation.
- Save modal UI.
- Debug/admin UI markup.
- Theme/architecture rendering systems.

## Integration note

The extracted module is intentionally engine-first and UI-agnostic. It should be imported by the RampageMaster gameplay layer, which can provide:

```js
const graph = buildRouteGraph({ worldSpan, buildings });
const result = updateMotion({
  dt,
  motionLab,
  motion,
  graph,
  petX,
  energy,
  level
});
```

The calling game layer remains responsible for rendering, hit detection, sound/haptics, economy changes, and persistence.
