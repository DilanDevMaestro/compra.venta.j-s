import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import type { Listing } from '../data/listings'
import { publicationsApi, socialApi } from '../services/api'
import storage from '../services/storage'
import { Header } from '../components/layout/Header'
import { Footer } from '../components/layout/Footer'
import { ListingSection } from '../components/home/ListingSection'

type PubRow = {
  _id?: string
  nombre?: string
  precio?: number | string
  categoria?: string
  subcategoria?: string
  imagenes?: Array<{ url?: string }>
}

const fallbackImage =
  'https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=1200&auto=format&fit=crop'

const PAGE = 24

export function VendorProfilePage() {
  const { userId } = useParams<{ userId: string }>()
  const navigate = useNavigate()

  const [isDark, setIsDark] = useState<boolean>(() => {
    try {
      const stored = localStorage.getItem('theme')
      if (stored) return stored === 'dark'
    } catch {
      /* ignored */
    }
    return window.matchMedia?.('(prefers-color-scheme: dark)')?.matches ?? false
  })

  const toggleTheme = () => {
    setIsDark((prev) => {
      const next = !prev
      try {
        localStorage.setItem('theme', next ? 'dark' : 'light')
      } catch {
        /* ignored */
      }
      return next
    })
  }

  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [summary, setSummary] = useState<{
    id: string
    name: string
    picture: string
    followersCount: number
    followingCount: number
    following: boolean
  } | null>(null)
  const [items, setItems] = useState<Listing[]>([])
  const [hasMore, setHasMore] = useState(false)
  const [followBusy, setFollowBusy] = useState(false)
  const [followMsg, setFollowMsg] = useState('')
  const [feedHint, setFeedHint] = useState('')

  const viewerId = storage.getUser()?._id
  const isOwn = Boolean(viewerId && userId && String(viewerId) === String(userId))

  const toListing = useCallback((pub: PubRow): Listing => ({
    id: String(pub._id ?? ''),
    title: String(pub.nombre ?? ''),
    price: Number(pub.precio) || 0,
    location: pub.categoria || 'Argentina',
    subcategory: pub.subcategoria || undefined,
    imageUrl: pub.imagenes?.[0]?.url || fallbackImage
  }), [])

  const loadInitial = useCallback(async () => {
    if (!userId) return
    setLoading(true)
    setFollowMsg('')
    setFeedHint('')
    let sum: typeof summary = null
    try {
      sum = await socialApi.profileSummary(userId)
    } catch {
      sum = null
    }

    try {
      const raw = await publicationsApi.getSellerPublications(userId, { skip: 0, limit: PAGE })
      setSummary(sum)
      setItems((raw.items || []).map((p) => toListing(p as PubRow)))
      setHasMore(Boolean(raw.hasMore))
    } catch {
      setSummary(sum)
      setItems([])
      setHasMore(false)
      setFeedHint(
        'No se pudieron cargar las publicaciones (¿backend sin actualizar?). La ruta debe ser GET /publications/seller/:userId.'
      )
    } finally {
      setLoading(false)
    }
  }, [toListing, userId])

  const loadMore = useCallback(async () => {
    if (!userId || loadingMore) return
    setLoadingMore(true)
    try {
      const raw = await publicationsApi.getSellerPublications(userId, {
        skip: items.length,
        limit: PAGE
      })
      const mapped = (raw.items || []).map((p) => toListing(p as PubRow))
      setItems((prev) => [...prev, ...mapped])
      setHasMore(Boolean(raw.hasMore))
    } catch {
      /* ignored */
    } finally {
      setLoadingMore(false)
    }
  }, [items.length, loadingMore, toListing, userId])

  useEffect(() => {
    void loadInitial()
  }, [loadInitial])

  const handleFollow = async () => {
    if (!userId || followBusy || isOwn) return
    if (!storage.getToken()) {
      setFollowMsg('Iniciá sesión para seguir vendedores.')
      return
    }
    setFollowBusy(true)
    setFollowMsg('')
    try {
      if (summary?.following) {
        await socialApi.unfollow(userId)
        setSummary((prev) =>
          prev ? { ...prev, following: false, followersCount: Math.max(0, prev.followersCount - 1) } : prev
        )
      } else {
        await socialApi.follow(userId)
        setSummary((prev) =>
          prev ? { ...prev, following: true, followersCount: prev.followersCount + 1 } : prev
        )
      }
    } catch {
      setFollowMsg('No se pudo actualizar el seguimiento.')
    } finally {
      setFollowBusy(false)
    }
  }

  if (!userId) {
    return null
  }

  return (
    <div className={isDark ? 'dark' : ''}>
      <div className="min-h-screen bg-background text-foreground flex flex-col">
        <Header isDark={isDark} onToggleTheme={toggleTheme} />
        <main className="mx-auto w-full max-w-5xl flex-1 px-4 pb-12">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="mt-4 text-[10px] font-semibold uppercase tracking-widest text-muted"
          >
            ← Volver
          </button>

          <div
            className="mt-4 flex flex-col gap-4 rounded-2xl border border-card/50 bg-card/60 p-4 shadow-[0_20px_50px_-35px_rgba(0,0,0,0.6)] dark:border-slate-700/60 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="flex min-w-0 items-center gap-3">
              <div className="h-14 w-14 shrink-0 overflow-hidden rounded-full border border-card/40 bg-surface dark:border-slate-700/50">
                <img
                  src={summary?.picture || fallbackImage}
                  alt=""
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="min-w-0">
                <h1 className="text-lg font-semibold">{summary?.name || 'Vendedor'}</h1>
                <p className="text-[11px] text-muted">
                  {summary ? `${summary.followersCount} seguidores · ${summary.followingCount} siguiendo` : '—'}
                </p>
              </div>
            </div>
            {!isOwn ? (
              <button
                type="button"
                onClick={handleFollow}
                disabled={followBusy || loading}
                className={`shrink-0 rounded-full border px-4 py-2 text-[11px] font-semibold uppercase tracking-widest disabled:opacity-60 ${
                  summary?.following
                    ? 'border-primary/50 bg-primary/10 text-primary'
                    : 'border-card/40 text-foreground dark:border-slate-700/60'
                }`}
              >
                {summary?.following ? 'Siguiendo' : 'Seguir'}
              </button>
            ) : (
              <Link
                to="/perfil"
                className="shrink-0 rounded-full border border-card/40 px-4 py-2 text-[11px] font-semibold uppercase tracking-widest text-muted dark:border-slate-700/60"
              >
                Ir a mi perfil
              </Link>
            )}
          </div>
          {followMsg ? <p className="mt-2 text-[11px] text-amber-700 dark:text-amber-400">{followMsg}</p> : null}
          {feedHint ? <p className="mt-2 text-[11px] text-muted">{feedHint}</p> : null}

          {loading ? (
            <p className="mt-6 text-xs text-muted">Cargando publicaciones...</p>
          ) : (
            <>
              <ListingSection
                title="Publicaciones"
                items={items}
                gridClassName="grid gap-1.5 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
              />
              {hasMore ? (
                <div className="mt-4 flex justify-center">
                  <button
                    type="button"
                    disabled={loadingMore}
                    onClick={() => void loadMore()}
                    className="rounded-full border border-card/40 px-4 py-2 text-[11px] font-semibold uppercase tracking-widest text-muted hover:text-foreground disabled:opacity-60 dark:border-slate-700/60"
                  >
                    {loadingMore ? 'Cargando…' : 'Cargar más'}
                  </button>
                </div>
              ) : null}
            </>
          )}
        </main>
        <Footer />
      </div>
    </div>
  )
}

export default VendorProfilePage
