# RampageMASTER FaceMaster Clean v11

Clean-up and revision checkpoint. This build debugs redundancies from the spliced FaceMaster builds and polishes UX/UI without adding new systems.

## Rule

Revision only. No new taxonomy categories, no new gene engine, no haptics, no LiveOps overlay, no duplicate runtime families.

## Kept source stack

- Kaiju Facial Anatomy Core V8.1
- Expanded Taxonomy + Aging V5.4
- GigaPet v6 game runtime
- KAIJU_ANATOMY bridge table
- Existing city, destruction, upgrades, missions, admin console, and action buttons

## Redundancy cleanup

- Removed the old repeating post-main egg-contract timers.
- Updated stale v4/v5/v6/v7/v10 labels to v11.
- Updated storage key to `rampagemaster_facemaster_clean_v11` and treats v1-v10 keys as legacy boot interference.
- Removed raw leftover hook names from the HTML source while retaining dynamic diagnostic checks.
- Kept exactly two script blocks: wire-only static egg preboot plus canonical runtime.
- Added `RampageDebug.redundancyReport()` and callable-only `RampageDebug.repairLaunchShell()`.

## UX/UI polish

- Added system font fallbacks; no external font dependency.
- Standardized panel radii, shadows, touch targets, bottom dock height, compact viewport behavior, and reduced-motion behavior.
- Bottom panels now cap at `min(42vh, 430px)` and scroll internally.
- Ability rail compresses/repositions on smaller or shorter screens.
- Tab buttons, cards, arcade runs, and growth panels now use consistent active/hover styling.

## Debug

- `node --check` passed on both script blocks.
- Static duplicate-ID scan returned zero duplicate IDs.
- Static leftover scan passed: no raw `rmLiveOpsShell`, no raw `__rmxHooks`, no `clean-v10`, no repeating egg-contract timers.
- Headless Chromium `page.set_content()` smoke test passed: eggs -> hatch -> UNLEASH -> city/kaiju render -> actions execute -> redundancy report clean.

## Local artifacts

- `rampagemaster_facemaster_clean_v11.html`
- `rampagemaster_facemaster_clean_v11_package.zip`
- `rampagemaster_facemaster_clean_v11_debug_report.txt`
- `v11_after_start.png`