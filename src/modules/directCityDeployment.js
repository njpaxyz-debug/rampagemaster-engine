/*
 * Defensive adapter derived from RampageMaster_DEPLOYMENT_DEFINITIVE_v12.html.
 * v12's key improvement was direct installation into the city runtime rather
 * than an optimistic acknowledgement chain. This module keeps the useful
 * contract while removing page-global RM_* dependencies.
 */

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export async function waitForCityInstall(frame, options = {}) {
  const timeoutMs = Math.max(0, options.timeoutMs ?? 12000);
  const pollMs = Math.max(1, options.pollMs ?? 50);
  const start = Date.now();

  while (Date.now() - start <= timeoutMs) {
    const cityWindow = frame?.contentWindow;
    if (cityWindow && typeof cityWindow.RM_CITY_INSTALL === 'function') return cityWindow;
    await sleep(pollMs);
  }
  throw new Error('City runtime did not expose RM_CITY_INSTALL before timeout.');
}

export function normalizeDeploymentPacket(raw, normalizeFn = (value) => value) {
  const packet = normalizeFn(raw);
  if (!packet || typeof packet !== 'object') throw new Error('Deployment packet is invalid.');
  return packet;
}

export async function deployToCity(options = {}) {
  const {
    frame,
    rawPacket,
    normalize = (value) => value,
    deploymentId = '',
    timeoutMs = 12000,
    pollMs = 50,
    onState,
    onSuccess,
    onError
  } = options;

  const packet = normalizeDeploymentPacket(rawPacket, normalize);
  const id = deploymentId || packet.deploymentId || packet.id || `rm-${Date.now()}`;
  onState?.({ phase: 'pending', deploymentId: id, packet });

  try {
    const cityWindow = await waitForCityInstall(frame, { timeoutMs, pollMs });
    const result = await cityWindow.RM_CITY_INSTALL(packet, id);
    if (!result?.ready) throw new Error('City install returned without ready=true.');
    const completed = { phase: 'ready', deploymentId: id, packet, result };
    onState?.(completed);
    onSuccess?.(completed);
    return completed;
  } catch (error) {
    const failed = { phase: 'error', deploymentId: id, packet, error };
    onState?.(failed);
    onError?.(failed);
    throw error;
  }
}

export function createDeploymentQueue(defaultOptions = {}) {
  let active = Promise.resolve();
  return (rawPacket, options = {}) => {
    const task = () => deployToCity({ ...defaultOptions, ...options, rawPacket });
    active = active.then(task, task);
    return active;
  };
}
