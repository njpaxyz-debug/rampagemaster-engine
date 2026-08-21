import { bossCampaignScore } from './modules/campaignEncounterEntities.js';

const clamp = (value, min, max) => Math.max(min, Math.min(max, Number(value) || 0));

export function processCityCollapseDelta(host, previousCollapseCount = 0) {
  const city = host?.city;
  const gameplay = host?.gameplay;
  const commands = host?.gameplayCommands;
  if (!city || !gameplay || !commands) return { ok: false, reason: 'bridge-not-ready', collapseCount: previousCollapseCount };
  const current = Math.max(0, Math.floor(city.collapseCount || 0));
  if (current <= previousCollapseCount) return { ok: true, delta: 0, collapseCount: current };
  const delta = current - previousCollapseCount;
  const session = gameplay.state.mission;
  if (!session || session.phase !== 'active') return { ok: true, delta, collapseCount: current, campaignUpdated: false };

  const lastBuilding = city.buildings?.find((building) => building.id === city.lastCollapse) || null;
  const baseScore = Math.max(24, Math.round((lastBuilding?.points || 8) * 4));
  let completed = false;
  let bossDestroyed = false;
  let totalScoreBase = 0;
  for (let i = 0; i < delta; i += 1) {
    const live = gameplay.state.mission;
    if (!live || live.phase !== 'active') break;
    const isFinalCollapse = i === delta - 1;
    const isBoss = isFinalCollapse && live.mission?.kind === 'boss' && lastBuilding?.campaignRole === 'commandTower' && Number(lastBuilding?.hp || 0) <= 0;
    const scoreBase = isBoss ? bossCampaignScore(gameplay.state.district) : baseScore;
    live.threat = clamp((live.threat || 0) + (isBoss ? 23 : 13), 0, 100);
    commands.campaignScore(scoreBase, isBoss ? 'BOSS BREAK' : 'DEMOLITION');
    totalScoreBase += scoreBase;
    if (live.mission?.kind === 'destroy') {
      const result = commands.campaignProgress(1, { districtCount: host.themePacks?.length || 1 });
      completed ||= Boolean(result?.complete);
    } else if (isBoss) {
      bossDestroyed = true;
      const result = commands.campaignProgress(1, { bossDestroyed: true, districtCount: host.themePacks?.length || 1 });
      completed ||= Boolean(result?.complete);
    }
  }
  commands.save();
  host.gameplayPanels?.render?.();
  return { ok: true, delta, collapseCount: current, campaignUpdated: true, completed, bossDestroyed, baseScore, totalScoreBase, buildingId: lastBuilding?.id || null };
}

export function attachCityGameplayBridge(host = window.RampageMaster) {
  if (!host?.city || !host?.gameplayCommands) throw new Error('City gameplay bridge requires city and gameplay APIs.');
  let previousCollapseCount = Math.max(0, Math.floor(host.city.collapseCount || 0));
  let stopped = false;
  const frame = () => {
    if (stopped) return;
    const result = processCityCollapseDelta(host, previousCollapseCount);
    previousCollapseCount = result.collapseCount ?? previousCollapseCount;
    requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);
  const bridge = { get collapseCount() { return previousCollapseCount; }, stop() { stopped = true; } };
  host.cityGameplayBridge = bridge;
  document.body.dataset.cityGameplayBridge = 'ready';
  return bridge;
}

function autoAttach() {
  try {
    if (window.RampageMaster?.gameplayCommands && !window.RampageMaster.cityGameplayBridge) attachCityGameplayBridge(window.RampageMaster);
  } catch (error) {
    console.error('[RampageMaster city gameplay bridge]', error);
    document.body.dataset.cityGameplayBridge = 'error';
  }
}

if (typeof window !== 'undefined' && typeof document !== 'undefined') {
  window.addEventListener('rampagemaster:gameplay-ready', autoAttach);
  if (window.RampageMaster?.gameplayCommands) autoAttach();
}
