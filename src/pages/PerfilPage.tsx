import { useEffect, useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Header } from '../components/layout/Header'
import { Footer } from '../components/layout/Footer'
import { commerceApi, publicationsApi, socialApi, userApi } from '../services/api'
import storage from '../services/storage'

type BusinessProfile = {
  name?: string
  location?: string
  banner?: string
  profilePicture?: string
  description?: string
  socialLinks?: {
    facebook?: string
    instagram?: string
    tiktok?: string
    website?: string
  }
  isActive?: boolean
}

type UserProfile = {
  _id?: string
  id?: string
  name?: string
  email?: string
  picture?: string
  businessProfile?: BusinessProfile
  referralCode?: string
  referralShareUrl?: string
  referral?: {
    totalInvites?: number
    rewardPoints?: number
    joinedWithReferral?: boolean
  }
  monetizationProfile?: {
    walletBalance?: number
    couponCredits?: number
  }
}

export function PerfilPage() {
  const [isDark, setIsDark] = useState<boolean>(() => {
    try {
      const stored = localStorage.getItem('theme')
      if (stored) return stored === 'dark'
    } catch {
      // ignore localStorage read errors
    }
    return window.matchMedia?.('(prefers-color-scheme: dark)')?.matches ?? false
  })

  const toggleTheme = () => {
    setIsDark((prev) => {
      const next = !prev
      try {
        localStorage.setItem('theme', next ? 'dark' : 'light')
      } catch {
        // ignore localStorage write errors
      }
      return next
    })
  }
  const [user, setUser] = useState<UserProfile | null>(null)
  type PubItem = {
    _id: string
    nombre?: string
    precio?: number
    vistas?: number
    likes?: number | unknown[]
    activo?: boolean
    imagenes?: Array<{ url?: string }>
    descuento?: number | string
    precioOriginal?: number
    shareCount?: number
    whatsappClicks?: number
    createdAt?: string
  }
  const [publications, setPublications] = useState<PubItem[]>([])
  const [loading, setLoading] = useState(false)
  const [isBusinessModalOpen, setIsBusinessModalOpen] = useState(false)
  const [isBenefitsOpen, setIsBenefitsOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [updateSuccess, setUpdateSuccess] = useState(false)
  const [profileModeOverride, setProfileModeOverride] = useState<boolean | null>(null)
  const [isActivityOpen, setIsActivityOpen] = useState(true)
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false)
  const [profileToggleBusy, setProfileToggleBusy] = useState(false)
  const [profileToggleError, setProfileToggleError] = useState('')
  const [followStats, setFollowStats] = useState<{ followersCount: number; followingCount: number } | null>(null)
  const [referralClaimCode, setReferralClaimCode] = useState('')
  const [referralMsg, setReferralMsg] = useState('')
  const [pendingBoostId, setPendingBoostId] = useState('')
  const [commerceMsg, setCommerceMsg] = useState('')
  const [lastBoostOrderId, setLastBoostOrderId] = useState('')
  const [shortcutNotice, setShortcutNotice] = useState('')
  const [formState, setFormState] = useState({
    businessName: '',
    location: '',
    facebook: '',
    instagram: '',
    tiktok: '',
    website: '',
    description: ''
  })
  const [bannerImage, setBannerImage] = useState<File | null>(null)
  const [profilePicture, setProfilePicture] = useState<File | null>(null)
  const navigate = useNavigate()
  /** Datos de diseño de muestra solo con `VITE_PROFILE_MOCK=1` en `.env` (en desarrollo podés probar la API real). */
  const isDesignPreview = import.meta.env.VITE_PROFILE_MOCK === '1'
  const isBusinessActive = profileModeOverride ?? Boolean(user?.businessProfile?.isActive)
  const previewMetrics = useMemo(() => {
    if (isDesignPreview) {
      return { rating: 4.8, responseRate: 96, responseTime: '1h', followers: 1280 }
    }
    return {
      rating: 0,
      responseRate: 0,
      responseTime: '—',
      followers: followStats?.followersCount ?? 0
    }
  }, [isDesignPreview, followStats?.followersCount])
  const lightSectionStyle = !isDark
    ? {
        // Use global surface color with a very subtle white overlay to match palette
        backgroundImage: 'linear-gradient(180deg, rgba(255,255,255,0.85) 0%, rgba(255,255,255,0.6) 35%, rgba(255,255,255,0.4) 100%)',
        backgroundColor: 'var(--surface)'
      }
    : undefined
  const lightCardStyle = !isDark
    ? {
        backgroundImage: 'linear-gradient(180deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.7) 35%, rgba(255,255,255,0.5) 100%)',
        backgroundColor: 'var(--surface)'
      }
    : undefined

  const stats = useMemo(() => {
    const totalPublications = publications.length
    const totalViews = publications.reduce((sum, p) => sum + (p.vistas || 0), 0)
    const totalLikes = publications.reduce((sum, p) => {
      if (Array.isArray(p.likes)) return sum + p.likes.length
      if (typeof p.likes === 'number') return sum + p.likes
      return sum
    }, 0)
    const totalShares = publications.reduce((sum, p) => sum + (p.shareCount || 0), 0)
    const totalWhatsappClicks = publications.reduce((sum, p) => sum + (p.whatsappClicks || 0), 0)
    const activePublications = publications.filter((p) => p.activo !== false).length
    return { totalPublications, totalViews, totalLikes, activePublications, totalShares, totalWhatsappClicks }
  }, [publications])

  useEffect(() => {
    const localUser = storage.getUser()
    if (isDesignPreview) {
      setUser({
        name: 'Diseño local',
        email: 'local@preview.test',
        picture: '/image/j&s.png',
        businessProfile: {
          name: 'Mi comercio',
          location: 'San Miguel de Tucumán',
          banner: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=1600&auto=format&fit=crop',
          profilePicture: 'https://images.unsplash.com/photo-1544723795-3fb6469f5b39?q=80&w=400&auto=format&fit=crop',
          description: 'Vista previa del perfil empresa para revisar el diseño.',
          isActive: true,
          socialLinks: {
            facebook: 'https://facebook.com',
            instagram: 'https://instagram.com',
            tiktok: 'https://tiktok.com',
            website: 'https://example.com'
          }
        }
      })
      setPublications([
        {
          _id: 'local-1',
          nombre: 'Moto 110cc impecable',
          precio: 750000,
          vistas: 120,
          likes: [1, 2, 3],
          activo: true
        },
        {
          _id: 'local-2',
          nombre: 'Notebook i5 16GB RAM',
          precio: 420000,
          vistas: 86,
          likes: [1],
          activo: true
        },
        {
          _id: 'local-3',
          nombre: 'Sofá 3 cuerpos premium',
          precio: 210000,
          vistas: 33,
          likes: [],
          activo: false
        },
        {
          _id: 'local-4',
          nombre: 'Auriculares gamer RGB',
          precio: 35000,
          vistas: 64,
          likes: [1, 2],
          activo: true
        }
      ])
      return
    }

    // If we have a cached user, use it while we attempt to fetch latest profile from server
    if (localUser) {
      setUser(localUser)
    }

    const load = async () => {
      setLoading(true)
      try {
        const profile = await userApi.getProfile()
        if (profile) {
          storage.setUser(profile)
          setUser(profile)
          setFormState({
            businessName: profile.businessProfile?.name || '',
            location: profile.businessProfile?.location || '',
            facebook: profile.businessProfile?.socialLinks?.facebook || '',
            instagram: profile.businessProfile?.socialLinks?.instagram || '',
            tiktok: profile.businessProfile?.socialLinks?.tiktok || '',
            website: profile.businessProfile?.socialLinks?.website || '',
            description: profile.businessProfile?.description || ''
          })
        }
        const pubs = await publicationsApi.getUserPublications()
        const list = Array.isArray(pubs) ? pubs : []
        const sorted = [...list].sort(
          (a, b) =>
            new Date((b as PubItem).createdAt || 0).getTime() -
            new Date((a as PubItem).createdAt || 0).getTime()
        )
        setPublications(sorted)
      } catch (error) {
        console.error('Error loading profile:', error)
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [isDesignPreview])

  useEffect(() => {
    if (isDesignPreview) return
    const uid = user?._id || user?.id
    if (!uid || !storage.getToken()) {
      setFollowStats(null)
      return
    }
    let cancelled = false
    void socialApi
      .followStatus(String(uid))
      .then((data) => {
        if (!cancelled) {
          setFollowStats({
            followersCount: data.followersCount,
            followingCount: data.followingCount
          })
        }
      })
      .catch(() => {
        if (!cancelled) setFollowStats(null)
      })
    return () => {
      cancelled = true
    }
  }, [user?._id, user?.id, isDesignPreview])

  const handlePersistToggleBusinessMode = async () => {
    setProfileToggleError('')
    const nextActive = !isBusinessActive

    if (isDesignPreview) {
      setProfileModeOverride(nextActive)
      setUser((prev) =>
        prev
          ? {
              ...prev,
              businessProfile: {
                ...(prev.businessProfile || {}),
                isActive: nextActive
              }
            }
          : prev
      )
      return
    }

    setProfileToggleBusy(true)
    try {
      const res = await userApi.setBusinessProfileActive(nextActive)
      if (!res?.success) {
        setProfileToggleError('No se pudo guardar el modo de perfil.')
        return
      }
      setProfileModeOverride(null)
      const profile = await userApi.getProfile()
      if (profile) {
        storage.setUser(profile)
        setUser(profile)
      }
    } catch {
      setProfileToggleError('No se pudo guardar el modo de perfil.')
    } finally {
      setProfileToggleBusy(false)
    }
  }

  const handleBusinessSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setIsSubmitting(true)
    setUpdateSuccess(false)

    try {
      const formData = new FormData()
      formData.append('businessName', formState.businessName)
      formData.append('location', formState.location)
      formData.append('facebook', formState.facebook)
      formData.append('instagram', formState.instagram)
      formData.append('tiktok', formState.tiktok)
      formData.append('website', formState.website)
      formData.append('description', formState.description)
      if (bannerImage) formData.append('bannerImage', bannerImage)
      if (profilePicture) formData.append('profilePicture', profilePicture)

      const response = await userApi.updateBusinessProfile(formData)
      if (response?.success) {
        setProfileModeOverride(null)
        const updatedProfile = await userApi.getProfile()
        if (updatedProfile) {
          storage.setUser(updatedProfile)
          setUser(updatedProfile)
          setUpdateSuccess(true)
        }
      }
    } catch (error) {
      console.error('Error updating profile:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  

  const handleToggleActive = async (pubId: string, current: boolean) => {
    try {
      await publicationsApi.update(pubId, { activo: !current })
      setPublications((prev) => prev.map((p) => (p._id === pubId ? { ...p, activo: !current } : p)))
    } catch (err) {
      console.error('Error toggling active state:', err)
    }
  }

  const handleToggleOffer = async (pubId: string, currentDiscount: number | undefined, precio: number) => {
    try {
      if (currentDiscount && Number(currentDiscount) > 0) {
        await publicationsApi.update(pubId, { descuento: 0 })
        setPublications((prev) => prev.map((p) => (p._id === pubId ? { ...p, descuento: 0 } : p)))
      } else {
        // Simple default: apply 10% discount
        const descuento = 10
        await publicationsApi.update(pubId, { descuento, precioOriginal: precio })
        setPublications((prev) => prev.map((p) => (p._id === pubId ? { ...p, descuento, precioOriginal: precio } : p)))
      }
    } catch (err) {
      console.error('Error toggling offer:', err)
    }
  }

  const handleDeletePublication = async (pubId: string) => {
    if (!confirm('¿Estás seguro de eliminar esta publicación?')) return
    try {
      await publicationsApi.delete(pubId)
      setPublications((prev) => prev.filter((p) => p._id !== pubId))
    } catch (err) {
      console.error('Error deleting publication:', err)
    }
  }

  const handleEditPublication = (pubId: string) => {
    navigate(`/publicar?edit=${pubId}`)
  }

  const handleClaimReferral = async () => {
    if (isDesignPreview) return
    setReferralMsg('')
    try {
      const res = await userApi.claimReferral(referralClaimCode.trim())
      if (res?.success) {
        setReferralMsg('Código aplicado correctamente.')
        const profile = await userApi.getProfile()
        if (profile) {
          storage.setUser(profile)
          setUser(profile as UserProfile)
        }
        setReferralClaimCode('')
      } else {
        setReferralMsg(typeof res?.message === 'string' ? res.message : 'No se pudo aplicar el código.')
      }
    } catch {
      setReferralMsg('Error al aplicar el código.')
    }
  }

  const handleCreateBoostStub = async () => {
    setCommerceMsg('')
    if (isDesignPreview) {
      setCommerceMsg('Desactivá VITE_PROFILE_MOCK para probar pedidos reales.')
      return
    }
    if (!pendingBoostId) {
      setCommerceMsg('Elegí una publicación.')
      return
    }
    try {
      const res = await commerceApi.createBoostOrder(pendingBoostId, { unit: 'week', value: 1 })
      if (res?.orderId) {
        setLastBoostOrderId(String(res.orderId))
        setCommerceMsg(
          `Pedido creado. Monto referencial: ${res.amount ?? '—'} ${res.currency || 'ARS'}. Confirmá el pago (simulación) para activar el impulso en el inicio.`
        )
      }
    } catch {
      setCommerceMsg('No se pudo crear el pedido.')
    }
  }

  const handleConfirmBoostStub = async () => {
    if (!lastBoostOrderId) {
      setCommerceMsg('Primero creá un pedido de impulso.')
      return
    }
    try {
      await commerceApi.confirmStub(lastBoostOrderId)
      setCommerceMsg('Impulso activado. Revisá el inicio (sección Impulsadas).')
    } catch {
      setCommerceMsg(
        'La simulación de pago solo está disponible fuera de producción o con PAYMENTS_STUB=true en el servidor.'
      )
    }
  }

  const scrollToPerfilSection = (elementId: string) => {
    window.requestAnimationFrame(() => {
      document.getElementById(elementId)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    })
  }

  const handleShortcutConsultas = () => {
    setShortcutNotice('')
    scrollToPerfilSection('perfil-publicaciones')
  }

  const handleShortcutImpulsar = () => {
    setShortcutNotice('')
    const el = document.getElementById('perfil-impulsar')
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' })
      return
    }
    setShortcutNotice(
      'Para crear pedidos de impulso, quitá VITE_PROFILE_MOCK del front o ponelo en 0 y recargá la página.'
    )
  }

  // Do not block render based on stored token when using httpOnly cookies.
  // Attempt to load profile via cookie-backed API call instead (handled in useEffect).

  return (
    <div className={isDark ? 'dark' : ''}>
      <div className="min-h-screen bg-background text-foreground flex flex-col">
        <Header isDark={isDark} onToggleTheme={toggleTheme} />
        <main className="mx-auto w-full max-w-6xl px-4 pb-12 flex-1">
          <div className="mt-6 overflow-hidden rounded-2xl border border-card/50 bg-card/60 shadow-[0_20px_60px_-40px_rgba(0,0,0,0.6)] dark:border-slate-700/60">
            {/** Banner: usar estilo tipo Hero en perfil. Si es perfil común usar banner por defecto. */}
            <div className="relative overflow-hidden bg-surface shadow-soft">
              <div className="aspect-[1920/500] w-full bg-background">
                {(() => {
                  const defaultBanner = '/image/home-image-banner/JSBANNER.png'
                  if (isBusinessActive) {
                    const src = user?.businessProfile?.banner || defaultBanner
                    return (
                      <img
                        src={src}
                        alt="Banner"
                        className="absolute inset-0 h-full w-full object-cover"
                        loading="lazy"
                      />
                    )
                  }
                  // perfil común usa banner por defecto
                  return (
                    <img
                      src={defaultBanner}
                      alt="Banner"
                      className="absolute inset-0 h-full w-full object-cover"
                      loading="lazy"
                    />
                  )
                })()}
              </div>
            </div>
            <div className="flex flex-col gap-4 p-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <div className="h-16 w-16 overflow-hidden rounded-full border border-card/40 bg-surface dark:border-slate-700/50">
                  <img
                    src={user?.businessProfile?.profilePicture || user?.picture || '/image/j&s.png'}
                    alt={user?.name || 'Usuario'}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div>
                  <p className="text-sm font-semibold">{user?.businessProfile?.name || user?.name}</p>
                  <p className="text-xs text-muted">{user?.email}</p>
                  {isBusinessActive && user?.businessProfile?.location ? (
                    <p className="text-[11px] text-muted">{user.businessProfile.location}</p>
                  ) : null}
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setIsBusinessModalOpen(true)}
                  className="rounded-full border border-black/10 bg-gradient-to-b from-black/5 via-transparent to-transparent px-4 py-2 text-[10px] font-semibold uppercase tracking-widest text-foreground shadow-[0_10px_20px_-12px_rgba(0,0,0,0.5)] transition hover:-translate-y-0.5 dark:border-slate-700/60 dark:from-white/5"
                >
                  {isBusinessActive ? 'Editar perfil empresa' : 'Actualizar a perfil empresa'}
                </button>
                <button
                  type="button"
                  onClick={handlePersistToggleBusinessMode}
                  disabled={profileToggleBusy}
                  className="rounded-full border border-black/10 bg-gradient-to-b from-black/5 via-transparent to-transparent px-4 py-2 text-[10px] font-semibold uppercase tracking-widest text-foreground shadow-[0_10px_20px_-12px_rgba(0,0,0,0.5)] transition hover:-translate-y-0.5 disabled:opacity-60 dark:border-slate-700/60 dark:from-white/5"
                >
                  {profileToggleBusy
                    ? 'Guardando...'
                    : isBusinessActive
                      ? 'Cambiar a perfil personal'
                      : 'Cambiar a perfil empresa'}
                </button>
              </div>
              {profileToggleError ? (
                <p className="mt-0 w-full px-0 text-[11px] text-red-500 sm:basis-full">{profileToggleError}</p>
              ) : null}
            </div>
            {isBusinessActive && user?.businessProfile?.description ? (
              <p className="px-4 pb-2 text-[12px] text-muted">{user.businessProfile.description}</p>
            ) : null}
            <div className="flex flex-wrap gap-2 px-4 pb-4">
              {isBusinessActive ? (
                <span className="rounded-full border border-black/10 bg-surface px-2 py-1 text-[10px] font-semibold uppercase tracking-widest text-foreground dark:border-slate-700/60">
                  Perfil empresa activo
                </span>
              ) : (
                <span className="rounded-full border border-black/10 bg-surface px-2 py-1 text-[10px] font-semibold uppercase tracking-widest text-muted dark:border-slate-700/60">
                  Perfil personal
                </span>
              )}
              {isBusinessActive && user?.businessProfile?.socialLinks?.facebook ? (
                <a
                  href={user.businessProfile.socialLinks.facebook}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-full border border-black/10 bg-surface px-2 py-1 text-[10px] font-semibold uppercase tracking-widest text-foreground dark:border-slate-700/60"
                >
                  Facebook
                </a>
              ) : null}
              {isBusinessActive && user?.businessProfile?.socialLinks?.instagram ? (
                <a
                  href={user.businessProfile.socialLinks.instagram}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-full border border-black/10 bg-surface px-2 py-1 text-[10px] font-semibold uppercase tracking-widest text-foreground dark:border-slate-700/60"
                >
                  Instagram
                </a>
              ) : null}
              {isBusinessActive && user?.businessProfile?.socialLinks?.tiktok ? (
                <a
                  href={user.businessProfile.socialLinks.tiktok}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-full border border-black/10 bg-surface px-2 py-1 text-[10px] font-semibold uppercase tracking-widest text-foreground dark:border-slate-700/60"
                >
                  TikTok
                </a>
              ) : null}
              {isBusinessActive && user?.businessProfile?.socialLinks?.website ? (
                <a
                  href={user.businessProfile.socialLinks.website}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-full border border-black/10 bg-surface px-2 py-1 text-[10px] font-semibold uppercase tracking-widest text-foreground dark:border-slate-700/60"
                >
                  Sitio web
                </a>
              ) : null}
            </div>
            {!isDesignPreview && (user?._id || user?.id) ? (
              <div className="border-t border-card/40 px-4 py-3 dark:border-slate-700/50">
                <p className="text-[10px] uppercase tracking-widest text-muted">Tu perfil público</p>
                <Link
                  to={`/vendedor/${String(user?._id || user?.id)}`}
                  className="mt-1 inline-flex text-[12px] font-semibold text-primary underline-offset-2 hover:underline"
                >
                  Ver cómo te ven otros (seguir al vendedor)
                </Link>
              </div>
            ) : null}
          </div>

          <div className="mt-5">
            <div
              style={lightCardStyle}
              className="hidden w-full flex-wrap items-center justify-between gap-4 rounded-xl border border-card/50 bg-card/60 px-4 py-2 text-[11px] text-muted shadow-[0_12px_30px_-22px_rgba(0,0,0,0.55)] sm:flex dark:border-slate-700/60 dark:bg-[linear-gradient(180deg,rgba(255,255,255,0.08)_0%,rgba(255,255,255,0.04)_35%,rgba(255,255,255,0)_100%)]"
            >
              <div className="flex items-center gap-2">
                <span className="uppercase tracking-widest">Publicaciones</span>
                <span className="text-base font-semibold text-foreground">{stats.totalPublications}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="uppercase tracking-widest">Activas</span>
                <span className="text-base font-semibold text-foreground">{stats.activePublications}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="uppercase tracking-widest">Vistas</span>
                <span className="text-base font-semibold text-foreground">{stats.totalViews}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="uppercase tracking-widest">Favoritos</span>
                <span className="text-base font-semibold text-foreground">{stats.totalLikes}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="uppercase tracking-widest">Compartidos</span>
                <span className="text-base font-semibold text-foreground">{stats.totalShares}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="uppercase tracking-widest">WhatsApp</span>
                <span className="text-base font-semibold text-foreground">{stats.totalWhatsappClicks}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 sm:hidden">
              <div
                style={lightCardStyle}
                className="min-h-[64px] rounded-xl border border-card/50 bg-card/60 p-2 text-center shadow-[0_12px_30px_-22px_rgba(0,0,0,0.55)] flex flex-col items-center justify-center gap-1 dark:border-slate-700/60 dark:bg-[linear-gradient(180deg,rgba(255,255,255,0.08)_0%,rgba(255,255,255,0.04)_35%,rgba(255,255,255,0)_100%)]"
              >
                <p className="text-[10px] leading-tight text-muted">Publicaciones</p>
                <p className="text-lg font-semibold">{stats.totalPublications}</p>
              </div>
              <div
                style={lightCardStyle}
                className="min-h-[64px] rounded-xl border border-card/50 bg-card/60 p-2 text-center shadow-[0_12px_30px_-22px_rgba(0,0,0,0.55)] flex flex-col items-center justify-center gap-1 dark:border-slate-700/60 dark:bg-[linear-gradient(180deg,rgba(255,255,255,0.08)_0%,rgba(255,255,255,0.04)_35%,rgba(255,255,255,0)_100%)]"
              >
                <p className="text-[10px] leading-tight text-muted">Activas</p>
                <p className="text-lg font-semibold">{stats.activePublications}</p>
              </div>
              <div
                style={lightCardStyle}
                className="min-h-[64px] rounded-xl border border-card/50 bg-card/60 p-2 text-center shadow-[0_12px_30px_-22px_rgba(0,0,0,0.55)] flex flex-col items-center justify-center gap-1 dark:border-slate-700/60 dark:bg-[linear-gradient(180deg,rgba(255,255,255,0.08)_0%,rgba(255,255,255,0.04)_35%,rgba(255,255,255,0)_100%)]"
              >
                <p className="text-[10px] leading-tight text-muted">Vistas</p>
                <p className="text-lg font-semibold">{stats.totalViews}</p>
              </div>
              <div
                style={lightCardStyle}
                className="min-h-[64px] rounded-xl border border-card/50 bg-card/60 p-2 text-center shadow-[0_12px_30px_-22px_rgba(0,0,0,0.55)] flex flex-col items-center justify-center gap-1 dark:border-slate-700/60 dark:bg-[linear-gradient(180deg,rgba(255,255,255,0.08)_0%,rgba(255,255,255,0.04)_35%,rgba(255,255,255,0)_100%)]"
              >
                <p className="text-[10px] leading-tight text-muted">Favoritos</p>
                <p className="text-lg font-semibold">{stats.totalLikes}</p>
              </div>
              <div
                style={lightCardStyle}
                className="min-h-[64px] rounded-xl border border-card/50 bg-card/60 p-2 text-center shadow-[0_12px_30px_-22px_rgba(0,0,0,0.55)] flex flex-col items-center justify-center gap-1 dark:border-slate-700/60 dark:bg-[linear-gradient(180deg,rgba(255,255,255,0.08)_0%,rgba(255,255,255,0.04)_35%,rgba(255,255,255,0)_100%)]"
              >
                <p className="text-[10px] leading-tight text-muted">Compartidos</p>
                <p className="text-lg font-semibold">{stats.totalShares}</p>
              </div>
              <div
                style={lightCardStyle}
                className="min-h-[64px] rounded-xl border border-card/50 bg-card/60 p-2 text-center shadow-[0_12px_30px_-22px_rgba(0,0,0,0.55)] flex flex-col items-center justify-center gap-1 dark:border-slate-700/60 dark:bg-[linear-gradient(180deg,rgba(255,255,255,0.08)_0%,rgba(255,255,255,0.04)_35%,rgba(255,255,255,0)_100%)]"
              >
                <p className="text-[10px] leading-tight text-muted">WhatsApp</p>
                <p className="text-lg font-semibold">{stats.totalWhatsappClicks}</p>
              </div>
            </div>
          </div>

          <div className={isBusinessActive ? 'mt-5 grid gap-3 lg:grid-cols-[1.2fr_1fr]' : 'mt-5 grid gap-3 lg:grid-cols-1'}>
            <div
              style={lightSectionStyle}
              className="rounded-2xl border border-card/50 bg-card/60 p-4 shadow-[0_20px_50px_-35px_rgba(0,0,0,0.6)] dark:border-slate-700/60 dark:bg-[linear-gradient(180deg,rgba(255,255,255,0.08)_0%,rgba(255,255,255,0.04)_35%,rgba(255,255,255,0)_100%)]"
            >
              <button
                onClick={() => setIsActivityOpen((prev) => !prev)}
                className="flex w-full items-center justify-between text-left"
              >
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-semibold">Actividad y reputación</h2>
                  <span className="rounded-full border border-black/10 bg-surface px-2 py-1 text-[10px] font-semibold uppercase tracking-widest text-muted dark:border-slate-700/60">
                    {isBusinessActive ? 'Empresa' : 'Personal'}
                  </span>
                </div>
                <span className="text-xs text-muted">{isActivityOpen ? 'Ocultar' : 'Mostrar'}</span>
              </button>
              {isActivityOpen ? (
                <div
                  className={
                    isBusinessActive
                      ? 'mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3 lg:grid-cols-4'
                      : 'mt-3 grid grid-cols-2 gap-2 sm:grid-cols-2 sm:gap-3'
                  }
                >
                  <div
                    style={lightCardStyle}
                    className="rounded-xl border border-card/40 bg-surface p-3 text-center shadow-[0_12px_30px_-22px_rgba(0,0,0,0.45)] dark:border-slate-700/50 dark:bg-[linear-gradient(180deg,rgba(255,255,255,0.08)_0%,rgba(255,255,255,0.04)_35%,rgba(255,255,255,0)_100%)]"
                  >
                    <p className="text-[10px] text-muted">Calificación</p>
                    <p className="text-base font-semibold">{previewMetrics.rating || '—'}</p>
                  </div>
                  {isBusinessActive ? (
                    <>
                      <div
                        style={lightCardStyle}
                        className="rounded-xl border border-card/40 bg-surface p-3 text-center shadow-[0_12px_30px_-22px_rgba(0,0,0,0.45)] dark:border-slate-700/50 dark:bg-[linear-gradient(180deg,rgba(255,255,255,0.08)_0%,rgba(255,255,255,0.04)_35%,rgba(255,255,255,0)_100%)]"
                      >
                        <p className="text-[10px] text-muted">Respuesta</p>
                        <p className="text-base font-semibold">
                          {previewMetrics.responseRate ? `${previewMetrics.responseRate}%` : '—'}
                        </p>
                      </div>
                      <div
                        style={lightCardStyle}
                        className="rounded-xl border border-card/40 bg-surface p-3 text-center shadow-[0_12px_30px_-22px_rgba(0,0,0,0.45)] dark:border-slate-700/50 dark:bg-[linear-gradient(180deg,rgba(255,255,255,0.08)_0%,rgba(255,255,255,0.04)_35%,rgba(255,255,255,0)_100%)]"
                      >
                        <p className="text-[10px] text-muted">Tiempo</p>
                        <p className="text-base font-semibold">{previewMetrics.responseTime}</p>
                      </div>
                      <div
                        style={lightCardStyle}
                        className="rounded-xl border border-card/40 bg-surface p-3 text-center shadow-[0_12px_30px_-22px_rgba(0,0,0,0.45)] dark:border-slate-700/50 dark:bg-[linear-gradient(180deg,rgba(255,255,255,0.08)_0%,rgba(255,255,255,0.04)_35%,rgba(255,255,255,0)_100%)]"
                      >
                        <p className="text-[10px] text-muted">Seguidores</p>
                        <p className="text-base font-semibold">{previewMetrics.followers}</p>
                      </div>
                    </>
                  ) : null}
                </div>
              ) : null}
              {isActivityOpen ? (
                <div
                  className={isBusinessActive ? 'mt-4 grid gap-2 sm:grid-cols-2' : 'mt-4 grid gap-2 sm:grid-cols-1'}
                >
                  <div
                    style={lightCardStyle}
                    className="rounded-xl border border-card/40 bg-surface p-3 shadow-[0_12px_30px_-22px_rgba(0,0,0,0.4)] dark:border-slate-700/50 dark:bg-[linear-gradient(180deg,rgba(255,255,255,0.08)_0%,rgba(255,255,255,0.04)_35%,rgba(255,255,255,0)_100%)]"
                  >
                    <p className="text-[11px] font-semibold">Última actividad</p>
                    <p className="mt-1 text-[11px] text-muted">
                      Publicaste “{publications[0]?.nombre || 'Producto destacado'}”.
                    </p>
                  </div>
                  {isBusinessActive ? (
                    <div
                      style={lightCardStyle}
                      className="rounded-xl border border-card/40 bg-surface p-3 shadow-[0_12px_30px_-22px_rgba(0,0,0,0.4)] dark:border-slate-700/50 dark:bg-[linear-gradient(180deg,rgba(255,255,255,0.08)_0%,rgba(255,255,255,0.04)_35%,rgba(255,255,255,0)_100%)]"
                    >
                      <p className="text-[11px] font-semibold">Mensajes</p>
                      <p className="mt-1 text-[11px] text-muted">12 nuevas consultas.</p>
                    </div>
                  ) : null}
                </div>
              ) : null}
            </div>

            {isBusinessActive ? (
              <div
                style={lightSectionStyle}
                className="rounded-2xl border border-card/50 bg-card/60 p-4 shadow-[0_20px_50px_-35px_rgba(0,0,0,0.6)] dark:border-slate-700/60 dark:bg-[linear-gradient(180deg,rgba(255,255,255,0.08)_0%,rgba(255,255,255,0.04)_35%,rgba(255,255,255,0)_100%)]"
              >
                <h2 className="text-sm font-semibold">Tu plan</h2>
                <div className="mt-3 rounded-xl border border-indigo-500/25 bg-gradient-to-b from-indigo-500/10 via-transparent to-transparent p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
                  <p className="text-[11px] font-semibold">Perfil empresa</p>
                  <p className="mt-1 text-[11px] text-muted">
                    Marca destacada, estadísticas avanzadas y prioridad en búsquedas.
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button
                      onClick={() => setIsBenefitsOpen(true)}
                      className="rounded-full border border-black/10 bg-gradient-to-b from-black/5 via-transparent to-transparent px-3 py-1.5 text-[10px] font-semibold uppercase tracking-widest text-foreground shadow-[0_10px_20px_-12px_rgba(0,0,0,0.45)] transition hover:-translate-y-0.5 dark:border-slate-700/60 dark:from-white/5"
                    >
                      Ver beneficios
                    </button>
                  </div>
                </div>
              </div>
            ) : null}
          </div>

          <div className="mt-6 grid gap-4">
            {!isDesignPreview ? (
              <div
                style={lightSectionStyle}
                className="rounded-2xl border border-card/50 bg-card/60 p-4 shadow-[0_20px_50px_-35px_rgba(0,0,0,0.6)] dark:border-slate-700/60 dark:bg-[linear-gradient(180deg,rgba(255,255,255,0.08)_0%,rgba(255,255,255,0.04)_35%,rgba(255,255,255,0)_100%)]"
              >
                <h2 className="text-sm font-semibold">Referidos y visibilidad</h2>
                <p className="mt-1 text-[11px] text-muted">
                  Compartí tu enlace; cada alta válida suma puntos para futuros cupones. Los impulsos aparecen en inicio y
                  categoría.
                </p>
                <div className="mt-3 space-y-2 text-[11px]">
                  <p>
                    <span className="font-semibold">Tu código:</span>{' '}
                    <span className="font-mono">{user?.referralCode || '—'}</span>
                  </p>
                  {user?.referralShareUrl ? (
                    <button
                      type="button"
                      onClick={() => {
                        void navigator.clipboard?.writeText(user.referralShareUrl || '')
                        setReferralMsg('Enlace copiado.')
                      }}
                      className="rounded-full border border-card/40 px-3 py-1 text-[10px] font-semibold uppercase tracking-widest"
                    >
                      Copiar enlace de invitación
                    </button>
                  ) : null}
                  <p className="text-muted">
                    Referidos: {user?.referral?.totalInvites ?? 0} · Puntos: {user?.referral?.rewardPoints ?? 0} ·
                    Cupones (próx.): {user?.monetizationProfile?.couponCredits ?? 0}
                  </p>
                  {!user?.referral?.joinedWithReferral ? (
                    <div className="flex flex-wrap items-end gap-2 pt-2">
                      <label className="text-[11px] font-semibold">
                        ¿Tenés un código de invitación?
                        <input
                          value={referralClaimCode}
                          onChange={(e) => setReferralClaimCode(e.target.value)}
                          className="mt-1 block w-full min-w-[200px] rounded-lg border border-card/60 bg-background px-2 py-1 text-[12px]"
                          placeholder="Código"
                        />
                      </label>
                      <button
                        type="button"
                        onClick={handleClaimReferral}
                        className="rounded-full bg-foreground px-3 py-1.5 text-[10px] font-semibold uppercase tracking-widest text-background"
                      >
                        Aplicar
                      </button>
                    </div>
                  ) : (
                    <p className="text-[11px] text-muted">Ya registraste un código de invitación.</p>
                  )}
                  {referralMsg ? <p className="text-[11px] text-muted">{referralMsg}</p> : null}

                  <div id="perfil-impulsar" className="mt-4 border-t border-card/40 pt-3 dark:border-slate-700/50 scroll-mt-24">
                    <p className="text-[11px] font-semibold">Impulsar publicación (pago)</p>
                    <p className="mt-0.5 text-[10px] text-muted">
                      Creá el pedido y simulá el pago en desarrollo; en producción se conectará la pasarela al mismo
                      endpoint de confirmación.
                    </p>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <select
                        value={pendingBoostId}
                        onChange={(e) => setPendingBoostId(e.target.value)}
                        className="rounded-lg border border-card/60 bg-background px-2 py-1 text-[11px]"
                      >
                        <option value="">Elegí publicación</option>
                        {publications.map((p) => (
                          <option key={p._id} value={p._id}>
                            {p.nombre || p._id}
                          </option>
                        ))}
                      </select>
                      <button
                        type="button"
                        onClick={handleCreateBoostStub}
                        className="rounded-full border border-card/40 px-3 py-1 text-[10px] font-semibold uppercase tracking-widest"
                      >
                        Crear pedido
                      </button>
                      <button
                        type="button"
                        onClick={handleConfirmBoostStub}
                        className="rounded-full bg-primary/15 px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-primary"
                      >
                        Simular pago (dev)
                      </button>
                    </div>
                    {lastBoostOrderId ? (
                      <p className="mt-1 font-mono text-[10px] text-muted">Pedido: {lastBoostOrderId}</p>
                    ) : null}
                    {commerceMsg ? <p className="mt-2 text-[11px] text-muted">{commerceMsg}</p> : null}
                  </div>
                </div>
              </div>
            ) : null}

            <div
              style={lightSectionStyle}
              className="rounded-2xl border border-card/50 bg-card/60 p-4 shadow-[0_20px_50px_-35px_rgba(0,0,0,0.6)] dark:border-slate-700/60 dark:bg-[linear-gradient(180deg,rgba(255,255,255,0.08)_0%,rgba(255,255,255,0.04)_35%,rgba(255,255,255,0)_100%)]"
            >
              <button
                onClick={() => setIsShortcutsOpen((prev) => !prev)}
                className="flex w-full items-center justify-between text-left"
              >
                <h2 className="text-sm font-semibold">Atajos rápidos</h2>
                <span className="text-xs text-muted sm:hidden">{isShortcutsOpen ? 'Ocultar' : 'Mostrar'}</span>
              </button>
              <div
                className={
                  isShortcutsOpen
                    ? 'mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3 lg:grid-cols-4'
                    : 'mt-3 hidden sm:grid sm:grid-cols-3 sm:gap-3 lg:grid-cols-4'
                }
              >
                <button
                  type="button"
                  onClick={() => navigate('/publicar')}
                  style={lightCardStyle}
                  className="rounded-xl border border-card/40 bg-surface p-3 text-left shadow-[0_12px_30px_-22px_rgba(0,0,0,0.4)] dark:border-slate-700/50 dark:bg-[linear-gradient(180deg,rgba(255,255,255,0.08)_0%,rgba(255,255,255,0.04)_35%,rgba(255,255,255,0)_100%)]"
                >
                  <p className="text-[11px] font-semibold">Crear publicación</p>
                  <p className="text-[11px] text-muted">Subí un nuevo producto en minutos.</p>
                </button>
                <button
                  type="button"
                  onClick={handleShortcutConsultas}
                  style={lightCardStyle}
                  className="rounded-xl border border-card/40 bg-surface p-3 text-left shadow-[0_12px_30px_-22px_rgba(0,0,0,0.4)] dark:border-slate-700/50 dark:bg-[linear-gradient(180deg,rgba(255,255,255,0.08)_0%,rgba(255,255,255,0.04)_35%,rgba(255,255,255,0)_100%)]"
                >
                  <p className="text-[11px] font-semibold">Revisar consultas</p>
                  <p className="text-[11px] text-muted">Ir a tus publicaciones y contactos.</p>
                </button>
                <button
                  type="button"
                  onClick={handleShortcutImpulsar}
                  style={lightCardStyle}
                  className="rounded-xl border border-card/40 bg-surface p-3 text-left shadow-[0_12px_30px_-22px_rgba(0,0,0,0.4)] dark:border-slate-700/50 dark:bg-[linear-gradient(180deg,rgba(255,255,255,0.08)_0%,rgba(255,255,255,0.04)_35%,rgba(255,255,255,0)_100%)]"
                >
                  <p className="text-[11px] font-semibold">Impulsar publicación</p>
                  <p className="text-[11px] text-muted">Destacá en inicio y categoría.</p>
                </button>
                <button
                  type="button"
                  onClick={() => setIsBusinessModalOpen(true)}
                  style={lightCardStyle}
                  className="rounded-xl border border-card/40 bg-surface p-3 text-left shadow-[0_12px_30px_-22px_rgba(0,0,0,0.4)] dark:border-slate-700/50 dark:bg-[linear-gradient(180deg,rgba(255,255,255,0.08)_0%,rgba(255,255,255,0.04)_35%,rgba(255,255,255,0)_100%)]"
                >
                  <p className="text-[11px] font-semibold">Editar perfil</p>
                  <p className="text-[11px] text-muted">Actualizá tu información.</p>
                </button>
              </div>
              {shortcutNotice ? (
                <p className="mt-3 text-[11px] text-amber-700 dark:text-amber-400">{shortcutNotice}</p>
              ) : null}
            </div>

            <div
              id="perfil-publicaciones"
              style={lightSectionStyle}
              className="scroll-mt-24 rounded-2xl border border-card/50 bg-card/60 p-4 shadow-[0_20px_50px_-35px_rgba(0,0,0,0.6)] dark:border-slate-700/60 dark:bg-[linear-gradient(180deg,rgba(255,255,255,0.08)_0%,rgba(255,255,255,0.04)_35%,rgba(255,255,255,0)_100%)]"
            >
              <h2 className="text-sm font-semibold">Tus publicaciones</h2>
              {loading ? (
                <p className="mt-3 text-xs text-muted">Cargando...</p>
              ) : publications.length ? (
                <ul className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
                  {publications.map((pub) => (
                    <li key={pub._id} className="mb-4">
                      <div>
                        <Link
                          to={`/publicacion/${pub._id}`}
                          style={lightCardStyle}
                          className="block rounded-2xl border border-card/40 bg-surface/80 p-3 shadow-[0_16px_40px_-26px_rgba(0,0,0,0.45)] transition hover:-translate-y-0.5 dark:border-slate-700/50 dark:bg-[linear-gradient(180deg,rgba(255,255,255,0.08)_0%,rgba(255,255,255,0.04)_35%,rgba(0,0,0,0.15)_100%)] flex flex-col h-[4.5rem] lg:h-[5.5rem] overflow-hidden min-w-0"
                        >
                          <div className="flex items-center justify-between">
                            <p className="text-[12px] font-semibold line-clamp-2 overflow-hidden">{pub.nombre}</p>
                            <span className="rounded-full border border-black/10 bg-surface px-2 py-0.5 text-[9px] font-semibold uppercase tracking-widest text-muted dark:border-slate-700/60">
                              {pub.activo !== false ? 'Activa' : 'Pausada'}
                            </span>
                          </div>
                          <p className="text-[11px] text-muted">${Number(pub.precio || 0).toLocaleString('es-AR')}</p>
                          <div className="mt-auto flex items-center justify-between text-[10px] text-muted">
                            <span>{pub.vistas || 0} vistas</span>
                            <span className="text-foreground">Ver detalles</span>
                          </div>
                        </Link>

                        <div className="mt-2 flex items-center justify-center sm:justify-between gap-1 sm:gap-0.5 w-full">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation()
                              e.preventDefault()
                              handleEditPublication(pub._id)
                            }}
                            className="shrink whitespace-nowrap rounded-md border border-card/40 bg-background/50 px-2 sm:px-2 py-1 text-[10px] sm:text-[11px] lg:text-[9px] font-semibold text-foreground shadow-sm dark:border-slate-700/60 dark:bg-surface/80"
                          >
                            Editar
                          </button>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation()
                              e.preventDefault()
                              handleToggleOffer(pub._id, Number(pub.descuento || 0), Number(pub.precio || 0))
                            }}
                            className="shrink whitespace-nowrap rounded-md border border-card/40 bg-background/50 px-2 sm:px-2 py-1 text-[10px] sm:text-[11px] lg:text-[9px] font-semibold text-foreground shadow-sm dark:border-slate-700/60 dark:bg-surface/80"
                          >
                            {pub.descuento && Number(pub.descuento) > 0 ? 'Quitar oferta' : 'Marcar oferta'}
                          </button>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation()
                              e.preventDefault()
                              handleToggleActive(pub._id, pub.activo !== false)
                            }}
                            className="shrink whitespace-nowrap rounded-md border border-card/40 bg-background/50 px-2 sm:px-2 py-1 text-[10px] sm:text-[11px] lg:text-[9px] font-semibold text-foreground shadow-sm dark:border-slate-700/60 dark:bg-surface/80"
                          >
                            {pub.activo !== false ? 'Pausar' : 'Activar'}
                          </button>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation()
                              e.preventDefault()
                              handleDeletePublication(pub._id)
                            }}
                            className="shrink whitespace-nowrap rounded-md border border-red-200 bg-red-50 text-red-600 px-2 sm:px-2 py-1 text-[10px] sm:text-[11px] lg:text-[9px] font-semibold shadow-sm"
                          >
                            Eliminar
                          </button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-3 text-xs text-muted">Todavía no tenés publicaciones.</p>
              )}
            </div>
          </div>
        </main>
        <Footer />
      </div>

      {isBusinessModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
          <div className="w-full max-w-lg rounded-2xl border border-black/10 bg-surface p-4 shadow-soft text-foreground dark:border-slate-700/60">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold">Perfil Empresa</h2>
              <button
                onClick={() => setIsBusinessModalOpen(false)}
                className="rounded-full border border-black/10 px-2 py-1 text-[10px] font-semibold uppercase tracking-widest text-muted dark:border-slate-700/60"
              >
                Cerrar
              </button>
            </div>
            <form onSubmit={handleBusinessSubmit} className="mt-4 space-y-3">
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="text-[11px] font-semibold text-foreground">
                  Nombre comercial
                  <input
                    value={formState.businessName}
                    onChange={(event) => setFormState({ ...formState, businessName: event.target.value })}
                    className="mt-1.5 w-full rounded-lg border border-card/60 bg-background px-2.5 py-1.5 text-[12px] text-foreground placeholder:text-muted dark:border-slate-700/60"
                  />
                </label>
                <label className="text-[11px] font-semibold text-foreground">
                  Ubicación
                  <input
                    value={formState.location}
                    onChange={(event) => setFormState({ ...formState, location: event.target.value })}
                    className="mt-1.5 w-full rounded-lg border border-card/60 bg-background px-2.5 py-1.5 text-[12px] text-foreground placeholder:text-muted dark:border-slate-700/60"
                  />
                </label>
              </div>

              <label className="text-[11px] font-semibold text-foreground">
                Descripción
                <textarea
                  value={formState.description}
                  onChange={(event) => setFormState({ ...formState, description: event.target.value })}
                  className="mt-1.5 min-h-[90px] w-full rounded-lg border border-card/60 bg-background px-2.5 py-1.5 text-[12px] text-foreground placeholder:text-muted dark:border-slate-700/60"
                />
              </label>

              <div className="grid gap-3 sm:grid-cols-2">
                <label className="text-[11px] font-semibold text-foreground">
                  Facebook
                  <input
                    value={formState.facebook}
                    onChange={(event) => setFormState({ ...formState, facebook: event.target.value })}
                    className="mt-1.5 w-full rounded-lg border border-card/60 bg-background px-2.5 py-1.5 text-[12px] text-foreground placeholder:text-muted dark:border-slate-700/60"
                  />
                </label>
                <label className="text-[11px] font-semibold text-foreground">
                  Instagram
                  <input
                    value={formState.instagram}
                    onChange={(event) => setFormState({ ...formState, instagram: event.target.value })}
                    className="mt-1.5 w-full rounded-lg border border-card/60 bg-background px-2.5 py-1.5 text-[12px] text-foreground placeholder:text-muted dark:border-slate-700/60"
                  />
                </label>
                <label className="text-[11px] font-semibold text-foreground">
                  TikTok
                  <input
                    value={formState.tiktok}
                    onChange={(event) => setFormState({ ...formState, tiktok: event.target.value })}
                    className="mt-1.5 w-full rounded-lg border border-card/60 bg-background px-2.5 py-1.5 text-[12px] text-foreground placeholder:text-muted dark:border-slate-700/60"
                  />
                </label>
                <label className="text-[11px] font-semibold text-foreground">
                  Sitio web
                  <input
                    value={formState.website}
                    onChange={(event) => setFormState({ ...formState, website: event.target.value })}
                    className="mt-1.5 w-full rounded-lg border border-card/60 bg-background px-2.5 py-1.5 text-[12px] text-foreground placeholder:text-muted dark:border-slate-700/60"
                  />
                </label>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <label className="text-[11px] font-semibold text-foreground">
                  Banner
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(event) => setBannerImage(event.target.files?.[0] || null)}
                    className="mt-1.5 block w-full text-[11px] text-muted"
                  />
                </label>
                <label className="text-[11px] font-semibold text-foreground">
                  Foto de perfil
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(event) => setProfilePicture(event.target.files?.[0] || null)}
                    className="mt-1.5 block w-full text-[11px] text-muted"
                  />
                </label>
              </div>

              {updateSuccess ? <p className="text-[11px] text-green-400">¡Perfil actualizado!</p> : null}

              <div className="flex items-center justify-end gap-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-full bg-foreground px-4 py-2 text-[10px] font-semibold uppercase tracking-widest text-background disabled:opacity-60"
                >
                  {isSubmitting ? 'Actualizando...' : 'Guardar cambios'}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {isBenefitsOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
          <div className="w-full max-w-xl rounded-2xl border border-black/10 bg-surface p-5 shadow-soft dark:border-white/10">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold">Beneficios por tipo de perfil</h2>
              <button
                onClick={() => setIsBenefitsOpen(false)}
                className="rounded-full border border-black/10 px-2 py-1 text-[10px] font-semibold uppercase tracking-widest text-muted dark:border-white/10"
              >
                Cerrar
              </button>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-slate-500/25 bg-gradient-to-br from-slate-500/10 via-transparent to-transparent p-4">
                <p className="text-[11px] font-semibold">Perfil personal</p>
                <ul className="mt-2 space-y-1 text-[11px] text-muted">
                  <li>• Publicaciones básicas (límite reducido)</li>
                  <li>• Sin banner ni branding avanzado</li>
                  <li>• Menor prioridad en resultados</li>
                </ul>
              </div>
              <div className="rounded-2xl border border-indigo-500/25 bg-gradient-to-br from-indigo-500/10 via-transparent to-transparent p-4">
                <p className="text-[11px] font-semibold">Perfil empresa</p>
                <ul className="mt-2 space-y-1 text-[11px] text-muted">
                  <li>• Publicaciones ilimitadas</li>
                  <li>• Banner, enlaces y branding completo</li>
                  <li>• Estadísticas avanzadas y reputación</li>
                  <li>• Destacados en búsquedas y categorías</li>
                  <li>• Respuestas rápidas y soporte preferencial</li>
                </ul>
              </div>
            </div>

            {!isBusinessActive ? (
              <button
                onClick={() => {
                  setIsBenefitsOpen(false)
                  setIsBusinessModalOpen(true)
                }}
                className="mt-4 w-full rounded-full bg-foreground px-4 py-2 text-[10px] font-semibold uppercase tracking-widest text-background"
              >
                Mejorar a perfil empresa
              </button>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  )
}
