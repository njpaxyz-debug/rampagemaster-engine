/*
 * Stable RampageMaster animation-engine entry point.
 *
 * This file intentionally re-exports the Drive-extracted v7.6.3 module from a
 * short, stable repo path. Gameplay code should import from this file instead
 * of importing directly from drive-extracts/ so future cleanup can move the
 * engine without breaking call sites.
 */

export * from '../../drive-extracts/animation-engine/rampagemaster_motion_biomech_engine_v7_6_3.extracted.js';

import MotionEngine from '../../drive-extracts/animation-engine/rampagemaster_motion_biomech_engine_v7_6_3.extracted.js';

export default MotionEngine;
