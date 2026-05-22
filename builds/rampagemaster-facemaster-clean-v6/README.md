# RampageMASTER FaceMaster Clean v6

Clean-up and revision checkpoint. This build connects the full game sequence without adding new taxonomy systems or new code families.

## Sequence connected

1. **Egg selection** — raw HTML contains three clickable egg buttons; the preboot is wire-only and does not force the launch overlay visible.
2. **Kaiju randomization** — egg pools roll an existing kaiju species; hatch stores the actual kaiju object for release.
3. **City release** — `startGame()` now stores `G.petType = kt.id`, generates the city, sets runtime started, and hides the egg screen.
4. **Cityscape destruction** — existing attack/destruction code remains canonical; a wrapper only updates the sequence checklist after destruction.
5. **City customization** — existing `TZ_THEMES` city packages are exposed in a CITY tab and rebuild the city with the selected existing palette/style.
6. **Mini games** — ARCADE tab uses existing actions as micro-runs: smash, care, roar/stamp trial. Rewards feed existing currency, XP, missions, and growth.
7. **Kaiju growth** — GROWTH tab reads existing level/evo/stats/taxonomy and adds a training action tied to existing currency/XP.

## Important fix

The previous flow could hatch visually but not release correctly because the selected value could still behave like an egg slot/index. v6 makes the hatch result explicit:

- `pendingHatchKaiju = kt`
- `selEgg = id`
- `G.petType = kt.id`

## Leftovers kept out

- No duplicate LiveOps shell.
- No `rmx` hook layer.
- No duplicate runtime `KAIJU` table.
- No invented v3/v4 DNA expansion.
- No native feedback/haptics.

## Checks

- `node --check` passed on both script blocks.
- Static regression checks passed for eggs, storage key, panels, active KAIJU table, and startGame release flow.

## Local artifacts

- `rampagemaster_facemaster_clean_v6.html`
- `rampagemaster_facemaster_clean_v6_package.zip`
- `rampagemaster_facemaster_clean_v6_debug_report.txt`