# RampageMASTER Cleanup Blueprint v1

Architecture-only cleanup plan for strengthening the current HTML/JS RampageMASTER build.

This document uses the uploaded COPILOT markdown as a systems map, but does not port the Unity/C# code directly. The working game remains HTML, JavaScript, Canvas, CSS panels, localStorage, `G`, `KAIJU_ANATOMY`, FaceMaster V8.1, and Expanded Taxonomy/Aging V5.4.

## Ground Rules

1. Revision mode only.
2. Keep the current working HTML/JS game as the baseline.
3. Do not add new taxonomy categories.
4. Do not add new gene engines.
5. Do not add LiveOps/rmx overlay families.
6. Do not add haptics/native feedback yet.
7. Do not paste whole preview canvases into the game renderer.
8. Every patch must preserve the full sequence: egg -> hatch -> unleash -> city -> action -> reward -> growth.
9. Renderer reads identity data; renderer does not invent kaiju identity.
10. Any safeguard must be callable and diagnostic-first, not a repeating timer that fights game state.

## Current Source Stack

- Face engine: `Kaiju Facial Anatomy Core V8.1`.
- Taxonomy/aging engine: `Expanded Taxonomy + Aging V5.4`.
- Game runtime: `GigaPet v6` / FaceMaster Clean lineage.
- Bridge table: `KAIJU_ANATOMY`.
- UI shell: HTML/CSS dock, panels, canvas, ability rail.
- Runtime state: `G`.
- Storage: versioned `rampagemaster_facemaster_clean_v*` keys.

## Blueprint Mapping from COPILOT Concepts to JS Modules

| COPILOT concept | HTML/JS equivalent | Cleanup target |
|---|---|---|
| `GameRoot` | Boot/start orchestration | `GameRoot` object with deterministic sequence methods |
| `DnaTraits` | Existing taxonomy + KAIJU_ANATOMY + FaceMaster phenotype | `KaijuIdentity` adapter, no new DNA |
| `KaijuLifeCycleSystem` | Egg, level, evo, stage, growth tab | `GrowthSystem` wrapper around existing stats |
| `KaijuPersonalityEngine` | mood/rage/joy/food/attack + idle loop | `MoodSystem` derived from existing `G` |
| `ThemeConfigSO` | `TZ_THEMES` / city packages | `ThemeSystem` schema normalizer |
| `CitySystem` | building array, damage, raze count, render city | split into `CityState`, `DestructionSystem`, `CityRenderer` |
| `PanicSystem` | citizens, flee behavior, combo/razed pressure | `PanicSystem` derived from existing city events |
| `KaijuLocomotion` | canvas kaiju position, idle bob, action state | `KaijuMotionSystem` wrapper |
| `KaijuVisualController` | `drawKaijuUnified` + FaceMaster overlay | `KaijuRenderer`, with FaceMaster data pass only |
| `AdminDebug` | admin console + diagnostics | `RampageDebug` invariant suite |

## Target Runtime Shape

```js
const Rampage = {
  GameRoot,
  State,
  KaijuIdentity,
  GrowthSystem,
  MoodSystem,
  ThemeSystem,
  CityState,
  DestructionSystem,
  PanicSystem,
  CityRenderer,
  KaijuRenderer,
  Panels,
  RampageDebug
};
```

This should be an organizational shell around existing functions first. Do not rewrite gameplay until a wrapper has passed invariants.

## Recurring Bugs and Permanent Invariants

### 1. Egg selection disappears

Cause history:
- egg tray was populated only after JS boot;
- saved-state auto-resume hid eggs;
- boot patches fought the launch screen.

Permanent invariant:

```js
RampageDebug.assertEggContract()
```

Must confirm:
- raw HTML contains at least three egg buttons;
- `#etray` is visible before hatch;
- `initEggs()` is canonical;
- static egg preboot is wire-only;
- no repeating egg timers;
- saved game appears as CONTINUE, never auto-hides eggs.

### 2. Kaiju does not release to city

Cause history:
- launch overlay had forced inline styles;
- selected egg index confused with kaiju id;
- `G.petType` not reliably set before render.

Permanent invariant:

```js
RampageDebug.assertReleaseContract()
```

Must confirm:
- `pendingHatchKaiju` is an actual kaiju object;
- `G.petType = kt.id` before render;
- `hideEggScreen()` clears inline overlay styles;
- city runtime starts only after valid pet id exists.

### 3. City or kaiju invisible after unleash

Cause history:
- city frame not drawn immediately;
- canvas not resized before first render;
- kaiju renderer failed without fallback.

Permanent invariant:

```js
RampageDebug.assertCityRenderContract()
```

Must confirm:
- canvas is visible and nonzero;
- buildings array exists;
- active kaiju id exists;
- one immediate render frame is drawn after unleash;
- unified renderer has a legacy fallback.

### 4. Face floats or becomes a static pasted square

Cause history:
- `FACE.drawFace()` pasted its preview canvas into the game;
- overlay used guessed center/size;
- gaze was not attached to actual head box.

Permanent invariant:

```js
RampageDebug.assertFaceContract()
```

Must confirm:
- no `FACE.drawFace()` call inside game renderer;
- face receives actual `{ headX, headY, headW, headH }` from body renderer;
- `FACE.computePhenotype()` and `FACE.buildEyeRig()` are used as data only;
- `window.__RM_FACE_GRID__` reports version, headBox, eyeCount, gazeMode;
- pointer/idle gaze changes pupil offset.

### 5. UX/UI panels fight the viewport

Cause history:
- bottom sheet grew over canvas;
- ability rail overlapped city;
- panels did not scroll internally.

Permanent invariant:

```js
RampageDebug.assertViewportContract()
```

Must confirm:
- canvas and bottom panel have non-overlapping bounds;
- panel height capped at `min(42vh, 430px)`;
- panels scroll internally;
- ability rail compresses/repositions on short screens;
- dock touch targets remain usable.

## Module Extraction Order

### Phase 1 — Stabilize without moving code

1. Add `RampageDebug.assertAll()`.
2. Add `GameRoot` wrapper around existing boot methods.
3. Add one sequence status object:

```js
G.sequence = {
  eggSelected:false,
  hatched:false,
  unleashed:false,
  cityReady:false,
  firstFrameDrawn:false,
  lastAction:null,
  lastReward:null,
  growthTick:0
};
```

4. Do not move functions yet.

### Phase 2 — Extract state wrappers

Create wrappers that call existing code:

```text
src/game-root.js
src/kaiju-identity.js
src/theme-system.js
src/city-state.js
src/destruction-system.js
src/panic-system.js
src/kaiju-renderer.js
src/ui-panels.js
src/debug-contracts.js
```

At this phase, wrappers can live inside the HTML but should be named and separated by comment blocks.

### Phase 3 — Split actual files

Only after Phase 2 passes tests:

```text
index.html
styles.css
src/data/kaiju-anatomy.js
src/data/themes.js
src/engines/face-v8-adapter.js
src/engines/taxonomy-v54-adapter.js
src/game-root.js
src/city-system.js
src/kaiju-renderer.js
src/ui-panels.js
src/debug-contracts.js
```

Also keep a generated single-file bundle for artifact testing.

## Required Smoke Test: Egg to City

Every revision must pass this checklist:

```text
1. Load fresh build.
2. Three eggs visible in raw launch screen.
3. Click egg.
4. Hatch result appears.
5. UNLEASH.
6. Egg screen hidden.
7. G.petType is valid.
8. Canvas visible and nonzero.
9. City buildings visible.
10. Kaiju visible.
11. Face grid connected to head box.
12. Attack damages a building.
13. Reward changes currency/score.
14. City tab changes theme without resetting pet.
15. Arcade action grants reward.
16. Growth action changes XP/stats.
17. Save/reload does not skip eggs unless CONTINUE is manually clicked.
18. No console errors.
```

## Implementation Priorities

### Priority A — Contracts before features

Before adding any visual/gameplay work, add assertions for:
- launch;
- release;
- city render;
- face grid;
- duplicate IDs;
- legacy leftovers.

### Priority B — Renderer separation

The renderer should be split conceptually:

```js
KaijuRenderer.drawBody(ctx, kaiju, pose)
KaijuRenderer.drawFace(ctx, kaiju, headBox, pose)
KaijuRenderer.drawEffects(ctx, kaiju, pose)
```

FaceMaster is allowed to supply data, never its own preview canvas.

### Priority C — City systems

Separate:

```js
CityState.generateBuildings()
DestructionSystem.applyDamage()
PanicSystem.applyShockwave()
CityRenderer.draw()
```

This is where future citizen visibility/destruction polish should happen.

### Priority D — UI polish

Use one panel renderer:

```js
Panels.render(activeTab)
Panels.open(tab)
Panels.close()
Panels.syncDock()
```

No separate tab renderers that fight the same DOM.

## Definition of Done for Next Cleanup Pass

- No new systems added.
- No old overlay leftovers.
- No repeating boot timers.
- All debug contracts pass.
- The game works from egg to city with a visible kaiju.
- Attack, city theme, arcade, and growth loops all update the same `G` state.
- Face animation is attached, interactive, and driven by existing FaceMaster data.
- Source comments show where existing code came from.
