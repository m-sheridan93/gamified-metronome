/**
 * Stable ids for stored records (sessions, presets).
 * crypto.randomUUID only exists in secure contexts (https / localhost), so fall back
 * for plain-http testing such as opening the dev server on a phone over wifi.
 */
export function newId() {
  if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID()
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`
}
