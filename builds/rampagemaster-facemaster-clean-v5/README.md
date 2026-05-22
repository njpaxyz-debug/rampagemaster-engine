# RampageMASTER FaceMaster Clean v5

Clean-up and revision checkpoint.

This build fixes the v4 problem where the kaiju did not release to the city after egg hatch. The cause was the static egg boot layer forcing the launch overlay visible even after the game started.

## Fix

- Replaced the aggressive preboot with a wire-only egg preboot.
- Removed timed boot calls.
- Removed the visibility-forcing launch helper.
- Preboot now only wires the static HTML egg buttons before the main engine loads.
- `initEggs()` remains the canonical egg generator.
- `startGame()` and `continueSavedGame()` now use `hideEggScreen()`.
- `hideEggScreen()` clears old overlay inline styles before hiding the launch screen.
- `resetEggSelectionUI()` uses `showEggScreen()` only during launch reset.

## Leftovers removed

- No boot method in RampageEggBoot.
- No boot timers.
- No duplicate LiveOps shell.
- No rmx hooks.
- No duplicate runtime KAIJU table collision.

## Checks

- Extracted both script blocks from the HTML.
- `node --check` passed on both scripts.
- Static regression confirmed that raw HTML still contains three egg buttons, the preboot is wire-only, and game start marks runtime as started before hiding the launch screen.

## Local artifacts

- `rampagemaster_facemaster_clean_v5.html`
- `rampagemaster_facemaster_clean_v5_package.zip`

No new taxonomy categories, gene engines, systems, or haptics were added.