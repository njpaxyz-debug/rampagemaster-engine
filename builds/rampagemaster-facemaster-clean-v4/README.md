# RampageMASTER FaceMaster Clean v4

This checkpoint fixes the recurring missing-egg launch bug by making egg selection part of the initial HTML, not only a post-load JavaScript side effect.

## Root problem

Earlier builds relied on `window.load -> initEggs()` to create the egg buttons. In the artifact viewer, saved-state logic, boot timing, or a later runtime error could prevent `initEggs()` from running, leaving only the static title/subtitle text and no eggs.

## Permanent correction

- `#etray` now ships with three visible static egg buttons in the HTML.
- A small preboot script runs before the main game engine and wires those eggs immediately.
- The preboot script only mirrors the existing `EGG_POOLS` labels: Nature, Fire, Shadow.
- When the full game engine is ready, the preboot buttons hand off to the canonical existing `selectEgg()` / `initEggs()` flow.
- `initEggs()` remains canonical and can still redraw eggs, but egg visibility no longer depends on it firing first.
- Old v3 launch invariant was removed.
- Duplicate LiveOps / rmx leftovers remain erased.

## Source rule

Only existing uploaded game systems are retained:

- Kaiju Facial Anatomy Core V8.1
- Expanded Taxonomy + Aging V5.4
- GigaPet v6 game engine
- KAIJU_ANATOMY bridge table
- Admin console, city, destruction, upgrades, missions, and action buttons

No new taxonomy categories, no new gene engine, no native feedback/haptics.

## Debug checks

- `node --check` passed against both script blocks.
- Static regression confirms:
  - three egg buttons are present in raw HTML before the main script
  - `RampageEggBoot` preboot exists
  - `window.selectEgg` / `window.initEggs` are exposed for handoff
  - old v3 invariant removed
  - no `rmLiveOpsShell`, `rmx-*`, or `__rmxHooks` leftovers

## Local artifacts

- `rampagemaster_facemaster_clean_v4.html`
- `rampagemaster_facemaster_clean_v4_package.zip`