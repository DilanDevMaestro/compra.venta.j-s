import { useEffect, useMemo, useState } from 'react'

export function Hero() {
  const initialImages = useMemo(
    () => [
      '/image/home-image-banner/JSBANNER.png',
      '/image/home-image-banner/bisi.webp',
      '/image/home-image-banner/muebes.webp',
      '/image/home-image-banner/play.webp',
      '/image/home-image-banner/zapas.webp'
    ],
    []
  )
  const [images, setImages] = useState<string[]>(initialImages)
  const [index, setIndex] = useState(0)



  useEffect(() => {
    if (images.length === 0) return
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % images.length)
    }, 4500)
    return () => clearInterval(timer)
  }, [images.length])

  return (
    <section className="mt-4 space-y-8">
      <div className="relative overflow-hidden rounded-3xl bg-surface shadow-soft">
        <div className="aspect-[1920/500] w-full bg-background">
        {images.map((src, i) => (
          <img
            key={src}
            src={src}
            alt={`Banner ${i + 1}`}
            className={`absolute inset-0 h-full w-full object-contain transition-opacity duration-700 ${
              i === index ? 'opacity-100' : 'opacity-0'
            }`}
            loading="lazy"
          />
        ))}
        </div>
        <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-2">
          {images.map((_, i) => (
            <button
              key={i}
              onClick={() => setIndex(i)}
              className={`h-2.5 w-2.5 rounded-full transition ${
                i === index ? 'bg-white' : 'bg-white/40'
              }`}
              aria-label={`Ir a banner ${i + 1}`}
            />
          ))}
        </div>
      </div>

    </section>
  )
}
