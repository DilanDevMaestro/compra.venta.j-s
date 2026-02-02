import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { publicationsApi } from '../services/api'
import { Header } from '../components/layout/Header'
import { Footer } from '../components/layout/Footer'
import FullscreenImageModal from '../components/FullscreenImageModal'
import { buildSrcSet, buildSrc } from '../utils/image'
import { config } from '../config/config'

const fallbackImage =
  'https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=1200&auto=format&fit=crop'

type PublicationDetail = {
  _id: string
  nombre: string
  precio: number
  categoria: string
  subcategoria?: string
  descripcion?: string
  whatsapp?: string
  imagenes?: { url: string }[]
  userName?: string
  userPicture?: string
  vistas?: number
  likes?: number
  isLiked?: boolean
  fechaCreacion?: string
  tiempoTranscurrido?: string
}

export function PublicationDetailPage() {
  const { id } = useParams<{ id: string }>()
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
  const [loading, setLoading] = useState(false)
  const [publication, setPublication] = useState<PublicationDetail | null>(null)
  const [selectedImage, setSelectedImage] = useState(0)
  const [showModal, setShowModal] = useState(false)
  const [isLiking, setIsLiking] = useState(false)
  const [likeMessage, setLikeMessage] = useState('')
  const navigate = useNavigate()

  const images = useMemo(() => {
    if (!publication?.imagenes?.length) return [fallbackImage]
    return publication.imagenes.map((image) => image.url).filter(Boolean)
  }, [publication])

  const whatsappLink = useMemo(() => {
    const raw = publication?.whatsapp || ''
    const digits = raw.replace(/[^0-9]/g, '')
    if (!digits || !publication?._id) return ''
    const frontendBaseCandidate = (config.FRONTEND_URL || '').replace(/\/$/, '')
    const frontendBase = frontendBaseCandidate || (typeof window !== 'undefined' ? window.location.origin : '')
    // Visible link should point to the publicacion route (Vercel will rewrite crawler requests to /api/preview)
    const previewUrl = `${frontendBase}/publicacion/${publication._id}?preview=1`
    // sanitize title by removing any URLs that could have been injected or previously appended
    const safeTitle = String(publication.nombre || '').replace(/https?:\/\/[\w\-./?=&%]+/gi, '').trim()
    const text = `Hola, estoy interesado en tu publicación: ${safeTitle} - ${previewUrl}`
    return `https://wa.me/${digits}?text=${encodeURIComponent(text)}`
  }, [publication])

  const telegramShareLink = useMemo(() => {
    if (!publication?._id) return ''
    const frontendBaseCandidate = (config.FRONTEND_URL || '').replace(/\/$/, '')
    const frontendBase = frontendBaseCandidate || (typeof window !== 'undefined' ? window.location.origin : '')
    const previewUrl = `${frontendBase}/api/preview?id=${publication._id}`
    const safeTitle = String(publication.nombre || '').replace(/https?:\/\/[\w\-./?=&%]+/gi, '').trim()
    const text = `Hola, estoy interesado en tu publicación: ${safeTitle}`
    return `https://t.me/share/url?url=${encodeURIComponent(previewUrl)}&text=${encodeURIComponent(text)}`
  }, [publication])

  useEffect(() => {
    if (!id) return
    const load = async () => {
      setLoading(true)
      try {
        const data = (await publicationsApi.getById(id)) as PublicationDetail
        setPublication(data)
        setSelectedImage(0)
      } catch (error) {
        console.error('Error loading publication:', error)
        setPublication(null)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id])

  const handleToggleFavorite = async () => {
    if (!publication?._id || isLiking) return
    try {
      setIsLiking(true)
      setLikeMessage('')
      const response = await publicationsApi.likePublication(publication._id, Boolean(publication.isLiked))
      if (response?.unauthorized) {
        setLikeMessage('Iniciá sesión para marcar favoritos.')
        return
      }
      setPublication((prev) => {
        if (!prev) return prev
        return {
          ...prev,
          isLiked: Boolean(response?.isLiked ?? !prev.isLiked),
          likes: Number(response?.likes ?? prev.likes ?? 0)
        }
      })
    } catch (error) {
      console.error('Error toggling favorite:', error)
      setLikeMessage('No se pudo actualizar el favorito.')
    } finally {
      setIsLiking(false)
    }
  }

  if (!id) {
    return null
  }

  return (
    <div className={isDark ? 'dark' : ''}>
      <div className="min-h-screen bg-background text-foreground flex flex-col">
        <Header isDark={isDark} onToggleTheme={toggleTheme} />
        <main className="mx-auto w-full max-w-5xl px-4 pb-12 flex-1">
          <button
            onClick={() => navigate(-1)}
            className="mt-4 text-[10px] font-semibold uppercase tracking-widest text-muted"
          >
            ← Volver
          </button>

          {loading ? (
            <div className="mt-8 text-xs text-muted">Cargando publicación...</div>
          ) : publication ? (
            <div className="mt-4 grid gap-4 lg:grid-cols-[1.3fr_0.7fr]">
              <section className="rounded-2xl border border-card/50 bg-[linear-gradient(180deg,rgba(0,0,0,0.12)_0%,rgba(0,0,0,0.06)_35%,rgba(0,0,0,0)_100%)] p-4 shadow-[0_20px_50px_-35px_rgba(0,0,0,0.6)] dark:border-slate-700/60 dark:bg-[linear-gradient(180deg,rgba(255,255,255,0.08)_0%,rgba(255,255,255,0.04)_35%,rgba(0,0,0,0.2)_100%)]">
                <div className="overflow-hidden rounded-xl border border-card/40 bg-surface dark:border-slate-700/50">
                  <img
                    src={buildSrc(images[selectedImage] || fallbackImage, 1024) || (images[selectedImage] || fallbackImage)}
                    srcSet={buildSrcSet(images[selectedImage])}
                    sizes="(max-width: 640px) 100vw, 50vw"
                    alt={publication.nombre}
                    className="h-[260px] w-full object-contain sm:h-[320px] cursor-zoom-in"
                    onClick={() => setShowModal(true)}
                    loading="eager"
                    decoding="async"
                    fetchPriority="high"
                  />
                </div>
                {images.length > 1 ? (
                  <div className="mt-2 grid grid-cols-4 gap-2 sm:grid-cols-6">
                    {images.map((url, index) => (
                      <button
                        key={`${url}-${index}`}
                        type="button"
                        onClick={() => setSelectedImage(index)}
                        className={`overflow-hidden rounded-lg border ${
                          selectedImage === index ? 'border-primary/70' : 'border-card/40 dark:border-slate-700/50'
                        }`}
                      >
                        <img
                          src={buildSrc(url, 200) || url}
                          srcSet={buildSrcSet(url)}
                          alt="Miniatura"
                          className="h-12 w-full object-cover"
                          loading="lazy"
                          decoding="async"
                        />
                      </button>
                    ))}
                  </div>
                ) : null}

                {showModal && (
                  <FullscreenImageModal images={images} initialIndex={selectedImage} onClose={() => setShowModal(false)} />
                )}

                <div className="mt-4 space-y-3">
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.2em] text-muted">{publication.categoria}</p>
                    <h1 className="mt-1.5 text-lg font-semibold">{publication.nombre}</h1>
                    {publication.subcategoria ? (
                      <p className="mt-1 text-[11px] text-muted">Subcategoría: {publication.subcategoria}</p>
                    ) : null}
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-[12px] font-semibold text-primary">
                      ${Number(publication.precio || 0).toLocaleString('es-AR')}
                    </span>
                    {publication.tiempoTranscurrido ? (
                      <span className="text-[11px] text-muted">{publication.tiempoTranscurrido}</span>
                    ) : null}
                    {publication.fechaCreacion ? (
                      <span className="text-[11px] text-muted">Publicado: {publication.fechaCreacion}</span>
                    ) : null}
                  </div>

                  {publication.descripcion ? (
                    <div>
                      <h2 className="text-[12px] font-semibold">Descripción</h2>
                      <p className="mt-1.5 text-[12px] text-muted leading-relaxed">{publication.descripcion}</p>
                    </div>
                  ) : null}
                </div>
              </section>

              <aside className="space-y-4">
                <div className="rounded-2xl border border-card/50 bg-[linear-gradient(180deg,rgba(0,0,0,0.12)_0%,rgba(0,0,0,0.06)_35%,rgba(0,0,0,0)_100%)] p-4 shadow-[0_20px_50px_-35px_rgba(0,0,0,0.6)] dark:border-slate-700/60 dark:bg-[linear-gradient(180deg,rgba(255,255,255,0.08)_0%,rgba(255,255,255,0.04)_35%,rgba(0,0,0,0.2)_100%)]">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-muted">Categoría</p>
                  <p className="mt-1 text-[12px] font-semibold">
                    {publication.subcategoria || publication.categoria || 'Gimnasios y Fitness'}
                  </p>
                  <div className="mt-3 space-y-1 text-[11px] text-muted">
                    <p className="text-[12px] font-semibold text-primary">
                      ${Number(publication.precio || 5000).toLocaleString('es-AR')}
                    </p>
                    <p>{publication.tiempoTranscurrido || 'Hace 347 días'}</p>
                    <p>{publication.fechaCreacion || 'Publicado: 18 de febrero de 2025, 15:53'}</p>
                  </div>
                  <div className="mt-3">
                    <p className="text-[11px] font-semibold">Descripción</p>
                    <p className="mt-1 text-[11px] text-muted">
                      {publication.descripcion || 'solo es muestra'}
                    </p>
                  </div>
                </div>

                <div className="rounded-2xl border border-card/50 bg-[linear-gradient(180deg,rgba(0,0,0,0.12)_0%,rgba(0,0,0,0.06)_35%,rgba(0,0,0,0)_100%)] p-4 shadow-[0_20px_50px_-35px_rgba(0,0,0,0.6)] dark:border-slate-700/60 dark:bg-[linear-gradient(180deg,rgba(255,255,255,0.08)_0%,rgba(255,255,255,0.04)_35%,rgba(0,0,0,0.2)_100%)]">
                  <h2 className="text-[12px] font-semibold">Vendedor</h2>
                  <div className="mt-2 flex items-center gap-2">
                    <div className="h-10 w-10 overflow-hidden rounded-full border border-card/40 bg-surface dark:border-slate-700/50">
                      <img
                        src={publication.userPicture || fallbackImage}
                        alt={publication.userName || 'Usuario'}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div>
                      <p className="text-[12px] font-semibold">{publication.userName || 'Usuario'}</p>
                      {publication.whatsapp ? (
                        <p className="text-[11px] text-muted">WhatsApp: {publication.whatsapp}</p>
                      ) : null}
                    </div>
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    {whatsappLink ? (
                      <a
                        href={whatsappLink}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex w-full items-center justify-center rounded-full bg-foreground px-3 py-1.5 text-[10px] font-semibold uppercase tracking-widest text-background"
                      >
                        Contactar por WhatsApp
                      </a>
                    ) : null}

                    {telegramShareLink ? (
                      <a
                        href={telegramShareLink}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex w-full items-center justify-center rounded-full border border-card/40 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-widest text-foreground"
                      >
                        Compartir por Telegram
                      </a>
                    ) : null}
                  </div>
                </div>

                <div className="rounded-2xl border border-card/50 bg-[linear-gradient(180deg,rgba(0,0,0,0.12)_0%,rgba(0,0,0,0.06)_35%,rgba(0,0,0,0)_100%)] p-4 text-[11px] text-muted shadow-[0_20px_50px_-35px_rgba(0,0,0,0.6)] dark:border-slate-700/60 dark:bg-[linear-gradient(180deg,rgba(255,255,255,0.08)_0%,rgba(255,255,255,0.04)_35%,rgba(0,0,0,0.2)_100%)]">
                  <p>Vistas: {publication.vistas ?? 0}</p>
                  <div className="mt-2 flex items-center justify-between gap-2">
                    <p>Favoritos: {publication.likes ?? 0}</p>
                    <button
                      type="button"
                      onClick={handleToggleFavorite}
                      disabled={isLiking}
                      className="inline-flex items-center gap-1 rounded-full border border-black/10 bg-surface px-2 py-0.5 text-[10px] font-semibold text-foreground disabled:opacity-60 dark:border-slate-700/60"
                    >
                      <img src="/image/corazon.gif" alt="Favorito" className="h-4 w-4" />
                      <span>{publication.isLiked ? 'Favorito' : 'Me gusta'}</span>
                      <span>👉</span>
                    </button>
                  </div>
                  {likeMessage ? <p className="mt-2 text-[10px] text-muted">{likeMessage}</p> : null}
                </div>
              </aside>
            </div>
          ) : (
            <div className="mt-8 text-xs text-muted">No se encontró la publicación.</div>
          )}
        </main>
        <Footer />
      </div>
    </div>
  )
}
