export const CURRENCY_LADDER = Object.freeze([
  { id: 'bones', label: 'Bones', symbol: '◆', rateToNext: 200 },
  { id: 'opal', label: 'Opal', symbol: '◇', rateToNext: 5 },
  { id: 'quartz', label: 'Quartz', symbol: '⬡', rateToNext: 4 },
  { id: 'diamond', label: 'Diamond', symbol: '⬢', rateToNext: 3 },
  { id: 'oil', label: 'Oil', symbol: '◈', rateToNext: null }
]);

export function createWallet(seed = {}) {
  return {
    bones: seed.bones ?? 240,
    opal: seed.opal ?? 0,
    quartz: seed.quartz ?? 0,
    diamond: seed.diamond ?? 0,
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
  const index = CURRENCY_LADDER.findIndex((currency) => currency.id === fromId);
  if (index < 0) return { ok: false, reason: 'unknown currency' };

  if (direction > 0) {
    const from = CURRENCY_LADDER[index];
    const to = CURRENCY_LADDER[index + 1];
    if (!to || !from.rateToNext) return { ok: false, reason: 'top currency' };
    if ((wallet[from.id] || 0) < from.rateToNext) return { ok: false, reason: `need ${from.rateToNext} ${from.label}` };
    wallet[from.id] -= from.rateToNext;
    wallet[to.id] = (wallet[to.id] || 0) + 1;
    return { ok: true, from: from.id, to: to.id, amount: 1 };
  }

  const from = CURRENCY_LADDER[index];
  const to = CURRENCY_LADDER[index - 1];
  if (!to) return { ok: false, reason: 'base currency' };
  if ((wallet[from.id] || 0) < 1) return { ok: false, reason: `need 1 ${from.label}` };
  wallet[from.id] -= 1;
  wallet[to.id] = (wallet[to.id] || 0) + Math.floor((to.rateToNext || 1) * 0.84);
  return { ok: true, from: from.id, to: to.id, amount: Math.floor((to.rateToNext || 1) * 0.84) };
}

export function walletSummary(wallet) {
  return CURRENCY_LADDER.map((currency) => `${currency.symbol} ${wallet[currency.id] || 0} ${currency.label}`).join(' · ');
}
