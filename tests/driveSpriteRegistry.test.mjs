import assert from 'node:assert/strict';
import {
  DRIVE_SPRITE_SHEETS,
  REPTILE_SCIENTIST_POSES,
  resolveReptilePose,
  getPoseById
} from '../src/assets/driveSpriteRegistry.js';
import { proceduralPoseTransform } from '../src/animation/driveSpriteSheetAnimator.js';

const sheet = DRIVE_SPRITE_SHEETS.reptileScientist;
assert.equal(sheet.kind, 'pose-sheet');
assert.deepEqual(sheet.grid, { columns: 3, rows: 2 });
assert.equal(REPTILE_SCIENTIST_POSES.length, 6);
assert.equal(resolveReptilePose('patrol'), 'walk');
assert.equal(resolveReptilePose('roar'), 'wave');
assert.equal(resolveReptilePose('unknown-state'), 'idle');
assert.equal(getPoseById(sheet, 'think').sourcePose, 'POSE_03');

for (const pose of sheet.poses) {
  const { u, v, w, h } = pose.rect;
  assert.ok(u >= 0 && v >= 0 && w > 0 && h > 0);
  assert.ok(u + w <= 1.000001);
  assert.ok(v + h <= 1.000001);
}

const idle = proceduralPoseTransform('idle', 1.25, 0);
const walk = proceduralPoseTransform('walk', 1.25, 0);
assert.notEqual(idle.bob, walk.bob);
assert.ok(Number.isFinite(walk.rotation));
console.log('drive sprite registry: ok');
