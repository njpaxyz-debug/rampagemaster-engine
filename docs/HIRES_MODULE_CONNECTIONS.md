# High-Resolution Module Connections

This checkpoint connects the higher-resolution and better-version RampageMaster module lanes into the modular source launcher.

## Connected source lanes

| Source lane | Best Drive source | Active repo adapter |
|---|---|---|
| Motion / biomechanics | `rampagemaster_biomech_generator_v7_6_3.html` | `src/animation/index.js` |
| Proportions / readable monster silhouette | `rampagemaster_admin_proportions_v7_1.html` | `src/modules/visualHighRes.js` |
| Architecture gameplay | `rampagemaster_unified_architecture_gameplay_v6_1.html` | `src/modules/cityHighRes.js` |
| Skyline intelligence | `rampagemaster_skyline_intelligence_v5.html` | `src/modules/cityHighRes.js` |
| Architecture skins / theme packages | `rampagemaster_architecture_skins_v4.html` | `src/modules/themePacks.js` |
| UX shell | `rampagemaster_ux_theme_v3.html` | `src/index.modular.html` |
| Product direction | `RAMPAGEMASTER SUPERIOR COMPONENTS` | `src/modules/bestSourceRegistry.js` |

## New module files

- `src/modules/bestSourceRegistry.js` — names the best source lanes and prevents older experiments from competing with newer adapters.
- `src/modules/themePacks.js` — high-resolution theme packages with palettes, architecture details, flora, fauna, and epigenetic effects.
- `src/modules/cityHighRes.js` — high-resolution city generation, detailed buildings, crumbling, fire, regeneration, panicked citizens, rarity/value, time-of-day cues, and theme rendering.
- `src/modules/visualHighRes.js` — proportion-aware kaiju rig renderer connected to taxonomy, phenotype, motion pose, gait, limbs, eye glow, blinking, armor, wings, tentacles, and silhouette scale.
- `src/modules/economyHighRes.js` — Bones → Opal → Quartz → Diamond → Oil conversion ladder plus city-value payout hooks.

## Updated launcher path

```text
src/index.modular.html
  -> src/app.js
    -> src/animation/index.js
    -> src/modules/cityHighRes.js
    -> src/modules/themePacks.js
    -> src/modules/visualHighRes.js
    -> src/modules/economyHighRes.js
    -> src/modules/bestSourceRegistry.js
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

## Integration rule

Do not paste higher-resolution code into the legacy one-file prototype. Route better versions through stable `src/modules/` adapters and let `src/app.js` compose them through the shared data model.

## Next integration pass

The next pass should move the egg/randomizer and mall/bank UI from the legacy prototype into dedicated source modules that consume the same taxonomy, city, theme, visual, and economy adapters.
