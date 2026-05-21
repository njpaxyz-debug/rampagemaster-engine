# RampageMASTER Source-Integrated DNA v1

This checkpoint follows the corrected rule: integrate only code already present in the uploaded source files.

## Included sources

- `EXPANDED TAXONOMY AGINGV5.4.html`: copied first script intact as `ExpandedTaxonomyV54`.
- `Kaiju Facial Anatomy CoreV8.1.html`: copied first script intact as `KaijuFaceAnatomyCoreV81`.
- `kaiju_idle_personality_sandbox_v5.html`: extracted data constants only: `SPECIES`, `PERSONALITIES`, `ENVIRONMENTS`, `STAGES`, `MOTION`, and `LOOP_LIBRARY`.

## Excluded

- Invented v3/v4 gene expansions.
- New taxonomy categories not already present in the uploaded sources.
- New renderer anatomy guesses.

## Files

- `src/dna-source-integrated.js` — source-integrated ES module.
- `dna-source-integrated.preview.inline.html` — artifact-friendly preview with embedded module code.
- `dna-source-integrated.preview.import.html` — normal relative-import smoke preview.
- `source-map.json` — source-to-function map.
- `dna-source-integrated.node-test.mjs` — Node smoke test.
- `dna-source-integrated.test-output.txt` — latest test result.

## Debug result

Node smoke test passed: `ok: true`.