# Modular Source Bridge

This checkpoint wires the source tree to the modular animation engine without destabilizing the legacy single-file prototype.

## Launchers

- `src/index.html` remains the legacy all-in-one playable prototype.
- `src/index.modular.html` is the new modular source launcher.
- `src/app.js` imports and calls `src/animation/index.js`.

## Execution path

```text
src/index.modular.html -> src/app.js -> src/animation/index.js
```

## Local run command

From the repository root:

```bash
python3 -m http.server 8000
```

Then open:

```text
http://localhost:8000/src/index.modular.html
```

## What the bridge does

`src/app.js` creates a lightweight city state, builds a seeded kaiju motion profile, calls `MotionEngine.updateMotion(...)` every animation frame, renders the returned position, gait, pose, limb phase, target, and biomechanical state, and exposes a debug object on `window.RampageMaster`.

## Integration rule

Use `src/animation/index.js` as the public animation API. Keep `drive-extracts/` as provenance and archive material until the engine is fully normalized into permanent source modules.

## Next pass

The next pass should replace the embedded movement calculations inside the legacy `src/index.html` prototype with calls to the same `MotionEngine` API already used by `src/app.js`.
