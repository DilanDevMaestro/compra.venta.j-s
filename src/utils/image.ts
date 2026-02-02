import { config } from '../config/config'

export function buildSrcSet(url?: string) {
  if (!url) return undefined
  try {
    const widths = [480, 768, 1024, 1366, 1920]
    // Use backend proxy to transform images (safe, avoids relying on external providers)
    return widths.map((w) => `${config.API_URL.replace(/\/$/, '')}/image?url=${encodeURIComponent(url)}&w=${w}&fmt=webp ${w}w`).join(', ')
  } catch {
    return undefined
  }
}

export function buildSrc(url?: string, desiredWidth?: number) {
  if (!url || !desiredWidth) return url
  try {
    return `${config.API_URL.replace(/\/$/, '')}/image?url=${encodeURIComponent(url)}&w=${desiredWidth}&fmt=webp`
  } catch {
    return url
  }
}
