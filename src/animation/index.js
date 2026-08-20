/*
 * Stable RampageMaster animation-engine entry point.
 *
 * This file intentionally re-exports the Drive-extracted v7.6.3 motion module
 * from a short, stable repo path. The Drive sprite lane is also exported here
 * so gameplay code can consume state/motion and Drive-backed pose rendering
 * through one animation boundary without importing drive-extract internals.
 */

export * from '../../drive-extracts/animation-engine/rampagemaster_motion_biomech_engine_v7_6_3.extracted.js';
export * from './driveSpriteSheetAnimator.js';

import MotionEngine from '../../drive-extracts/animation-engine/rampagemaster_motion_biomech_engine_v7_6_3.extracted.js';

export default MotionEngine;
