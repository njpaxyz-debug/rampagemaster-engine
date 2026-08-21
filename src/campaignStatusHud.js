import { campaignObjectiveText, campaignProgressPct, campaignXpNext } from './modules/campaignProgression.js';

const esc = (value) => String(value ?? '').replace(/[&<>'"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[char]));
const clamp = (value, min = 0, max = 100) => Math.max(min, Math.min(max, Number(value) || 0));

export function campaignHudModel(host) {
  const state = host?.gameplay?.state;
  const session = state?.mission;
  if (!session || session.phase !== 'active') return { active: false, phase: session?.phase || null, result: session?.result || '' };
  const seconds = Math.max(0, Math.ceil((session.timeFrames || 0) / 60));
  const model = {
    active: true,
    phase: session.phase,
    title: session.mission?.title || 'MISSION',
    objective: campaignObjectiveText(session.mission),
    progress: campaignProgressPct(session),
    progressValue: Math.floor(session.progress || 0),
    target: session.mission?.target || 1,
    score: Math.floor(session.score || 0),
    combo: Math.max(1, Math.floor(session.combo || 1)),
    threat: clamp(session.threat || 0),
    seconds,
    time: `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`,
    rank: Math.max(1, Math.floor(state.campaign?.rank || 1)),
    xp: Math.max(0, Math.floor(state.campaign?.xp || 0)),
    xpNext: campaignXpNext(state.campaign || {}),
    kind: session.mission?.kind || 'unknown',
    responseUnits: host?.campaignEncounter?.state?.units?.length || 0,
    bossHp: null
  };
  const bossId = host?.campaignEncounter?.state?.bossId;
  if (bossId) {
    const boss = host.city?.buildings?.find((building) => building.id === bossId);
    if (boss) model.bossHp = { hp: Math.max(0, Number(boss.hp) || 0), max: Math.max(1, Number(boss.max) || 1) };
  }
  return model;
}

function injectStyles() {
  if (document.querySelector('[data-rm-campaign-hud-style]')) return;
  const style = document.createElement('style');
  style.dataset.rmCampaignHudStyle = 'true';
  style.textContent = `
    #rmCampaignHud{position:fixed;z-index:32;top:78px;left:50%;transform:translateX(-50%);width:min(460px,calc(100vw - 28px));pointer-events:none;font-family:Georgia,"Iowan Old Style",serif;opacity:0;visibility:hidden;transition:.16s}
    #rmCampaignHud.active{opacity:1;visibility:visible}.rmCampaignCard{border:1px solid rgba(135,205,255,.28);border-radius:15px;background:rgba(3,8,18,.84);box-shadow:0 12px 36px rgba(0,0,0,.46);backdrop-filter:blur(12px);padding:9px 11px}.rmCampaignTop{display:grid;grid-template-columns:1fr auto;gap:8px;align-items:start}.rmCampaignTop small{display:block;font:900 7px ui-monospace,monospace;letter-spacing:.13em;color:#39ff14;text-transform:uppercase}.rmCampaignTop strong{display:block;margin-top:2px;font-size:13px;color:#fff2c7}.rmCampaignTime{font:900 16px ui-monospace,monospace;color:#fff}.rmCampaignObjective{margin-top:5px;font-size:9px;color:rgba(238,247,255,.72);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.rmCampaignBar{height:6px;margin-top:7px;border:1px solid rgba(255,255,255,.1);border-radius:99px;background:#02050a;overflow:hidden}.rmCampaignBar i{display:block;height:100%;background:linear-gradient(90deg,#00d4ff,#39ff14)}.rmCampaignMeta{display:flex;justify-content:space-between;gap:8px;margin-top:5px;font:800 7px ui-monospace,monospace;color:rgba(238,247,255,.56)}.rmCampaignMeta b{color:#ffd76b}.rmCampaignFlash{position:fixed;z-index:110;left:50%;top:145px;transform:translate(-50%,-8px);opacity:0;padding:8px 12px;border:1px solid #39ff14;border-radius:999px;background:rgba(2,9,8,.94);color:#eaffef;font:900 9px ui-monospace,monospace;pointer-events:none;transition:.16s}.rmCampaignFlash.show{opacity:1;transform:translate(-50%,0)}
    @media(max-width:720px){#rmCampaignHud{top:auto;bottom:74px;width:calc(100vw - 14px)}.rmCampaignCard{padding:7px 9px;border-radius:12px}.rmCampaignTop strong{font-size:11px}.rmCampaignObjective{font-size:8px}.rmCampaignFlash{top:auto;bottom:142px}}
  `;
  document.head.appendChild(style);
}

function haptic(pattern) {
  try { if (navigator.vibrate) navigator.vibrate(pattern); } catch (_) {}
}

export function attachCampaignStatusHud(host = window.RampageMaster) {
  if (!host?.gameplay) throw new Error('Campaign HUD requires gameplay state.');
  injectStyles();
  const hud = document.createElement('div');
  hud.id = 'rmCampaignHud';
  hud.setAttribute('aria-live', 'polite');
  const flash = document.createElement('div');
  flash.className = 'rmCampaignFlash';
  document.body.append(hud, flash);
  let stopped = false;
  let lastPhase = host.gameplay.state.mission?.phase || null;
  let lastMissionIndex = host.gameplay.state.campaign?.missionIndex || 0;
  let flashTimer = null;

  const notify = (message, kind = 'good') => {
    flash.textContent = message;
    flash.style.borderColor = kind === 'bad' ? '#ff4f7a' : kind === 'warn' ? '#ffd76b' : '#39ff14';
    flash.classList.add('show');
    clearTimeout(flashTimer);
    flashTimer = setTimeout(() => flash.classList.remove('show'), 1400);
  };

  const gateCampaignStart = (event) => {
    const button = event.target?.closest?.('[data-rm-campaign-start]');
    if (!button || host.gameplay.state.pet?.hatched) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    haptic([35]);
    notify('HATCH A KAIJU BEFORE STARTING CAMPAIGN', 'warn');
  };
  document.addEventListener('click', gateCampaignStart, true);

  const frame = () => {
    if (stopped) return;
    const model = campaignHudModel(host);
    const drawerOpen = document.querySelector('#rmGameplayDrawer')?.classList.contains('open');
    hud.classList.toggle('active', model.active && !drawerOpen);
    if (model.active) {
      const specialty = model.kind === 'response' ? ` · UNITS <b>${model.responseUnits}</b>` : model.kind === 'boss' && model.bossHp ? ` · BOSS <b>${Math.ceil(model.bossHp.hp)}/${Math.ceil(model.bossHp.max)}</b>` : '';
      hud.innerHTML = `<div class="rmCampaignCard"><div class="rmCampaignTop"><div><small>Campaign · Rank ${model.rank}</small><strong>${esc(model.title)}</strong></div><span class="rmCampaignTime">${model.time}</span></div><div class="rmCampaignObjective">${esc(model.objective)}</div><div class="rmCampaignBar"><i style="width:${Math.round(model.progress * 100)}%"></i></div><div class="rmCampaignMeta"><span>SCORE <b>${model.score}</b> · COMBO <b>${model.combo}×</b>${specialty}</span><span>THREAT <b>${Math.round(model.threat)}%</b></span></div></div>`;
    }

    const session = host.gameplay.state.mission;
    const phase = session?.phase || null;
    const missionIndex = host.gameplay.state.campaign?.missionIndex || 0;
    if (phase !== lastPhase || missionIndex !== lastMissionIndex) {
      if (phase === 'active') { haptic([10]); notify(session?.mission?.title || 'MISSION START'); }
      else if (phase === 'complete') { haptic([18,30,18]); notify(session?.result || 'MISSION COMPLETE'); }
      else if (phase === 'failed') { haptic([45]); notify(session?.result || 'MISSION FAILED', 'bad'); }
      lastPhase = phase;
      lastMissionIndex = missionIndex;
    }

    const start = document.querySelector('[data-rm-campaign-start]');
    if (start && !host.gameplay.state.pet?.hatched) {
      start.disabled = true;
      start.title = 'Hatch a kaiju first';
      start.textContent = 'Hatch required';
    }
    requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);

  const api = { notify, model: () => campaignHudModel(host), stop() { stopped = true; document.removeEventListener('click', gateCampaignStart, true); clearTimeout(flashTimer); hud.remove(); flash.remove(); } };
  host.campaignHud = api;
  window.RampageFeedback = api;
  document.body.dataset.campaignHud = 'ready';
  return api;
}

function autoAttach() {
  try {
    if (window.RampageMaster?.gameplay && !window.RampageMaster.campaignHud) attachCampaignStatusHud(window.RampageMaster);
  } catch (error) {
    console.error('[RampageMaster campaign HUD]', error);
    document.body.dataset.campaignHud = 'error';
  }
}

if (typeof window !== 'undefined' && typeof document !== 'undefined') {
  window.addEventListener('rampagemaster:gameplay-ready', autoAttach);
  if (window.RampageMaster?.gameplay) autoAttach();
}
