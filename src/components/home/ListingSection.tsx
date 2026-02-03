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

  const isDark = (() => {
    try {
      const stored = localStorage.getItem('theme')
      if (stored) return stored === 'dark'
    } catch {
      /* ignored */
    }
    return window.matchMedia?.('(prefers-color-scheme: dark)')?.matches ?? true
  })()

  const lightCardBg = { backgroundColor: '#e6ddd0' }

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
      {items.length === 0 ? (
        <div className="rounded-xl border border-card/40 bg-surface px-3 py-4 text-[11px] text-muted dark:border-slate-700/50">
          No hay publicaciones para mostrar.
        </div>
      ) : layout === 'scroll' ? (
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
                className="w-[150px] sm:w-[170px] shrink-0 overflow-hidden rounded-xl border transition hover:-translate-y-0.5 relative dark:border-slate-700/50 dark:shadow-[0_12px_40px_-24px_rgba(0,0,0,0.72)] dark:hover:shadow-[0_18px_50px_-30px_rgba(0,0,0,0.78)] dark:backdrop-blur-sm dark-gradient-bg"
                  style={
                    isDark
                      ? undefined
                      : {
                          ...lightCardBg,
                          borderColor: 'rgba(0,0,0,0.06)',
                          boxShadow: 'rgb(0 0 0 / 5%) 0px 8px 18px -8px'
                        }
                  }
              >
                <div className="h-20 overflow-hidden relative">
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="h-full w-full object-cover"
                    loading="lazy"
                    decoding="async"
                  />
                    <div className="absolute bottom-0 left-0 right-0 h-1/2 pointer-events-none hidden dark:block dark:bg-[linear-gradient(to top,rgba(0,0,0,0.42)_0%,rgba(0,0,0,0)_70%)]" />
                    
                </div>
                <div className="flex h-[120px] flex-col p-2 pl-1 sm:pl-2 bg-transparent dark:bg-[linear-gradient(180deg,rgba(255,255,255,0.02)_0%,rgba(0,0,0,0.12)_100%)]">
                  <p className="line-clamp-2 text-[10px] font-semibold dark:text-white" style={isDark ? undefined : { color: '#000' }}>{item.title}</p>
                    <p className="mt-1 text-[9px] text-muted">
                      <span className="font-semibold text-[9px] text-foreground dark:text-white" style={isDark ? undefined : { color: '#111' }}>{item.location}</span>
                      {item.subcategory ? <span className="text-muted" style={isDark ? undefined : { color: '#444' }}> &middot; {item.subcategory}</span> : null}
                    </p>
                  <p className={`mt-1 text-[12px] font-bold ${highlight === 'offer' ? 'text-offer' : 'text-price'}`}>
                    ${item.price.toLocaleString('es-AR')}
                  </p>
                  <span className="mt-auto inline-flex rounded-full border border-black/10 px-2 py-0.5 text-[9px] font-semibold text-foreground dark:border-slate-700/40 dark:bg-[rgba(255,255,255,0.02)]">
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
            className="overflow-hidden rounded-xl border transition hover:-translate-y-0.5 relative dark:border-slate-700/50 dark:shadow-[0_12px_40px_-24px_rgba(0,0,0,0.72)] dark:hover:shadow-[0_18px_50px_-30px_rgba(0,0,0,0.78)] dark:backdrop-blur-sm dark-gradient-bg"
            style={
              isDark
                ? undefined
                : { ...lightCardBg, borderColor: 'rgba(0,0,0,0.06)', boxShadow: 'rgb(0 0 0 / 5%) 0px 8px 18px -8px' }
            }
          >
            <div className="h-20 overflow-hidden relative">
              <img
                src={item.imageUrl}
                alt={item.title}
                className="h-full w-full object-cover"
                loading="lazy"
                decoding="async"
              />
              <div className="absolute bottom-0 left-0 right-0 h-1/2 pointer-events-none hidden dark:block dark:bg-[linear-gradient(to top,rgba(0,0,0,0.42)_0%,rgba(0,0,0,0)_70%)]" />
            </div>
            <div className="flex h-[120px] flex-col p-2 pl-1 sm:pl-2 bg-transparent dark:bg-[linear-gradient(180deg,rgba(255,255,255,0.02)_0%,rgba(0,0,0,0.12)_100%)]">
              <p className="line-clamp-2 text-[10px] font-semibold dark:text-white" style={isDark ? undefined : { color: '#000' }}>{item.title}</p>
              <p className="mt-1 text-[9px] text-muted">
                <span className="font-semibold text-[9px] text-foreground dark:text-white" style={isDark ? undefined : { color: '#111' }}>{item.location}</span>
                {item.subcategory ? <span className="text-muted" style={isDark ? undefined : { color: '#444' }}> &middot; {item.subcategory}</span> : null}
              </p>
              <p className={`mt-1 text-[12px] font-bold ${highlight === 'offer' ? 'text-offer' : 'text-price'}`}>
                ${item.price.toLocaleString('es-AR')}
              </p>
              <span className="mt-auto inline-flex rounded-full border border-black/10 px-2 py-0.5 text-[9px] font-semibold text-foreground dark:border-slate-700/40 dark:bg-[rgba(255,255,255,0.02)]">
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
