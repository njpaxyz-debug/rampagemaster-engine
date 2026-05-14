# RampageMaster Engine

## Project Overview

This repository contains the foundational elements for the `RampageMaster` project, a Kaiju Pocket Pet game. The core objective is to evolve a single-file HTML prototype into a robust, gene-driven monster engine with optimized performance and detailed gameplay mechanics. This project emphasizes a modular approach to game development, focusing on clear separation of concerns for scalability and maintainability.

## Project Structure

```
rampagemaster-engine/
├── src/
│   └── index.html             # The main single-file HTML prototype for RampageMaster
└── docs/
    ├── MASTER_INDEX.md        # Master compile and best-version arrangement document
    └── OPTIMIZATION_SCAFFOLD.md # Prioritized scaffold for performance and gameplay engine optimization
└── README.md                # This document
```

## Getting Started

To run the `RampageMaster` prototype, simply open the `src/index.html` file in any modern web browser. No special server setup is required as it is a self-contained HTML file.

### Prerequisites

*   A modern web browser (e.g., Chrome, Firefox, Edge)

### Running the Prototype

1.  Navigate to the `src/` directory.
2.  Open `index.html` in your preferred web browser.

## Key Features and Gameplay Mechanics

The `RampageMaster` prototype incorporates several core gameplay elements:

*   **Core Pet Loop:** Engage with your Kaiju through hatching, naming, feeding, playing, cleaning, resting, training, and exploration. Monitor key stats like health, food, joy, energy, and cleanliness, alongside progression metrics such as XP, level, bond, mood, and evolution stages.
*   **Egg and Randomizer:** A unique egg selection process in the Nest, requiring three taps to hatch. The timing and coordinates of these taps feed a hidden seeded randomizer, which generates the Kaiju's DNA, influencing its physical traits and personality.
*   **City/Rampage Loop:** Experience a dynamic city environment where your Kaiju can rampage, damaging buildings that later regenerate. Citizens react to your Kaiju's presence, panicking and escaping. Rampaging earns 
bones (currency) but consumes energy and requires cleanliness.
*   **Economic Framework (Mall, Bank, Arcade):** The Mall serves as a hub for acquiring consumables, upgrades, and cosmetics. The Bank facilitates currency conversion (bones → opal → quartz → fossils → oil). The Arcade offers engaging microgames with streak rewards, contributing to the in-game economy.
*   **DNA / Debug Access:** Access detailed DNA information in a dedicated panel, allowing for deeper understanding of your Kaiju's generated traits. The game also supports exporting and importing save JSON for checkpoints and debugging.

## Development Roadmap and Optimization

For a detailed understanding of the project's future development and optimization strategies, please refer to the following documents:

*   **`docs/MASTER_INDEX.md`**: Provides a comprehensive audit and arrangement of the project's master compile and best-version sources.
*   **`docs/OPTIMIZATION_SCAFFOLD.md`**: Outlines a prioritized scaffold for enhancing gameplay engine details and optimizing performance, including strategies for CharacterEngine integration, Canvas rendering optimization, and modular architecture.

## Contributing

Contributions are welcome! Please refer to the `docs/MASTER_INDEX.md` and `docs/OPTIMIZATION_SCAFFOLD.md` for current development priorities and architectural guidelines.

## License

[Specify your license here, e.g., MIT, Apache 2.0, etc.]

## Contact

For any inquiries or collaboration opportunities, please contact [Your Name/Email/GitHub Profile].
