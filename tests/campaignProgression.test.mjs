import assert from 'node:assert/strict';
import { addCampaignProgress, addCampaignScore, campaignMissionComplete, campaignMissionSpec, campaignXpNext, completeCampaignMission, createCampaignState, createMissionSession } from '../src/modules/campaignProgression.js';

const campaign = createCampaignState();
assert.equal(campaignXpNext(campaign), 700);
const first = campaignMissionSpec(campaign, 0); assert.equal(first.title, 'DEMOLITION RUN'); assert.equal(first.target, 4); assert.equal(first.reward, 180);
const session = createMissionSession(campaign, 0); addCampaignProgress(session, 4); assert.equal(campaignMissionComplete(session), true);
const wallet = { bones: 0, opal: 0 }; const pet = { health: 100, maxHealth: 100 }; const districts = [true, false, false];
const done = completeCampaignMission({ campaign, session, wallet, pet, districtsUnlocked: districts, districtCount: 3 }); assert.equal(done.ok, true); assert.equal(wallet.bones, 426); assert.equal(wallet.opal, 0); assert.equal(campaign.missionsCompleted, 1);
const scoreCampaign = createCampaignState({ missionIndex: 4 }); const scoreSession = createMissionSession(scoreCampaign, 0); scoreSession.comboTimer = 1; const score = addCampaignScore(scoreCampaign, scoreSession, 100); assert.equal(score.combo, 2); assert.equal(score.gained, 114); assert.equal(scoreSession.progress, 114);
const cycleCampaign = createCampaignState({ missionIndex: 5 }); const scaled = campaignMissionSpec(cycleCampaign, 2); assert.equal(scaled.kind, 'destroy'); assert.ok(scaled.reward > 180); assert.ok(scaled.target > 4);
console.log('campaign progression: ok');
