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
  for (let i = 0; i < delta; i += 1) {
    if (gameplay.state.mission?.phase !== 'active') break;
    commands.campaignScore(baseScore, 'DEMOLITION');
    if (gameplay.state.mission?.mission?.kind === 'destroy') {
      const result = commands.campaignProgress(1, { districtCount: host.themePacks?.length || 1 });
      completed ||= Boolean(result?.complete);
    }
  }
  commands.save();
  host.gameplayPanels?.render?.();
  return { ok: true, delta, collapseCount: current, campaignUpdated: true, completed, baseScore, buildingId: lastBuilding?.id || null };
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
