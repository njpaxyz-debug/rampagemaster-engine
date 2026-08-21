import assert from 'node:assert/strict';
import { createMemoryStorage, createStateStore, exportRampageState, importRampageState } from '../src/modules/persistence.js';

const storage = createMemoryStorage();
const normalize = (s) => ({ ...s, bones: Math.max(0, Math.floor(s.bones || 0)) });
const store = createStateStore({ key: 'rm', storage, normalize });
store.save({ bones: 12.8, nested: { ok: true } }); assert.deepEqual(store.load(), { bones: 12, nested: { ok: true } });
const text = exportRampageState({ bones: 7 }, { version: 'test' });
const imported = importRampageState(text, { normalize }); assert.equal(imported.ok, true); assert.equal(imported.state.bones, 7); assert.equal(imported.envelope.version, 'test');
assert.equal(importRampageState('{nope').reason, 'invalid-json');
store.clear(); assert.equal(store.load(null), null);
console.log('persistence: ok');
