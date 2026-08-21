/*
 * RampageMaster best-source module registry.
 *
 * This is not runtime rendering code. It is the integration map that prevents
 * older experiments from competing with newer modules. Each source lane has a
 * clear job and an active adapter path in src/.
 */

export const BEST_SOURCE_REGISTRY = Object.freeze({
  superiorComponents: {
    activeAdapter: 'docs/HIRES_MODULE_CONNECTIONS.md',
    bestSource: 'RAMPAGEMASTER SUPERIOR COMPONENTS',
    driveId: '1WcgbvSCBxpmhfv7u9fMkQhxmXpcm1rUb7R_y3WUJTPo',
    rank: 0,
    reason: 'Authoritative product direction: stop layering disconnected scripts; route best lanes through a unified data model.'
  },
  animation: {
    activeAdapter: 'src/animation/index.js',
    bestSource: 'rampagemaster_biomech_generator_v7_6_3.html',
    driveId: '1FqjDWhYgcEurfq9r4-Nxp5JJRSTK-3h5',
    rank: 1,
    reason: 'Highest versioned biomechanical locomotion, route graph, gait, and pose logic.'
  },
  characterEngine: {
    activeAdapter: 'src/modules/characterEngine.js',
    bestSource: 'CharacterEngine_FeatureMap (1).xlsx',
    driveId: '1IU0QpVvrH_cfvGMN0It4_xOd_ttUfYxG',
    rank: 2,
    reason: 'Canonical feature categories, option metadata, compatibility rules, palettes, pose library, animation metadata, and asset registry migrated to lazy JSON.'
  },
  petAndHatchProgression: {
    activeAdapter: 'src/modules/gameplayCore.js',
    bestSource: 'rampagemaster_master_v1.html',
    driveId: '12_hVI3EJqE1ualFoYginxtVqFCszscpo',
    rank: 3,
    reason: 'Canonical three-tap hatch, care actions, needs, XP, bond, stage progression, inventory effects, and master shop behavior; obsolete embedded feature pools are replaced by CharacterEngine.'
  },
  economyProfiles: {
    activeAdapter: 'src/modules/economyProgression.js',
    bestSource: 'rampagemaster_master_v1.html + RampageMaster_DEPLOYMENT_DEFINITIVE_v12.html',
    driveId: '12_hVI3EJqE1ualFoYginxtVqFCszscpo',
    rank: 4,
    reason: 'Preserves conflicting sourced economies as explicit profiles instead of merging them: Master uses Fossils/Oil; later market builds use Petrol/Diamond.'
  },
  marketArcadeProgression: {
    activeAdapter: 'src/modules/arcadeProgression.js',
    bestSource: 'RampageMaster_DEPLOYMENT_DEFINITIVE_v12.html',
    driveId: '13dOkLcpyijTDPNeDcIdSfud_7oyKTczf',
    rank: 5,
    reason: 'Best connected arcade loop: free/basic/premium entry, five-second rounds, progressive spawn speed, streak persistence, boss payouts, and shared-wallet rewards.'
  },
  campaignProgression: {
    activeAdapter: 'src/modules/campaignProgression.js',
    bestSource: 'RampageMaster_DEPLOYMENT_DEFINITIVE_v12.html',
    driveId: '13dOkLcpyijTDPNeDcIdSfud_7oyKTczf',
    rank: 6,
    reason: 'Preserves authored five-mission campaign rotation, district/cycle scaling, combo scoring, rank XP, mission payouts, and district unlock cadence as testable state logic.'
  },
  persistence: {
    activeAdapter: 'src/modules/persistence.js',
    bestSource: 'rampagemaster_master_v1.html + RampageMaster_DEPLOYMENT_DEFINITIVE_v12.html',
    driveId: '12_hVI3EJqE1ualFoYginxtVqFCszscpo',
    rank: 7,
    reason: 'Unifies local save behavior with later import/export workflows behind a versioned, testable storage adapter with memory fallback.'
  },
  legacyStateMigration: {
    activeAdapter: 'src/modules/legacyStateMigration.js',
    bestSource: 'rampagemaster_master_v1.html + RampageMaster_DEPLOYMENT_DEFINITIVE_v12.html',
    driveId: '12_hVI3EJqE1ualFoYginxtVqFCszscpo',
    rank: 8,
    reason: 'Imports both major historical save schemas without inventing CharacterEngine IDs or pretending missing v12 care meters existed.'
  },
  spritePoseAssets: {
    activeAdapter: 'src/animation/driveSpriteSheetAnimator.js',
    bestSource: 'reptile scientist canva sprite sheet.jpg.png + CharacterEngine_FeatureMap',
    driveId: '1IU0QpVvrH_cfvGMN0It4_xOd_ttUfYxG',
    rank: 9,
    reason: 'Grounded six-pose Drive sprite source; pose semantics are mapped without inventing nonexistent atlas frames.'
  },
  directDeployment: {
    activeAdapter: 'src/modules/directCityDeployment.js',
    bestSource: 'RampageMaster_DEPLOYMENT_DEFINITIVE_v12.html',
    driveId: '13dOkLcpyijTDPNeDcIdSfud_7oyKTczf',
    rank: 10,
    reason: 'Best deployment contract: wait for the live city API, install directly, require ready=true, and surface explicit failure.'
  },
  proportions: {
    activeAdapter: 'src/modules/visualHighRes.js',
    bestSource: 'rampagemaster_admin_proportions_v7_1.html',
    driveId: '1LlZb_uVybuPpu-zZ1iXl2cIw2sLKwUwp',
    rank: 11,
    reason: 'Best proportions/admin checkpoint for scale, body mass, and readable monster silhouette.'
  },
  architectureGameplay: {
    activeAdapter: 'src/modules/cityHighRes.js',
    bestSource: 'rampagemaster_unified_architecture_gameplay_v6_1.html',
    driveId: '1epm_W9g2cR5mML1VQIKovHotZyKIcdyo',
    rank: 12,
    reason: 'Best gameplay-facing city loop: building damage, crumbling, regeneration, and skyline interaction.'
  },
  skyline: {
    activeAdapter: 'src/modules/cityHighRes.js',
    bestSource: 'rampagemaster_skyline_intelligence_v5.html',
    driveId: '17W7AclrcISBdEpcEwmedw38K4Z1JY7MP',
    rank: 13,
    reason: 'Best skyline intelligence lane for layered city silhouettes, geography, time-of-day, and environment cues.'
  },
  architectureSkins: {
    activeAdapter: 'src/modules/themePacks.js',
    bestSource: 'rampagemaster_architecture_skins_v4.html',
    driveId: '1SeHD2boJoZexcqA3LZw2Ow0Zd7omlTC5',
    rank: 14,
    reason: 'Best skin/theme package source for materials, palettes, windows, sculpture, flora, and fauna.'
  },
  uxTheme: {
    activeAdapter: 'src/index.modular.html',
    bestSource: 'rampagemaster_ux_theme_v3.html',
    driveId: '1DILKs2N860Wi0Qw5b-8qALCmyZsk_Clr',
    rank: 15,
    reason: 'Best UI wrapper lane for compact playable shell and themed arcade-like presentation.'
  },
  campaignEncounters: {
    activeAdapter: 'src/campaignEncounterBridge.js',
    bestSource: 'RampageMaster_DEPLOYMENT_DEFINITIVE_v12.html · embedded city RM3/RM8',
    driveId: '13dOkLcpyijTDPNeDcIdSfud_7oyKTczf',
    rank: 16,
    reason: 'Restores source response drones/tanks, HP scaling, kill scoring, pickups, threat pressure and command-tower boss scaling while retaining the later RM8 non-damaging decorative response-fire safety behavior.'
  },
  liveCitizenFeeding: {
    activeAdapter: 'src/citizenGameplayBridge.js',
    bestSource: 'rampagemaster_master_v1.html + RampageMaster_DEPLOYMENT_DEFINITIVE_v12.html',
    driveId: '13dOkLcpyijTDPNeDcIdSfud_7oyKTczf',
    rank: 17,
    reason: 'Connects the Master consume-care effects to actual high-res citizens and the later campaign FEED CHAIN scoring/progress contract, including source-scale delayed citizen respawn.'
  }
});

export function getActiveModuleAdapters() {
  return Object.values(BEST_SOURCE_REGISTRY)
    .sort((a, b) => a.rank - b.rank)
    .map((entry) => entry.activeAdapter)
    .filter((path, index, all) => all.indexOf(path) === index);
}

export function getSourceLineage() {
  return Object.entries(BEST_SOURCE_REGISTRY).map(([slot, entry]) => ({
    slot,
    source: entry.bestSource,
    driveId: entry.driveId,
    adapter: entry.activeAdapter,
    reason: entry.reason
  }));
}
