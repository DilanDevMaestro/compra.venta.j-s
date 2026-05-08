export type LocationData = {
  country?: string
  countryCode?: string
  region?: string
  city?: string
  postalCode?: string
  areaCode?: string
  lat?: number
  lng?: number
}

type CachedLocation = {
  data: LocationData
  updatedAt: number
}

const cacheKey = 'cv_location_cache_v1'
const maxAgeMs = 24 * 60 * 60 * 1000

const readCache = (): LocationData | null => {
  try {
    const raw = localStorage.getItem(cacheKey)
    if (!raw) return null
    const parsed = JSON.parse(raw) as CachedLocation
    if (!parsed?.data || !parsed?.updatedAt) return null
    if (Date.now() - parsed.updatedAt > maxAgeMs) return null
    return parsed.data
  } catch {
    return null
  }
}

const writeCache = (data: LocationData) => {
  try {
    const payload: CachedLocation = { data, updatedAt: Date.now() }
    localStorage.setItem(cacheKey, JSON.stringify(payload))
  } catch {
    // ignore storage errors
  }
}

const reverseGeocode = async (lat: number, lng: number): Promise<LocationData | null> => {
  const url = new URL('https://nominatim.openstreetmap.org/reverse')
  url.searchParams.set('format', 'jsonv2')
  url.searchParams.set('lat', String(lat))
  url.searchParams.set('lon', String(lng))
  url.searchParams.set('zoom', '10')
  url.searchParams.set('addressdetails', '1')
  url.searchParams.set('accept-language', 'es')

  const res = await fetch(url.toString())
  if (!res.ok) return null
  const data = await res.json()
  const address = data?.address || {}

  return {
    country: address.country,
    countryCode: address.country_code ? String(address.country_code).toUpperCase() : undefined,
    region: address.state || address.region || address.state_district,
    city: address.city || address.town || address.village || address.municipality,
    postalCode: address.postcode,
    lat,
    lng
  }
}

const ipFallback = async (): Promise<LocationData | null> => {
  try {
    const res = await fetch('https://ipapi.co/json/')
    if (!res.ok) return null
    const data = await res.json()
    return {
      country: data?.country_name,
      countryCode: data?.country_code,
      region: data?.region,
      city: data?.city,
      postalCode: data?.postal,
      lat: Number(data?.latitude),
      lng: Number(data?.longitude)
    }
  } catch {
    return null
  }
}

export const detectLocation = async (force = false): Promise<LocationData | null> => {
  if (typeof window === 'undefined') return null

  if (!force) {
    const cached = readCache()
    if (cached) return cached
  }

  if (!navigator.geolocation) {
    const fallback = await ipFallback()
    if (fallback) writeCache(fallback)
    return fallback
  }

  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude
        const lng = pos.coords.longitude
        const data = await reverseGeocode(lat, lng)
        const resolved = data || (await ipFallback())
        if (resolved) writeCache(resolved)
        resolve(resolved)
      },
      async () => {
        const fallback = await ipFallback()
        if (fallback) writeCache(fallback)
        resolve(fallback)
      },
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 60000 }
    )
  })
}

export const getCachedLocation = (): LocationData | null => {
  if (typeof window === 'undefined') return null
  return readCache()
}
