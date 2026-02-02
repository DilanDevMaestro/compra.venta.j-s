import { useRef } from 'react'
import { Link } from 'react-router-dom'
import type { Listing } from '../../data/listings'

type ListingSectionProps = {
  title: string
  items: Listing[]
  highlight?: 'offer'
  layout?: 'grid' | 'scroll'
  gridClassName?: string
  viewMoreLink?: string
}

export function ListingSection({
  title,
  items,
  highlight,
  layout = 'grid',
  gridClassName,
  viewMoreLink
}: ListingSectionProps) {
  const scrollRef = useRef<HTMLDivElement | null>(null)

  const handleScroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return
    const amount = direction === 'left' ? -240 : 240
    scrollRef.current.scrollBy({ left: amount, behavior: 'smooth' })
  }

  return (
    <section className="mt-6">
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-sm font-semibold">{title}</h2>
        {viewMoreLink ? (
          <Link to={viewMoreLink} className="text-[10px] font-semibold uppercase tracking-widest text-muted">
            Ver más
          </Link>
        ) : (
          <button className="text-[10px] font-semibold uppercase tracking-widest text-muted">Ver más</button>
        )}
      </div>
      {layout === 'scroll' ? (
        <div className="relative">
          <button
            onClick={() => handleScroll('left')}
            className="absolute left-1 top-1/2 z-10 -translate-y-1/2 rounded-full border border-black/10 bg-surface/90 px-1.5 py-0.5 text-[10px] font-semibold text-foreground shadow-soft dark:border-white/10"
            aria-label="Desplazar a la izquierda"
          >
            ‹
          </button>
          <div ref={scrollRef} className="overflow-x-auto overscroll-x-contain pb-2 pl-8 pr-8 scrollbar-hidden">
            <div className="flex gap-2">
            {items.map((item) => (
              <Link
                key={item.id}
                to={`/publicacion/${item.id}`}
                className="w-[150px] sm:w-[170px] shrink-0 overflow-hidden rounded-xl border border-black/10 bg-surface transition hover:-translate-y-0.5 dark:border-white/10"
              >
                <div className="h-20 overflow-hidden">
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                </div>
                <div className="flex h-[120px] flex-col p-2">
                  <p className="line-clamp-2 text-[10px] font-semibold">{item.title}</p>
                  <p className="mt-1 text-[9px] text-muted">{item.location}</p>
                  <p className={`mt-1 text-[12px] font-bold ${highlight === 'offer' ? 'text-offer' : 'text-price'}`}>
                    ${item.price.toLocaleString('es-AR')}
                  </p>
                  <span className="mt-auto inline-flex rounded-full border border-black/10 px-2 py-0.5 text-[9px] font-semibold text-foreground dark:border-white/10">
                    Ver detalles
                  </span>
                </div>
              </Link>
            ))}
            </div>
          </div>
          <button
            onClick={() => handleScroll('right')}
            className="absolute right-1 top-1/2 z-10 -translate-y-1/2 rounded-full border border-black/10 bg-surface/90 px-1.5 py-0.5 text-[10px] font-semibold text-foreground shadow-soft dark:border-white/10"
            aria-label="Desplazar a la derecha"
          >
            ›
          </button>
        </div>
      ) : (
        <div className={gridClassName || "grid gap-1.5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"}>
        {items.map((item) => (
          <Link
            key={item.id}
            to={`/publicacion/${item.id}`}
            className="overflow-hidden rounded-xl border border-black/10 bg-surface transition hover:-translate-y-0.5 dark:border-white/10"
          >
            <div className="h-20 overflow-hidden">
              <img
                src={item.imageUrl}
                alt={item.title}
                className="h-full w-full object-cover"
                loading="lazy"
              />
            </div>
            <div className="flex h-[120px] flex-col p-2">
              <p className="line-clamp-2 text-[10px] font-semibold">{item.title}</p>
              <p className="mt-1 text-[9px] text-muted">{item.location}</p>
              <p className={`mt-1 text-[12px] font-bold ${highlight === 'offer' ? 'text-offer' : 'text-price'}`}>
                ${item.price.toLocaleString('es-AR')}
              </p>
              <span className="mt-auto inline-flex rounded-full border border-black/10 px-2 py-0.5 text-[9px] font-semibold text-foreground dark:border-white/10">
                Ver detalles
              </span>
            </div>
          </Link>
        ))}
        </div>
      )}
    </section>
  )
}
