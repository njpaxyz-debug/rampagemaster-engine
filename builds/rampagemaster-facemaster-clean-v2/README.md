# RampageMASTER FaceMaster Clean v2

This checkpoint corrects the broken splicing that repeatedly removed the egg selection.

## Source rule

Only already-uploaded code was salvaged and reorganized. No invented taxonomy categories, no new gene engine, and native feedback/haptics remains deferred.

## Canonical pieces kept

- `Kaiju Facial Anatomy Core V8.1` as the face/eye/expression engine.
- `Expanded Taxonomy + Aging V5.4` as taxonomy/stage/skin/motion engine.
- `GigaPet v6 main game engine` as the playable city-rampage runtime.
- `KAIJU_ANATOMY` as the canonical bridge table.
- Admin console, egg pools, hatch flow, city, destruction, upgrades, missions, and action buttons.

## Leftovers erased

- External Google font dependency.
- Duplicate overlay CSS/HTML/JS layer.
- Legacy `const KAIJU = [...]` table.
- Old rmx hook patch.
- Previous safe-boot patch leftovers.

## Permanent prevention

`initEggs()` is now self-resetting and restores the egg screen UI every time it populates eggs.

`RampageDebug.launchInvariant()` checks the launch state after load and restores eggs only when the game has no active pet and the visible egg tray is empty or hidden.

## Debug

- Node syntax check passed.
- Playwright smoke test passed: 3 eggs -> click egg -> hatch result -> start game -> game actions -> forced empty-tray repair -> 3 eggs restored.

## Local artifacts

- `rampagemaster_facemaster_clean_v2.html`
- `rampagemaster_facemaster_clean_v2_package.zip`