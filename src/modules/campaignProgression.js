export const CAMPAIGN_DEFAULT = Object.freeze({
  rank: 1,
  xp: 0,
  missionIndex: 0,
  missionsCompleted: 0,
  totalScore: 0,
  bestCombo: 1,
  bestMissionScore: 0
});

export const CAMPAIGN_MISSIONS = Object.freeze([
  Object.freeze({ kind: 'destroy', title: 'DEMOLITION RUN', brief: 'Level marked city blocks before the response clock expires.', target: 4, time: 82, reward: 180, xp: 120 }),
  Object.freeze({ kind: 'feed', title: 'FEEDING FRENZY', brief: 'Crack buildings, chase the fleeing population, and fill your stomach.', target: 7, time: 92, reward: 240, xp: 150 }),
  Object.freeze({ kind: 'response', title: 'BREAK THE RESPONSE', brief: 'Raise threat, then destroy incoming city defense units.', target: 4, time: 96, reward: 330, xp: 190 }),
  Object.freeze({ kind: 'boss', title: 'BOSS BLOCK', brief: 'Find the command tower, break its armor, and finish the district encounter.', target: 1, time: 108, reward: 470, xp: 260 }),
  Object.freeze({ kind: 'score', title: 'MAXIMUM RAMPAGE', brief: 'Chain destruction, feeding and response takedowns into a high-score run.', target: 2600, time: 100, reward: 560, xp: 300 })
]);

export function createCampaignState(seed = {}) { return { ...CAMPAIGN_DEFAULT, ...seed }; }
export function campaignXpNext(campaign) { return 420 + Math.max(1, Math.floor(campaign?.rank || 1)) * 280; }

export function campaignMissionSpec(campaign, district = 0) {
  const index = Math.max(0, Math.floor(campaign?.missionIndex || 0));
  const base = CAMPAIGN_MISSIONS[index % CAMPAIGN_MISSIONS.length];
  const cycle = Math.floor(index / CAMPAIGN_MISSIONS.length);
  const districtScale = 1 + Math.max(0, Number(district) || 0) * 0.16 + cycle * 0.14;
  return {
    ...base,
    target: base.kind === 'score' ? Math.floor(base.target * districtScale) : Math.ceil(base.target * (1 + cycle * 0.18)),
    time: Math.max(58, base.time - cycle * 2),
    reward: Math.floor(base.reward * districtScale),
    xp: Math.floor(base.xp * (1 + cycle * 0.12)),
    cycle,
    districtScale
  };
}

export function campaignObjectiveText(mission) {
  if (!mission) return 'Awaiting mission uplink.';
  if (mission.kind === 'destroy') return `Destroy ${mission.target} city blocks`;
  if (mission.kind === 'feed') return `Devour ${mission.target} fleeing citizens`;
  if (mission.kind === 'response') return `Destroy ${mission.target} response units`;
  if (mission.kind === 'boss') return 'Destroy the armored command tower';
  return `Score ${mission.target} points`;
}

export function createMissionSession(campaign, district = 0) {
  const mission = campaignMissionSpec(campaign, district);
  return { phase: 'active', mission, progress: 0, score: 0, combo: 1, comboTimer: 0, threat: mission.kind === 'response' ? 34 : 0, timeFrames: mission.time * 60, maxFrames: mission.time * 60, result: '', rewardBones: 0, rewardOpal: 0 };
}

export function tickCampaignMission(session, frames = 1) {
  if (!session || session.phase !== 'active') return { ok: false, reason: 'inactive', phase: session?.phase || null };
  const elapsed = Math.max(0, Number(frames) || 0);
  session.comboTimer = Math.max(0, (session.comboTimer || 0) - elapsed);
  session.timeFrames = Math.max(0, (session.timeFrames || 0) - elapsed);
  if (session.timeFrames <= 0) {
    failCampaignMission(session, 'TIME EXPIRED');
    return { ok: true, expired: true, phase: session.phase, timeFrames: 0 };
  }
  return { ok: true, expired: false, phase: session.phase, timeFrames: session.timeFrames, comboTimer: session.comboTimer };
}

export function addCampaignScore(campaign, session, base, reason = 'IMPACT') {
  if (session.phase !== 'active') return { ok: false, reason: 'inactive' };
  session.combo = session.comboTimer > 0 ? Math.min(12, session.combo + 1) : 1;
  session.comboTimer = 190;
  const gained = Math.floor(Math.max(0, base) * (1 + (session.combo - 1) * 0.15));
  session.score += gained;
  campaign.totalScore += gained;
  campaign.bestCombo = Math.max(campaign.bestCombo, session.combo);
  if (session.mission.kind === 'score') session.progress = session.score;
  return { ok: true, gained, reason, combo: session.combo, score: session.score };
}

export function addCampaignProgress(session, amount = 1) { session.progress += Math.max(0, Number(amount) || 0); return session.progress; }
export function campaignProgressValue(session) { return session?.mission?.kind === 'score' ? session.score : session?.progress || 0; }
export function campaignProgressPct(session) { return Math.max(0, Math.min(1, campaignProgressValue(session) / Math.max(1, session?.mission?.target || 1))); }
export function campaignMissionComplete(session, { bossDestroyed = false } = {}) { if (!session?.mission) return false; return session.mission.kind === 'boss' ? Boolean(bossDestroyed) : campaignProgressValue(session) >= session.mission.target; }

export function completeCampaignMission({ campaign, session, wallet, pet, districtsUnlocked = [], districtCount = 1 }) {
  if (session.phase !== 'active') return { ok: false, reason: 'inactive' };
  const timeBonus = Math.floor(Math.max(0, session.timeFrames / 60) * 3);
  const comboBonus = Math.max(0, (session.combo - 1) * 20);
  session.rewardBones = session.mission.reward + timeBonus + comboBonus;
  session.rewardOpal = ((campaign.missionsCompleted + 1) % 3 === 0) ? 1 : 0;
  wallet.bones = (wallet.bones || 0) + session.rewardBones;
  wallet.opal = (wallet.opal || 0) + session.rewardOpal;
  campaign.xp += session.mission.xp;
  campaign.missionsCompleted += 1;
  campaign.missionIndex += 1;
  campaign.bestMissionScore = Math.max(campaign.bestMissionScore, session.score);
  let ranked = false;
  let ranksGained = 0;
  while (campaign.xp >= campaignXpNext(campaign)) {
    campaign.xp -= campaignXpNext(campaign);
    campaign.rank += 1;
    ranked = true;
    ranksGained += 1;
    if (pet) {
      pet.maxHealth = Math.max(1, Number(pet.maxHealth || pet.health || 100)) + 12;
      pet.health = pet.maxHealth;
    }
  }
  const unlockIndex = Math.min(Math.max(0, districtCount - 1), Math.floor(campaign.missionsCompleted / 2));
  if (unlockIndex > 0) districtsUnlocked[unlockIndex] = true;
  session.phase = 'complete';
  session.result = ranked ? 'RANK UP! CITY THREAT CLASS INCREASED' : 'MISSION COMPLETE';
  return { ok: true, ranked, ranksGained, timeBonus, comboBonus, rewardBones: session.rewardBones, rewardOpal: session.rewardOpal, unlockIndex };
}

export function failCampaignMission(session, reason = 'KAIJU DOWN') { if (session.phase !== 'active') return { ok: false, reason: 'inactive' }; session.phase = 'failed'; session.result = reason; return { ok: true, reason }; }
export function resetCampaign() { return createCampaignState(); }
