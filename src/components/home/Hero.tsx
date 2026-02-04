import { useEffect, useMemo, useState } from 'react'

type AdminBanner = {
  imageUrl: string
  buttonText?: string
  buttonUrl?: string
  buttonPosition?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'
}

type HeroProps = {
  adminBanners?: AdminBanner[]
}

export function Hero({ adminBanners }: HeroProps) {
  const staticImages = useMemo(
    () => [
      '/image/home-image-banner/JSBANNER.png',
      '/image/home-image-banner/bisi.webp',
      '/image/home-image-banner/muebes.webp',
      '/image/home-image-banner/play.webp',
      '/image/home-image-banner/zapas.webp'
    ],
    []
  )

  // Build combined list: static images first, then admin banners (if any)
  type CombinedItem = { src: string; banner?: AdminBanner }
  const combined: CombinedItem[] = useMemo(() => {
    const statics: CombinedItem[] = staticImages.map((src) => ({ src }))
    const admins: CombinedItem[] = (adminBanners || []).map((b) => ({ src: b.imageUrl, banner: b }))
    return [...statics, ...admins]
  }, [staticImages, adminBanners])

  const [index, setIndex] = useState(0)

  useEffect(() => {
    if (combined.length === 0) return
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % combined.length)
    }, 4500)
    return () => clearInterval(timer)
  }, [combined.length])

  return (
    <section className="mt-4 space-y-8">
      <div className="relative overflow-hidden rounded-2xl bg-surface shadow-soft">
        <div className="aspect-[1920/500] w-full bg-background">
          {combined.map((item, i) => (
            <div key={`${item.src}-${i}`} className={`absolute inset-0 h-full w-full transition-opacity duration-700 ${i === index ? 'opacity-100' : 'opacity-0'}`}>
              <img src={item.src} alt={`Banner ${i + 1}`} className="h-full w-full object-contain" loading="lazy" />
              {item.banner?.buttonText && item.banner?.buttonUrl ? (
                <a
                  href={item.banner.buttonUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`absolute z-10 rounded-full border border-white/60 bg-black/60 px-3 py-1 text-[11px] font-semibold text-white shadow-lg backdrop-blur ${
                    item.banner.buttonPosition === 'top-left'
                      ? 'left-3 top-3'
                      : item.banner.buttonPosition === 'top-right'
                      ? 'right-3 top-3'
                      : item.banner.buttonPosition === 'bottom-left'
                      ? 'left-3 bottom-3'
                      : 'right-3 bottom-3'
                  }`}
                >
                  {item.banner.buttonText}
                </a>
              ) : null}
            </div>
          ))}
        </div>
        <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-2 z-20">
          {combined.map((_, i) => (
            <button
              key={i}
              onClick={() => setIndex(i)}
              className={`h-2.5 w-2.5 rounded-full transition ${i === index ? 'bg-white' : 'bg-white/40'}`}
              aria-label={`Ir a banner ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
