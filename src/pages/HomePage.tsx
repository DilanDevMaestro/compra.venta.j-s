import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { categories as fallbackCategories } from '../data/categories'
import { listings as fallbackListings, type Listing } from '../data/listings'
import { publicationsApi } from '../services/api'
import { config } from '../config/config'
import { Header } from '../components/layout/Header'
import { Hero } from '../components/home/Hero'
import { MarketMarquee } from '../components/home/MarketMarquee'
import { CategorySidebar } from '../components/home/CategorySidebar'
import { CategoryModal } from '../components/home/CategoryModal'
import { ListingSection } from '../components/home/ListingSection'
import { Footer } from '../components/layout/Footer'
import { categoryToSlug, resolveCategoryKey, resolveCategoryName } from '../utils/categories'

export function HomePage() {
  const [isDark, setIsDark] = useState(true)
  const [categories, setCategories] = useState(fallbackCategories)
  const [featured, setFeatured] = useState<Listing[]>(() =>
    fallbackListings.filter((item) => item.featured)
  )
  const [offers, setOffers] = useState<Listing[]>(() =>
    fallbackListings.filter((item) => item.isOffer)
  )
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

  const loadHomeData = useCallback(async () => {
    try {
      const [recentData, discounted, counts] = await Promise.all([
        publicationsApi.getRecent(),
        publicationsApi.getDiscounted(),
        publicationsApi.getCategoryCounts()
      ])

      if (recentData?.featured?.length) {
        setFeatured(recentData.featured.map((pub: any) => toListing(pub, { featured: true })))
      }

      if (Array.isArray(discounted) && discounted.length) {
        setOffers(discounted.map((pub: any) => toListing(pub, { isOffer: true })))
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
    } catch (error) {
      console.error('Error loading home data:', error)
    }
  }, [categoryIndex, toListing])

  useEffect(() => {
    loadHomeData()
  }, [loadHomeData])

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

  return (
    <div className={isDark ? 'dark' : ''}>
      <div className="min-h-screen bg-background text-foreground flex flex-col">
        <Header isDark={isDark} onToggleTheme={() => setIsDark((prev) => !prev)} />
        <main className="mx-auto w-full max-w-5xl px-4 pb-12 flex-1">
          <Hero />
          <MarketMarquee />
          <div className="mt-4 flex gap-3">
            <CategorySidebar
              categories={categories}
              onSelect={(category) => handleCategorySelect(category.name)}
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
              <ListingSection title="Destacados" items={featured} layout="scroll" />
              <ListingSection title="Ofertas" items={offers} highlight="offer" layout="scroll" />
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
    </div>
  )
}
