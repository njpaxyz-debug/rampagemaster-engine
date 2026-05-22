/* RampageMASTER SAFE v3 egg boot guard
   Purpose: the base v6 game remains the source of truth. This guard only repairs
   the launch screen when the normal load handler is skipped or the egg tray is
   left empty. It does not introduce new kaiju, new taxonomy, or new gameplay. */
(function(){
  'use strict';
  const LOG = '[RM BOOT]';
  let attempts = 0;
  function byId(id){ return document.getElementById(id); }
  function trayEmpty(){ const tray=byId('etray'); return !!tray && tray.children.length===0; }
  function eggScreenVisible(){ const es=byId('es'); return !!es && !es.classList.contains('hidden'); }
  function manualEggs(){
    const tray=byId('etray');
    if(!tray || tray.children.length) return false;
    if(typeof EGG_POOLS === 'undefined' || typeof selectEgg !== 'function') return false;
    const pool=[...EGG_POOLS];
    const chosen=[];
    for(let i=0;i<3 && pool.length;i++){
      const idx=Math.floor(Math.random()*pool.length);
      chosen.push(pool.splice(idx,1)[0]);
    }
    tray.innerHTML='';
    tray.style.display='flex';
    chosen.forEach((egg,i)=>{
      const slot=document.createElement('button');
      slot.type='button';
      slot.className='eslot rmEggButton';
      slot.setAttribute('aria-label', egg.label || ('Egg '+(i+1)));
      slot.style.background='transparent';
      slot.style.border='0';
      slot.style.color='inherit';
      slot.innerHTML=`<div class="eshell" id="egg${i}" style="background:linear-gradient(135deg,${egg.colors[0]},${egg.colors[1]});color:${egg.accent};box-shadow:0 0 24px ${egg.accent}66"></div><div class="elabel">${egg.label}</div><div class="erarity" style="color:${egg.accent}">${egg.rarity}</div>`;
      slot.addEventListener('click',()=>selectEgg(i,egg),{once:true});
      slot.addEventListener('touchstart',(ev)=>{ev.preventDefault();selectEgg(i,egg);},{once:true,passive:false});
      tray.appendChild(slot);
    });
    console.info(LOG,'manual egg tray repaired',tray.children.length);
    return tray.children.length>0;
  }
  function repairEggTray(){
    attempts++;
    const tray=byId('etray');
    if(!tray) return;
    try { if(typeof G !== 'undefined' && G && G.petType && byId('es')?.classList.contains('hidden')) return; } catch(_){}
    if(!eggScreenVisible()) return;
    if(!trayEmpty()) return;
    try { if(typeof initEggs === 'function') initEggs(); } catch(e) { console.warn(LOG,'initEggs failed',e); }
    if(trayEmpty()) manualEggs();
    if(trayEmpty()){
      const sub=byId('esub');
      if(sub) sub.textContent='EGG BOOT NEEDS BASE GAME SCRIPT';
      console.error(LOG,'egg tray still empty after repair attempt', attempts);
    }
  }
  function bootBaseIfNeeded(){
    try { if(typeof resize==='function') resize(); } catch(e){ console.warn(LOG,'resize failed',e); }
    try { if(typeof genStars==='function') genStars(); } catch(e){ console.warn(LOG,'genStars failed',e); }
    try { if(typeof esResize==='function') esResize(); } catch(e){ console.warn(LOG,'esResize failed',e); }
    try { if(typeof G !== 'undefined' && (!G || !G.petType) && typeof loadState==='function') loadState(); } catch(e){ console.warn(LOG,'loadState failed',e); }
    repairEggTray();
  }
  function schedule(){ [0,80,250,700,1500,3000].forEach(ms=>setTimeout(bootBaseIfNeeded,ms)); }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',schedule,{once:true});
  else schedule();
  window.addEventListener('load',schedule,{once:true});
  window.RampageEggBootGuard = { repairEggTray, manualEggs, bootBaseIfNeeded, version:'safe-v3' };
})();
