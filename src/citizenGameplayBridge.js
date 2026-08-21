const CONSUME_RADIUS = 145;
const CLICK_RADIUS = 22;
const RESPAWN_MIN_MS = 10000;
const RESPAWN_SPAN_MS = 15000;

function haptic(pattern) { try { if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(pattern); } catch (_) {} }
function feedback(message, kind = 'good') { try { if (typeof window !== 'undefined') window.RampageFeedback?.notify?.(message, kind); } catch (_) {} }

export function citizenCampaignScore(citizen) {
  return 24 + Math.max(1, Number(citizen?.value) || 1) * 3;
}

export function nearestCitizen(city, x, radius = CONSUME_RADIUS) {
  let best = null;
  let distance = Infinity;
  for (const citizen of city?.citizens || []) {
    const d = Math.abs(Number(citizen.x) - Number(x));
    if (d <= radius && d < distance) { best = citizen; distance = d; }
  }
  return best ? { citizen: best, distance } : null;
}

export function hitTestCitizen(city, x, y, radius = CLICK_RADIUS) {
  let best = null;
  let distance = Infinity;
  for (const citizen of city?.citizens || []) {
    const cx = Number(citizen.x) || 0;
    const cy = (Number(city?.groundY) || Number(citizen.y) || 420) - 18;
    const d = Math.hypot(cx - x, cy - y);
    if (d <= radius && d < distance) { best = citizen; distance = d; }
  }
  return best ? { citizen: best, distance } : null;
}

export function consumeCityCitizen(host, runtime, citizen, random = Math.random, now = performance.now()) {
  const city = host?.city;
  const core = host?.gameplay;
  const commands = host?.gameplayCommands;
  if (!city || !core || !commands || !citizen) return { ok: false, reason: 'bridge-not-ready' };
  const index = city.citizens.indexOf(citizen);
  if (index < 0) return { ok: false, reason: 'citizen-unavailable' };

  const care = commands.care('consume', { cityCitizenId: citizen.id });
  if (!care?.ok) return care;

  city.citizens.splice(index, 1);
  const delayMs = RESPAWN_MIN_MS + random() * RESPAWN_SPAN_MS;
  runtime.respawn.push({ citizen: { ...citizen }, at: now + delayMs });
  city.panic = Math.min(100, Math.max(0, Number(city.panic) || 0) + 7);

  const session = core.state.mission;
  let scoreResult = null;
  let campaignResult = null;
  if (session?.phase === 'active') {
    scoreResult = commands.campaignScore(citizenCampaignScore(citizen), 'FEED CHAIN');
    if (session.mission?.kind === 'feed') campaignResult = commands.campaignProgress(1, { districtCount: host.themePacks?.length || 1 });
  }
  commands.save();
  host.gameplayPanels?.render?.();
  haptic([10]);
  feedback(`FEED +${care.bones || 0} BONES${scoreResult?.gained ? ` · +${scoreResult.gained} SCORE` : ''}`);
  return { ok: true, citizenId: citizen.id, value: citizen.value, care, scoreResult, campaignResult, respawnMs: delayMs };
}

export function updateCitizenRespawns(host, runtime, now = performance.now(), random = Math.random) {
  const city = host?.city;
  if (!city || !runtime?.respawn?.length) return 0;
  let count = 0;
  const waiting = [];
  for (const entry of runtime.respawn) {
    if (entry.at > now) { waiting.push(entry); continue; }
    const citizen = { ...entry.citizen };
    citizen.x = random() < 0.5 ? -20 : city.width + 20;
    citizen.y = city.groundY;
    citizen.fear = 0;
    citizen.spawnClock = 0;
    city.citizens.push(citizen);
    count += 1;
  }
  runtime.respawn = waiting;
  return count;
}

export function drawFeedTargets(ctx, host) {
  const session = host?.gameplay?.state?.mission;
  if (!ctx || session?.phase !== 'active' || session.mission?.kind !== 'feed') return 0;
  const city = host.city;
  const petX = host.state?.position?.x || 0;
  const nearest = nearestCitizen(city, petX, CONSUME_RADIUS)?.citizen || null;
  let count = 0;
  for (const citizen of city.citizens || []) {
    const x = Number(citizen.x) || 0;
    const y = (Number(city.groundY) || 420) - 18;
    ctx.save();
    ctx.strokeStyle = citizen === nearest ? '#39ff14' : 'rgba(255,215,107,.55)';
    ctx.lineWidth = citizen === nearest ? 3 : 1.5;
    ctx.setLineDash(citizen === nearest ? [] : [4, 4]);
    ctx.beginPath(); ctx.arc(x, y, citizen === nearest ? 14 : 10, 0, Math.PI * 2); ctx.stroke();
    if (citizen === nearest) {
      ctx.fillStyle = '#39ff14';
      ctx.font = '900 9px ui-monospace,monospace';
      ctx.fillText('FEED', x + 13, y - 11);
    }
    ctx.restore();
    count += 1;
  }
  return count;
}

export function attachCitizenGameplayBridge(host = window.RampageMaster) {
  if (!host?.gameplayCommands || !host?.city) throw new Error('Citizen gameplay bridge requires gameplay and city APIs.');
  const canvas = document.querySelector('[data-rampage-canvas]');
  if (!canvas) throw new Error('Citizen gameplay bridge requires the high-res canvas.');
  const overlay = document.createElement('canvas');
  overlay.dataset.rampageCitizenTargets = 'true';
  overlay.setAttribute('aria-hidden', 'true');
  overlay.style.cssText = 'position:fixed;inset:0;width:100vw;height:100vh;z-index:3;pointer-events:none;';
  document.body.appendChild(overlay);
  const ctx = overlay.getContext('2d');
  const runtime = { respawn: [], stopped: false };

  const consume = (citizen) => consumeCityCitizen(host, runtime, citizen);
  const consumeNearest = () => {
    const found = nearestCitizen(host.city, host.state?.position?.x || 0);
    if (!found) { haptic([35]); feedback('MOVE WITHIN RANGE OF A CITIZEN', 'warn'); return { ok: false, reason: 'no-citizen-in-range' }; }
    return consume(found.citizen);
  };

  const pointer = (event) => {
    const rect = canvas.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * canvas.width;
    const y = ((event.clientY - rect.top) / rect.height) * canvas.height;
    const hit = hitTestCitizen(host.city, x, y);
    if (!hit) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    consume(hit.citizen);
  };
  canvas.addEventListener('pointerdown', pointer, true);

  const careCapture = (event) => {
    const button = event.target?.closest?.('[data-rm-care="consume"]');
    if (!button) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    const result = consumeNearest();
    host.gameplayPanels?.render?.();
    if (!result.ok) button.title = 'Move within 145px of a citizen first';
  };
  document.addEventListener('click', careCapture, true);

  let raf = 0;
  const frame = () => {
    if (runtime.stopped) return;
    updateCitizenRespawns(host, runtime);
    if (overlay.width !== canvas.width || overlay.height !== canvas.height) { overlay.width = canvas.width; overlay.height = canvas.height; }
    ctx.clearRect(0, 0, overlay.width, overlay.height);
    drawFeedTargets(ctx, host);
    raf = requestAnimationFrame(frame);
  };
  raf = requestAnimationFrame(frame);

  const api = {
    get pendingRespawns() { return runtime.respawn.length; },
    consumeNearest,
    consumeById(id) {
      const citizen = host.city.citizens.find((candidate) => candidate.id === id);
      return citizen ? consume(citizen) : { ok: false, reason: 'citizen-unavailable' };
    },
    stop() {
      runtime.stopped = true;
      cancelAnimationFrame(raf);
      canvas.removeEventListener('pointerdown', pointer, true);
      document.removeEventListener('click', careCapture, true);
      overlay.remove();
    }
  };
  host.citizenGameplay = api;
  document.body.dataset.citizenGameplayBridge = 'ready';
  return api;
}

function autoAttach() {
  try {
    if (window.RampageMaster?.gameplayCommands && !window.RampageMaster.citizenGameplay) attachCitizenGameplayBridge(window.RampageMaster);
  } catch (error) {
    console.error('[RampageMaster citizen gameplay bridge]', error);
    document.body.dataset.citizenGameplayBridge = 'error';
  }
}

if (typeof window !== 'undefined' && typeof document !== 'undefined') {
  window.addEventListener('rampagemaster:gameplay-ready', autoAttach);
  if (window.RampageMaster?.gameplayCommands) autoAttach();
}
