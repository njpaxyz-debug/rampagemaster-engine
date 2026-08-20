/*
 * CharacterEngine runtime adapter.
 *
 * Source: CharacterEngine_FeatureMap (1).xlsx in Google Drive.
 * The workbook is treated as source metadata, not as proof that every referenced
 * asset/animation exists. Missing source references are preserved and resolved
 * through explicit fallbacks rather than invented data.
 */

const DATA_FILES = Object.freeze({
  categories: '../data/character-engine/categories.json',
  featureOptions: Object.freeze([
    '../data/character-engine/feature-options-1.json',
    '../data/character-engine/feature-options-2.json',
    '../data/character-engine/feature-options-3.json'
  ]),
  compatibilityRules: '../data/character-engine/compatibility-rules.json',
  colorPalettes: '../data/character-engine/color-palettes.json',
  animationMeta: '../data/character-engine/animation-meta.json',
  poses: '../data/character-engine/poses.json',
  assetRegistry: '../data/character-engine/asset-registry.json',
  validation: '../data/character-engine/validation.json'
});

export const CHARACTER_ENGINE_SOURCE = Object.freeze({
  title: 'CharacterEngine_FeatureMap (1).xlsx',
  driveId: '1IU0QpVvrH_cfvGMN0It4_xOd_ttUfYxG'
});

export const DEFAULT_ANIMATION_CLIPS = Object.freeze({
  idle: 'idle_stand',
  walk: 'walk_cycle',
  talk: 'talk_mouth_open',
  action: 'action_generic'
});

const LANE_FIELDS = Object.freeze({
  idle: 'AnimClip_Idle',
  walk: 'AnimClip_Walk',
  talk: 'AnimClip_Talk',
  action: 'AnimClip_Action'
});

function indexBy(rows = [], key) {
  return new Map(rows.filter(Boolean).map((row) => [row[key], row]));
}

async function readJson(relativePath, fetchImpl = fetch) {
  const response = await fetchImpl(new URL(relativePath, import.meta.url));
  if (!response.ok) throw new Error(`CharacterEngine data load failed: ${relativePath} (${response.status})`);
  return response.json();
}

export async function loadCharacterEngine(options = {}) {
  const fetchImpl = options.fetchImpl || fetch;
  const [
    categories,
    featureOptions1,
    featureOptions2,
    featureOptions3,
    compatibilityRules,
    colorPalettes,
    animationMeta,
    poses,
    assetRegistry,
    validation
  ] = await Promise.all([
    readJson(DATA_FILES.categories, fetchImpl),
    readJson(DATA_FILES.featureOptions[0], fetchImpl),
    readJson(DATA_FILES.featureOptions[1], fetchImpl),
    readJson(DATA_FILES.featureOptions[2], fetchImpl),
    readJson(DATA_FILES.compatibilityRules, fetchImpl),
    readJson(DATA_FILES.colorPalettes, fetchImpl),
    readJson(DATA_FILES.animationMeta, fetchImpl),
    readJson(DATA_FILES.poses, fetchImpl),
    readJson(DATA_FILES.assetRegistry, fetchImpl),
    readJson(DATA_FILES.validation, fetchImpl)
  ]);

  return buildCharacterEngine({
    categories: categories.categories,
    featureOptions: [
      ...featureOptions1.featureOptions,
      ...featureOptions2.featureOptions,
      ...featureOptions3.featureOptions
    ],
    compatibilityRules: compatibilityRules.compatibilityRules,
    colorPalettes: colorPalettes.colorPalettes,
    animationMeta: animationMeta.animationMeta,
    poses: poses.poses,
    assetRegistry: assetRegistry.assetRegistry,
    validation: validation.validation,
    source: categories.source || CHARACTER_ENGINE_SOURCE
  });
}

export function buildCharacterEngine(raw = {}) {
  const categories = raw.categories || [];
  const featureOptions = raw.featureOptions || [];
  const compatibilityRules = raw.compatibilityRules || [];
  const colorPalettes = raw.colorPalettes || [];
  const animationMeta = raw.animationMeta || [];
  const poses = raw.poses || [];
  const assetRegistry = raw.assetRegistry || [];

  const categoriesById = indexBy(categories, 'CategoryID');
  const optionsById = indexBy(featureOptions, 'OptionID');
  const clipsById = indexBy(animationMeta, 'AnimClipID');
  const posesById = indexBy(poses, 'PoseID');
  const assetsById = indexBy(assetRegistry, 'AssetID');

  const optionsByCategory = new Map();
  for (const option of featureOptions) {
    const bucket = optionsByCategory.get(option.CategoryID) || [];
    bucket.push(option);
    optionsByCategory.set(option.CategoryID, bucket);
  }
  for (const bucket of optionsByCategory.values()) {
    bucket.sort((a, b) => (a.SortOrder ?? 999) - (b.SortOrder ?? 999));
  }

  const palettesById = new Map();
  for (const row of colorPalettes) {
    const bucket = palettesById.get(row.PaletteID) || [];
    bucket.push(row);
    palettesById.set(row.PaletteID, bucket);
  }

  const assetsByOption = new Map();
  for (const asset of assetRegistry) {
    const bucket = assetsByOption.get(asset.LinkedOptionID) || [];
    bucket.push(asset);
    assetsByOption.set(asset.LinkedOptionID, bucket);
  }

  return Object.freeze({
    source: raw.source || CHARACTER_ENGINE_SOURCE,
    validation: raw.validation || null,
    categories,
    featureOptions,
    compatibilityRules,
    colorPalettes,
    animationMeta,
    poses,
    assetRegistry,
    categoriesById,
    optionsById,
    clipsById,
    posesById,
    assetsById,
    optionsByCategory,
    palettesById,
    assetsByOption
  });
}

export function getOptionsForCategory(engine, categoryId, options = {}) {
  const rows = engine?.optionsByCategory?.get(categoryId) || [];
  if (options.includeInactive) return [...rows];
  return rows.filter((row) => row.Status === 'ACTIVE');
}

export function resolveOptionAnimation(engine, optionId, lane = 'idle') {
  const normalizedLane = String(lane || 'idle').toLowerCase();
  const field = LANE_FIELDS[normalizedLane] || LANE_FIELDS.idle;
  const option = engine?.optionsById?.get(optionId) || null;
  const requested = option?.[field] || 'none';

  if (requested === 'none' || engine?.clipsById?.has(requested)) {
    return Object.freeze({ requested, resolved: requested, missing: false, fallback: false });
  }

  const preferredFallback = DEFAULT_ANIMATION_CLIPS[normalizedLane] || 'none';
  const resolved = engine?.clipsById?.has(preferredFallback) ? preferredFallback : 'none';
  return Object.freeze({ requested, resolved, missing: true, fallback: true });
}

export function resolvePalette(engine, paletteId) {
  const rows = engine?.palettesById?.get(paletteId);
  if (rows?.length) {
    return Object.freeze({ requested: paletteId, resolved: paletteId, rows: [...rows], missing: false });
  }
  const fallbackRows = engine?.palettesById?.get('PAL_NONE') || [];
  return Object.freeze({ requested: paletteId, resolved: 'PAL_NONE', rows: [...fallbackRows], missing: true });
}

export function getAssetMetadataForOption(engine, optionId) {
  return [...(engine?.assetsByOption?.get(optionId) || [])];
}

export function validateSelection(engine, selectedOptionIds = []) {
  const selected = new Set(selectedOptionIds.filter(Boolean));
  const unknownOptions = [...selected].filter((id) => !engine?.optionsById?.has(id));
  const conflicts = [];
  const suggestions = [];
  const requireGroups = new Map();

  for (const rule of engine?.compatibilityRules || []) {
    const aSelected = selected.has(rule.OptionID_A);
    const bSelected = selected.has(rule.OptionID_B);

    if (rule.RuleType === 'CONFLICT' && aSelected && bSelected) {
      conflicts.push(rule);
    } else if (rule.RuleType === 'SUGGEST' && aSelected && !bSelected) {
      suggestions.push(rule);
    } else if (rule.RuleType === 'REQUIRE') {
      const bucket = requireGroups.get(rule.OptionID_A) || [];
      bucket.push(rule);
      requireGroups.set(rule.OptionID_A, bucket);
    }
  }

  const missingRequirements = [];
  for (const [optionId, rules] of requireGroups) {
    if (!selected.has(optionId)) continue;
    // Multiple REQUIRE rows for one option are alternatives unless source data
    // explicitly introduces a separate requirement group. Example: red tie can
    // be anchored by the white OR gray lab coat, not both simultaneously.
    const satisfied = rules.some((rule) => selected.has(rule.OptionID_B));
    if (!satisfied) {
      missingRequirements.push(Object.freeze({
        optionId,
        anyOf: rules.map((rule) => rule.OptionID_B),
        rules: [...rules]
      }));
    }
  }

  // Enforce category-level exclusivity independently from explicit rules.
  const categorySelections = new Map();
  for (const optionId of selected) {
    const option = engine?.optionsById?.get(optionId);
    if (!option) continue;
    const category = engine?.categoriesById?.get(option.CategoryID);
    if (!category?.MutuallyExclusive) continue;
    const bucket = categorySelections.get(option.CategoryID) || [];
    bucket.push(optionId);
    categorySelections.set(option.CategoryID, bucket);
  }
  const exclusiveCategoryViolations = [...categorySelections.entries()]
    .filter(([, ids]) => ids.length > 1)
    .map(([categoryId, optionIds]) => ({ categoryId, optionIds }));

  return Object.freeze({
    valid:
      unknownOptions.length === 0 &&
      conflicts.length === 0 &&
      missingRequirements.length === 0 &&
      exclusiveCategoryViolations.length === 0,
    unknownOptions,
    conflicts,
    missingRequirements,
    exclusiveCategoryViolations,
    suggestions
  });
}

export function characterEngineSummary(engine) {
  return Object.freeze({
    categories: engine?.categories?.length || 0,
    featureOptions: engine?.featureOptions?.length || 0,
    compatibilityRules: engine?.compatibilityRules?.length || 0,
    palettes: engine?.colorPalettes?.length || 0,
    animationClips: engine?.animationMeta?.length || 0,
    poses: engine?.poses?.length || 0,
    assets: engine?.assetRegistry?.length || 0,
    sourceIssues: engine?.validation?.issueCount || 0
  });
}
