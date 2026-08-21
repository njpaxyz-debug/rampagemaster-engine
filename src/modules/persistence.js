export function createMemoryStorage(seed = {}) {
  const data = new Map(Object.entries(seed));
  return {
    getItem(key) { return data.has(key) ? data.get(key) : null; },
    setItem(key, value) { data.set(key, String(value)); },
    removeItem(key) { data.delete(key); },
    clear() { data.clear(); },
    dump() { return Object.fromEntries(data); }
  };
}

export function resolveStorage(candidate = globalThis?.localStorage) {
  if (candidate && typeof candidate.getItem === 'function' && typeof candidate.setItem === 'function') {
    try {
      const key = '__rm_storage_probe__';
      candidate.setItem(key, '1');
      candidate.removeItem(key);
      return candidate;
    } catch (_) {}
  }
  return createMemoryStorage();
}

export function normalizeSerializable(value) {
  return JSON.parse(JSON.stringify(value ?? null));
}

export function exportRampageState(state, { version = 'rampagemaster-pilot-v1', meta = {} } = {}) {
  return JSON.stringify({ version, exportedAt: new Date().toISOString(), meta: normalizeSerializable(meta), state: normalizeSerializable(state) }, null, 2);
}

export function importRampageState(text, { normalize = (state) => state } = {}) {
  let parsed;
  try { parsed = typeof text === 'string' ? JSON.parse(text) : text; }
  catch (error) { return { ok: false, reason: 'invalid-json', error }; }
  const candidate = parsed?.state ?? parsed;
  if (!candidate || typeof candidate !== 'object' || Array.isArray(candidate)) return { ok: false, reason: 'invalid-state' };
  try { return { ok: true, state: normalize(normalizeSerializable(candidate)), envelope: parsed?.state ? parsed : null }; }
  catch (error) { return { ok: false, reason: 'normalization-failed', error }; }
}

export function createStateStore({ key = 'rampagemaster_pilot_state', storage = resolveStorage(), normalize = (state) => state } = {}) {
  return {
    key,
    storage,
    load(fallback = null) {
      const raw = storage.getItem(key);
      if (!raw) return fallback;
      const result = importRampageState(raw, { normalize });
      return result.ok ? result.state : fallback;
    },
    save(state) {
      const clean = normalize(normalizeSerializable(state));
      storage.setItem(key, JSON.stringify(clean));
      return clean;
    },
    clear() { storage.removeItem(key); },
    export(state, options = {}) { return exportRampageState(state, options); },
    import(text) { return importRampageState(text, { normalize }); }
  };
}
