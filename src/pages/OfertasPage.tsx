import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { categories as fallbackCategories } from '../data/categories'
import { listings as fallbackListings, type Listing } from '../data/listings'
import { publicationsApi } from '../services/api'
import { config } from '../config/config'
import { CategorySidebar } from '../components/home/CategorySidebar'
import { CategoryModal } from '../components/home/CategoryModal'
import { ListingSection } from '../components/home/ListingSection'
import { Footer } from '../components/layout/Footer'
import { Header } from '../components/layout/Header'
import { categoryToSlug, resolveCategoryKey, resolveCategoryName } from '../utils/categories'

export function OfertasPage() {
  const [isDark, setIsDark] = useState(true)
  const [categories, setCategories] = useState(fallbackCategories)
  const [items, setItems] = useState<Listing[]>(() => fallbackListings.filter((item) => item.isOffer))
  const [loading, setLoading] = useState(false)
  const [showCategories, setShowCategories] = useState(false)
  const navigate = useNavigate()

  const categoryIndex = useMemo(() => {
    return new Map(fallbackCategories.map((c) => [resolveCategoryKey(c.name), c]))
  }, [])

  const toListing = useCallback((pub: any, extra?: Partial<Listing>): Listing => ({
    id: pub._id,
    title: pub.nombre,
    price: Number(pub.precio) || 0,
    location: pub.categoria || 'Argentina',
    imageUrl:
      pub.imagenes?.[0]?.url ||
      'https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=1200&auto=format&fit=crop',
    ...extra
  }), [])

  const loadCounts = useCallback(async () => {
    try {
      const counts = await publicationsApi.getCategoryCounts()
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
    } catch (error) {
      console.error('Error loading categories:', error)
    }
  }, [categoryIndex])

  const loadOffers = useCallback(async () => {
    setLoading(true)
    try {
      const discounted = await publicationsApi.getDiscounted()
      if (Array.isArray(discounted) && discounted.length) {
        setItems(discounted.map((pub: any) => toListing(pub, { isOffer: true })))
      } else {
        setItems([])
      }
    } catch (error) {
      console.error('Error loading offers:', error)
      setItems(fallbackListings.filter((item) => item.isOffer))
    } finally {
      setLoading(false)
    }
  }, [toListing])

  useEffect(() => {
    loadCounts()
    loadOffers()
  }, [loadCounts, loadOffers])

  useEffect(() => {
    const eventsUrl = `${config.API_URL}/events`
    const source = new EventSource(eventsUrl)

    const handleChange = () => {
      loadCounts()
      loadOffers()
    }

    source.addEventListener('publications:changed', handleChange)
    source.addEventListener('error', () => source.close())

    return () => source.close()
  }, [loadCounts, loadOffers])

  return (
    <div className={isDark ? 'dark' : ''}>
      <div className="min-h-screen bg-background text-foreground flex flex-col">
        <Header isDark={isDark} onToggleTheme={() => setIsDark((prev) => !prev)} />
        <main className="mx-auto w-full max-w-5xl px-4 pb-12 flex-1">
          <div className="mt-4 flex gap-3">
            <CategorySidebar
              categories={categories}
              onSelect={(category) => navigate(`/categoria/${categoryToSlug(category.name)}`)}
            />
            <div className="min-w-0 flex-1">
              <div className="mb-4 lg:hidden">
                <button
                  onClick={() => setShowCategories(true)}
                  className="w-full rounded-xl border border-black/10 bg-surface px-4 py-3 text-left text-xs font-semibold uppercase tracking-widest text-muted dark:border-white/10"
                >
                  Ver categorías
                </button>
              </div>
              {loading ? (
                <div className="text-xs text-muted">Cargando ofertas...</div>
              ) : (
                <ListingSection
                  title="Ofertas"
                  items={items}
                  highlight="offer"
                  gridClassName="grid gap-1.5 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
                />
              )}
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
          navigate(`/categoria/${categoryToSlug(category.name)}`)
        }}
      />
    </div>
  )
}
