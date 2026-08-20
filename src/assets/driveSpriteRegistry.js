/*
 * Drive-backed visual asset registry.
 *
 * Source truth matters here: the Reptile Scientist image is a real six-pose
 * 3x2 sheet. Historical workbooks also describe conceptual animation frame
 * ranges, but those ranges are NOT encoded in the PNG and are deliberately not
 * represented as fake frames in this registry.
 */

const cell = (column, row, columns = 3, rows = 2) => Object.freeze({
  u: column / columns,
  v: row / rows,
  w: 1 / columns,
  h: 1 / rows
});

export const REPTILE_SCIENTIST_POSES = Object.freeze([
  { id: 'idle', label: 'Idle Stand', rect: cell(0, 0), sourcePose: 'POSE_01' },
  { id: 'walk', label: 'Walk Mid-stride', rect: cell(1, 0), sourcePose: 'POSE_02' },
  { id: 'think', label: 'Think / Chin Rub', rect: cell(2, 0), sourcePose: 'POSE_03' },
  { id: 'phone', label: 'Hold Phone', rect: cell(0, 1), sourcePose: 'POSE_04' },
  { id: 'wave', label: 'Open Wave', rect: cell(1, 1), sourcePose: 'POSE_05' },
  { id: 'standAlt', label: 'Tail-out Stand', rect: cell(2, 1), sourcePose: 'POSE_06' }
]);

export const DRIVE_SPRITE_SHEETS = Object.freeze({
  reptileScientist: Object.freeze({
    id: 'reptileScientist',
    kind: 'pose-sheet',
    available: true,
    assetPath: '../../assets/drive/reptile-scientist-six-pose.webp',
    originalName: 'reptile scientist canva sprite sheet.jpg.png',
    productionDimensions: Object.freeze({ width: 360, height: 261 }),
    sourceDimensions: Object.freeze({ width: 1294, height: 938 }),
    grid: Object.freeze({ columns: 3, rows: 2 }),
    poses: REPTILE_SCIENTIST_POSES,
    provenance: Object.freeze({
      source: 'Google Drive',
      mapping: 'CharacterEngine_FeatureMap / PoseLibrary',
      note: 'Six real poses. Procedural interpolation supplies motion between poses; conceptual workbook frame ranges are not treated as literal atlas frames.'
    })
  }),
  mythicFour: Object.freeze({
    id: 'mythicFour',
    kind: 'reference-composite',
    available: false,
    assetPath: null,
    originalName: 'mythic four arche sprite.jpg.png',
    stagedProductionDimensions: Object.freeze({ width: 360, height: 205 }),
    sourceDimensions: Object.freeze({ width: 1600, height: 912 }),
    grid: null,
    poses: Object.freeze([]),
    provenance: Object.freeze({
      source: 'Google Drive',
      note: 'Reference/archetype composition only. Not interpreted as a uniform frame atlas; intentionally not required by the runtime pose lane.'
    })
  })
});

export const STATE_TO_REPTILE_POSE = Object.freeze({
  idle: 'idle',
  care: 'think',
  patrol: 'walk',
  walk: 'walk',
  run: 'walk',
  rampage: 'standAlt',
  stomp: 'standAlt',
  roar: 'wave',
  shockwave: 'standAlt',
  beam: 'standAlt',
  charge: 'walk',
  hitreact: 'think',
  enraged: 'standAlt',
  cataclysmic: 'standAlt',
  greet: 'wave',
  inspect: 'think',
  phone: 'phone'
});

export function getDriveSpriteSheet(id = 'reptileScientist') {
  return DRIVE_SPRITE_SHEETS[id] || null;
}

export function getPoseById(sheet, poseId) {
  if (!sheet?.poses?.length) return null;
  return sheet.poses.find((pose) => pose.id === poseId) || sheet.poses[0];
}

export function resolveReptilePose(state = 'idle') {
  const key = String(state || 'idle').toLowerCase();
  return STATE_TO_REPTILE_POSE[key] || 'idle';
}
