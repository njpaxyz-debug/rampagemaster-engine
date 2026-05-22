# RampageMASTER FaceMaster Clean v3

This checkpoint permanently corrects the disappearing egg-selection issue from the spliced FaceMaster builds.

## Corrected boot rule

The launch screen must always show clickable eggs. A saved game may be offered as an explicit `CONTINUE` button, but it may not auto-hide the egg tray.

## Changes

- Uses a fresh storage key: `rampagemaster_facemaster_clean_v3`.
- Clears old boot keys that interfered with new launches.
- Keeps egg selection visible on every launch.
- If a valid save exists, shows `CONTINUE <KAIJU>` below the egg tray instead of skipping eggs.
- Makes `initEggs()` self-resetting: title, subtitle, tray display, hatch result state, and selected egg state are reset before eggs are created.
- Keeps exactly one canonical runtime `KAIJU` table: `const KAIJU = Object.values(KAIJU_ANATOMY)`.
- Removes leftover duplicate overlay hooks.

## Checks

- `node --check` passed on the extracted script.
- Static regression assertions passed:
  - one runtime `KAIJU` table
  - no old `const KAIJU = [...]` collision
  - no `__rmxHooks`
  - no `rmLiveOpsShell`
  - new storage key present
  - self-resetting egg boot present

## Artifact generated in ChatGPT

- `rampagemaster_facemaster_clean_v3.html`
- `rampagemaster_facemaster_clean_v3_package.zip`

Native feedback/haptics remains deferred.