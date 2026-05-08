import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { publicationsApi } from '../services/api'
import { Header } from '../components/layout/Header'
import { Footer } from '../components/layout/Footer'
import { ListingSection } from '../components/home/ListingSection'
import type { Listing } from '../data/listings'

type RawPublication = {
  _id?: string
  nombre?: string
  precio?: number | string
  categoria?: string
  subcategoria?: string
  imagenes?: Array<{ url?: string }>
}

export function LocationPage() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const [items, setItems] = useState<Listing[]>([])
  const [loading, setLoading] = useState(false)
  const [isDark, setIsDark] = useState<boolean>(() => {
    try {
      const stored = localStorage.getItem('theme')
      if (stored) return stored === 'dark'
    } catch {
      // ignore
    }
    return window.matchMedia?.('(prefers-color-scheme: dark)')?.matches ?? false
  })

  const toggleTheme = () => {
    setIsDark((prev) => {
      const next = !prev
      try {
        localStorage.setItem('theme', next ? 'dark' : 'light')
      } catch {
        // ignore
      }
      return next
    })
  }

  const country = params.get('country') || ''
  const province = params.get('province') || ''
  const city = params.get('city') || ''

  const title = useMemo(() => {
    if (city) return `Ciudad: ${city}`
    if (province) return `Provincia: ${province}`
    if (country) return `País: ${country}`
    return 'Ubicación'
  }, [city, country, province])

  const subtitle = useMemo(() => {
    const parts = [country, province, city].filter(Boolean)
    return parts.length ? parts.join(' · ') : ''
  }, [city, country, province])

  const loadByLocation = useCallback(async () => {
    if (!country && !province && !city) {
      navigate('/')
      return
    }
    setLoading(true)
    try {
      const data = await publicationsApi.getByLocation({
        country: country || undefined,
        province: province || undefined,
        city: city || undefined,
        limit: 200
      })

      const list = Array.isArray(data) ? data : data?.items || []
      const mapped = list.map((pub: RawPublication) => ({
        id: String(pub._id ?? ''),
        title: String(pub.nombre ?? ''),
        price: Number(pub.precio) || 0,
        location: pub.categoria || '',
        subcategory: pub.subcategoria || undefined,
        imageUrl:
          pub.imagenes?.[0]?.url ||
          'https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=1200&auto=format&fit=crop'
      })) as Listing[]

      setItems(mapped)
    } catch (error) {
      console.error('Error cargando publicaciones por ubicación:', error)
      setItems([])
    } finally {
      setLoading(false)
    }
  }, [city, country, navigate, province])

  useEffect(() => {
    loadByLocation()
  }, [loadByLocation])

  return (
    <div className={isDark ? 'dark' : ''}>
      <div className="min-h-screen bg-background text-foreground flex flex-col">
        <Header isDark={isDark} onToggleTheme={toggleTheme} />
        <main className="mx-auto w-full max-w-5xl px-4 pb-12 flex-1">
          <div className="mt-4">
            <div className="mb-3 flex flex-col gap-1">
              <h2 className="text-sm font-semibold">{title}</h2>
              {subtitle ? <p className="text-xs text-muted">{subtitle}</p> : null}
            </div>
            {loading ? (
              <div className="text-xs text-muted">Cargando publicaciones...</div>
            ) : (
              <ListingSection
                title="Resultados"
                items={items}
                gridClassName="grid gap-1.5 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
              />
            )}
          </div>
        </main>
        <Footer />
      </div>
    </div>
  )
}
