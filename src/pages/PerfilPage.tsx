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
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [updateSuccess, setUpdateSuccess] = useState(false)
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

  const stats = useMemo(() => {
    const totalPublications = publications.length
    const totalViews = publications.reduce((sum, p) => sum + (p.vistas || 0), 0)
    const totalLikes = publications.reduce((sum, p) => sum + (p.likes?.length || p.likes || 0), 0)
    const activePublications = publications.filter((p) => p.activo === true).length
    return { totalPublications, totalViews, totalLikes, activePublications }
  }, [publications])

  useEffect(() => {
    const token = localStorage.getItem('token')
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

  if (!localStorage.getItem('token')) {
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
          <div className="mt-6 overflow-hidden rounded-2xl border border-card/50 bg-card/60 shadow-soft">
            {user?.businessProfile?.banner ? (
              <img src={user.businessProfile.banner} alt="Banner" className="h-32 w-full object-cover" />
            ) : (
              <div className="h-24 bg-surface" />
            )}
            <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <div className="h-16 w-16 overflow-hidden rounded-full border border-card/40 bg-surface">
                  <img
                    src={user?.businessProfile?.profilePicture || user?.picture || '/image/j&s.png'}
                    alt={user?.name || 'Usuario'}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div>
                  <p className="text-sm font-semibold">{user?.businessProfile?.name || user?.name}</p>
                  <p className="text-xs text-muted">{user?.email}</p>
                  {user?.businessProfile?.location ? (
                    <p className="text-[11px] text-muted">{user.businessProfile.location}</p>
                  ) : null}
                </div>
              </div>
              <button
                onClick={() => setIsBusinessModalOpen(true)}
                className="rounded-full border border-black/10 bg-surface px-4 py-2 text-[10px] font-semibold uppercase tracking-widest text-foreground dark:border-white/10"
              >
                {user?.businessProfile?.isActive ? 'Editar perfil empresa' : 'Actualizar a perfil empresa'}
              </button>
            </div>
            {user?.businessProfile?.description ? (
              <p className="px-4 pb-2 text-[12px] text-muted">{user.businessProfile.description}</p>
            ) : null}
            <div className="flex flex-wrap gap-2 px-4 pb-4">
              {user?.businessProfile?.isActive ? (
                <span className="rounded-full border border-black/10 bg-surface px-2 py-1 text-[10px] font-semibold uppercase tracking-widest text-foreground dark:border-white/10">
                  Perfil empresa activo
                </span>
              ) : (
                <span className="rounded-full border border-black/10 bg-surface px-2 py-1 text-[10px] font-semibold uppercase tracking-widest text-muted dark:border-white/10">
                  Perfil personal
                </span>
              )}
              {user?.businessProfile?.socialLinks?.facebook ? (
                <a
                  href={user.businessProfile.socialLinks.facebook}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-full border border-black/10 bg-surface px-2 py-1 text-[10px] font-semibold uppercase tracking-widest text-foreground dark:border-white/10"
                >
                  Facebook
                </a>
              ) : null}
              {user?.businessProfile?.socialLinks?.instagram ? (
                <a
                  href={user.businessProfile.socialLinks.instagram}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-full border border-black/10 bg-surface px-2 py-1 text-[10px] font-semibold uppercase tracking-widest text-foreground dark:border-white/10"
                >
                  Instagram
                </a>
              ) : null}
              {user?.businessProfile?.socialLinks?.tiktok ? (
                <a
                  href={user.businessProfile.socialLinks.tiktok}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-full border border-black/10 bg-surface px-2 py-1 text-[10px] font-semibold uppercase tracking-widest text-foreground dark:border-white/10"
                >
                  TikTok
                </a>
              ) : null}
              {user?.businessProfile?.socialLinks?.website ? (
                <a
                  href={user.businessProfile.socialLinks.website}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-full border border-black/10 bg-surface px-2 py-1 text-[10px] font-semibold uppercase tracking-widest text-foreground dark:border-white/10"
                >
                  Sitio web
                </a>
              ) : null}
            </div>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-4">
            <div className="rounded-xl border border-card/50 bg-card/60 p-3 text-center">
              <p className="text-xs text-muted">Publicaciones</p>
              <p className="text-lg font-semibold">{stats.totalPublications}</p>
            </div>
            <div className="rounded-xl border border-card/50 bg-card/60 p-3 text-center">
              <p className="text-xs text-muted">Activas</p>
              <p className="text-lg font-semibold">{stats.activePublications}</p>
            </div>
            <div className="rounded-xl border border-card/50 bg-card/60 p-3 text-center">
              <p className="text-xs text-muted">Vistas</p>
              <p className="text-lg font-semibold">{stats.totalViews}</p>
            </div>
            <div className="rounded-xl border border-card/50 bg-card/60 p-3 text-center">
              <p className="text-xs text-muted">Favoritos</p>
              <p className="text-lg font-semibold">{stats.totalLikes}</p>
            </div>
          </div>

          <div className="mt-6 rounded-2xl border border-card/50 bg-card/60 p-4 shadow-soft">
            <h2 className="text-sm font-semibold">Tus publicaciones</h2>
            {loading ? (
              <p className="mt-3 text-xs text-muted">Cargando...</p>
            ) : publications.length ? (
              <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                {publications.map((pub) => (
                  <li key={pub._id} className="rounded-xl border border-card/40 bg-surface p-3">
                    <p className="text-[12px] font-semibold">{pub.nombre}</p>
                    <p className="text-[11px] text-muted">${Number(pub.precio || 0).toLocaleString('es-AR')}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-3 text-xs text-muted">Todavía no tenés publicaciones.</p>
            )}
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
    </div>
  )
}
