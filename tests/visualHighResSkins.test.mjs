import assert from 'node:assert/strict';
import { deriveVisualRig, getHighResKaijuSkin, getHighResKaijuSkinStatus, listHighResKaijuSkins, setHighResKaijuSkin } from '../src/modules/visualHighRes.js';

const skins = listHighResKaijuSkins();
assert.deepEqual(skins.map((skin) => skin.id), ['procedural', 'drive-reptile']);
assert.equal(getHighResKaijuSkin(), 'procedural');
let result = setHighResKaijuSkin('drive-reptile');
assert.equal(result.ok, true); assert.equal(getHighResKaijuSkin(), 'drive-reptile'); assert.equal(getHighResKaijuSkinStatus().driveReady, false);
result = setHighResKaijuSkin('procedural'); assert.equal(result.ok, true); assert.equal(getHighResKaijuSkin(), 'procedural');
assert.equal(setHighResKaijuSkin('not-real').reason, 'unknown-skin');
const rig = deriveVisualRig({ phylum: 'draco' }, { height: 82, bulk: 76, terror: 86 }, { time: 1 });
assert.ok(rig.scale > 1); assert.ok(rig.torso.w > 100);
console.log('high-res visual skins: ok');
