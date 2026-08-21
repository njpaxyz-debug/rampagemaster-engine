const clone = (value) => JSON.parse(JSON.stringify(value ?? null));

export function detectRampageStateFormat(input) {
  const raw = input?.state && typeof input.state === 'object' ? input.state : input;
  if (!raw || typeof raw !== 'object') return 'unknown';
  if (String(raw.version || '').startsWith('MASTER_2026_05_09') || (raw.wallet && 'food' in raw && 'joy' in raw && 'clean' in raw)) return 'master20260509';
  if ('bones' in raw && ('petHP' in raw || 'petType' in raw || raw.campaign)) return 'marketV12';
  if (raw.economyProfile && raw.pet && raw.wallet) return 'pilot';
  return 'unknown';
}

function masterSeed(raw) {
  const features = raw.features || null;
  return {
    economyProfile: 'master20260509',
    wallet: clone(raw.wallet || {}),
    pet: {
      hatched: Boolean(raw.hatched), name: raw.name || 'Mochi', level: raw.level ?? 1, xp: raw.xp ?? 0, bond: raw.bond ?? 0,
      food: raw.food ?? 78, joy: raw.joy ?? 70, energy: raw.energy ?? 82, clean: raw.clean ?? 86, health: raw.health ?? 100,
      inventory: clone(raw.inventory || {}), upgrades: clone(raw.upgrades || {}), personality: features?.personality || null
    },
    hatch: { eggId: raw.egg || 'ember', taps: clone(raw.hatchTaps || []), hatched: Boolean(raw.hatched), dna: raw.dna || features?.dna || null, genomeSeed: features?.seed ?? null },
    genome: features ? { seed: features.seed ?? null, dna: raw.dna || features.dna || null, selectedOptions: [], validation: null, legacyFeatures: clone(features) } : null,
    inventory: clone(raw.inventory || {}), upgrades: clone(raw.upgrades || {}), skins: clone(raw.skins || {}), skin: raw.skin || 'base', arcade: clone(raw.arcade || {})
  };
}

function marketSeed(raw, envelope = null) {
  const customMonster = envelope?.customMonster || raw.customMonster || null;
  const warnings = [
    'v12 city saves do not contain the May master food/joy/energy/clean care meters; gameplay-core defaults will fill those fields.',
    'v12 uses the Petrol/Diamond market economy profile rather than the May Fossils/Oil master profile.'
  ];
  return {
    seed: {
      economyProfile: 'marketV12',
      wallet: { bones: raw.bones ?? 0, opal: raw.opal ?? 0, quartz: raw.quartz ?? 0, petrol: raw.petrol ?? 0, diamond: raw.diamond ?? 0 },
      pet: { hatched: true, name: customMonster?.name || raw.petName || 'Migrated Kaiju', health: raw.petHP ?? 100, maxHealth: raw.petMaxHP ?? raw.petHP ?? 100, speciesEvolution: customMonster?.dna?.genus || null, personality: customMonster?.dna?.personality || null },
      hatch: { eggId: customMonster?.dna?.family || 'deployed', taps: [], hatched: true, dna: customMonster?.dna?.code || null, genomeSeed: null },
      genome: customMonster ? { seed: null, dna: customMonster?.dna?.code || null, selectedOptions: [], validation: null, legacyCustomMonster: clone(customMonster) } : null,
      arcade: { wins: raw.arcadeWins ?? 0, streak: raw.arcadeStreak ?? 0, best: raw.arcadeBest ?? 0 },
      campaign: clone(raw.campaign || {}), district: raw.district ?? 0, districtsUnlocked: clone(raw.districtUnlocked || [true]), skins: clone(raw.ownedThemes || {}), skin: raw.activeTheme || 'base'
    },
    warnings
  };
}

export function migrateLegacyRampageState(input) {
  let parsed = input;
  if (typeof input === 'string') {
    try { parsed = JSON.parse(input); }
    catch (error) { return { ok: false, reason: 'invalid-json', error }; }
  }
  const format = detectRampageStateFormat(parsed);
  const raw = parsed?.state && typeof parsed.state === 'object' ? parsed.state : parsed;
  if (format === 'master20260509') {
    return { ok: true, format, seed: masterSeed(raw), warnings: raw.features ? ['Legacy FEATURE_POOLS selections are preserved as legacyFeatures; CharacterEngine option IDs are not fabricated during migration.'] : [] };
  }
  if (format === 'marketV12') {
    const result = marketSeed(raw, parsed?.state ? parsed : null);
    return { ok: true, format, ...result };
  }
  if (format === 'pilot') return { ok: true, format, seed: clone(raw), warnings: [] };
  return { ok: false, reason: 'unknown-format', format };
}
