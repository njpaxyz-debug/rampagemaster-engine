import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const html = await readFile(new URL('../src/index.modular.html', import.meta.url), 'utf8');
const required = [
  './app.js',
  './appGameplayBridge.js',
  './gameplayPanels.js',
  './visualSkinControls.js',
  './cityGameplayBridge.js',
  './campaignEncounterBridge.js',
  './citizenGameplayBridge.js',
  './campaignStatusHud.js'
];
for (const src of required) assert.ok(html.includes(`src="${src}"`), `launcher must load ${src}`);
const positions = required.map((src) => html.indexOf(`src="${src}"`));
for (let i = 1; i < positions.length; i += 1) assert.ok(positions[i] > positions[i - 1], `${required[i]} must load after ${required[i - 1]}`);
assert.ok(html.includes('live citizen feeding'));
assert.ok(html.includes('response/boss encounters'));

console.log('modular launcher integration: ok');