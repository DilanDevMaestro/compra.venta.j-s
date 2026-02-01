import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { categories as fallbackCategories } from '../data/categories'
import { publicationsApi } from '../services/api'
import { config } from '../config/config'
import { CategorySidebar } from '../components/home/CategorySidebar'
import { SubcategoryModal } from '../components/home/SubcategoryModal'
import { ListingSection } from '../components/home/ListingSection'
import { Footer } from '../components/layout/Footer'
import { Header } from '../components/layout/Header'
import { categoryToSlug, normalizeCategoryKey, resolveCategoryKey, slugToCategoryKey } from '../utils/categories'
import type { Listing } from '../data/listings'

export function CategoryPage() {
  const { categorySlug } = useParams<{ categorySlug: string }>()
  const [isDark, setIsDark] = useState(true)
  const [categories, setCategories] = useState(fallbackCategories)
  const [items, setItems] = useState<Listing[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedSubcategory, setSelectedSubcategory] = useState('')
  const [showSubcategories, setShowSubcategories] = useState(false)
  const navigate = useNavigate()

  const selectedName = useMemo(() => {
    if (!categorySlug) return ''
    const key = slugToCategoryKey(categorySlug)
    const match = fallbackCategories.find((c) => normalizeCategoryKey(c.name) === normalizeCategoryKey(key))
    return match?.name ?? key
  }, [categorySlug])

  const selectedCategory = useMemo(() => {
    if (!categorySlug) return undefined
    const key = slugToCategoryKey(categorySlug)
    return categories.find((c) => normalizeCategoryKey(c.name) === normalizeCategoryKey(key))
  }, [categorySlug, categories])

  const filteredItems = useMemo(() => {
    if (!selectedSubcategory) return items
    const hasSubcategory = items.some((item) => Boolean(item.subcategory))
    if (!hasSubcategory) return items
    const target = normalizeCategoryKey(selectedSubcategory)
    return items.filter((item) => normalizeCategoryKey(item.subcategory || '') === target)
  }, [items, selectedSubcategory])

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
        setCategories(next)
      }
    } catch (error) {
      console.error('Error loading categories:', error)
    }
  }, [])

  const loadCategory = useCallback(async () => {
    if (!categorySlug) return
    setLoading(true)
    try {
      const data = await publicationsApi.getByCategory(categorySlug, selectedSubcategory || undefined)
      const list = Array.isArray(data) ? data : data?.publications || []
      const mapped = list.map((pub: any) => ({
        id: pub._id,
        title: pub.nombre,
        price: Number(pub.precio) || 0,
        location: pub.categoria || 'Argentina',
        subcategory: pub.subcategoria || pub.subCategory || pub.subcategory || pub.sub_categoria || '',
        imageUrl:
          pub.imagenes?.[0]?.url ||
          'https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=1200&auto=format&fit=crop'
      })) as Listing[]
      setItems(mapped)
    } catch (error) {
      console.error('Error loading category:', error)
      setItems([])
    } finally {
      setLoading(false)
    }
  }, [categorySlug, selectedSubcategory])

  useEffect(() => {
    loadCounts()
  }, [loadCounts])

  useEffect(() => {
    setSelectedSubcategory('')
  }, [categorySlug])

  useEffect(() => {
    loadCategory()
  }, [loadCategory])

  useEffect(() => {
    const eventsUrl = `${config.API_URL}/events`
    const source = new EventSource(eventsUrl)

    const handleChange = (event: MessageEvent) => {
      try {
        const payload = JSON.parse(event.data)
        if (!payload?.category || !categorySlug) {
          loadCounts()
          loadCategory()
          return
        }

        const normalized = normalizeCategoryKey(payload.category)
        const current = normalizeCategoryKey(selectedName)
        if (normalized === current) {
          loadCategory()
        }
        loadCounts()
      } catch {
        loadCounts()
        loadCategory()
      }
    }

    source.addEventListener('publications:changed', handleChange)
    source.addEventListener('error', () => source.close())

    return () => source.close()
  }, [categorySlug, loadCategory, loadCounts, selectedName])

  return (
    <div className={isDark ? 'dark' : ''}>
      <div className="min-h-screen bg-background text-foreground flex flex-col">
        <Header isDark={isDark} onToggleTheme={() => setIsDark((prev) => !prev)} />
        <main className="mx-auto w-full max-w-5xl px-4 pb-12 flex-1">
          <div className="mt-4 flex gap-3">
            <CategorySidebar
              categories={categories}
              onSelect={(category) => {
                navigate(`/categoria/${categoryToSlug(category.name)}`)
              }}
            />
            <div className="min-w-0 flex-1">
              <div className="mb-2 flex items-center justify-between">
                <h2 className="text-sm font-semibold">{selectedName}</h2>
              </div>
              {selectedCategory?.subcategories?.length ? (
                <div className="mb-4">
                  <div className="mb-3 lg:hidden">
                    <button
                      onClick={() => setShowSubcategories(true)}
                      className="w-full rounded-xl border border-black/10 bg-surface px-4 py-3 text-left text-xs font-semibold uppercase tracking-widest text-muted dark:border-white/10"
                    >
                      Ver subcategorías
                    </button>
                  </div>
                  <div className="hidden flex-wrap gap-2 lg:flex">
                    <button
                      type="button"
                      onClick={() => setSelectedSubcategory('')}
                      className={`rounded-full border px-2.5 py-0.5 text-[10px] font-medium transition ${
                        selectedSubcategory
                          ? 'border-card/40 text-muted hover:bg-card'
                          : 'border-primary/60 bg-primary/10 text-primary'
                      }`}
                    >
                      Todas
                    </button>
                    {selectedCategory.subcategories.map((subcategory) => (
                      <button
                        key={subcategory}
                        type="button"
                        onClick={() => setSelectedSubcategory(subcategory)}
                        className={`rounded-full border px-2.5 py-0.5 text-[10px] font-medium transition ${
                          selectedSubcategory === subcategory
                            ? 'border-primary/60 bg-primary/10 text-primary'
                            : 'border-card/40 text-muted hover:bg-card'
                        }`}
                      >
                        {subcategory}
                      </button>
                    ))}
                  </div>
                </div>
              ) : null}
              {loading ? (
                <div className="text-xs text-muted">Cargando publicaciones...</div>
              ) : (
                <ListingSection
                  title="Resultados"
                  items={filteredItems}
                  gridClassName="grid gap-1.5 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
                />
              )}
            </div>
          </div>
        </main>
        <Footer />
      </div>
      <SubcategoryModal
        open={showSubcategories}
        subcategories={selectedCategory?.subcategories || []}
        onClose={() => setShowSubcategories(false)}
        onSelect={(subcategory) => {
          setSelectedSubcategory(subcategory)
          setShowSubcategories(false)
        }}
      />
    </div>
  )
}
