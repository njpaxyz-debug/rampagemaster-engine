import { MASTER_EGG_SPECIES, getEggSpecies } from './modules/hatchDna.js';
import { MASTER_SHOP, canAfford, getEconomyProfile } from './modules/economyProgression.js';
import { ARCADE_MODES, ARCADE_RULES, arcadeSpawnDelay } from './modules/arcadeProgression.js';
import { getPetMood, getPetStage } from './modules/petProgression.js';
import { campaignMissionSpec, campaignObjectiveText, campaignProgressPct, campaignXpNext } from './modules/campaignProgression.js';

const PANEL_IDS = ['nest', 'bank', 'mall', 'arcade'];
const CURRENCY_LABELS = Object.freeze({ bones: 'Bones', opal: 'Opal', quartz: 'Quartz', fossils: 'Fossils', oil: 'Oil', petrol: 'Petrol', diamond: 'Diamond' });
const CURRENCY_ICONS = Object.freeze({ bones: '◆', opal: '◇', quartz: '⬡', fossils: '◌', oil: '◈', petrol: '▰', diamond: '⬢' });

let host = null;
let root = null;
let drawer = null;
let dock = null;
let activePanel = 'nest';
let drawerOpen = false;
let campaignClock = null;
let campaignRenderTick = 0;
let arcadeTimer = null;
let arcadeSpawnTimer = null;
let arcadeTicker = null;
let arcadeRun = null;

const esc = (value) => String(value ?? '').replace(/[&<>'"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[char]));
const clamp = (value, min = 0, max = 100) => Math.max(min, Math.min(max, Number(value) || 0));
const money = (wallet, currency) => Math.max(0, Math.floor(wallet?.[currency] || 0));

function injectStyles() {
  if (document.querySelector('[data-rm-gameplay-styles]')) return;
  const style = document.createElement('style');
  style.dataset.rmGameplayStyles = 'true';
  style.textContent = `
    #rmGameplayUI{position:fixed;inset:0;z-index:40;pointer-events:none;font-family:Georgia,"Iowan Old Style","Palatino Linotype",serif;color:#eef7ff}
    #rmGameplayDock{pointer-events:auto;position:absolute;left:50%;bottom:max(12px,env(safe-area-inset-bottom));transform:translateX(-50%);display:grid;grid-template-columns:repeat(4,minmax(74px,112px));gap:7px;padding:7px;border:1px solid rgba(135,205,255,.24);border-radius:20px;background:rgba(4,8,18,.9);box-shadow:0 16px 44px rgba(0,0,0,.54);backdrop-filter:blur(13px)}
    .rmDockBtn{min-height:52px;border:1px solid rgba(135,205,255,.18);border-radius:14px;background:rgba(255,255,255,.055);color:#eaf5ff;padding:6px 8px;display:grid;grid-template-columns:24px 1fr;gap:6px;align-items:center;text-align:left;font:900 11px/1.05 Georgia,serif;cursor:pointer}.rmDockBtn i{font-style:normal;font-size:18px}.rmDockBtn small{display:block;margin-top:4px;font:700 8px/1.1 ui-monospace,monospace;color:rgba(238,247,255,.55)}.rmDockBtn.is-active{border-color:#39ff14;color:#fff;box-shadow:0 0 20px rgba(57,255,20,.16)}
    #rmGameplayDrawer{pointer-events:auto;position:absolute;left:50%;bottom:82px;transform:translate(-50%,14px) scale(.985);width:min(840px,calc(100vw - 24px));max-height:min(68vh,720px);overflow:hidden;border:1px solid rgba(135,205,255,.27);border-radius:24px;background:rgba(5,9,20,.96);box-shadow:0 28px 90px rgba(0,0,0,.75),0 0 36px rgba(0,212,255,.08);backdrop-filter:blur(18px);opacity:0;visibility:hidden;transition:.18s ease}
    #rmGameplayDrawer.open{opacity:1;visibility:visible;transform:translate(-50%,0) scale(1)}
    .rmDrawerHead{height:58px;display:flex;align-items:center;gap:10px;padding:0 16px;border-bottom:1px solid rgba(135,205,255,.17);background:linear-gradient(90deg,rgba(57,255,20,.08),rgba(0,212,255,.06))}.rmDrawerHead strong{font-size:20px;color:#fff2c7}.rmDrawerHead small{font:700 9px ui-monospace,monospace;color:rgba(238,247,255,.55)}.rmDrawerHead button{margin-left:auto;width:38px;height:38px;border-radius:12px;padding:0;font-size:18px}
    .rmDrawerBody{max-height:calc(min(68vh,720px) - 58px);overflow:auto;padding:14px 16px 22px;scrollbar-width:thin}.rmGrid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:11px}.rmFull{grid-column:1/-1}.rmCard{border:1px solid rgba(135,205,255,.15);border-radius:17px;background:rgba(255,255,255,.045);padding:13px}.rmCard h3{margin:0 0 7px;font-size:17px;color:#fff2c7}.rmCard p{margin:4px 0;color:rgba(238,247,255,.66);font-size:11px;line-height:1.4}.rmEyebrow{font:900 8px ui-monospace,monospace;letter-spacing:.12em;text-transform:uppercase;color:#39ff14}.rmRow{display:flex;align-items:center;gap:8px;flex-wrap:wrap}.rmSpread{display:flex;justify-content:space-between;gap:10px;align-items:center}.rmActions{display:flex;gap:7px;flex-wrap:wrap;margin-top:10px}.rmBtn{border:1px solid rgba(135,205,255,.24);border-radius:11px;background:rgba(255,255,255,.07);color:#eef7ff;padding:8px 10px;font:900 10px Georgia,serif;cursor:pointer}.rmBtn:hover{border-color:#39ff14}.rmBtn.primary{border-color:rgba(57,255,20,.55);background:rgba(57,255,20,.09)}.rmBtn:disabled{opacity:.38;cursor:not-allowed}.rmMetric{display:grid;grid-template-columns:72px 1fr 38px;gap:7px;align-items:center;margin:7px 0;font-size:10px}.rmBar{height:7px;border-radius:999px;background:#02050a;overflow:hidden;border:1px solid rgba(255,255,255,.08)}.rmBar i{display:block;height:100%;background:linear-gradient(90deg,#00d4ff,#39ff14)}
    .rmEggs{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px;margin-top:9px}.rmEgg{min-height:92px;position:relative;border:1px solid rgba(255,255,255,.14);border-radius:18px;background:radial-gradient(circle at 35% 18%,rgba(255,255,255,.16),transparent 32%),linear-gradient(180deg,#182037,#090d19);color:#eef7ff;cursor:pointer;padding:8px}.rmEgg.active{border-color:#39ff14;box-shadow:0 0 18px rgba(57,255,20,.13)}.rmEgg:disabled{cursor:default}.rmEgg b{display:block;font-size:28px}.rmEgg span{display:block;font-size:10px;font-weight:900}.rmEgg small{display:block;font-size:8px;color:rgba(238,247,255,.55)}.rmTapDots{display:flex;gap:4px;justify-content:center;margin-top:6px}.rmTapDots i{width:5px;height:5px;border-radius:50%;background:rgba(255,255,255,.12)}.rmTapDots i.on{background:#39ff14;box-shadow:0 0 5px #39ff14}.rmName{width:100%;height:38px;margin-top:9px;border:1px solid rgba(135,205,255,.22);border-radius:11px;background:#030711;color:#eef7ff;padding:8px 10px;font:800 12px Georgia,serif}
    .rmWallet{display:grid;grid-template-columns:repeat(auto-fit,minmax(92px,1fr));gap:7px}.rmCoin{padding:9px;border:1px solid rgba(135,205,255,.14);border-radius:13px;background:#050a13}.rmCoin b{display:block;font-size:18px;color:#fff}.rmCoin small{font:800 8px ui-monospace,monospace;color:rgba(238,247,255,.52)}
    .rmList{display:grid;gap:8px}.rmListItem{display:grid;grid-template-columns:1fr auto;gap:10px;align-items:center;padding:10px;border:1px solid rgba(135,205,255,.12);border-radius:14px;background:rgba(255,255,255,.035)}.rmListItem h4{margin:0;color:#fff2c7;font-size:13px}.rmListItem p{margin:3px 0 0;font-size:9px}.rmCost{font:800 9px ui-monospace,monospace;color:#ffd76b}.rmOwned{color:#39ff14}
    .rmSaveText{width:100%;min-height:96px;margin-top:8px;resize:vertical;border:1px solid rgba(135,205,255,.17);border-radius:12px;background:#02050b;color:#cde6ff;padding:9px;font:10px/1.35 ui-monospace,monospace}
    .rmArcadeField{height:230px;position:relative;overflow:hidden;border:1px solid rgba(135,205,255,.18);border-radius:16px;background:radial-gradient(circle at 50% 100%,rgba(0,212,255,.17),#02050b 72%);margin-top:10px}.rmArcTarget{position:absolute;width:44px;height:44px;border:3px solid #39ff14;border-radius:50%;background:rgba(255,79,122,.55);color:#fff;font-size:18px;cursor:pointer;box-shadow:0 0 20px rgba(57,255,20,.27)}
    .rmToast{position:absolute;left:50%;top:76px;transform:translate(-50%,-8px);opacity:0;pointer-events:none;padding:9px 14px;border:1px solid rgba(57,255,20,.7);border-radius:999px;background:rgba(3,12,8,.94);font:900 10px ui-monospace,monospace;color:#dcffe4;transition:.16s}.rmToast.show{opacity:1;transform:translate(-50%,0)}.rmWarning{padding:8px 10px;border-left:3px solid #ffd76b;background:rgba(255,215,107,.07);font-size:9px;line-height:1.35;color:#ffe8a5;margin-top:8px}
    @media(max-width:720px){#rmGameplayDock{width:calc(100vw - 16px);grid-template-columns:repeat(4,1fr);bottom:max(8px,env(safe-area-inset-bottom))}.rmDockBtn{min-width:0;grid-template-columns:1fr;text-align:center;min-height:46px}.rmDockBtn i{font-size:16px}.rmDockBtn small{display:none}#rmGameplayDrawer{bottom:68px;width:calc(100vw - 12px);max-height:72vh;border-radius:18px}.rmGrid{grid-template-columns:1fr}.rmFull{grid-column:auto}.rmEggs{grid-template-columns:repeat(2,1fr)}.rmDrawerBody{padding:11px}.rmDrawerHead{height:50px}}
  `;
  document.head.appendChild(style);
}

function toast(message, bad = false) {
  const el = root?.querySelector('.rmToast');
  if (!el) return;
  el.textContent = message;
  el.style.borderColor = bad ? 'rgba(255,79,122,.8)' : 'rgba(57,255,20,.7)';
  el.classList.add('show');
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => el.classList.remove('show'), 1400);
}

function persist() {
  try { host?.gameplayCommands?.save(); } catch (_) {}
}

function actionMessage(result, success = 'Updated') {
  if (!result?.ok) return result?.reason?.replaceAll('-', ' ') || 'Action unavailable';
  return success;
}

function renderDock() {
  const s = host.gameplay.state;
  const owned = Object.values(s.upgrades || {}).filter(Boolean).length + Object.values(s.skins || {}).filter(Boolean).length;
  const buttons = [
    ['nest', '🥚', 'Nest', s.pet.hatched ? `LV ${s.pet.level}` : `${s.hatch.taps.length}/3 taps`],
    ['bank', '◇', 'Bank', `${money(s.wallet, 'bones')} bones`],
    ['mall', '▦', 'Mall', `${owned} owned`],
    ['arcade', '◎', 'Arcade', `best ${s.arcade.best}`]
  ];
  dock.innerHTML = buttons.map(([id, icon, label, meta]) => `<button class="rmDockBtn ${activePanel === id && drawerOpen ? 'is-active' : ''}" data-rm-panel="${id}"><i>${icon}</i><span>${label}<small>${esc(meta)}</small></span></button>`).join('');
  dock.querySelectorAll('[data-rm-panel]').forEach((button) => button.addEventListener('click', () => {
    const id = button.dataset.rmPanel;
    if (drawerOpen && activePanel === id) drawerOpen = false;
    else { activePanel = id; drawerOpen = true; }
    render();
  }));
}

function metric(label, value) {
  return `<div class="rmMetric"><span>${esc(label)}</span><span class="rmBar"><i style="width:${clamp(value)}%"></i></span><b>${Math.round(value)}</b></div>`;
}

function renderCampaign() {
  const s = host.gameplay.state;
  const campaign = s.campaign;
  const session = s.mission;
  const next = campaignMissionSpec(campaign, s.district);
  const xpNeed = campaignXpNext(campaign);
  if (!session || session.phase === 'complete' || session.phase === 'failed') {
    return `<div class="rmCard rmFull"><div class="rmSpread"><div><span class="rmEyebrow">Campaign · Rank ${campaign.rank}</span><h3>${esc(next.title)}</h3></div><b>${campaign.xp}/${xpNeed} XP</b></div><p>${esc(next.brief)}</p><p><b>${esc(campaignObjectiveText(next))}</b> · ${next.time}s · reward ${next.reward} Bones + ${next.xp} rank XP</p>${session?.result ? `<div class="rmWarning">Last result: ${esc(session.result)}</div>` : ''}<div class="rmActions"><button class="rmBtn primary" data-rm-campaign-start>Start mission</button></div></div>`;
  }
  const pct = campaignProgressPct(session) * 100;
  const seconds = Math.ceil((session.timeFrames || 0) / 60);
  return `<div class="rmCard rmFull"><div class="rmSpread"><div><span class="rmEyebrow">Mission Active · ${session.combo}× combo</span><h3>${esc(session.mission.title)}</h3></div><b>${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}</b></div><p>${esc(campaignObjectiveText(session.mission))}</p><div class="rmBar"><i style="width:${pct}%"></i></div><p>${Math.floor(session.progress || 0)} / ${session.mission.target} · score ${session.score}</p>${session.mission.kind === 'response' || session.mission.kind === 'boss' ? `<div class="rmWarning">This mission type is preserved in the core, but response-unit/boss entities are not yet connected to the current high-res city renderer.</div>` : ''}</div>`;
}

function renderNest() {
  const s = host.gameplay.state;
  const pet = s.pet;
  const species = getEggSpecies(s.hatch.eggId);
  const taps = s.hatch.taps.length;
  const eggs = MASTER_EGG_SPECIES.map((egg) => `<button class="rmEgg ${s.hatch.eggId === egg.id ? 'active' : ''}" data-rm-egg="${egg.id}" ${pet.hatched ? 'disabled' : ''}><b>${egg.icon}</b><span>${egg.name}</span><small>${egg.trait} → ${egg.evolution}</small><span class="rmTapDots">${[0,1,2].map((i) => `<i class="${s.hatch.eggId === egg.id && taps > i ? 'on' : ''}"></i>`).join('')}</span></button>`).join('');
  const care = pet.hatched ? ['feed','play','clean','rest','train','explore','consume'] : ['rest'];
  const careButtons = care.map((action) => `<button class="rmBtn ${action === 'feed' || action === 'consume' ? 'primary' : ''}" data-rm-care="${action}">${action[0].toUpperCase() + action.slice(1)}</button>`).join('');
  const inventory = Object.entries(s.inventory || {}).filter(([, qty]) => qty > 0).map(([id, qty]) => `<button class="rmBtn" data-rm-use="${id}">${esc(id)} ×${qty}</button>`).join('') || '<span style="font-size:10px;color:rgba(238,247,255,.5)">Inventory empty</span>';
  const dna = s.genome?.dna || s.hatch.dna;
  return `<div class="rmGrid">
    <div class="rmCard rmFull"><span class="rmEyebrow">${pet.hatched ? 'Hatched identity' : 'Three-tap incubation'}</span><h3>${pet.hatched ? esc(pet.name) : 'Choose an egg and tap it 3×'}</h3><p>${species.name} · ${species.trait} · evolves toward ${species.evolution}. The egg tray remains visible after hatch as the source master required.</p><div class="rmEggs">${eggs}</div><input class="rmName" data-rm-name maxlength="18" value="${esc(pet.name)}" aria-label="Kaiju name"></div>
    <div class="rmCard"><h3>Growth</h3>${metric('XP', pet.xp)}${metric('Bond', pet.bond)}<p>${getPetStage(pet)} · mood ${esc(getPetMood(pet))}${dna ? ` · DNA ${esc(dna.slice(0,4))}-${esc(dna.slice(-4))}` : ''}</p></div>
    <div class="rmCard"><h3>Needs</h3>${metric('Food',pet.food)}${metric('Joy',pet.joy)}${metric('Energy',pet.energy)}${metric('Clean',pet.clean)}${metric('Health',pet.health)}</div>
    <div class="rmCard rmFull"><h3>Care loop</h3><div class="rmActions">${careButtons}</div><div class="rmActions">${inventory}</div></div>
    ${renderCampaign()}
    <div class="rmCard rmFull"><h3>Save / migration</h3><p>Current saves use the modular gameplay-core schema. Legacy May Master and v12 exports can be ingested explicitly without inventing missing CharacterEngine IDs.</p><textarea class="rmSaveText" data-rm-save-text placeholder="Exported or legacy JSON"></textarea><div class="rmActions"><button class="rmBtn primary" data-rm-save>Save</button><button class="rmBtn" data-rm-load>Load</button><button class="rmBtn" data-rm-export>Export JSON</button><button class="rmBtn" data-rm-import>Import current</button><button class="rmBtn" data-rm-import-legacy>Import legacy</button></div></div>
  </div>`;
}

function renderBank() {
  const s = host.gameplay.state;
  const profile = getEconomyProfile(s.economyProfile);
  const wallet = profile.currencies.map((currency) => `<div class="rmCoin"><small>${CURRENCY_ICONS[currency] || '•'} ${CURRENCY_LABELS[currency] || currency}</small><b>${money(s.wallet,currency)}</b></div>`).join('');
  const routes = profile.routes.map((route) => {
    const cost = Math.max(1, Math.floor(route.cost * (s.upgrades.vault ? .88 : 1)));
    return `<div class="rmListItem"><div><h4>${CURRENCY_LABELS[route.from]} → ${CURRENCY_LABELS[route.to]}</h4><p>${cost} ${route.from} → ${route.out} ${route.to}${s.upgrades.vault ? ' · Vault -12%' : ''}</p></div><div class="rmActions"><button class="rmBtn primary" data-rm-bank="${route.id}:1">×1</button><button class="rmBtn" data-rm-bank="${route.id}:5">×5</button></div></div>`;
  }).join('');
  return `<div class="rmGrid"><div class="rmCard rmFull"><span class="rmEyebrow">Economy profile · ${esc(profile.id)}</span><h3>Bank</h3><div class="rmWallet">${wallet}</div>${s.economyProfile === 'marketV12' ? '<div class="rmWarning">This imported lineage uses Petrol/Diamond. It is intentionally not merged with the May Master Fossils/Oil economy.</div>' : ''}</div><div class="rmCard rmFull"><div class="rmList">${routes}</div></div></div>`;
}

function priceText(price) { return Object.entries(price).map(([currency, amount]) => `${amount} ${currency}`).join(' + '); }

function renderMall() {
  const s = host.gameplay.state;
  const items = MASTER_SHOP.map((item) => {
    const owned = item.type === 'upgrade' ? Boolean(s.upgrades?.[item.id]) : item.type === 'skin' ? Boolean(s.skins?.[item.id]) : false;
    const qty = item.type === 'item' ? (s.inventory?.[item.id] || 0) : null;
    const compatibleCurrency = Object.keys(item.price).every((currency) => currency in s.wallet);
    const affordable = compatibleCurrency && canAfford(s.wallet,item.price);
    return `<div class="rmListItem"><div><h4>${esc(item.name)} ${owned ? '<span class="rmOwned">✓</span>' : ''}</h4><p>${item.type}${qty !== null ? ` · inventory ${qty}` : ''}</p><span class="rmCost">${priceText(item.price)}</span>${!compatibleCurrency ? '<p>Not available in this imported economy profile.</p>' : ''}</div><button class="rmBtn ${affordable && !owned ? 'primary' : ''}" data-rm-buy="${item.id}" ${owned || !compatibleCurrency ? 'disabled' : ''}>${owned ? 'Owned' : 'Buy'}</button></div>`;
  }).join('');
  return `<div class="rmGrid"><div class="rmCard rmFull"><span class="rmEyebrow">Master shop catalog</span><h3>Mall</h3><p>Consumables, care support, exploration upgrades, economy modifiers and the preserved Neon City cosmetic.</p></div><div class="rmCard rmFull"><div class="rmList">${items}</div></div></div>`;
}

function arcadeSummary() {
  const s = host.gameplay.state.arcade;
  return `<div class="rmSpread"><span>Best <b>${s.best}</b></span><span>Wins <b>${s.wins}</b></span><span>Streak <b>${s.streak}</b></span></div>`;
}

function renderArcade() {
  const s = host.gameplay.state;
  const modeButtons = Object.values(ARCADE_MODES).map((mode) => {
    const entry = mode.entry ? `${mode.entry.amount} ${mode.entry.currency}` : 'free';
    return `<button class="rmBtn ${s.arcade.mode === mode.id ? 'primary' : ''}" data-rm-arcade-mode="${mode.id}">${mode.id} · ${entry}</button>`;
  }).join('');
  const running = arcadeRun ? `<div class="rmSpread"><b>Score <span data-rm-arcade-score>${arcadeRun.score}</span></b><b><span data-rm-arcade-time>${(Math.max(0,arcadeRun.endsAt-performance.now())/1000).toFixed(1)}</span>s</b></div><div class="rmArcadeField" data-rm-arcade-field></div>` : `<div class="rmArcadeField" style="display:grid;place-items:center"><button class="rmBtn primary" data-rm-arcade-start>Start ${esc(s.arcade.mode)} round</button></div>`;
  return `<div class="rmGrid"><div class="rmCard rmFull"><span class="rmEyebrow">Five-second target round</span><h3>Arcade</h3>${arcadeSummary()}<p>Win at ${ARCADE_RULES.winScore}+ hits. Opal at ${ARCADE_RULES.opalScore}+. Premium adds Quartz at ${ARCADE_RULES.premiumQuartzScore}+. Every 20th win is a boss payout.</p><div class="rmActions">${modeButtons}</div>${running}</div></div>`;
}

function renderBody() {
  if (activePanel === 'bank') return renderBank();
  if (activePanel === 'mall') return renderMall();
  if (activePanel === 'arcade') return renderArcade();
  return renderNest();
}

function render() {
  if (!host || !root) return;
  renderDock();
  drawer.classList.toggle('open', drawerOpen);
  const titles = { nest: ['Nest','attachment · growth · campaign'], bank: ['Bank','conversion strategy'], mall: ['Mall','items · upgrades · cosmetics'], arcade: ['Arcade','short skill loop'] };
  const [title, sub] = titles[activePanel];
  drawer.innerHTML = `<div class="rmDrawerHead"><div><strong>${title}</strong><small>${sub}</small></div><button class="rmBtn" data-rm-close aria-label="Close">×</button></div><div class="rmDrawerBody">${renderBody()}</div>`;
  wireDrawer();
  if (arcadeRun && activePanel === 'arcade' && drawerOpen) spawnArcadeTarget(true);
}

function afterMutation(message, bad = false) { persist(); render(); toast(message,bad); }

function wireDrawer() {
  drawer.querySelector('[data-rm-close]')?.addEventListener('click', () => { drawerOpen = false; render(); });
  drawer.querySelector('[data-rm-name]')?.addEventListener('change', (event) => afterMutation(`Name set: ${host.gameplayCommands.setName(event.target.value)}`));
  drawer.querySelectorAll('[data-rm-egg]').forEach((button) => button.addEventListener('click', (event) => {
    const rect = button.getBoundingClientRect();
    const name = drawer.querySelector('[data-rm-name]')?.value || host.gameplay.state.pet.name;
    host.gameplayCommands.setName(name);
    const result = host.gameplayCommands.hatchTap({ x: event.clientX - rect.left, y: event.clientY - rect.top, dt: Date.now() % 100000 }, { eggId: button.dataset.rmEgg, name, nonce: Date.now() });
    const species = getEggSpecies(button.dataset.rmEgg);
    afterMutation(result.hatched ? `${species.name} hatched · ${result.dna.slice(0,4)}-${result.dna.slice(-4)}` : `${species.name}: ${result.remaining} tap${result.remaining === 1 ? '' : 's'} remaining`);
  }));
  drawer.querySelectorAll('[data-rm-care]').forEach((button) => button.addEventListener('click', () => {
    const action = button.dataset.rmCare;
    const result = host.gameplayCommands.care(action);
    if (result.ok && action === 'consume' && host.gameplay.state.mission?.phase === 'active' && host.gameplay.state.mission.mission.kind === 'feed') {
      host.gameplayCommands.campaignScore(36,'FEED CHAIN');
      host.gameplayCommands.campaignProgress(1,{ districtCount: 5 });
    }
    afterMutation(actionMessage(result, `${action} complete`), !result.ok);
  }));
  drawer.querySelectorAll('[data-rm-use]').forEach((button) => button.addEventListener('click', () => { const r=host.gameplayCommands.useItem(button.dataset.rmUse); afterMutation(actionMessage(r,`${button.dataset.rmUse} used`),!r.ok); }));
  drawer.querySelectorAll('[data-rm-bank]').forEach((button) => button.addEventListener('click', () => { const [route,count]=button.dataset.rmBank.split(':'); const r=host.gameplayCommands.convert(route,Number(count)); afterMutation(actionMessage(r,r.ok?`Converted ${r.spent} ${r.from} → ${r.gained} ${r.to}`:'Conversion failed'),!r.ok); }));
  drawer.querySelectorAll('[data-rm-buy]').forEach((button) => button.addEventListener('click', () => { const r=host.gameplayCommands.buy(button.dataset.rmBuy); afterMutation(actionMessage(r,r.ok?`${r.item.name} acquired`:'Purchase failed'),!r.ok); }));
  drawer.querySelectorAll('[data-rm-arcade-mode]').forEach((button) => button.addEventListener('click', () => { host.gameplay.state.arcade.mode=button.dataset.rmArcadeMode; render(); }));
  drawer.querySelector('[data-rm-arcade-start]')?.addEventListener('click', () => startArcade(host.gameplay.state.arcade.mode));
  drawer.querySelector('[data-rm-campaign-start]')?.addEventListener('click', () => { host.gameplayCommands.beginCampaign(host.gameplay.state.district); persist(); render(); toast('Mission started'); });
  const text = drawer.querySelector('[data-rm-save-text]');
  drawer.querySelector('[data-rm-save]')?.addEventListener('click', () => { host.gameplayCommands.save(); toast('Saved'); });
  drawer.querySelector('[data-rm-load]')?.addEventListener('click', () => { host.gameplayCommands.load(); render(); toast('Save loaded'); });
  drawer.querySelector('[data-rm-export]')?.addEventListener('click', async () => { const value=host.gameplayCommands.export(); if(text) text.value=value; try{await navigator.clipboard?.writeText(value);toast('Export copied');}catch(_){toast('Export placed in text box');} });
  drawer.querySelector('[data-rm-import]')?.addEventListener('click', () => { const r=host.gameplayCommands.import(text?.value||''); afterMutation(actionMessage(r,'Current save imported'),!r.ok); });
  drawer.querySelector('[data-rm-import-legacy]')?.addEventListener('click', () => { const r=host.gameplayCommands.importLegacy(text?.value||''); const message=r.ok ? `Legacy ${r.format} imported${r.warnings?.length ? ` · ${r.warnings.length} warning(s)` : ''}` : actionMessage(r,'Legacy imported'); afterMutation(message,!r.ok); });
}

function clearArcadeTimers() {
  clearTimeout(arcadeTimer); clearTimeout(arcadeSpawnTimer); clearInterval(arcadeTicker);
  arcadeTimer = arcadeSpawnTimer = arcadeTicker = null;
}

function startArcade(mode) {
  clearArcadeTimers();
  const entry = host.gameplayCommands.enterArcade(mode);
  if (!entry.ok) { toast(actionMessage(entry),true); return; }
  arcadeRun = { mode, score: 0, endsAt: performance.now() + ARCADE_RULES.roundMs };
  render();
  spawnArcadeTarget(true);
  arcadeTicker = setInterval(() => {
    const scoreEl = drawer?.querySelector('[data-rm-arcade-score]');
    const timeEl = drawer?.querySelector('[data-rm-arcade-time]');
    if (scoreEl) scoreEl.textContent = arcadeRun?.score ?? 0;
    if (timeEl && arcadeRun) timeEl.textContent = (Math.max(0,arcadeRun.endsAt-performance.now())/1000).toFixed(1);
  },100);
  arcadeTimer = setTimeout(finishArcade,ARCADE_RULES.roundMs);
}

function spawnArcadeTarget(force = false) {
  if (!arcadeRun || activePanel !== 'arcade' || !drawerOpen) return;
  const field = drawer.querySelector('[data-rm-arcade-field]');
  if (!field) return;
  if (!force) field.querySelector('.rmArcTarget')?.remove();
  else if (field.querySelector('.rmArcTarget')) return;
  const target=document.createElement('button'); target.className='rmArcTarget'; target.textContent='◆'; target.setAttribute('aria-label','Arcade target');
  const maxX=Math.max(0,field.clientWidth-50),maxY=Math.max(0,field.clientHeight-50); target.style.left=`${Math.random()*maxX}px`; target.style.top=`${Math.random()*maxY}px`;
  target.addEventListener('click',()=>{ if(!arcadeRun)return; arcadeRun.score+=1; target.remove(); spawnArcadeTarget(); });
  field.appendChild(target);
  clearTimeout(arcadeSpawnTimer); arcadeSpawnTimer=setTimeout(()=>{target.remove();spawnArcadeTarget();},arcadeSpawnDelay(host.gameplay.state.arcade.wins));
}

function finishArcade() {
  if (!arcadeRun) return;
  const run=arcadeRun; arcadeRun=null; clearArcadeTimers(); const reward=host.gameplayCommands.settleArcade(run.score,run.mode); persist(); render(); toast(reward.win?`Win · +${reward.bones} Bones${reward.opal?` +${reward.opal} Opal`:''}${reward.quartz?` +${reward.quartz} Quartz`:''}`:`Round ${reward.score} · +${reward.bones} Bones`);
}

function startCampaignClock() {
  if (campaignClock) return;
  campaignClock=setInterval(()=>{
    const session=host?.gameplay?.state?.mission;
    if (!session || session.phase!=='active') return;
    const result=host.gameplayCommands.campaignTick(15);
    campaignRenderTick=(campaignRenderTick+1)%4;
    if (result.expired) { persist(); if(drawerOpen&&activePanel==='nest')render(); toast('Mission failed · time expired',true); }
    else if (campaignRenderTick===0 && drawerOpen && activePanel==='nest') render();
  },250);
}

export function attachGameplayPanels(nextHost) {
  if (!nextHost?.gameplayCommands || !nextHost?.gameplay) throw new Error('Gameplay panels require the gameplay bridge.');
  host=nextHost; injectStyles();
  root=document.createElement('div'); root.id='rmGameplayUI'; root.innerHTML='<div class="rmToast"></div><div id="rmGameplayDrawer"></div><nav id="rmGameplayDock" aria-label="RampageMaster destinations"></nav>';
  document.body.appendChild(root); drawer=root.querySelector('#rmGameplayDrawer'); dock=root.querySelector('#rmGameplayDock');
  render(); startCampaignClock(); document.body.dataset.gameplayPanels='ready'; return { root, render:()=>render(), open:(panel='nest')=>{activePanel=PANEL_IDS.includes(panel)?panel:'nest';drawerOpen=true;render();}, close:()=>{drawerOpen=false;render();} };
}

if (typeof window!=='undefined' && typeof document!=='undefined') {
  window.addEventListener('rampagemaster:gameplay-ready',()=>{
    try { if(!document.querySelector('#rmGameplayUI')) window.RampageMaster.gameplayPanels=attachGameplayPanels(window.RampageMaster); }
    catch(error){console.error('[RampageMaster gameplay panels]',error);document.body.dataset.gameplayPanels='error';}
  });
}
