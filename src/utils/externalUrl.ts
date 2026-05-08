/** Devuelve URL válida para href (agrega https si falta). */
export function normalizeExternalUrl(raw: string): string {
  const t = String(raw || '').trim()
  if (!t) return ''
  if (/^https?:\/\//i.test(t)) return t
  if (/^mailto:/i.test(t)) return t
  return `https://${t}`
}
