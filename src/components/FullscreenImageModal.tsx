import { useEffect, useState, useRef } from 'react'
import { FaTimes, FaChevronLeft, FaChevronRight } from 'react-icons/fa'

type Props = {
  images: string[]
  initialIndex?: number
  onClose: () => void
}

export default function FullscreenImageModal({ images, initialIndex = 0, onClose }: Props) {
  const [index, setIndex] = useState(initialIndex)
  const touchStartX = useRef<number | null>(null)

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowRight') setIndex((i) => (i + 1) % images.length)
      if (e.key === 'ArrowLeft') setIndex((i) => (i - 1 + images.length) % images.length)
    }
    document.addEventListener('keydown', handleKey)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handleKey)
      document.body.style.overflow = prevOverflow
    }
  }, [images.length, onClose])

  if (!images || images.length === 0) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90"
      onClick={onClose}
    >
      <button
        onClick={(e) => { e.stopPropagation(); onClose() }}
        className="absolute top-6 right-6 z-60 rounded bg-white/10 p-4 touch-none text-white"
        aria-label="Cerrar"
        style={{ minWidth: 44, minHeight: 44 }}
      >
        <FaTimes />
      </button>

      {images.length > 1 && (
        <button
          onClick={(e) => { e.stopPropagation(); setIndex((i) => (i - 1 + images.length) % images.length) }}
          className="absolute left-6 top-1/2 z-60 -translate-y-1/2 rounded bg-white/10 p-4 text-white"
          aria-label="Anterior"
        >
          <FaChevronLeft />
        </button>
      )}

      {images.length > 1 && (
        <button
          onClick={(e) => { e.stopPropagation(); setIndex((i) => (i + 1) % images.length) }}
          className="absolute right-6 top-1/2 z-60 -translate-y-1/2 rounded bg-white/10 p-4 text-white"
          aria-label="Siguiente"
        >
          <FaChevronRight />
        </button>
      )}

      <div
        className="max-h-[80vh] max-w-[95vw] flex flex-col items-center justify-center"
        onClick={(e) => e.stopPropagation()}
        onTouchStart={(e) => { if (e.touches && e.touches[0]) touchStartX.current = e.touches[0].clientX }}
        onTouchEnd={(e) => {
          if (touchStartX.current == null) return
          const endX = (e.changedTouches && e.changedTouches[0]) ? e.changedTouches[0].clientX : null
          if (endX == null) return
          const diff = touchStartX.current - endX
          const threshold = 50
          if (diff > threshold) {
            setIndex((i) => (i + 1) % images.length)
          } else if (diff < -threshold) {
            setIndex((i) => (i - 1 + images.length) % images.length)
          }
          touchStartX.current = null
        }}
      >
        <div className="flex items-center justify-center w-full">
          <img src={images[index]} alt={`Imagen ${index + 1}`} className="max-h-[70vh] max-w-[95vw] object-contain" loading="eager" decoding="async" />
        </div>

        {images.length > 1 && (
          <div className="mt-4 w-full overflow-x-auto">
            <div className="flex gap-2 px-2">
              {images.map((src, i) => (
                <button
                  key={`${src}-${i}`}
                  onClick={(e) => { e.stopPropagation(); setIndex(i) }}
                  className={`flex-shrink-0 rounded-md overflow-hidden border ${i === index ? 'ring-2 ring-primary/60' : 'border-card/40'} focus:outline-none`}
                  style={{ minWidth: 48, minHeight: 48 }}
                  aria-label={`Ver imagen ${i + 1}`}
                >
                  <img src={src} alt={`Miniatura ${i + 1}`} className="h-12 w-12 sm:h-16 sm:w-16 object-cover" loading="lazy" decoding="async" />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="absolute bottom-6 text-white/90">{index + 1} / {images.length}</div>
    </div>
  )
}
