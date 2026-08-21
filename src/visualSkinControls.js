import { getHighResKaijuSkin, getHighResKaijuSkinStatus, listHighResKaijuSkins, loadHighResKaijuSkin } from './modules/visualHighRes.js';

function labelFor(id) {
  return listHighResKaijuSkins().find((skin) => skin.id === id)?.label || id;
}

export async function toggleHighResSkin() {
  const current = getHighResKaijuSkin();
  const next = current === 'procedural' ? 'drive-reptile' : 'procedural';
  return loadHighResKaijuSkin(next);
}

export function attachVisualSkinControls(host = window.RampageMaster) {
  const nav = document.querySelector('.controls');
  if (!nav || nav.querySelector('[data-rampage-skin]')) return null;
  const button = document.createElement('button');
  button.dataset.rampageSkin = 'true';
  const renderLabel = () => {
    const status = getHighResKaijuSkinStatus();
    button.textContent = status.activeSkin === 'drive-reptile' ? (status.driveReady ? 'Skin: Drive Sprite' : 'Skin: Drive Loading…') : 'Skin: Procedural';
    button.title = `${labelFor(status.activeSkin)}${status.driveError ? ` · ${status.driveError}` : ''}`;
    button.classList.toggle('is-active', status.activeSkin === 'drive-reptile');
  };
  button.addEventListener('click', async () => {
    button.disabled = true;
    await toggleHighResSkin();
    button.disabled = false;
    renderLabel();
  });
  nav.appendChild(button);
  renderLabel();
  if (host) {
    host.visualSkins = Object.freeze({
      list: listHighResKaijuSkins,
      get: getHighResKaijuSkin,
      status: getHighResKaijuSkinStatus,
      select: loadHighResKaijuSkin,
      toggle: toggleHighResSkin
    });
  }
  return button;
}

if (typeof window !== 'undefined' && typeof document !== 'undefined') {
  const attach = () => attachVisualSkinControls(window.RampageMaster);
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', attach, { once: true });
  else attach();
}
