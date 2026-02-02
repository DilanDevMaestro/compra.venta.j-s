import { useEffect, useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { Header } from '../components/layout/Header'
import { Footer } from '../components/layout/Footer'
import { publicationsApi, userApi } from '../services/api'

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
  name?: string
  email?: string
  picture?: string
  businessProfile?: BusinessProfile
}

export function PerfilPage() {
  const [isDark, setIsDark] = useState(true)
  const [user, setUser] = useState<UserProfile | null>(null)
  const [publications, setPublications] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [isBusinessModalOpen, setIsBusinessModalOpen] = useState(false)
  const [isBenefitsOpen, setIsBenefitsOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [updateSuccess, setUpdateSuccess] = useState(false)
  const [profileModeOverride, setProfileModeOverride] = useState<boolean | null>(null)
  const [isActivityOpen, setIsActivityOpen] = useState(true)
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false)
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
  const isLocalPreview = import.meta.env.DEV
  const isBusinessActive = profileModeOverride ?? Boolean(user?.businessProfile?.isActive)
  const previewMetrics = isLocalPreview
    ? { rating: 4.8, responseRate: 96, responseTime: '1h', followers: 1280 }
    : { rating: 0, responseRate: 0, responseTime: '—', followers: 0 }
  const lightSectionStyle = !isDark
    ? {
        backgroundImage:
          'linear-gradient(180deg, rgba(210,220,235,0.9) 0%, rgba(235,240,248,0.6) 35%, rgba(255,255,255,0.15) 100%)',
        backgroundColor: 'rgba(255,255,255,0.65)'
      }
    : undefined
  const lightCardStyle = !isDark
    ? {
        backgroundImage:
          'linear-gradient(180deg, rgba(205,215,230,0.95) 0%, rgba(235,240,248,0.65) 35%, rgba(255,255,255,0.2) 100%)',
        backgroundColor: 'rgba(255,255,255,0.7)'
      }
    : undefined

  const stats = useMemo(() => {
    const totalPublications = publications.length
    const totalViews = publications.reduce((sum, p) => sum + (p.vistas || 0), 0)
    const totalLikes = publications.reduce((sum, p) => sum + (p.likes?.length || p.likes || 0), 0)
    const activePublications = publications.filter((p) => p.activo === true).length
    return { totalPublications, totalViews, totalLikes, activePublications }
  }, [publications])

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token && isLocalPreview) {
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

    if (!token) {
      return
    }

    const localUser = localStorage.getItem('user')
    if (localUser) {
      setUser(JSON.parse(localUser))
    }

    const load = async () => {
      setLoading(true)
      try {
        const profile = await userApi.getProfile()
        if (profile) {
          localStorage.setItem('user', JSON.stringify(profile))
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
        setPublications(Array.isArray(pubs) ? pubs : [])
      } catch (error) {
        console.error('Error loading profile:', error)
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [])

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
        const updatedProfile = await userApi.getProfile()
        if (updatedProfile) {
          localStorage.setItem('user', JSON.stringify(updatedProfile))
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

  if (!localStorage.getItem('token') && !isLocalPreview) {
    return (
      <div className={isDark ? 'dark' : ''}>
        <div className="min-h-screen bg-background text-foreground flex flex-col">
          <Header isDark={isDark} onToggleTheme={() => setIsDark((prev) => !prev)} />
          <main className="mx-auto w-full max-w-4xl px-4 pb-12 flex-1">
            <div className="mt-8 rounded-2xl border border-card/50 bg-card/60 p-6 text-center text-sm">
              <p className="mb-3 font-semibold">Necesitás iniciar sesión con Google.</p>
              <button
                onClick={() => navigate('/')}
                className="rounded-full bg-foreground px-4 py-2 text-[10px] font-semibold uppercase tracking-widest text-background"
              >
                Volver al inicio
              </button>
            </div>
          </main>
          <Footer />
        </div>
      </div>
    )
  }

  return (
    <div className={isDark ? 'dark' : ''}>
      <div className="min-h-screen bg-background text-foreground flex flex-col">
        <Header isDark={isDark} onToggleTheme={() => setIsDark((prev) => !prev)} />
        <main className="mx-auto w-full max-w-6xl px-4 pb-12 flex-1">
          <div className="mt-6 overflow-hidden rounded-2xl border border-card/50 bg-card/60 shadow-[0_20px_60px_-40px_rgba(0,0,0,0.6)] dark:border-slate-700/60">
            {isBusinessActive ? (
              user?.businessProfile?.banner ? (
                <img src={user.businessProfile.banner} alt="Banner" className="h-32 w-full object-cover" />
              ) : (
                <div className="h-24 bg-surface" />
              )
            ) : (
              <div className="h-16 bg-surface" />
            )}
            <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between">
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
                  onClick={() => {
                    const nextValue = !isBusinessActive
                    setProfileModeOverride(nextValue)
                    setUser((prev) =>
                      prev
                        ? {
                            ...prev,
                            businessProfile: {
                              ...(prev.businessProfile || {}),
                              isActive: nextValue
                            }
                          }
                        : prev
                    )
                  }}
                  className="rounded-full border border-black/10 bg-gradient-to-b from-black/5 via-transparent to-transparent px-4 py-2 text-[10px] font-semibold uppercase tracking-widest text-foreground shadow-[0_10px_20px_-12px_rgba(0,0,0,0.5)] transition hover:-translate-y-0.5 dark:border-slate-700/60 dark:from-white/5"
                >
                  {isBusinessActive ? 'Cambiar a perfil personal' : 'Cambiar a perfil empresa'}
                </button>
              </div>
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
          </div>

          <div className={isBusinessActive ? 'mt-5 grid grid-cols-4 gap-2 sm:gap-3' : 'mt-5 grid grid-cols-2 gap-2 sm:gap-3'}>
            <div
              style={lightCardStyle}
              className="min-h-[64px] rounded-xl border border-card/50 bg-card/60 p-2 text-center shadow-[0_12px_30px_-22px_rgba(0,0,0,0.55)] flex flex-col items-center justify-center gap-1 dark:border-slate-700/60 dark:bg-[linear-gradient(180deg,rgba(255,255,255,0.08)_0%,rgba(255,255,255,0.04)_35%,rgba(255,255,255,0)_100%)]"
            >
              <p className="text-[10px] leading-tight text-muted">Publicaciones</p>
              <p className="text-lg font-semibold">{stats.totalPublications}</p>
            </div>
            {isBusinessActive ? (
              <>
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
              </>
            ) : (
              <div
                style={lightCardStyle}
                className="min-h-[64px] rounded-xl border border-card/50 bg-card/60 p-2 text-center shadow-[0_12px_30px_-22px_rgba(0,0,0,0.55)] flex flex-col items-center justify-center gap-1 dark:border-slate-700/60 dark:bg-[linear-gradient(180deg,rgba(255,255,255,0.08)_0%,rgba(255,255,255,0.04)_35%,rgba(255,255,255,0)_100%)]"
              >
                <p className="text-[10px] leading-tight text-muted">Favoritos</p>
                <p className="text-lg font-semibold">{stats.totalLikes}</p>
              </div>
            )}
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
                        <p className="text-base font-semibold">{previewMetrics.followers || '—'}</p>
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

          <div className="mt-6 grid gap-4 lg:grid-cols-[1fr_1fr]">
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
              <div className={isShortcutsOpen ? 'mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3' : 'mt-3 hidden sm:grid sm:grid-cols-3 sm:gap-3'}>
                <button
                  style={lightCardStyle}
                  className="rounded-xl border border-card/40 bg-surface p-3 text-left shadow-[0_12px_30px_-22px_rgba(0,0,0,0.4)] dark:border-slate-700/50 dark:bg-[linear-gradient(180deg,rgba(255,255,255,0.08)_0%,rgba(255,255,255,0.04)_35%,rgba(255,255,255,0)_100%)]"
                >
                  <p className="text-[11px] font-semibold">Crear publicación</p>
                  <p className="text-[11px] text-muted">Subí un nuevo producto en minutos.</p>
                </button>
                <button
                  style={lightCardStyle}
                  className="rounded-xl border border-card/40 bg-surface p-3 text-left shadow-[0_12px_30px_-22px_rgba(0,0,0,0.4)] dark:border-slate-700/50 dark:bg-[linear-gradient(180deg,rgba(255,255,255,0.08)_0%,rgba(255,255,255,0.04)_35%,rgba(255,255,255,0)_100%)]"
                >
                  <p className="text-[11px] font-semibold">Revisar consultas</p>
                  <p className="text-[11px] text-muted">Respondé a tus clientes.</p>
                </button>
                <button
                  style={lightCardStyle}
                  className="rounded-xl border border-card/40 bg-surface p-3 text-left shadow-[0_12px_30px_-22px_rgba(0,0,0,0.4)] dark:border-slate-700/50 dark:bg-[linear-gradient(180deg,rgba(255,255,255,0.08)_0%,rgba(255,255,255,0.04)_35%,rgba(255,255,255,0)_100%)]"
                >
                  <p className="text-[11px] font-semibold">Impulsar publicación</p>
                  <p className="text-[11px] text-muted">Destacá tus mejores productos.</p>
                </button>
                <button
                  onClick={() => setIsBusinessModalOpen(true)}
                  style={lightCardStyle}
                  className="rounded-xl border border-card/40 bg-surface p-3 text-left shadow-[0_12px_30px_-22px_rgba(0,0,0,0.4)] dark:border-slate-700/50 dark:bg-[linear-gradient(180deg,rgba(255,255,255,0.08)_0%,rgba(255,255,255,0.04)_35%,rgba(255,255,255,0)_100%)]"
                >
                  <p className="text-[11px] font-semibold">Editar perfil</p>
                  <p className="text-[11px] text-muted">Actualizá tu información.</p>
                </button>
              </div>
            </div>

            <div
              style={lightSectionStyle}
              className="rounded-2xl border border-card/50 bg-card/60 p-4 shadow-[0_20px_50px_-35px_rgba(0,0,0,0.6)] dark:border-slate-700/60 dark:bg-[linear-gradient(180deg,rgba(255,255,255,0.08)_0%,rgba(255,255,255,0.04)_35%,rgba(255,255,255,0)_100%)]"
            >
              <h2 className="text-sm font-semibold">Tus publicaciones</h2>
              {loading ? (
                <p className="mt-3 text-xs text-muted">Cargando...</p>
              ) : publications.length ? (
                <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                  {publications.map((pub) => (
                    <li
                      key={pub._id}
                      style={lightCardStyle}
                      className="rounded-xl border border-card/40 bg-surface p-3 shadow-[0_12px_30px_-22px_rgba(0,0,0,0.4)] dark:border-slate-700/50 dark:bg-[linear-gradient(180deg,rgba(255,255,255,0.08)_0%,rgba(255,255,255,0.04)_35%,rgba(255,255,255,0)_100%)]"
                    >
                      <p className="text-[12px] font-semibold">{pub.nombre}</p>
                      <p className="text-[11px] text-muted">${Number(pub.precio || 0).toLocaleString('es-AR')}</p>
                      <p className="mt-1 text-[10px] text-muted">
                        {pub.activo ? 'Activa' : 'Pausada'} · {pub.vistas || 0} vistas
                      </p>
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
          <div className="w-full max-w-lg rounded-2xl border border-black/10 bg-surface p-4 shadow-soft dark:border-white/10">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold">Perfil Empresa</h2>
              <button
                onClick={() => setIsBusinessModalOpen(false)}
                className="rounded-full border border-black/10 px-2 py-1 text-[10px] font-semibold uppercase tracking-widest text-muted dark:border-white/10"
              >
                Cerrar
              </button>
            </div>
            <form onSubmit={handleBusinessSubmit} className="mt-4 space-y-3">
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="text-[11px] font-semibold">
                  Nombre comercial
                  <input
                    value={formState.businessName}
                    onChange={(event) => setFormState({ ...formState, businessName: event.target.value })}
                    className="mt-1.5 w-full rounded-lg border border-card/60 bg-background px-2.5 py-1.5 text-[12px]"
                  />
                </label>
                <label className="text-[11px] font-semibold">
                  Ubicación
                  <input
                    value={formState.location}
                    onChange={(event) => setFormState({ ...formState, location: event.target.value })}
                    className="mt-1.5 w-full rounded-lg border border-card/60 bg-background px-2.5 py-1.5 text-[12px]"
                  />
                </label>
              </div>

              <label className="text-[11px] font-semibold">
                Descripción
                <textarea
                  value={formState.description}
                  onChange={(event) => setFormState({ ...formState, description: event.target.value })}
                  className="mt-1.5 min-h-[90px] w-full rounded-lg border border-card/60 bg-background px-2.5 py-1.5 text-[12px]"
                />
              </label>

              <div className="grid gap-3 sm:grid-cols-2">
                <label className="text-[11px] font-semibold">
                  Facebook
                  <input
                    value={formState.facebook}
                    onChange={(event) => setFormState({ ...formState, facebook: event.target.value })}
                    className="mt-1.5 w-full rounded-lg border border-card/60 bg-background px-2.5 py-1.5 text-[12px]"
                  />
                </label>
                <label className="text-[11px] font-semibold">
                  Instagram
                  <input
                    value={formState.instagram}
                    onChange={(event) => setFormState({ ...formState, instagram: event.target.value })}
                    className="mt-1.5 w-full rounded-lg border border-card/60 bg-background px-2.5 py-1.5 text-[12px]"
                  />
                </label>
                <label className="text-[11px] font-semibold">
                  TikTok
                  <input
                    value={formState.tiktok}
                    onChange={(event) => setFormState({ ...formState, tiktok: event.target.value })}
                    className="mt-1.5 w-full rounded-lg border border-card/60 bg-background px-2.5 py-1.5 text-[12px]"
                  />
                </label>
                <label className="text-[11px] font-semibold">
                  Sitio web
                  <input
                    value={formState.website}
                    onChange={(event) => setFormState({ ...formState, website: event.target.value })}
                    className="mt-1.5 w-full rounded-lg border border-card/60 bg-background px-2.5 py-1.5 text-[12px]"
                  />
                </label>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <label className="text-[11px] font-semibold">
                  Banner
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(event) => setBannerImage(event.target.files?.[0] || null)}
                    className="mt-1.5 block w-full text-[11px] text-muted"
                  />
                </label>
                <label className="text-[11px] font-semibold">
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
