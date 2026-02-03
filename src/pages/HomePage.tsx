import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { categories as fallbackCategories } from '../data/categories'
import type { Listing } from '../data/listings'
import { publicationsApi } from '../services/api'
import { config } from '../config/config'
import { Header } from '../components/layout/Header'
import { Hero } from '../components/home/Hero'
import { MarketMarquee } from '../components/home/MarketMarquee'
import { CategorySidebar } from '../components/home/CategorySidebar'
import { CategoryModal } from '../components/home/CategoryModal'
import { ListingSection } from '../components/home/ListingSection'
import { LocationTree } from '../components/home/LocationTree'
import { LocationModal } from '../components/home/LocationModal'
import { Footer } from '../components/layout/Footer'
import { categoryToSlug, resolveCategoryKey, resolveCategoryName } from '../utils/categories'
import { detectLocation } from '../services/locationService'

type RawPublication = {
  _id?: string
  nombre?: string
  precio?: number | string
  categoria?: string
  subcategoria?: string
  imagenes?: Array<{ url?: string }>
  createdAt?: string
  precioOriginal?: number | string
  descuento?: number | string
  activo?: boolean
  vistas?: number
  likes?: number | unknown[] | unknown
}

type LocationItem = { name: string; count: number; country?: string; province?: string }

export function HomePage() {
  const [isDark, setIsDark] = useState<boolean>(() => {
    try {
      const stored = localStorage.getItem('theme')
      if (stored) return stored === 'dark'
    } catch {
      // ignore localStorage access errors (e.g., disabled storage)
    }
    return window.matchMedia?.('(prefers-color-scheme: dark)')?.matches ?? false
  })

  const toggleTheme = () => {
    setIsDark((prev) => {
      const next = !prev
      try {
        localStorage.setItem('theme', next ? 'dark' : 'light')
      } catch {
        // ignore localStorage write errors (private browsing, etc.)
      }
      return next
    })
  }
  const [categories, setCategories] = useState(fallbackCategories)
  const [featured, setFeatured] = useState<Listing[]>([])
  const [recent, setRecent] = useState<Listing[]>([])
  const [timeframe, setTimeframe] = useState<'all' | '12h' | '24h'>('24h')
  const [offers, setOffers] = useState<Listing[]>([])
  const [showCategories, setShowCategories] = useState(false)
  const [showLocations, setShowLocations] = useState(false)
  const [locationCounts, setLocationCounts] = useState<Record<string, LocationItem[]>>({
    country: [],
    province: [],
    city: []
  })
  const [locationFilter, setLocationFilter] = useState<{
    country: string
    province?: string
    city?: string
  } | null>(null)
  const navigate = useNavigate()

  const categoryIndex = useMemo(() => {
    return new Map(fallbackCategories.map((c) => [resolveCategoryKey(c.name), c]))
  }, [])

  const toListing = useCallback((pub: RawPublication, extra?: Partial<Listing>): Listing => ({
    id: String(pub._id ?? ''),
    title: String(pub.nombre ?? ''),
    price: Number(pub.precio) || 0,
    location: pub.categoria || 'Argentina',
    subcategory: pub.subcategoria || undefined,
    imageUrl:
      pub.imagenes?.[0]?.url ||
      'https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=1200&auto=format&fit=crop',
    createdAt: pub.createdAt,
    ...extra
  }), [])

  const buildCategoryCounts = useCallback(
    (list: RawPublication[]) => {
      const countsByCategory: Record<string, number> = {}
      list.forEach((pub) => {
        const key = resolveCategoryKey(String(pub.categoria || ''))
        if (!key) return
        countsByCategory[key] = (countsByCategory[key] || 0) + 1
      })

      const next = fallbackCategories.map((category) => ({
        ...category,
        count: countsByCategory[resolveCategoryKey(category.name)] ?? 0
      }))

      const extras = Object.entries(countsByCategory)
        .filter(([name]) => !categoryIndex.has(name))
        .map(([name, count], index) => ({
          id: next.length + index + 1,
          name: resolveCategoryName(name),
          count,
          icon: '🧩',
          subcategories: []
        }))

      setCategories([...next, ...extras])
    },
    [categoryIndex]
  )

  const loadHomeData = useCallback(async () => {
    try {
      const [countryCounts, provinceCounts, cityCounts] = await Promise.all([
        publicationsApi.getLocationCounts('country', 200),
        publicationsApi.getLocationCounts('province', 200),
        publicationsApi.getLocationCounts('city', 200)
      ])

      if (locationFilter) {
        const data = await publicationsApi.getByLocation({
          country: locationFilter.country,
          province: locationFilter.province,
          city: locationFilter.city,
          limit: 500
        })
        const list: RawPublication[] = Array.isArray(data) ? data : data?.items || []

        const sortedByCreated = [...list].sort((a, b) =>
          String(b.createdAt || '').localeCompare(String(a.createdAt || ''))
        )
        const recentItems = sortedByCreated.slice(0, 10).map((pub) => toListing(pub))
        const featuredItems = [...list]
          .sort((a, b) => Number(b.vistas || 0) - Number(a.vistas || 0))
          .slice(0, 3)
          .map((pub) => toListing(pub, { featured: true }))
        const offersItems = list
          .filter((pub) => Number(pub.descuento || 0) > 0)
          .slice(0, 10)
          .map((pub) => toListing(pub, { isOffer: true }))

        setRecent(recentItems)
        setFeatured(featuredItems)
        setOffers(offersItems)
        buildCategoryCounts(list)
      } else {
        const [recentData, discounted, counts] = await Promise.all([
          publicationsApi.getRecent(),
          publicationsApi.getDiscounted(),
          publicationsApi.getCategoryCounts()
        ])

        if (recentData) {
          if (recentData?.publications?.length) {
            setRecent(recentData.publications.map((pub: RawPublication) => toListing(pub)))
          }
          if (recentData?.featured?.length) {
            setFeatured(recentData.featured.map((pub: RawPublication) => toListing(pub, { featured: true })))
          }
        }

        if (Array.isArray(discounted) && discounted.length) {
          setOffers(discounted.map((pub: RawPublication) => toListing(pub, { isOffer: true })))
        }

        if (counts && typeof counts === 'object') {
          const normalized = Object.fromEntries(
            Object.entries(counts).map(([name, count]) => [resolveCategoryKey(name), Number(count) || 0])
          )

          const next = fallbackCategories.map((category) => ({
            ...category,
            count: normalized[resolveCategoryKey(category.name)] ?? category.count
          }))

          const extras = Object.entries(normalized)
            .filter(([name]) => !categoryIndex.has(name))
            .map(([name, count], index) => ({
              id: next.length + index + 1,
              name: resolveCategoryName(name),
              count,
              icon: '🧩',
              subcategories: []
            }))

          setCategories([...next, ...extras])
        }
      }

      if (countryCounts?.items) {
        setLocationCounts((prev) => ({
          ...prev,
          country: countryCounts.items
        }))
      }
      if (provinceCounts?.items) {
        setLocationCounts((prev) => ({
          ...prev,
          province: provinceCounts.items
        }))
      }
      if (cityCounts?.items) {
        setLocationCounts((prev) => ({
          ...prev,
          city: cityCounts.items
        }))
      }
    } catch (error) {
      console.error('Error loading home data:', error)
    }
  }, [buildCategoryCounts, categoryIndex, locationFilter, toListing])

  useEffect(() => {
    void (async () => {
      // cache location in localStorage for future visits
      void detectLocation()
      await loadHomeData()
    })()
  }, [loadHomeData])

  // Refetch recent publications when timeframe changes (or on mount)
  useEffect(() => {
    const fetchRecent = async () => {
      try {
        if (locationFilter) return
        const hours = timeframe === '12h' ? 12 : timeframe === '24h' ? 24 : undefined
        const recentData = await publicationsApi.getRecent(hours)
        if (recentData) {
          if (recentData?.publications?.length) {
            setRecent(recentData.publications.map((pub: RawPublication) => toListing(pub)))
          } else {
            setRecent([])
          }
          if (recentData?.featured?.length) {
            setFeatured(recentData.featured.map((pub: RawPublication) => toListing(pub, { featured: true })))
          }
        }
      } catch (error) {
        console.error('Error fetching recent with timeframe:', error)
      }
    }
    fetchRecent()
  }, [locationFilter, timeframe, toListing])

  useEffect(() => {
    const eventsUrl = `${config.API_URL}/events`
    const source = new EventSource(eventsUrl)

    const handleChange = () => {
      loadHomeData()
    }

    source.addEventListener('publications:changed', handleChange)

    source.addEventListener('error', () => {
      source.close()
    })

    return () => source.close()
  }, [loadHomeData])

  const handleCategorySelect = (categoryName: string) => {
    navigate(`/categoria/${categoryToSlug(categoryName)}`)
  }

  const [filteredRecent, setFilteredRecent] = useState<Listing[]>([])

  useEffect(() => {
    if (timeframe === 'all') {
      // keep async to avoid sync setState-in-effect lint
      Promise.resolve().then(() => setFilteredRecent(recent))
      return
    }
    const now = Date.now()
    const hours = timeframe === '12h' ? 12 : 24
    Promise.resolve().then(() =>
      setFilteredRecent(
        recent.filter((r) => {
          if (!r.createdAt) return false
          const created = new Date(r.createdAt).getTime()
          return now - created <= hours * 60 * 60 * 1000
        })
      )
    )
  }, [recent, timeframe])

  return (
    <div className={isDark ? 'dark' : ''}>
      <div className="min-h-screen bg-background text-foreground flex flex-col">
        <Header isDark={isDark} onToggleTheme={toggleTheme} />
        <main className="mx-auto w-full max-w-5xl px-4 pb-12 flex-1">
          <Hero />
          <MarketMarquee />
          <div className="mt-4 flex gap-3">
            <div className="flex flex-col">
              <CategorySidebar
                categories={categories}
                onSelect={(category) => handleCategorySelect(category.name)}
              />
              <div className="mt-3 hidden lg:block">
                <aside className="w-40 shrink-0">
                  <LocationTree
                    title="Países"
                    countries={locationCounts.country || []}
                    provinces={locationCounts.province || []}
                    cities={locationCounts.city || []}
                    maxHeight="460px"
                    onSelect={(payload) => {
                      setLocationFilter(payload)
                    }}
                  />
                </aside>
              </div>
            </div>
            <div className="min-w-0 flex-1">
              <div className="mb-4 flex flex-wrap gap-2 lg:hidden">
                <button
                  onClick={() => setShowCategories(true)}
                  className="inline-flex w-auto rounded-xl border bg-surface px-3 py-2 text-left text-[12px] font-semibold uppercase tracking-widest text-muted dark:border-white/10"
                  style={isDark ? undefined : { borderColor: 'rgba(0,0,0,0.18)' }}
                >
                  Ver categorías
                </button>
                <button
                  onClick={() => setShowLocations(true)}
                  className="inline-flex w-auto rounded-xl border bg-surface px-3 py-2 text-left text-[12px] font-semibold uppercase tracking-widest text-muted dark:border-white/10"
                  style={isDark ? undefined : { borderColor: 'rgba(0,0,0,0.18)' }}
                >
                  Ver región
                </button>
              </div>
              <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-col">
                  <h3 className="text-sm font-semibold">Compra y vende sin vueltas</h3>
                  {locationFilter ? (
                    <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px] text-muted">
                      <span className="rounded-full border border-card/40 px-2 py-0.5">
                        {locationFilter.country}
                        {locationFilter.province ? ` · ${locationFilter.province}` : ''}
                        {locationFilter.city ? ` · ${locationFilter.city}` : ''}
                      </span>
                      <button
                        type="button"
                        onClick={() => setLocationFilter(null)}
                        className="rounded-full border border-card/40 px-2 py-0.5 text-[11px] text-muted hover:text-foreground"
                      >
                        Limpiar filtro
                      </button>
                    </div>
                  ) : null}
                </div>
                <div className="flex items-center gap-1 overflow-x-auto flex-nowrap">
                  <button
                    type="button"
                    onClick={() => setTimeframe('all')}
                    className={`whitespace-nowrap text-[11px] px-2 py-0.5 rounded-full border ${timeframe === 'all' ? 'bg-primary/10 text-primary border-primary/30' : 'text-muted border-card/40'}`}
                    aria-pressed={timeframe === 'all'}
                  >
                    Todas
                  </button>
                  <button
                    type="button"
                    onClick={() => setTimeframe('12h')}
                    className={`whitespace-nowrap text-[11px] px-2 py-0.5 rounded-full border ${timeframe === '12h' ? 'bg-primary/10 text-primary border-primary/30' : 'text-muted border-card/40'}`}
                    aria-pressed={timeframe === '12h'}
                  >
                    Últimas 12h
                  </button>
                  <button
                    type="button"
                    onClick={() => setTimeframe('24h')}
                    className={`whitespace-nowrap text-[11px] px-2 py-0.5 rounded-full border ${timeframe === '24h' ? 'bg-primary/10 text-primary border-primary/30' : 'text-muted border-card/40'}`}
                    aria-pressed={timeframe === '24h'}
                  >
                    Últimas 24h
                  </button>
                </div>
              </div>
              <div className="lg:hidden" />

              <ListingSection
                title="Recientes"
                items={filteredRecent}
                layout="scroll"
                viewMoreLink="/recientes"
              />
              <ListingSection title="Destacados" items={featured} layout="scroll" viewMoreLink="/destacados" />
              <ListingSection title="Ofertas" items={offers} highlight="offer" layout="scroll" viewMoreLink="/ofertas" />
            </div>
          </div>
        </main>
        <Footer />
      </div>
      <CategoryModal
        open={showCategories}
        categories={categories}
        onClose={() => setShowCategories(false)}
        onSelect={(category) => {
          setShowCategories(false)
          handleCategorySelect(category.name)
        }}
      />
      <LocationModal
        open={showLocations}
        countries={locationCounts.country || []}
        provinces={locationCounts.province || []}
        cities={locationCounts.city || []}
        onClose={() => setShowLocations(false)}
        onSelect={(payload) => {
          setShowLocations(false)
          setLocationFilter(payload)
        }}
      />
    </div>
  )
}

export default HomePage
