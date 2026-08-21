const u32 = (n) => n >>> 0;
const hex32 = (n) => u32(n).toString(16).padStart(8, '0');

export function hashGenomeString(value = '') {
  let h = 2166136261;
  for (let i = 0; i < String(value).length; i += 1) {
    h ^= String(value).charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  h += h << 13; h ^= h >>> 7; h += h << 3; h ^= h >>> 17; h += h << 5;
  return u32(h);
}

export function createHatchState(seed = {}) {
  return {
    eggId: seed.eggId || 'ember',
    name: seed.name || 'Mochi',
    taps: Array.isArray(seed.taps) ? seed.taps.slice(-3) : [],
    hatched: Boolean(seed.hatched),
    dna: seed.dna || null,
    genomeSeed: seed.genomeSeed ?? null
  };
}

export function seedFromTapPattern({ eggId = 'ember', name = 'Mochi', taps = [], nonce = 0 } = {}) {
  const parts = [eggId, name, Number(nonce) || 0, ...taps.slice(-3).map((tap) => `${Math.round(tap.x || 0)}:${Math.round(tap.y || 0)}:${Math.round(tap.dt || 0)}`)];
  return hashGenomeString(parts.join('|'));
}

export function dnaFromGenomeSeed(seed, { eggId = 'ember', name = 'Mochi' } = {}) {
  const hi = hashGenomeString(`hi${seed}${eggId}`);
  const lo = hashGenomeString(`lo${seed}${name}`);
  return `${hex32(hi)}${hex32(lo)}`;
}

export function genomeUnit(seed, offset = 0) {
  return hashGenomeString(`${seed}:${offset}`) / 0xffffffff;
}

export function recordHatchTap(state, tap, options = {}) {
  if (state.hatched) return { ok: false, reason: 'already-hatched', state };
  if (options.eggId) {
    if (options.eggId !== state.eggId && state.taps.length) state.taps = [];
    state.eggId = options.eggId;
  }
  if (options.name) state.name = options.name;
  state.taps.push({ x: Number(tap?.x || 0), y: Number(tap?.y || 0), dt: Number(tap?.dt || 0) });
  state.taps = state.taps.slice(-3);
  if (state.taps.length < 3) return { ok: true, hatched: false, remaining: 3 - state.taps.length, state };
  const nonce = options.nonce ?? options.now ?? 0;
  const genomeSeed = seedFromTapPattern({ eggId: state.eggId, name: state.name, taps: state.taps, nonce });
  state.genomeSeed = genomeSeed;
  state.dna = dnaFromGenomeSeed(genomeSeed, state);
  state.hatched = true;
  return { ok: true, hatched: true, genomeSeed, dna: state.dna, state };
}

export function chooseEgg(state, eggId) {
  if (state.hatched) return { ok: false, reason: 'already-hatched', eggId: state.eggId };
  state.eggId = eggId;
  state.taps = [];
  return { ok: true, eggId };
}

export function selectCharacterEngineOptions(engine, genomeSeed, { includeInactive = false } = {}) {
  if (!engine?.categories || !engine?.featureOptions) return [];
  const chosen = [];
  const active = engine.featureOptions.filter((option) => includeInactive || String(option.Status || 'ACTIVE').toUpperCase() === 'ACTIVE');
  const byCategory = new Map();
  for (const option of active) {
    if (!byCategory.has(option.CategoryID)) byCategory.set(option.CategoryID, []);
    byCategory.get(option.CategoryID).push(option);
  }
  engine.categories.forEach((category, index) => {
    const options = (byCategory.get(category.CategoryID) || []).sort((a, b) => (Number(a.SortOrder) || 0) - (Number(b.SortOrder) || 0));
    if (!options.length) return;
    const pick = Math.floor(genomeUnit(genomeSeed, index * 97 + 31) * options.length) % options.length;
    chosen.push(options[pick].OptionID);
  });
  return chosen;
}
