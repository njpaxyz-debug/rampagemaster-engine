/*
 * RampageMaster Motion + Biomechanics Engine v7.6.3 — extracted module
 *
 * Provenance
 * - Drive source title: rampagemaster_biomech_generator_v7_6_3.html
 * - Drive source id: 1FqjDWhYgcEurfq9r4-Nxp5JJRSTK-3h5
 * - Drive source modified: 2026-05-10T13:49:44.000Z
 *
 * Extraction policy
 * The Drive source is a single-file HTML prototype containing UI, canvas rendering,
 * city simulation, economy, mall, bank, DNA panels, and animation systems. This file
 * isolates the reusable animation-engine layer: v7.5 Motion Sandbox, v7.6 Biomechanical
 * Locomotion Patch, and v7.6.3 generator/reset activation semantics.
 */

export const RAMPAGEMASTER_MOTION_ENGINE_VERSION = '7.6.3';

export const DRIVE_PROVENANCE = Object.freeze({
  title: 'rampagemaster_biomech_generator_v7_6_3.html',
  driveFileId: '1FqjDWhYgcEurfq9r4-Nxp5JJRSTK-3h5',
  modifiedAt: '2026-05-10T13:49:44.000Z',
  extractedSubsystems: [
    'RampageMaster v7.5 Motion Sandbox Reintegration',
    'RampageMaster v7.6 Biomechanical Locomotion Patch',
    'RampageMaster v7.6.3 Restart / Reset / Kaiju Generator Activation'
  ]
});

const clamp = (value, min = 0, max = 1) => Math.max(min, Math.min(max, Number(value) || 0));

export function hashString(input = '') {
  let hash = 2166136261 >>> 0;
  for (let i = 0; i < String(input).length; i += 1) {
    hash ^= String(input).charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

export function seededRandom(seed) {
  let t = (seed >>> 0) + 0x6D2B79F5;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}

export function deepDefaults(base, overrides) {
  const out = JSON.parse(JSON.stringify(base || {}));
  for (const key of Object.keys(overrides || {})) {
    if (overrides[key] && typeof overrides[key] === 'object' && !Array.isArray(overrides[key])) {
      out[key] = deepDefaults(out[key] || {}, overrides[key]);
    } else {
      out[key] = overrides[key];
    }
  }
  return out;
}

export const SPECIES_SIGNATURES = Object.freeze({
  ember: {
    name: 'Ember Wyrm', emoji: '🔥', body: '#e85d45', accent: '#ffd064', scale: 1.05,
    routeBias: { roof: 0.88, ledge: 0.62, street: 0.56, window: 0.18, wall: 0.58, alley: 0.42, nest: 0.26 },
    limbs: { type: 'clawed', arm: 0.78, leg: 0.58, foot: 0.34, reach: 0.86, climb: 0.72 },
    face: { eyes: 'slit', mouth: 'fang', brow: 'sharp', react: 'snarl' },
    tail: { type: 'serpent', length: 1.25 },
    motion: { grounded: 0.94, stride: 0.78, bob: 0.30, lean: 0.72, hover: 0, turnSnap: 0.35, weight: 1.1 }
  },
  moss: {
    name: 'Moss Titan', emoji: '🌿', body: '#62b96f', accent: '#d6f0a6', scale: 1.18,
    routeBias: { roof: 0.18, ledge: 0.35, street: 0.80, window: 0.30, wall: 0.24, alley: 0.42, nest: 0.78 },
    limbs: { type: 'trunk', arm: 0.86, leg: 0.72, foot: 0.55, reach: 0.62, climb: 0.18 },
    face: { eyes: 'soft', mouth: 'flat', brow: 'low', react: 'concern' },
    tail: { type: 'root', length: 0.55 },
    motion: { grounded: 1, stride: 0.40, bob: 0.12, lean: 0.24, hover: 0, turnSnap: 0.08, weight: 1.45 }
  },
  void: {
    name: 'Voidling', emoji: '🌘', body: '#5741a8', accent: '#9ee8ff', scale: 0.90,
    routeBias: { roof: 0.70, ledge: 0.86, street: 0.28, window: 0.94, wall: 0.84, alley: 0.78, nest: 0.28 },
    limbs: { type: 'thin', arm: 0.98, leg: 0.72, foot: 0.24, reach: 1.0, climb: 0.95 },
    face: { eyes: 'many', mouth: 'void', brow: 'tilt', react: 'stare' },
    tail: { type: 'shadow', length: 0.85 },
    motion: { grounded: 0.84, stride: 0.58, bob: 0.16, lean: 0.88, hover: 0.02, turnSnap: 0.72, weight: 0.72 }
  },
  plush: {
    name: 'Plush Behemoth', emoji: '🧸', body: '#d98ab6', accent: '#fff0a2', scale: 0.98,
    routeBias: { roof: 0.20, ledge: 0.30, street: 0.70, window: 0.50, wall: 0.15, alley: 0.22, nest: 0.82 },
    limbs: { type: 'round', arm: 0.58, leg: 0.48, foot: 0.44, reach: 0.50, climb: 0.12 },
    face: { eyes: 'button', mouth: 'smile', brow: 'none', react: 'giggle' },
    tail: { type: 'button', length: 0.22 },
    motion: { grounded: 0.98, stride: 0.64, bob: 0.38, lean: 0.30, hover: 0, turnSnap: 0.18, weight: 0.9 }
  },
  chrome: {
    name: 'Chrome Kaiju', emoji: '⚙️', body: '#9ca9bb', accent: '#70e5ff', scale: 1.02,
    routeBias: { roof: 0.46, ledge: 0.52, street: 0.82, window: 0.24, wall: 0.42, alley: 0.34, nest: 0.18 },
    limbs: { type: 'segmented', arm: 0.72, leg: 0.64, foot: 0.38, reach: 0.68, climb: 0.55 },
    face: { eyes: 'visor', mouth: 'line', brow: 'plate', react: 'scan' },
    tail: { type: 'cable', length: 0.70 },
    motion: { grounded: 1, stride: 0.48, bob: 0.05, lean: 0.14, hover: 0, turnSnap: 0.92, weight: 1.25 }
  },
  ghost: {
    name: 'Lantern Ghost', emoji: '🏮', body: '#8fd7d4', accent: '#ffe58c', scale: 0.88,
    routeBias: { roof: 0.62, ledge: 0.82, street: 0.20, window: 1.0, wall: 0.80, alley: 0.70, nest: 0.46 },
    limbs: { type: 'sleeve', arm: 0.80, leg: 0.22, foot: 0.18, reach: 0.92, climb: 0.82 },
    face: { eyes: 'lantern', mouth: 'small', brow: 'mist', react: 'blink' },
    tail: { type: 'mist', length: 1.10 },
    motion: { grounded: 0.70, stride: 0.28, bob: 0.10, lean: 0.52, hover: 0.04, turnSnap: 0.44, weight: 0.48 }
  }
});

export const STAGES = Object.freeze({
  egg: { name: 'Egg', scale: 0.54, speed: 0.08, states: ['nest', 'doze'] },
  larva: { name: 'Larva', scale: 0.72, speed: 0.45, states: ['creep', 'nest', 'inspect', 'doze', 'windowWatch'] },
  adolescent: { name: 'Adolescent', scale: 0.92, speed: 1.05, states: ['creep', 'play', 'inspect', 'patrol', 'perch', 'climb', 'windowWatch'] },
  mature: { name: 'Mature', scale: 1.10, speed: 0.90, states: ['creep', 'stalk', 'patrol', 'perch', 'inspect', 'nest', 'climb', 'restRoof', 'windowWatch'] },
  elderly: { name: 'Elderly', scale: 0.98, speed: 0.55, states: ['creep', 'nest', 'doze', 'inspect', 'perch', 'restRoof', 'windowWatch'] }
});

export const LOOP_LIBRARY = Object.freeze({
  creep: { name: 'Creep', state: 'creep', hint: 'slow foot-locked alley movement' },
  stalk: { name: 'Stalk', state: 'stalk', hint: 'leaning pause-to-pounce behavior' },
  play: { name: 'Play', state: 'play', hint: 'toy-like crouch and weighted recoveries' },
  patrol: { name: 'Patrol', state: 'patrol', hint: 'territorial walking route' },
  perch: { name: 'Perch', state: 'perch', hint: 'roof/ledge bracing' },
  nest: { name: 'Nest', state: 'nest', hint: 'settling, nuzzle, low energy' },
  inspect: { name: 'Inspect', state: 'inspect', hint: 'face/hand reaction to windows and signs' },
  doze: { name: 'Doze', state: 'doze', hint: 'sleepy idle with grounded weight' },
  climb: { name: 'Climb', state: 'climb', hint: 'wall-axis migration' },
  restRoof: { name: 'Roof Rest', state: 'restRoof', hint: 'resting on rooftop contact line' },
  windowWatch: { name: 'Window Watch', state: 'windowWatch', hint: 'window-hugging observation' }
});

export const ANATOMY_DEFAULT = Object.freeze({
  hands: { size: 0.52, claw: 0.45, thumb: 0.45, grip: 0.68 },
  feet: { size: 0.52, toes: 0.55, heel: 0.44, stance: 0.64 },
  fingers: { length: 0.50, splay: 0.46, talons: 0.35, curl: 0.42 },
  neck: { length: 0.45, thickness: 0.55, tilt: 0.44, reach: 0.50 },
  face: { mouth: 0.52, eyes: 0.62, snout: 0.45, brow: 0.48, jaw: 0.42, blink: 0.55 }
});

export const PHYSICS_DEFAULT = Object.freeze({
  gravity: 1,
  groundSnap: 1,
  limbActivity: 0.92,
  climbBias: 0.78,
  worldInteraction: 0.92,
  footLock: 1,
  pathContinuity: 1,
  slopeGrip: 0.88,
  stepImpact: 0.72
});

export const PRESSURE_DEFAULT = Object.freeze({
  threat: 0.38,
  novelty: 0.72,
  comfort: 0.45,
  hunger: 0.32,
  noise: 0.64,
  weather: 0.22
});

export const BIOMECH_LIBRARY = Object.freeze({
  version: '1.0.4',
  globalConstants: {
    gravityStandard: 9.81,
    fluidDensityWater: 1000,
    squareCubeLawActive: true
  },
  taxonomies: {
    chordata_vertebrata: {
      id: 'chordata_vertebrata',
      label: 'Chordata / Vertebrate',
      skeleton: { type: 'endoskeleton', material: 'hydroxyapatite', rigidity: 0.85, scalingExponentMass: 3.0, scalingExponentStrength: 2.0, jointConstraints: 'high_fidelity_limits' },
      musculature: { model: 'lever_arm', torqueMultiplier: 1.2, contractionSpeed: 0.7, insertionLogic: 'proximal_to_joint', fatigueRate: 0.05 },
      animationBias: { ikPrecision: 0.9, centerOfGravity: 'pelvic_lumbar_centroid', locomotionTypes: ['cursorial', 'saltatorial', 'fossorial'] }
    },
    arthropoda: {
      id: 'arthropoda',
      label: 'Arthropoda / Exoskeleton',
      skeleton: { type: 'exoskeleton', material: 'chitin', rigidity: 0.95, scalingExponentMass: 3.2, scalingExponentStrength: 2.0, jointConstraints: 'hinge_dominated' },
      musculature: { model: 'internal_piston', torqueMultiplier: 2.5, contractionSpeed: 1.5, insertionLogic: 'internal_surface_attachment', fatigueRate: 0.02 },
      animationBias: { ikPrecision: 0.6, centerOfGravity: 'thoracic_centroid', locomotionTypes: ['hexapedal', 'saltatorial', 'aerial_fast_flutter'] }
    },
    mollusca_cephalopoda: {
      id: 'mollusca_cephalopoda',
      label: 'Mollusca / Cephalopod',
      skeleton: { type: 'hydrostatic', material: 'fluid_pressure', rigidity: 0.15, scalingExponentMass: 2.8, scalingExponentStrength: 2.2, jointConstraints: 'unconstrained_soft_body' },
      musculature: { model: 'muscular_hydrostat', torqueMultiplier: 0.8, contractionSpeed: 0.4, insertionLogic: 'distributed_sheet', fatigueRate: 0.1 },
      animationBias: { ikPrecision: 0.2, centerOfGravity: 'mantle_core', locomotionTypes: ['jet_propulsion', 'tentacular_crawl'] }
    }
  }
});

export const SPECIES_TO_BIOMECH_PHYLUM = Object.freeze({
  ember: 'chordata_vertebrata',
  moss: 'chordata_vertebrata',
  plush: 'chordata_vertebrata',
  chrome: 'arthropoda',
  void: 'mollusca_cephalopoda',
  ghost: 'mollusca_cephalopoda'
});

export function defaultLoopTags() {
  return Object.fromEntries(Object.keys(LOOP_LIBRARY).map((key) => [key, true]));
}

export function createMotionLab(overrides = {}) {
  const species = SPECIES_SIGNATURES[overrides.species] ? overrides.species : 'void';
  const phylum = overrides.biomechPhylum || SPECIES_TO_BIOMECH_PHYLUM[species] || 'chordata_vertebrata';
  return {
    species,
    personality: overrides.personality || 'curious',
    stage: STAGES[overrides.stage] ? overrides.stage : 'mature',
    biomechPhylum: BIOMECH_LIBRARY.taxonomies[phylum] ? phylum : 'chordata_vertebrata',
    anatomy: deepDefaults(ANATOMY_DEFAULT, overrides.anatomy || {}),
    physics: { ...PHYSICS_DEFAULT, ...(overrides.physics || {}) },
    pressure: { ...PRESSURE_DEFAULT, ...(overrides.pressure || {}) },
    loopTags: { ...defaultLoopTags(), ...(overrides.loopTags || {}) },
    showRoutes: overrides.showRoutes !== false,
    showContact: overrides.showContact !== false,
    savedBuilds: Array.isArray(overrides.savedBuilds) ? overrides.savedBuilds : [],
    label: overrides.label || '',
    outcome: overrides.outcome || 'untested',
    notes: overrides.notes || ''
  };
}

export function createKaijuMotion(overrides = {}) {
  return {
    mode: overrides.mode || 'patrol',
    timer: Number.isFinite(overrides.timer) ? overrides.timer : 0,
    targetX: Number.isFinite(overrides.targetX) ? overrides.targetX : 520,
    yOffset: Number.isFinite(overrides.yOffset) ? overrides.yOffset : 0,
    surface: overrides.surface || 'ground',
    phase: Number.isFinite(overrides.phase) ? overrides.phase : seededRandom(hashString('kaiju-motion')) * 7,
    route: overrides.route || 'main-street',
    path: Array.isArray(overrides.path) ? overrides.path : [],
    pathIndex: Number.isFinite(overrides.pathIndex) ? overrides.pathIndex : 0,
    history: Array.isArray(overrides.history) ? overrides.history : []
  };
}

export function biomechDerived(motionLab) {
  const ml = createMotionLab(motionLab);
  const taxonomy = BIOMECH_LIBRARY.taxonomies[ml.biomechPhylum] || BIOMECH_LIBRARY.taxonomies.chordata_vertebrata;
  const sig = SPECIES_SIGNATURES[ml.species] || SPECIES_SIGNATURES.void;
  const sk = taxonomy.skeleton;
  const mu = taxonomy.musculature;
  const ab = taxonomy.animationBias;
  const gaits = ab.locomotionTypes || [];
  const scale = Number(sig.scale || 1);
  const massPenalty = BIOMECH_LIBRARY.globalConstants.squareCubeLawActive
    ? clamp(1 - (sk.scalingExponentMass - sk.scalingExponentStrength) * 0.10 * (scale - 1), 0.72, 1.18)
    : 1;
  const hex = gaits.includes('hexapedal');
  const cursor = gaits.includes('cursorial');
  const flutter = gaits.includes('aerial_fast_flutter');
  const tentacle = gaits.includes('tentacular_crawl');
  const jet = gaits.includes('jet_propulsion');
  return {
    id: taxonomy.id,
    label: taxonomy.label,
    skeleton: sk.type,
    material: sk.material,
    muscle: mu.model,
    cog: ab.centerOfGravity,
    gaits,
    rigidity: sk.rigidity,
    torque: mu.torqueMultiplier,
    contraction: mu.contractionSpeed,
    fatigue: mu.fatigueRate,
    ik: ab.ikPrecision,
    massPenalty,
    speedScalar: clamp((0.64 + mu.contractionSpeed * 0.34 + mu.torqueMultiplier * 0.08) * massPenalty * (cursor ? 1.08 : 1) * (hex ? 1.16 : 1) * (tentacle ? 0.72 : 1) * (jet ? 0.86 : 1), 0.34, 1.9),
    climbScalar: clamp((sig.limbs.climb || 0.5) * (0.42 + mu.torqueMultiplier * 0.16 + mu.contractionSpeed * 0.18 + ab.ikPrecision * 0.20) * (hex ? 1.28 : 1) * (tentacle ? 1.18 : 1) * (cursor ? 0.72 : 1), 0.18, 1.7),
    turnScalar: clamp((sig.motion.turnSnap || 0.4) + (0.95 - sk.rigidity) * 0.42 + (hex ? 0.26 : 0) + (tentacle ? 0.34 : 0), 0.08, 1.45),
    verticalScalar: clamp((gaits.includes('saltatorial') ? 1.10 : 0.72) * (hex ? 1.08 : 1) * (tentacle ? 0.92 : 1) * (cursor ? 0.72 : 1) * (flutter ? 1.05 : 1), 0.12, 1.35),
    footLock: clamp((ml.physics.footLock || 1) * (0.55 + ab.ikPrecision * 0.42 + sk.rigidity * 0.22) * (tentacle ? 0.78 : 1), 0.45, 1.2),
    contactSettle: clamp((ml.physics.groundSnap || 1) * (0.45 + sk.rigidity * 0.48 + ab.ikPrecision * 0.22), 0.42, 1.25),
    limbPulse: clamp((ml.physics.limbActivity || 0.9) * (mu.contractionSpeed * 0.66 + mu.torqueMultiplier * 0.12 + ab.ikPrecision * 0.25), 0.22, 1.9),
    allowedSurfaces: hex || tentacle ? ['street', 'base', 'wall', 'window', 'ledge', 'roof'] : flutter ? ['window', 'ledge', 'roof', 'base'] : cursor ? ['street', 'base', 'ledge', 'roof'] : ['street', 'base', 'window', 'ledge', 'roof'],
    gaitLabel: hex ? 'hexapedal hinge gait' : tentacle ? 'tentacular crawl' : cursor ? 'vertebrate cursorial gait' : flutter ? 'anchored flutter-brace' : jet ? 'soft hydrostatic pulse' : 'grounded crawl'
  };
}

export function buildRouteGraph({ worldSpan = 1280, buildings = [] } = {}) {
  const nodes = [];
  const edges = [];
  const add = (type, x, yOffset = 0, buildingId = null) => {
    const id = `${type}:${buildingId ?? 'street'}:${Math.round(x)}:${Math.round(yOffset)}`;
    const node = { id, type, x: clamp(x, 25, worldSpan - 25), yOffset: Math.max(0, yOffset || 0), buildingId };
    nodes.push(node);
    return node;
  };
  for (let x = 70; x < worldSpan; x += 150) add('street', x, 0, 's');
  buildings.filter((b) => (b.hp ?? 100) > 0).forEach((b, index) => {
    const cx = b.x + b.w / 2;
    const roof = Math.max(38, b.h + 10);
    const mid = Math.max(20, b.h * 0.52);
    const ledge = Math.max(26, b.h * 0.72);
    add('base', cx, 0, index);
    add('wall', cx, mid * 0.55, index);
    add('window', cx, mid, index);
    add('ledge', cx, ledge, index);
    add('roof', cx, roof, index);
  });
  const link = (a, b) => {
    if (!a || !b || a.id === b.id) return;
    edges.push([a.id, b.id], [b.id, a.id]);
  };
  const streets = nodes.filter((n) => n.type === 'street').sort((a, b) => a.x - b.x);
  for (let i = 0; i < streets.length - 1; i += 1) link(streets[i], streets[i + 1]);
  for (const b of buildings.filter((x) => (x.hp ?? 100) > 0)) {
    const index = buildings.indexOf(b);
    const list = nodes.filter((n) => n.buildingId === index);
    const base = list.find((n) => n.type === 'base');
    const wall = list.find((n) => n.type === 'wall');
    const win = list.find((n) => n.type === 'window');
    const ledge = list.find((n) => n.type === 'ledge');
    const roof = list.find((n) => n.type === 'roof');
    link(base, wall); link(wall, win); link(win, ledge); link(ledge, roof);
    link(base, streets.slice().sort((a, c) => Math.abs(a.x - base.x) - Math.abs(c.x - base.x))[0]);
  }
  const roofs = nodes.filter((n) => n.type === 'roof').sort((a, b) => a.x - b.x);
  for (let i = 0; i < roofs.length - 1; i += 1) if (Math.abs(roofs[i + 1].x - roofs[i].x) < 210) link(roofs[i], roofs[i + 1]);
  return { nodes, edges, byId: Object.fromEntries(nodes.map((n) => [n.id, n])), at: Date.now() };
}

export function nearestGraphNode(graph, x, yOffset = 0, types = null) {
  let pool = graph.nodes.filter((n) => !types || types.includes(n.type));
  if (!pool.length) pool = graph.nodes;
  return pool.slice().sort((a, b) => Math.hypot(a.x - x, (a.yOffset - yOffset) * 1.25) - Math.hypot(b.x - x, (b.yOffset - yOffset) * 1.25))[0];
}

export function graphNeighbors(graph, id) {
  return graph.edges.filter((edge) => edge[0] === id).map((edge) => edge[1]);
}

export function findPath(graph, startId, endId) {
  if (!startId || !endId) return [];
  const queue = [startId];
  const previous = { [startId]: null };
  while (queue.length) {
    const id = queue.shift();
    if (id === endId) break;
    for (const next of graphNeighbors(graph, id)) {
      if (!(next in previous)) {
        previous[next] = id;
        queue.push(next);
      }
    }
  }
  if (!(endId in previous)) return [startId, endId].filter(Boolean);
  const path = [];
  for (let id = endId; id; id = previous[id]) path.unshift(id);
  return path;
}

export function targetTypesForState(state, motionLab) {
  const bio = biomechDerived(motionLab);
  const base = state === 'climb' ? ['wall', 'window', 'ledge', 'roof']
    : state === 'perch' || state === 'restRoof' ? ['roof', 'ledge']
    : state === 'windowWatch' || state === 'inspect' ? ['window', 'ledge']
    : state === 'nest' || state === 'doze' ? ['base', 'roof', 'street']
    : ['street', 'base', 'ledge'];
  const filtered = base.filter((type) => bio.allowedSurfaces.includes(type));
  return filtered.length ? filtered : bio.allowedSurfaces.slice();
}

export function chooseMotionState(motionLab, random = Math.random) {
  const ml = createMotionLab(motionLab);
  const stage = STAGES[ml.stage] || STAGES.mature;
  const bio = biomechDerived(ml);
  const allowed = Object.keys(LOOP_LIBRARY).filter((key) => ml.loopTags[key] !== false && stage.states.includes(key));
  const gaitBoost = {
    creep: bio.gaits.includes('tentacular_crawl') ? 0.65 : 0.18,
    stalk: bio.gaits.includes('cursorial') ? 0.42 : 0.18,
    play: bio.gaits.includes('saltatorial') ? 0.58 : 0.12,
    patrol: bio.gaits.includes('cursorial') ? 0.52 : bio.gaits.includes('hexapedal') ? 0.45 : 0.22,
    perch: bio.gaits.includes('aerial_fast_flutter') ? 0.52 : 0.18,
    nest: bio.gaits.includes('fossorial') ? 0.45 : 0.12,
    inspect: bio.ik > 0.65 ? 0.38 : 0.22,
    doze: bio.fatigue > 0.08 ? 0.50 : 0.12,
    climb: bio.gaits.includes('hexapedal') || bio.gaits.includes('tentacular_crawl') ? 0.62 : 0.16,
    restRoof: bio.gaits.includes('aerial_fast_flutter') ? 0.42 : 0.16,
    windowWatch: bio.gaits.includes('tentacular_crawl') || bio.gaits.includes('aerial_fast_flutter') ? 0.55 : 0.22
  };
  const pool = allowed.map((key) => [key, (gaitBoost[key] || 0.2) + (key === 'stalk' ? ml.pressure.threat * 0.5 : 0) + (key === 'play' ? ml.pressure.novelty * 0.45 : 0) + (key === 'nest' || key === 'doze' ? ml.pressure.comfort * 0.45 : 0)]).filter((item) => item[1] > 0);
  if (!pool.length) return 'patrol';
  let total = pool.reduce((sum, item) => sum + item[1], 0);
  let roll = random() * total;
  for (const [key, weight] of pool) {
    roll -= weight;
    if (roll <= 0) return key;
  }
  return pool[0][0];
}

export function selectGraphPath({ motionLab, motion, graph, petX = 520, reason = 'timer', random = Math.random } = {}) {
  const ml = createMotionLab(motionLab);
  const current = createKaijuMotion(motion);
  const bio = biomechDerived(ml);
  const state = chooseMotionState(ml, random);
  const types = targetTypesForState(state, ml);
  const currentNode = nearestGraphNode(graph, petX, current.yOffset || 0);
  let pool = graph.nodes.filter((node) => types.includes(node.type));
  pool = pool.filter((node) => bio.allowedSurfaces.includes(node.type) || node.type === 'street' || node.type === 'base');
  if (!pool.length) pool = graph.nodes.filter((node) => bio.allowedSurfaces.includes(node.type));
  if (!pool.length) pool = graph.nodes;
  const sig = SPECIES_SIGNATURES[ml.species] || SPECIES_SIGNATURES.void;
  const ranked = pool.map((node) => {
    let weight = (sig.routeBias[node.type] || 0.42) + random() * 0.14;
    if (bio.allowedSurfaces.includes(node.type)) weight += 0.24;
    if (state === 'climb' && ['wall', 'window', 'ledge', 'roof'].includes(node.type)) weight += bio.climbScalar * 0.34;
    if (state === 'patrol' && ['street', 'base'].includes(node.type)) weight += bio.speedScalar * 0.22;
    if (state === 'windowWatch' && node.type === 'window') weight += bio.ik * 0.42;
    if (state === 'restRoof' && node.type === 'roof') weight += bio.contactSettle * 0.22;
    return { node, weight };
  }).sort((a, b) => b.weight - a.weight);
  const dest = (ranked[Math.floor(random() * Math.min(6, ranked.length))] || ranked[0] || { node: currentNode }).node;
  const path = findPath(graph, currentNode?.id, dest?.id);
  return {
    ...current,
    mode: state,
    route: dest?.type || 'street',
    path,
    pathIndex: 0,
    fromNode: currentNode?.id,
    toNode: path[1] || dest?.id || currentNode?.id,
    targetX: dest?.x || petX,
    targetYOffset: dest?.yOffset || 0,
    timer: 4 + random() * 8,
    intent: `${ml.personality} ${LOOP_LIBRARY[state]?.name || state} · ${bio.gaitLabel} → ${dest?.type || 'street'}`,
    label: LOOP_LIBRARY[state]?.name || state,
    bioPhylum: bio.id,
    bioGait: bio.gaitLabel,
    history: [`${new Date().toISOString()} ${reason}: ${state} → ${dest?.type || 'street'}`, ...(current.history || [])].slice(0, 12)
  };
}

export function updateMotion({ dt, motionLab, motion, graph, petX = 520, energy = 80, level = 1, random = Math.random } = {}) {
  const ml = createMotionLab(motionLab);
  let next = createKaijuMotion(motion);
  if (!Array.isArray(next.path) || !next.path.length || !next.toNode || next.timer <= 0) {
    next = selectGraphPath({ motionLab: ml, motion: next, graph, petX, reason: 'timer', random });
  }
  const bio = biomechDerived(ml);
  const sig = SPECIES_SIGNATURES[ml.species] || SPECIES_SIGNATURES.void;
  const stage = STAGES[ml.stage] || STAGES.mature;
  const to = graph.byId[next.toNode] || nearestGraphNode(graph, petX, next.yOffset || 0);
  if (!to) return { motion: next, petX };
  const vertical = Math.abs((to.yOffset || 0) - (next.yOffset || 0)) > 10 || ['wall', 'window'].includes(to.type);
  let x = Number.isFinite(next.x) ? next.x : petX;
  let y = Number.isFinite(next.yOffset) ? next.yOffset : 0;
  const dx = to.x - x;
  const dy = (to.yOffset || 0) - y;
  const dist = Math.max(1, Math.hypot(dx, dy * 1.22));
  const surfacePenalty = (to.type === 'wall' || to.type === 'window') ? (bio.climbScalar * 0.72) : (to.type === 'roof' || to.type === 'ledge') ? (0.78 + bio.contactSettle * 0.18) : 1;
  const baseSpeed = (32 + energy * 0.18) * (stage.speed || 1) * (sig.motion.stride || 0.6) * (ml.physics.pathContinuity || 1) * bio.speedScalar * (0.62 + energy / 220) * surfacePenalty;
  const speed = baseSpeed * Math.max(0.58, 1 - bio.fatigue * (level || 1) * 0.055);
  if (dist < Math.max(3, 5 * bio.ik)) {
    next.pathIndex = (next.pathIndex || 0) + 1;
    next.fromNode = next.toNode;
    next.toNode = next.path[(next.pathIndex || 0) + 1];
    if (!next.toNode) next.timer -= dt;
    next.x = to.x;
    next.yOffset = to.yOffset || 0;
  } else {
    const step = Math.min(dist, speed * dt);
    x += (dx / dist) * step;
    y += (dy / dist) * step * (vertical ? bio.verticalScalar : 0.38);
    if (!vertical && to.type !== 'roof' && to.type !== 'ledge') y *= Math.max(0, 0.90 - bio.contactSettle * 0.06);
    next.x = x;
    next.yOffset = Math.max(0, y);
    next.facing = dx < 0 ? -1 : 1;
    next.step = (next.step || 0) + dt * speed * 0.075 * bio.footLock;
    next.contact = clamp(bio.contactSettle - (vertical ? 0.22 : 0), 0.28, 1.05);
  }
  next.surface = (to.type === 'street' || to.type === 'base') ? 'ground' : to.type;
  next.grounded = ['ground', 'street', 'base', 'roof', 'ledge'].includes(next.surface) || bio.gaits.includes('tentacular_crawl');
  next.action = next.mode;
  next.wallX = to.x;
  next.bioPhylum = bio.id;
  next.bioGait = bio.gaitLabel;
  next.ikPrecision = bio.ik;
  next.cog = bio.cog;
  next.timer -= dt;
  return { motion: next, petX: next.x };
}

export function stageLevel(stageKey) {
  return { egg: 0, larva: 1, adolescent: 4, mature: 8, elderly: 13 }[stageKey] ?? 1;
}

export function generatorSeedRecord({ seed = Date.now() >>> 0, egg = 'ember', stage = 'egg', hatch = false } = {}) {
  const species = egg === 'sprout' ? 'moss' : egg === 'tide' ? 'ghost' : SPECIES_SIGNATURES[egg] ? egg : 'void';
  const biomechPhylum = SPECIES_TO_BIOMECH_PHYLUM[species] || 'chordata_vertebrata';
  return {
    version: RAMPAGEMASTER_MOTION_ENGINE_VERSION,
    seed: seed >>> 0,
    egg,
    species,
    biomechPhylum,
    stage,
    hatched: hatch || stage !== 'egg',
    level: stageLevel(stage),
    createdAt: new Date().toISOString(),
    resetLinked: true
  };
}

export default Object.freeze({
  version: RAMPAGEMASTER_MOTION_ENGINE_VERSION,
  provenance: DRIVE_PROVENANCE,
  speciesSignatures: SPECIES_SIGNATURES,
  stages: STAGES,
  loopLibrary: LOOP_LIBRARY,
  biomechLibrary: BIOMECH_LIBRARY,
  createMotionLab,
  createKaijuMotion,
  biomechDerived,
  buildRouteGraph,
  nearestGraphNode,
  findPath,
  targetTypesForState,
  chooseMotionState,
  selectGraphPath,
  updateMotion,
  generatorSeedRecord
});
