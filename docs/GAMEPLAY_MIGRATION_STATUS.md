# RampageMaster gameplay migration status

Branch: `codex/pilot-import-2026-08-20`

This document is the source-fidelity checkpoint for gameplay migration. It prevents older monolithic builds from being reintroduced wholesale and records the intentional adaptations required by the modular high-resolution renderer.

## Canonical source lanes

| Runtime lane | Source | Active adapter |
| --- | --- | --- |
| Hatch / care / pet growth / Master shop | `rampagemaster_master_v1.html` | `src/modules/gameplayCore.js`, `petProgression.js`, `hatchDna.js`, `economyProgression.js` |
| Character identity | `CharacterEngine_FeatureMap (1).xlsx` | `src/modules/characterEngine.js` |
| Market arcade / campaign | `RampageMaster_DEPLOYMENT_DEFINITIVE_v12.html` | `arcadeProgression.js`, `campaignProgression.js` |
| Response / boss encounter behavior | v12 embedded city RM3, with RM8 safety override | `campaignEncounterEntities.js`, `campaignEncounterBridge.js` |
| Live citizen feeding | Master consume-care + v12 RM3 FEED CHAIN | `citizenGameplayBridge.js` |
| City collapse / boss completion | v12 RM3 campaign semantics + high-res city | `cityGameplayBridge.js` |
| Drive pose rendering | Reptile Scientist six-pose sheet | `driveSpriteSheetAnimator.js`, `visualHighRes.js` |

## Five campaign mission contracts

All five authored mission types are now driven by real runtime events.

1. **DEMOLITION RUN** — a real high-res building collapse advances progress. A normal collapse adds +13 threat and enters the shared campaign score stream.
2. **FEEDING FRENZY** — only consuming an actual live city citizen advances progress. The pet receives the Master consume effects; campaign score is `24 + 3 × citizen base value`. Citizens are removed from the active city and respawn after the historical 10–25 second window.
3. **BREAK THE RESPONSE** — threat spawns source-style drones/tanks. HP uses the v12 district/rank formulas. Source baseline tap damage is 5 until Claw Power is separately migrated. Drone/tank kills score 160/220, reduce threat by 8, advance response progress, and retain the 72% heal/rage/Bones pickup chance.
4. **BOSS BLOCK** — a deterministic existing high-res tower is promoted to the command tower because the high-res city has no legacy `btype===3` field. Boss HP multiplier remains exactly `2.3 + rank × 0.08`. Only collapse of the marked command tower satisfies the boss objective; it adds +23 threat and uses the legacy boss score base `255 + district × 25`.
5. **MAXIMUM RAMPAGE** — building collapses, citizen consumption and response-unit kills all enter the same campaign score stream, so the score mission emerges from the other real interactions instead of a synthetic counter.

## Intentional adaptations

- **No legacy iframe/city runtime was restored.** Encounter logic is a transparent overlay/bridge over the current `cityHighRes` renderer.
- **Response fire remains non-damaging.** The earlier RM3 combat projectiles are superseded by the later RM8 safety behavior: response units remain visible and can fire a decorative shot at most once per real day, but they do not damage the kaiju.
- **Command tower selection is deterministic, not invented taxonomy.** The highest-scoring live high-res building (height, points, width) becomes the command tower when no prior command tower exists. No fake `btype` is injected.
- **Citizen consumption removes the actual object from `city.citizens`.** This avoids adding an incompatible `eaten` schema to `cityHighRes`; the bridge owns the delayed respawn queue and restores the citizen at a city edge.
- **Economies remain separate profiles.** Master Fossils/Oil and later Petrol/Diamond are not silently merged.
- **Hatch feature generation uses CharacterEngine.** The old embedded `FEATURE_POOLS` are historical source only and are not runtime canon.

## Runtime load order

`src/index.modular.html` currently loads:

1. `app.js`
2. `appGameplayBridge.js`
3. `gameplayPanels.js`
4. `visualSkinControls.js`
5. `cityGameplayBridge.js`
6. `campaignEncounterBridge.js`
7. `citizenGameplayBridge.js`

The encounter bridge registers before the citizen bridge so a tap that lands on a response unit wins capture routing before citizen hit-testing. Ordinary taps continue to the base city renderer.

## Regression coverage

The zero-dependency Node suite includes dedicated coverage for:

- gameplay core state, save/import and persisted rampage meter;
- pet progression, hatch DNA and CharacterEngine selection;
- both economy profiles and Master shop;
- arcade progression;
- campaign progression and mission timers;
- response-unit/boss formulas and pickups;
- response/boss host bridge;
- building-collapse and boss-completion bridge;
- live citizen consume → pet → campaign → respawn cycle;
- Drive/procedural render skin fallback;
- modular launcher script inclusion/order.

Workflow: `.github/workflows/pilot-migration-tests.yml` runs every `tests/*.test.mjs` on pushes to this pilot branch. The current connector does not expose push-run results, so an empty connector status must not be interpreted as a passing or failing run.

## Next migration boundary

Do not add another major mechanics lane until the current modular launcher receives a browser/mobile interaction pass. The next work should concentrate on:

- target readability and tap affordances for citizens, response units and the command tower;
- compact campaign telemetry outside the open Nest drawer;
- hatch gating for campaign start;
- haptic/toast feedback for consume, response kills, pickups and mission completion;
- mobile overlap testing among top HUD, skin control, gameplay dock and encounter targets;
- only after those pass: evaluate remaining historical upgrades such as Claw Power, ability damage and rampage-meter activation as separately sourced modules.
