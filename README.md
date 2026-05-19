# RampageMaster Engine

## Project Overview

This repository contains the foundational elements for the `RampageMaster` project, a Kaiju Pocket Pet game. The core objective is to evolve a single-file HTML prototype into a robust, gene-driven monster engine with optimized performance and detailed gameplay mechanics. This project emphasizes a modular approach to game development, focusing on clear separation of concerns for scalability and maintainability.

## Project Structure

```
rampagemaster-engine/
├── src/
│   ├── index.html                         # The main single-file HTML prototype for RampageMaster
│   └── animation/
│       └── index.js                       # Stable animation-engine import path
├── drive-extracts/
│   └── animation-engine/
│       ├── MANIFEST.md                    # Drive extraction manifest and source boundaries
│       └── rampagemaster_motion_biomech_engine_v7_6_3.extracted.js
│                                           # Extracted motion/biomechanics engine module
├── tests/
│   └── animation-engine-smoke.html        # Browser smoke test for the extracted engine
├── docs/
│   ├── MASTER_INDEX.md                    # Master compile and best-version arrangement document
│   └── OPTIMIZATION_SCAFFOLD.md           # Prioritized scaffold for performance and gameplay optimization
└── README.md
```

## Getting Started

To run the current single-file `RampageMaster` prototype, open `src/index.html` in any modern browser. No special server setup is required for the prototype because it is self-contained.

### Prerequisites

* A modern browser such as Chrome, Firefox, Edge, or Safari.

### Running the Prototype

1. Navigate to the `src/` directory.
2. Open `index.html` in your preferred browser.

## Animation Engine Extraction

The Drive audit identified `rampagemaster_biomech_generator_v7_6_3.html` as the most direct animation-engine source. The repo now contains a cleaned extraction of that motion/biomechanics layer at:

```js
src/animation/index.js
```

Gameplay code should import from this stable path rather than importing directly from `drive-extracts/`. The current stable entry point re-exports the extracted v7.6.3 module:

```js
import MotionEngine from './animation/index.js';
```

The extracted module focuses on the animation-engine responsibilities only:

* seeded kaiju motion profiles
* taxonomy-to-locomotion mapping
* biomechanical derived stats
* gait/pose/limb phase state
* route-graph target selection
* rampage/care/idle intent handling
* city-aware movement state updates

It intentionally does **not** include the entire original giant HTML shell, UI, mall, bank, arcade, save system, or city renderer. Those remain separate gameplay/application concerns.

## Animation Smoke Test

A standalone browser smoke test is available at:

```text
tests/animation-engine-smoke.html
```

Because the smoke test imports ES modules, run it through a small local static server from the repository root:

```bash
python3 -m http.server 8000
```

Then open:

```text
http://localhost:8000/tests/animation-engine-smoke.html
```

The test creates a seeded Giga-Rex motion profile, advances it through the extracted motion engine, renders a simplified kaiju on a city strip, and prints live debug state including current gait, pose, target, limbs, and derived biomechanical values.

## Key Features and Gameplay Mechanics

The `RampageMaster` prototype incorporates several core gameplay elements:

* **Core Pet Loop:** Engage with your Kaiju through hatching, naming, feeding, playing, cleaning, resting, training, and exploration. Monitor health, food, joy, energy, cleanliness, XP, level, bond, mood, and evolution stages.
* **Egg and Randomizer:** A unique egg selection process in the Nest uses tap timing and coordinates as a hidden seeded randomizer, shaping DNA, traits, personality, and city-rampage behavior.
* **City/Rampage Loop:** A dynamic city environment allows rampaging, building damage, regeneration, citizens escaping, and bone-currency rewards.
* **Economic Framework:** The Mall, Bank, and Arcade support consumables, upgrades, cosmetics, conversion paths, microgames, and streak rewards.
* **DNA / Debug Access:** Dedicated DNA/debug information supports export/import save checkpoints and deeper inspection of generated traits.
* **Animation / Biomechanics Layer:** A modular motion layer now exists independently from the single-file shell, making future integration safer and preventing more overlapping animation logic.

## Development Roadmap and Optimization

For detailed planning, refer to:

* `docs/MASTER_INDEX.md` — master compile and best-version source arrangement.
* `docs/OPTIMIZATION_SCAFFOLD.md` — prioritized scaffold for gameplay, performance, CharacterEngine integration, canvas rendering, and modular architecture.
* `drive-extracts/animation-engine/MANIFEST.md` — current Drive extraction source list and exact boundaries.

## Current Integration Rule

Use `src/animation/index.js` as the public animation API. Treat everything inside `drive-extracts/` as provenance/archive material until the engine is fully normalized into permanent `src/` modules.

## License

[Specify your license here, e.g., MIT, Apache 2.0, etc.]

## Contact

For any inquiries or collaboration opportunities, please contact [Your Name/Email/GitHub Profile].
