# RAMPAGEMASTER — Master Compile / Best-Version Arrangement

Generated: 2026-05-09

## Master decision

The best working direction is not one old file. It is a streamlined master built from four strongest source lanes:

1. **Playable shell / stable mobile UI**
   - Keep the most recent `preview (10).html` style: compact playable field, clean panels, save/export, bank, mall, care loop, responsive toy/pocket framing.
   - This becomes the stability base.

2. **City Rampage / V7 UX signatures**
   - Preserve the full-screen rampage feel, bottom dock, egg sequence, neon arcade mood, quick actions, save/import/export, and compact menu sheet.
   - Keep the egg-selection behavior as a non-negotiable: it remains visible in Nest and cannot vanish after hatch.

3. **NEST / BANK / MALL / ARCADE framework**
   - Preserve the four-system loop: Nest = attachment and growth; Bank = conversion strategy; Mall = expression and sinks; Arcade = fast microgame variety.
   - Current master uses the currency ladder from the working builds: bones → opal → quartz → fossils → oil.

4. **DNA / feature-map / facial anatomy work**
   - Preserve the hidden tap-seeded randomizer.
   - Preserve DNA as an accessible detail panel, not noisy always-on text.
   - Preserve “3D pixel depth” face logic through named emote points: brow, cheek, jaw.
   - Preserve gene-to-feature mapping as a data structure ready to be replaced later by the full CharacterEngine spreadsheet JSON.

## What this package contains

- `rampagemaster_master_v1.html`
  - Single-file runnable checkpoint.
  - No external libraries.
  - LocalStorage save.
  - Export/import save JSON.
  - Canvas city simulation.

- `RAMPAGEMASTER_MASTER_INDEX.md`
  - This audit and arrangement file.

- `rampagemaster_master_package.zip`
  - Both files together.

## Kept gameplay signatures

### Core pet loop
- Hatch, name, feed, play, clean, rest, train, explore.
- Needs: health, food, joy, energy, clean.
- XP, level, bond, mood, stage/evolution.

### Egg and randomizer
- Egg selection is fixed in the Nest.
- Hatch requires three taps.
- Tap coordinates and timing feed a hidden seeded randomizer.
- The generated DNA drives body, eyes, mouth, horns, tail, skin, personality, hue, scale, and emote points.

### City/rampage loop
- Moving city field.
- Buildings can be damaged.
- Buildings regenerate after cooldown.
- Citizens idle, panic, escape, and respawn.
- Motorists and military remain visible as ambient systems.
- Clicking/consuming citizens gives bones without graphic violence.
- Rampage earns bones but costs energy and cleanliness.

### Mall
- Consumables: snack, toy, soap, citizen bait, fossil relic.
- Upgrades: Metro Pass, Comfy Lair, Lucky Gut, Vault Key.
- Cosmetic: Neon City Skin.
- Mall operates as the sink for currency and expression.

### Bank
- Conversion chain:
  - 100 bones → 1 opal
  - 25 opal → 1 quartz
  - 10 quartz → 1 fossil
  - 5 fossils → 1 oil
- Vault Key reduces conversion costs.

### Arcade
- Short microgame queue.
- Streak rewards.
- Rewards feed bones/opal back into the main economy.

### DNA / debug access
- DNA information is accessible in its own panel.
- Detailed metadata is not permanently cluttering the main city view.
- Save JSON can be exported/imported as a checkpoint.

## Trimmed / parked

- Older V6/V7 files are no longer the master source.
- Empty modular folders are treated as future folder targets rather than current content sources.
- Raw PNG/GLB monster assets are parked as art reference until there is a proper asset pipeline.
- The full CharacterEngine spreadsheet should become JSON later, but the current checkpoint uses a compact embedded data map so the build runs immediately.
- The full backend architecture is parked. This version is intentionally a single-file local playable prototype.

## Next best folder arrangement

Recommended Drive structure:

```text
RAMPAGEMASTER/
  00_MASTER/
    rampagemaster_master_v1.html
    RAMPAGEMASTER_MASTER_INDEX.md
  01_WORKING_HTML_ARCHIVE/
    preview (10).html
    gigapet_v7.html
    gigapet_v6.html
    gigapet_city_rampage_game.html
    gigapet_city_rampage_v7_ux_mall_bank_layoutfix (1).html
  02_GAMEPLAY_LOOP/
    economy balance tables
    NEST BANK MALL ARCADE doc
  03_CHARACTER_ENGINE/
    CharacterEngine_FeatureMap
    gene-to-sprite pipeline doc
    kaiju facial anatomy core files
  04_ASSETS_REFERENCE/
    PNGs
    GLB model
    raw visual references
  05_PARKED_EXPERIMENTS/
    mobile V5
    deepseek scratch builds
    old imports
```

## Known limitations in this master checkpoint

- It is a polished single-file prototype, not a production app.
- No server/database yet.
- No real imported sprite atlas yet.
- Facial anatomy is procedural, not using the full lab asset package yet.
- Arcade is structurally implemented but still needs true per-microgame mechanics.
- Balance values are conservative starter values and should be tuned after playtesting.

## Best next build step

Convert the CharacterEngine spreadsheet into JSON and replace the embedded `FEATURE_POOLS` with real category rows:
Categories → FeatureOptions → Palettes → CompatibilityRules → PoseLibrary → AnimationMeta.

That will turn this from a strong playable prototype into the real gene-driven monster engine.
