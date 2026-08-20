# RampageMaster — Codex Pilot

## Purpose
This repository is the canonical GitHub/Codex workspace for RampageMaster. The goal is to stop treating each exported HTML build as a disconnected artifact and instead maintain a testable, versioned application.

## Canonical workflow
1. Preserve `master` as the stable line.
2. Do implementation work on feature branches.
3. Treat the newest approved playable build as source material, not as permission to overwrite working systems blindly.
4. Prefer extracting reusable systems from monolithic HTML into `src/` while keeping a runnable single-file build in `builds/` when useful.
5. Every behavioral change should have a reproducible test or explicit manual acceptance check.
6. Do not merge visual experiments that regress gameplay, input, save/load, mobile layout, or forge/deploy behavior.

## Current product invariants
- Mobile-first gameplay.
- Main game view should remain visually dominant; controls must not obstruct play.
- Kaiju/monster is persistent and should not be treated as disposable/death-driven gameplay.
- Monster Forge → hatch/create → deploy pipeline must remain functional.
- Procedural/randomized creature identity should produce visible differences.
- City interaction must remain playable by tap/click.
- Save/load/reset must be deterministic enough to debug.
- No military damage loop; destruction is driven by the kaiju/player systems.
- Sprite rendering should remain crisp/pixel-appropriate where pixel assets are used.
- Native/mobile haptic affordances may be used where supported, with graceful fallback.

## First Codex assignment
Audit the current repository before changing architecture.

### Phase 1 — Baseline
- Identify the actual runnable entrypoint(s).
- Map `index.html`, `src/`, `builds/`, and existing tests.
- Run or inspect all existing tests.
- Identify duplicated game-state, renderer, forge, persistence, and input code.
- Produce a short `docs/CODEX_BASELINE.md` with findings before refactoring.

### Phase 2 — Playability contract
Create smoke tests or a repeatable browser test harness for:
- app loads without uncaught exceptions;
- START enters gameplay;
- tap/click causes the expected primary interaction;
- Monster Forge opens and closes;
- a generated/forged monster can be deployed;
- save survives reload;
- reset clears the save;
- mobile viewport does not hide the primary playfield.

### Phase 3 — Refactor safely
Only after the baseline is documented and tests exist:
- isolate state/persistence;
- isolate input;
- isolate renderer/animation loop;
- isolate forge integration;
- isolate UI panels/HUD;
- keep a compatibility build path for a single-file HTML export.

## Acceptance rule
A refactor is not an improvement if it makes the application less playable, changes canonical visual identity without instruction, or removes a working interaction. Prefer small, reversible commits and regression tests over large rewrites.

## Current external source candidate
A newer Library artifact has been identified as `gigapet_city_rampage_forge_edition (5).html`, containing the landing page, Monster Forge overlay, forged-monster renderer, local persistence, and deploy pipeline. Before importing it wholesale, compare it against the repo's current stable build and migrate only validated improvements.
