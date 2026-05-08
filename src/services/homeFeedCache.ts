/** Snapshot ligero del home para mostrar datos al volver atrás sin esperar la red. */

const KEY = 'cv_home_feed_v1'
const MAX_AGE_MS = 120_000

export type HomeFeedSnapshot = {
  at: number
  featured: unknown[]
  recent: unknown[]
  forYou: unknown[]
  boosted: unknown[]
  offers: unknown[]
  categories: unknown[]
  timeframe: string
}

export function readHomeFeedCache(expectedTimeframe: string): Omit<HomeFeedSnapshot, 'at'> | null {
  try {
    const raw = sessionStorage.getItem(KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as HomeFeedSnapshot
    if (!parsed?.at || Date.now() - parsed.at > MAX_AGE_MS) return null
    if (parsed.timeframe !== expectedTimeframe) return null
    return {
      featured: parsed.featured,
      recent: parsed.recent,
      forYou: parsed.forYou,
      boosted: parsed.boosted,
      offers: parsed.offers,
      categories: parsed.categories,
      timeframe: parsed.timeframe
    }
  } catch {
    return null
  }
}

export function writeHomeFeedCache(snapshot: Omit<HomeFeedSnapshot, 'at'>): void {
  try {
    const payload: HomeFeedSnapshot = { ...snapshot, at: Date.now() }
    sessionStorage.setItem(KEY, JSON.stringify(payload))
  } catch {
    /* quota / private mode */
  }
}
