export const THEME_PACKS = Object.freeze([
  {
    id: 'metroGlass',
    name: 'Metro Glass Prime',
    tier: 1,
    palette: {
      skyTop: '#17244c',
      skyMid: '#081426',
      ground: '#07070d',
      building: '#101828',
      buildingAlt: '#17223a',
      trim: '#00d4ff',
      window: '#9ee8ff',
      accent: '#39ff14',
      danger: '#ff4f7a'
    },
    architecture: ['curtain-wall towers', 'rooftop antennas', 'neon signs', 'stacked balconies'],
    detail: ['lit office grids', 'water towers', 'street steam', 'tiny rooftop gardens'],
    flora: ['planter boxes', 'median trees'],
    fauna: ['pigeons', 'stray cats'],
    epigeneticEffects: { curiosity: 0.06, agility: 0.03, anxiety: 0.04 },
    unlock: { currency: 'bones', amount: 0 }
  },
  {
    id: 'brickworks',
    name: 'Brickworks Row',
    tier: 2,
    palette: {
      skyTop: '#322244',
      skyMid: '#151020',
      ground: '#0c0705',
      building: '#28150e',
      buildingAlt: '#4c2418',
      trim: '#a04d2c',
      window: '#ffd76b',
      accent: '#ff9f43',
      danger: '#ff4f7a'
    },
    architecture: ['rowhome cornices', 'arched windows', 'fire escapes', 'stoops'],
    detail: ['flower pots', 'laundry lines', 'awning stripes', 'brick crack decals'],
    flora: ['stoop planters', 'ivy walls'],
    fauna: ['sparrows', 'alley raccoons'],
    epigeneticEffects: { bravery: 0.04, hunger: 0.03, attachment: 0.05 },
    unlock: { currency: 'opal', amount: 1 }
  },
  {
    id: 'harborIndustrial',
    name: 'Harbor Industrial',
    tier: 3,
    palette: {
      skyTop: '#07101d',
      skyMid: '#263449',
      ground: '#07090a',
      building: '#151923',
      buildingAlt: '#2b3037',
      trim: '#6b7280',
      window: '#9ca3af',
      accent: '#ffd76b',
      danger: '#ff7c4f'
    },
    architecture: ['warehouses', 'cranes', 'smokestacks', 'container stacks'],
    detail: ['warning lights', 'rolling doors', 'catwalks', 'patched concrete'],
    flora: ['dock weeds', 'salt grass'],
    fauna: ['gulls', 'rats'],
    epigeneticEffects: { bulk: 0.05, aggression: 0.04, armor: 0.04 },
    unlock: { currency: 'opal', amount: 2 }
  },
  {
    id: 'royalStone',
    name: 'Royal Stone Quarter',
    tier: 3,
    palette: {
      skyTop: '#26105c',
      skyMid: '#3a1d58',
      ground: '#08070c',
      building: '#232323',
      buildingAlt: '#3b3530',
      trim: '#a8a29e',
      window: '#e7e5e4',
      accent: '#ffd76b',
      danger: '#ff4f7a'
    },
    architecture: ['museums', 'clock towers', 'columns', 'stone arches'],
    detail: ['statues', 'banners', 'fountain spray', 'stained glass'],
    flora: ['formal hedges', 'cypress planters'],
    fauna: ['owls', 'fountain birds'],
    epigeneticEffects: { majesty: 0.08, patience: 0.04, terror: 0.03 },
    unlock: { currency: 'quartz', amount: 1 }
  },
  {
    id: 'sunsetStucco',
    name: 'Sunset Stucco Strip',
    tier: 4,
    palette: {
      skyTop: '#ff6b35',
      skyMid: '#321c43',
      ground: '#0c0610',
      building: '#2a2016',
      buildingAlt: '#5b3522',
      trim: '#d4a870',
      window: '#ffd76b',
      accent: '#00d4ff',
      danger: '#ff4f7a'
    },
    architecture: ['stucco arcades', 'rounded hotels', 'billboards', 'theater marquees'],
    detail: ['palm silhouettes', 'colored awnings', 'lit signs', 'balcony rails'],
    flora: ['palms', 'succulents'],
    fauna: ['parrots', 'street dogs'],
    epigeneticEffects: { glamour: 0.06, confidence: 0.05, heat: 0.04 },
    unlock: { currency: 'quartz', amount: 2 }
  },
  {
    id: 'toxicGarden',
    name: 'Toxic Garden District',
    tier: 5,
    palette: {
      skyTop: '#163820',
      skyMid: '#07180e',
      ground: '#050905',
      building: '#18231b',
      buildingAlt: '#263529',
      trim: '#39ff14',
      window: '#caffbf',
      accent: '#b06cff',
      danger: '#ff4f7a'
    },
    architecture: ['greenhouses', 'overgrown towers', 'bio-domes', 'root-wrapped blocks'],
    detail: ['vines', 'glowing spores', 'broken skylights', 'pond reflections'],
    flora: ['giant ferns', 'bioluminescent moss'],
    fauna: ['moths', 'frogs'],
    epigeneticEffects: { regen: 0.08, weird: 0.05, slime: 0.05 },
    unlock: { currency: 'diamond', amount: 1 }
  }
]);

export function getThemePack(id = 'metroGlass') {
  return THEME_PACKS.find((theme) => theme.id === id) || THEME_PACKS[0];
}

export function applyThemeToDocument(theme, root = document.documentElement) {
  const p = theme.palette;
  root.style.setProperty('--themeSky', p.skyTop);
  root.style.setProperty('--themeMid', p.skyMid);
  root.style.setProperty('--themeAccent', p.accent);
  root.style.setProperty('--themeGold', p.window);
}

export function resolveThemeProgression(wallet = {}) {
  return THEME_PACKS.map((theme) => {
    const { currency, amount } = theme.unlock;
    const owned = currency === 'bones' ? true : (wallet[currency] || 0) >= amount;
    return { ...theme, owned };
  });
}
