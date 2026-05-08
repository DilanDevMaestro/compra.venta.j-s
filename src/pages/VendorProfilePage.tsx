import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import type { Listing } from '../data/listings'
import { publicationsApi, socialApi } from '../services/api'
import storage from '../services/storage'
import { Header } from '../components/layout/Header'
import { Footer } from '../components/layout/Footer'
import { ListingSection } from '../components/home/ListingSection'
import { normalizeExternalUrl } from '../utils/externalUrl'

type PubRow = {
  _id?: string
  nombre?: string
  precio?: number | string
  categoria?: string
  subcategoria?: string
  imagenes?: Array<{ url?: string }>
  vistas?: number
}

const fallbackCardImage =
  'https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=1200&auto=format&fit=crop'

/** Misma imagen por defecto que en PerfilPage */
const defaultBanner = '/image/home-image-banner/JSBANNER.png'
const defaultAvatar = '/image/j&s.png'

const PAGE = 24

type ProfileSummary = {
  id: string
  name: string
  picture: string
  banner?: string
  location?: string
  description?: string
  socialLinks?: {
    facebook?: string
    instagram?: string
    tiktok?: string
    website?: string
  } | null
  followersCount: number
  followingCount: number
  following: boolean
  isBusiness?: boolean
}

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

  const lightCardStyle = !isDark
    ? {
        backgroundImage:
          'linear-gradient(180deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.7) 35%, rgba(255,255,255,0.5) 100%)',
        backgroundColor: 'var(--surface)'
      }
    : undefined

  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [summary, setSummary] = useState<ProfileSummary | null>(null)
  const [totalPubs, setTotalPubs] = useState(0)
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
    imageUrl: pub.imagenes?.[0]?.url || fallbackCardImage,
    vistas: typeof pub.vistas === 'number' ? pub.vistas : undefined
  }), [])

  const vistasLoaded = useMemo(() => items.reduce((s, p) => s + (p.vistas ?? 0), 0), [items])

  const socialLinksList = useMemo(() => {
    const sl = summary?.socialLinks
    if (!sl || !summary?.isBusiness) return []
    const pairs: { key: string; label: string; raw: string }[] = [
      { key: 'fb', label: 'Facebook', raw: sl.facebook || '' },
      { key: 'ig', label: 'Instagram', raw: sl.instagram || '' },
      { key: 'tt', label: 'TikTok', raw: sl.tiktok || '' },
      { key: 'web', label: 'Sitio web', raw: sl.website || '' }
    ]
    return pairs
      .map((p) => ({ ...p, href: normalizeExternalUrl(p.raw) }))
      .filter((p) => p.href !== '')
  }, [summary?.socialLinks, summary?.isBusiness])

  const loadInitial = useCallback(async () => {
    if (!userId) return
    setLoading(true)
    setFollowMsg('')
    setFeedHint('')
    let sum: ProfileSummary | null = null
    try {
      sum = (await socialApi.profileSummary(userId)) as ProfileSummary
    } catch {
      sum = null
    }

    try {
      const raw = await publicationsApi.getSellerPublications(userId, { skip: 0, limit: PAGE })
      setSummary(sum)
      setTotalPubs(typeof raw.total === 'number' ? raw.total : (raw.items || []).length)
      setItems((raw.items || []).map((p) => toListing(p as PubRow)))
      setHasMore(Boolean(raw.hasMore))
    } catch {
      setSummary(sum)
      setTotalPubs(0)
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
      if (typeof raw.total === 'number') setTotalPubs(raw.total)
    } catch {
      /* ignored */
    } finally {
      setLoadingMore(false)
    }
  }, [items.length, loadingMore, toListing, userId])

  useEffect(() => {
    void loadInitial()
  }, [loadInitial])

  const bannerSrc =
    summary?.isBusiness && summary.banner && summary.banner.trim() !== '' ? summary.banner : defaultBanner

  const avatarSrc =
    (summary?.picture && summary.picture.trim() !== '' ? summary.picture : null) || defaultAvatar

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
        <main className="mx-auto w-full max-w-6xl flex-1 px-4 pb-12">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="mt-4 text-[10px] font-semibold uppercase tracking-widest text-muted"
          >
            ← Volver
          </button>

          <div className="mt-6 overflow-hidden rounded-2xl border border-card/50 bg-card/60 shadow-[0_20px_60px_-40px_rgba(0,0,0,0.6)] dark:border-slate-700/60">
            <div className="relative overflow-hidden bg-surface shadow-soft">
              <div className="aspect-[1920/500] w-full bg-background">
                <img
                  src={bannerSrc}
                  alt=""
                  className="absolute inset-0 h-full w-full object-cover"
                  loading="lazy"
                />
              </div>
            </div>

            <div className="flex flex-col gap-4 p-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <div className="h-16 w-16 shrink-0 overflow-hidden rounded-full border border-card/40 bg-surface dark:border-slate-700/50">
                  <img src={avatarSrc} alt="" className="h-full w-full object-cover" loading="lazy" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold">{summary?.name || 'Vendedor'}</p>
                  {summary?.isBusiness && summary.location ? (
                    <p className="text-[11px] text-muted">{summary.location}</p>
                  ) : null}
                  <p className="text-xs text-muted">
                    {summary
                      ? `${summary.followersCount} seguidores · ${summary.followingCount} siguiendo`
                      : '—'}
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {!isOwn ? (
                  <button
                    type="button"
                    onClick={handleFollow}
                    disabled={followBusy || loading}
                    className={`rounded-full border border-black/10 bg-gradient-to-b from-black/5 via-transparent to-transparent px-4 py-2 text-[10px] font-semibold uppercase tracking-widest shadow-[0_10px_20px_-12px_rgba(0,0,0,0.5)] transition hover:-translate-y-0.5 disabled:opacity-60 dark:border-slate-700/60 dark:from-white/5 ${
                      summary?.following
                        ? 'border-primary/50 bg-primary/10 text-primary'
                        : 'text-foreground'
                    }`}
                  >
                    {followBusy ? '…' : summary?.following ? 'Siguiendo' : 'Seguir'}
                  </button>
                ) : (
                  <Link
                    to="/perfil"
                    className="rounded-full border border-black/10 bg-gradient-to-b from-black/5 via-transparent to-transparent px-4 py-2 text-[10px] font-semibold uppercase tracking-widest text-foreground shadow-[0_10px_20px_-12px_rgba(0,0,0,0.5)] transition hover:-translate-y-0.5 dark:border-slate-700/60 dark:from-white/5"
                  >
                    Editar mi perfil
                  </Link>
                )}
              </div>
            </div>

            {!loading && summary?.isBusiness ? (
              <div className="space-y-3 px-4 pb-4">
                {summary.description?.trim() ? (
                  <div className="rounded-xl border border-card/40 bg-surface/90 p-4 shadow-[0_8px_24px_-18px_rgba(0,0,0,0.35)] dark:border-slate-700/55 dark:bg-[linear-gradient(180deg,rgba(255,255,255,0.06)_0%,rgba(0,0,0,0.12)_100%)]">
                    <h3 className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted">
                      Descripción del negocio
                    </h3>
                    <p className="mt-2 text-[13px] leading-relaxed text-foreground">{summary.description.trim()}</p>
                  </div>
                ) : null}

                {socialLinksList.length > 0 ? (
                  <div className="rounded-xl border border-card/40 bg-surface/90 p-4 shadow-[0_8px_24px_-18px_rgba(0,0,0,0.35)] dark:border-slate-700/55 dark:bg-[linear-gradient(180deg,rgba(255,255,255,0.06)_0%,rgba(0,0,0,0.12)_100%)]">
                    <h3 className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted">
                      Redes y contacto
                    </h3>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {socialLinksList.map((link) => (
                        <a
                          key={link.key}
                          href={link.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="rounded-full border border-black/10 bg-surface px-3 py-1.5 text-[10px] font-semibold uppercase tracking-widest text-foreground transition hover:border-primary/40 hover:text-primary dark:border-slate-700/60"
                        >
                          {link.label}
                        </a>
                      ))}
                    </div>
                  </div>
                ) : null}

                <div className="flex flex-wrap gap-2 pt-1">
                  <span className="rounded-full border border-black/10 bg-surface px-2 py-1 text-[10px] font-semibold uppercase tracking-widest text-foreground dark:border-slate-700/60">
                    Perfil empresa
                  </span>
                </div>
              </div>
            ) : !loading && summary ? (
              <div className="flex flex-wrap gap-2 px-4 pb-4">
                <span className="rounded-full border border-black/10 bg-surface px-2 py-1 text-[10px] font-semibold uppercase tracking-widest text-muted dark:border-slate-700/60">
                  Perfil personal
                </span>
              </div>
            ) : null}
          </div>

          {followMsg ? <p className="mt-3 text-[11px] text-amber-700 dark:text-amber-400">{followMsg}</p> : null}
          {feedHint ? <p className="mt-2 text-[11px] text-muted">{feedHint}</p> : null}

          {!loading && summary ? (
            <div className="mt-5">
              <div
                style={lightCardStyle}
                className="hidden w-full flex-wrap items-center justify-between gap-4 rounded-xl border border-card/50 bg-card/60 px-4 py-3 text-[11px] text-muted shadow-[0_12px_30px_-22px_rgba(0,0,0,0.55)] sm:flex dark:border-slate-700/60 dark:bg-[linear-gradient(180deg,rgba(255,255,255,0.08)_0%,rgba(255,255,255,0.04)_35%,rgba(255,255,255,0)_100%)]"
              >
                <div className="flex items-center gap-2">
                  <span className="uppercase tracking-widest">Publicaciones</span>
                  <span className="text-base font-semibold text-foreground">{totalPubs}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="uppercase tracking-widest">Vistas (cargadas)</span>
                  <span className="text-base font-semibold text-foreground">{vistasLoaded}</span>
                  {hasMore ? <span className="text-[10px] text-muted">· hay más resultados</span> : null}
                </div>
              </div>
              <div className="mt-2 grid grid-cols-2 gap-2 sm:hidden">
                <div
                  style={lightCardStyle}
                  className="min-h-[64px] rounded-xl border border-card/50 bg-card/60 p-2 text-center shadow-[0_12px_30px_-22px_rgba(0,0,0,0.55)] dark:border-slate-700/60 dark:bg-[linear-gradient(180deg,rgba(255,255,255,0.08)_0%,rgba(255,255,255,0.04)_35%,rgba(255,255,255,0)_100%)]"
                >
                  <p className="text-[10px] leading-tight text-muted">Publicaciones</p>
                  <p className="text-lg font-semibold text-foreground">{totalPubs}</p>
                </div>
                <div
                  style={lightCardStyle}
                  className="min-h-[64px] rounded-xl border border-card/50 bg-card/60 p-2 text-center shadow-[0_12px_30px_-22px_rgba(0,0,0,0.55)] dark:border-slate-700/60 dark:bg-[linear-gradient(180deg,rgba(255,255,255,0.08)_0%,rgba(255,255,255,0.04)_35%,rgba(255,255,255,0)_100%)]"
                >
                  <p className="text-[10px] leading-tight text-muted">Vistas (en página)</p>
                  <p className="text-lg font-semibold text-foreground">{vistasLoaded}</p>
                </div>
              </div>
            </div>
          ) : null}

          {loading ? (
            <p className="mt-6 text-xs text-muted">Cargando perfil y publicaciones...</p>
          ) : (
            <>
              <div className="mt-6">
                <ListingSection
                  title="Publicaciones"
                  items={items}
                  gridClassName="grid gap-1.5 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5"
                />
              </div>
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
