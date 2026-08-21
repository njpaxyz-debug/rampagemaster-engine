export const ARCADE_MODES = Object.freeze({
  free: Object.freeze({ id: 'free', entry: null, payoutMultiplier: 1 }),
  basic: Object.freeze({ id: 'basic', entry: Object.freeze({ currency: 'bones', amount: 1 }), payoutMultiplier: 2 }),
  premium: Object.freeze({ id: 'premium', entry: Object.freeze({ currency: 'opal', amount: 1 }), payoutMultiplier: 3 })
});

export const ARCADE_RULES = Object.freeze({
  roundMs: 5000,
  winScore: 4,
  opalScore: 7,
  premiumQuartzScore: 9,
  speedEveryWins: 5,
  speedMultiplier: 0.85,
  baseSpawnDelayMs: 700,
  minSpawnDelayMs: 260,
  bossEveryWins: 20
});

export function createArcadeProgression(seed = {}) {
  return {
    best: Math.max(0, Math.floor(seed.best || 0)),
    wins: Math.max(0, Math.floor(seed.wins || 0)),
    streak: Math.max(0, Math.floor(seed.streak || 0)),
    mode: ARCADE_MODES[seed.mode] ? seed.mode : 'free'
  };
}

export function arcadeSpawnDelay(wins = 0) {
  const tier = Math.floor(Math.max(0, wins) / ARCADE_RULES.speedEveryWins);
  return Math.max(ARCADE_RULES.minSpawnDelayMs, ARCADE_RULES.baseSpawnDelayMs * Math.pow(ARCADE_RULES.speedMultiplier, tier));
}

export function arcadeEntryCost(mode = 'free') {
  return ARCADE_MODES[mode]?.entry || null;
}

export function canStartArcade(wallet, mode = 'free') {
  const entry = arcadeEntryCost(mode);
  if (!entry) return { ok: true, entry: null };
  if ((wallet?.[entry.currency] || 0) < entry.amount) return { ok: false, reason: 'insufficient-entry', entry };
  return { ok: true, entry };
}

export function payArcadeEntry(wallet, mode = 'free') {
  const check = canStartArcade(wallet, mode);
  if (!check.ok) return check;
  if (check.entry) wallet[check.entry.currency] -= check.entry.amount;
  return { ok: true, entry: check.entry };
}

export function settleArcadeRound(progression, score, mode = progression.mode || 'free') {
  const safeScore = Math.max(0, Math.floor(score || 0));
  const modeConfig = ARCADE_MODES[mode] || ARCADE_MODES.free;
  const win = safeScore >= ARCADE_RULES.winScore;
  const nextWinNumber = progression.wins + (win ? 1 : 0);
  const boss = win && nextWinNumber % ARCADE_RULES.bossEveryWins === 0;
  let bones = safeScore * modeConfig.payoutMultiplier;
  let opal = safeScore >= ARCADE_RULES.opalScore ? 1 : 0;
  let quartz = mode === 'premium' && safeScore >= ARCADE_RULES.premiumQuartzScore ? 1 : 0;
  if (boss) {
    bones *= 2;
    quartz = Math.max(1, quartz);
  }
  progression.streak = win ? progression.streak + 1 : 0;
  if (win) progression.wins += 1;
  progression.best = Math.max(progression.best, safeScore);
  progression.mode = mode;
  return { score: safeScore, mode, win, boss, bones, opal, quartz, best: progression.best, wins: progression.wins, streak: progression.streak };
}

export function applyArcadeReward(wallet, reward) {
  for (const currency of ['bones', 'opal', 'quartz']) wallet[currency] = (wallet[currency] || 0) + Math.max(0, Math.floor(reward?.[currency] || 0));
  return wallet;
}
