# RampageMASTER FaceMaster Clean v12

Phase 1 cleanup pass: Debug Contracts + GameRoot Stabilization.

## Rule

Revision only. No new taxonomy categories, no new gene engine, no haptics, no LiveOps/rmx overlay, no duplicate runtime families.

## Purpose

This checkpoint implements Phase 1 from `docs/rampagemaster-cleanup-blueprint-v1.md`:

- add debug contracts before more feature work;
- add a GameRoot wrapper around the existing boot flow;
- keep the current HTML/JS runtime intact;
- prevent recurring egg/release/city/face/viewport bugs from returning silently.

## Kept source stack

- Kaiju Facial Anatomy Core V8.1
- Expanded Taxonomy + Aging V5.4
- GigaPet v6 game runtime
- KAIJU_ANATOMY bridge table
- existing city, destruction, upgrades, missions, admin console, action buttons

## Added architecture wrapper

`Rampage.GameRoot` / `window.GameRoot` now owns the launch sequence without moving the existing systems:

- `bootLaunch()`
- `chooseEgg()`
- `hatch()`
- `unleash()`
- `continue()`
- `ensureCity()`
- `firstFrame()`
- `assertAll()`

The old raw window-load boot body now delegates to `GameRoot.bootLaunch()`.

## Added debug contracts

`RampageDebug.assertAll()` runs these callable diagnostics:

- `assertEggContract()`
- `assertReleaseContract()`
- `assertCityRenderContract()`
- `assertFaceContract()`
- `assertViewportContract()`
- `assertSequenceContract()`
- `assertNoLeftovers()`

These are diagnostics, not boot timers. They do not fight runtime state.

## Cleanup

- Removed passive post-main launch repair microtask.
- Updated storage key to `rampagemaster_facemaster_clean_v12`.
- Treats v1-v11 storage keys as legacy boot interference.
- Preserves wire-only static egg preboot.
- Added sequence log at `window.__RM_SEQUENCE_LOG__`.

## Debug

- `node --check` passed on both script blocks.
- Static checks passed.
- Headless Chromium `page.set_content()` smoke test passed from egg to city.
- `RampageDebug.assertAll('smoke')` returned ok for all contracts.

## Local artifacts generated

- `rampagemaster_facemaster_clean_v12.html`
- `rampagemaster_facemaster_clean_v12_package.zip`
- `rampagemaster_facemaster_clean_v12_debug_report.txt`
- `v12_after_start.png`