import { ECONOMY_PROFILES } from './economyProgression.js';

const MASTER_ROUTES = ECONOMY_PROFILES.master20260509.routes;
const routeFrom = (currencyId) => MASTER_ROUTES.find((route) => route.from === currencyId) || null;

export const CURRENCY_LADDER = Object.freeze([
  { id: 'bones', label: 'Bones', symbol: '◆', rateToNext: routeFrom('bones')?.cost ?? 100 },
  { id: 'opal', label: 'Opal', symbol: '◇', rateToNext: routeFrom('opal')?.cost ?? 25 },
  { id: 'quartz', label: 'Quartz', symbol: '⬡', rateToNext: routeFrom('quartz')?.cost ?? 10 },
  { id: 'fossils', label: 'Fossils', symbol: '◌', rateToNext: routeFrom('fossils')?.cost ?? 5 },
  { id: 'oil', label: 'Oil', symbol: '◈', rateToNext: null }
]);

export function createWallet(seed = {}) {
  return {
    bones: seed.bones ?? 240,
    opal: seed.opal ?? 0,
    quartz: seed.quartz ?? 0,
    fossils: seed.fossils ?? 0,
    oil: seed.oil ?? 0,
    tokens: seed.tokens ?? 0,
    lifetimeBones: seed.lifetimeBones ?? 0
  };
}

export function awardCityValue(wallet, building, multiplier = 1) {
  const gained = Math.round((building?.points || 8) * multiplier);
  wallet.bones += gained;
  wallet.lifetimeBones += gained;
  return gained;
}

export function convertCurrency(wallet, fromId, direction = 1) {
  if (direction <= 0) return { ok: false, reason: 'reverse conversion not defined by canonical master economy' };
  const route = routeFrom(fromId);
  if (!route) {
    const known = CURRENCY_LADDER.some((currency) => currency.id === fromId);
    return { ok: false, reason: known ? 'top currency' : 'unknown currency' };
  }
  if ((wallet[route.from] || 0) < route.cost) return { ok: false, reason: `need ${route.cost} ${route.from}` };
  wallet[route.from] -= route.cost;
  wallet[route.to] = (wallet[route.to] || 0) + route.out;
  return { ok: true, from: route.from, to: route.to, amount: route.out, spent: route.cost, profile: 'master20260509' };
}

export function walletSummary(wallet) {
  return CURRENCY_LADDER.map((currency) => `${currency.symbol} ${wallet[currency.id] || 0} ${currency.label}`).join(' · ');
}
