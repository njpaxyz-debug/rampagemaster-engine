export const ECONOMY_PROFILES = Object.freeze({
  master20260509: Object.freeze({
    id: 'master20260509',
    currencies: Object.freeze(['bones', 'opal', 'quartz', 'fossils', 'oil']),
    routes: Object.freeze([
      Object.freeze({ id: 'bo', from: 'bones', to: 'opal', cost: 100, out: 1 }),
      Object.freeze({ id: 'oq', from: 'opal', to: 'quartz', cost: 25, out: 1 }),
      Object.freeze({ id: 'qf', from: 'quartz', to: 'fossils', cost: 10, out: 1 }),
      Object.freeze({ id: 'fo', from: 'fossils', to: 'oil', cost: 5, out: 1 })
    ])
  }),
  marketV12: Object.freeze({
    id: 'marketV12',
    currencies: Object.freeze(['bones', 'opal', 'quartz', 'petrol', 'diamond']),
    routes: Object.freeze([
      Object.freeze({ id: 'bo', from: 'bones', to: 'opal', cost: 100, out: 1 }),
      Object.freeze({ id: 'oq', from: 'opal', to: 'quartz', cost: 50, out: 1 }),
      Object.freeze({ id: 'qp', from: 'quartz', to: 'petrol', cost: 25, out: 1 }),
      Object.freeze({ id: 'pd', from: 'petrol', to: 'diamond', cost: 10, out: 1 })
    ])
  })
});

export const MASTER_SHOP = Object.freeze([
  Object.freeze({ id: 'snack', type: 'item', name: 'Snack Cache', price: Object.freeze({ bones: 45 }), qty: 3 }),
  Object.freeze({ id: 'toy', type: 'item', name: 'Street Toy', price: Object.freeze({ bones: 65 }), qty: 2 }),
  Object.freeze({ id: 'soap', type: 'item', name: 'Clean Kit', price: Object.freeze({ bones: 35 }), qty: 2 }),
  Object.freeze({ id: 'bait', type: 'item', name: 'Citizen Bait', price: Object.freeze({ bones: 80 }), qty: 1 }),
  Object.freeze({ id: 'metro', type: 'upgrade', name: 'Metro Pass', price: Object.freeze({ opal: 2 }) }),
  Object.freeze({ id: 'bed', type: 'upgrade', name: 'Comfy Lair', price: Object.freeze({ opal: 3 }) }),
  Object.freeze({ id: 'lucky', type: 'upgrade', name: 'Lucky Gut', price: Object.freeze({ quartz: 1 }) }),
  Object.freeze({ id: 'vault', type: 'upgrade', name: 'Vault Key', price: Object.freeze({ quartz: 2 }) }),
  Object.freeze({ id: 'skin_neon', type: 'skin', name: 'Neon City Skin', price: Object.freeze({ opal: 4 }) }),
  Object.freeze({ id: 'relic', type: 'item', name: 'Fossil Relic', price: Object.freeze({ fossils: 1 }), qty: 1 })
]);

export function getEconomyProfile(profile = 'master20260509') {
  const resolved = typeof profile === 'string' ? ECONOMY_PROFILES[profile] : profile;
  if (!resolved) throw new Error(`Unknown economy profile: ${profile}`);
  return resolved;
}

export function createProgressionWallet(profile = 'master20260509', seed = {}) {
  const p = getEconomyProfile(profile);
  const wallet = {};
  p.currencies.forEach((currency) => { wallet[currency] = Math.max(0, Math.floor(seed[currency] || 0)); });
  Object.defineProperty(wallet, '__profile', { value: p.id, enumerable: false, configurable: true });
  return wallet;
}

export function convertProgressionCurrency(wallet, routeId, count = 1, { profile = null, vaultDiscount = false } = {}) {
  const p = getEconomyProfile(profile || wallet?.__profile || 'master20260509');
  const route = p.routes.find((item) => item.id === routeId || item.from === routeId);
  if (!route) return { ok: false, reason: 'unknown-route' };
  const units = Math.max(1, Math.floor(count || 1));
  const unitCost = Math.max(1, Math.floor(route.cost * (vaultDiscount ? 0.88 : 1)));
  const totalCost = unitCost * units;
  if ((wallet[route.from] || 0) < totalCost) return { ok: false, reason: 'insufficient-funds', need: totalCost, currency: route.from };
  wallet[route.from] -= totalCost;
  wallet[route.to] = (wallet[route.to] || 0) + route.out * units;
  return { ok: true, profile: p.id, from: route.from, to: route.to, spent: totalCost, gained: route.out * units, unitCost, units };
}

export function canAfford(wallet, price = {}) {
  return Object.entries(price).every(([currency, amount]) => (wallet[currency] || 0) >= amount);
}

export function purchaseMasterShopItem(state, itemId) {
  const item = MASTER_SHOP.find((entry) => entry.id === itemId);
  if (!item) return { ok: false, reason: 'unknown-item', itemId };
  if (item.type === 'upgrade' && state.upgrades?.[itemId]) return { ok: false, reason: 'already-owned', itemId };
  if (item.type === 'skin' && state.skins?.[itemId]) return { ok: false, reason: 'already-owned', itemId };
  if (!canAfford(state.wallet, item.price)) return { ok: false, reason: 'insufficient-funds', price: item.price };
  for (const [currency, amount] of Object.entries(item.price)) state.wallet[currency] -= amount;
  if (item.type === 'item') {
    state.inventory = state.inventory || {};
    state.inventory[itemId] = (state.inventory[itemId] || 0) + (item.qty || 1);
  } else if (item.type === 'upgrade') {
    state.upgrades = state.upgrades || {};
    state.upgrades[itemId] = true;
  } else if (item.type === 'skin') {
    state.skins = state.skins || {};
    state.skins[itemId] = true;
    state.skin = itemId;
  }
  return { ok: true, item };
}
