// RampageMASTER source-integrated adapter v1
// This repo checkpoint intentionally contains only glue/adapter structure.
// The full extracted source-integrated module is in the downloadable package produced in ChatGPT.
// No invented taxonomy, gene expansion, or new archetype lists are introduced here.

export const SOURCE_PROVENANCE = Object.freeze({
  taxonomyEngine: 'EXPANDED TAXONOMY AGINGV5.4.html / ExpandedTaxonomyV54',
  facialEngine: 'Kaiju Facial Anatomy CoreV8.1.html / KaijuFaceAnatomyCoreV81',
  idleMotionData: 'kaiju_idle_personality_sandbox_v5.html / SPECIES, PERSONALITIES, ENVIRONMENTS, STAGES, MOTION, LOOP_LIBRARY',
  adapter: 'glue only; no new taxonomy categories'
});

export const INTEGRATION_CONTRACT = Object.freeze({
  rule: 'renderer reads existing phenotype/taxonomy/face/motion outputs; renderer does not invent anatomy',
  outputs: [
    'id',
    'name',
    'genome64',
    'stage',
    'taxonomy',
    'baseForm',
    'skin',
    'anatomy',
    'systems',
    'field',
    'face',
    'motion',
    'events',
    'warnings'
  ],
  sourceFunctions: [
    'ExpandedTaxonomyV54.make',
    'ExpandedTaxonomyV54.advance',
    'ExpandedTaxonomyV54.recombine',
    'ExpandedTaxonomyV54.phenotype',
    'ExpandedTaxonomyV54.deriveTaxonomy',
    'ExpandedTaxonomyV54.faceMarkers',
    'ExpandedTaxonomyV54.release',
    'KaijuFaceAnatomyCoreV81.defaultSelection',
    'KaijuFaceAnatomyCoreV81.computePhenotype',
    'Idle LOOP_LIBRARY selection from kaiju_idle_personality_sandbox_v5.html'
  ]
});

export function assertSourceApis(globalObject = globalThis) {
  const missing = [];
  if (!globalObject.ExpandedTaxonomyV54) missing.push('ExpandedTaxonomyV54');
  if (!globalObject.KaijuFaceAnatomyCoreV81) missing.push('KaijuFaceAnatomyCoreV81');
  return { ok: missing.length === 0, missing };
}

export function deriveRendererPacketFromSourceApis(specimen, sourceApis) {
  const V54 = sourceApis.ExpandedTaxonomyV54;
  const FACE = sourceApis.KaijuFaceAnatomyCoreV81;
  if (!V54 || !FACE) throw new Error('Missing source APIs: ExpandedTaxonomyV54 and KaijuFaceAnatomyCoreV81 are required.');
  V54.sync(specimen, 'renderer-packet');
  const ph = V54.phenotype(specimen);
  const tx = ph.taxonomy || V54.deriveTaxonomy(specimen);
  const selection = FACE.defaultSelection();
  const kingdomMap = { animalia:'animalia', arthropoda:'animalia', fungalia:'fungal', botanica:'plantimal', mineralis:'synthetic', plasmic:'protist', hybrid:'protist' };
  const phylumMap = { arthropoid:'arthropoda', cephalopoid:'mollusca', ichthyoid:'chordata', tetrapod:'chordata', serpentine:'chordata', volucrid:'chordata', mycelial:'fungal', sporeling:'fungal', lichenic:'fungal' };
  selection.kingdom = kingdomMap[tx.kingdom] || 'animalia';
  selection.phylum = phylumMap[tx.phylum] || 'chordata';
  selection.personality = ph.face?.tags?.includes('feral') ? 'aggressive' : ph.face?.tags?.includes('sleepy') ? 'timid' : ph.face?.tags?.includes('social') ? 'curious' : 'neutral';
  selection.eyeMode = ph.eyes > .78 ? 'multiple' : 'paired';
  selection.expression = ph.face?.tags?.includes('feral') ? 'snarl' : ph.face?.tags?.includes('sleepy') ? 'sleepy' : ph.face?.tags?.includes('vigilant') ? 'alert' : 'neutral';
  const facePhenotype = FACE.computePhenotype(selection);
  return {
    id: specimen.id,
    name: specimen.name,
    genome64: V54.encode64(specimen.genome),
    source: SOURCE_PROVENANCE,
    stage: { id: specimen.stage, label: ph.label, ageMinutes: specimen.ageMinutes, stability: specimen.stability },
    taxonomy: tx,
    baseForm: ph.baseForm,
    skin: { package: specimen.skinPackage, colors: ph.skinColors, glow: ph.glow, armor: ph.armor, texture: ph.texture },
    anatomy: { scale: ph.scale, radial: ph.radial || 0, tail: ph.tail, limbs: ph.limbs, wings: ph.wings, horns: ph.horns, jaw: ph.jaw, eyes: ph.eyes, ageMarks: ph.ageMarks },
    systems: ph.systems,
    field: ph.field,
    face: { markers: ph.face, selection, phenotype: facePhenotype },
    motion: { track: ph.track, currentLoop: specimen.personality?.loop },
    events: specimen.events || [],
    warnings: []
  };
}
