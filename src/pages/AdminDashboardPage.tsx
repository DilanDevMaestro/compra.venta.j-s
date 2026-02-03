import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Line, Bar } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Tooltip,
  Legend
} from 'chart.js'
import { Header } from '../components/layout/Header'
import { Footer } from '../components/layout/Footer'
import { adminApi } from '../services/api'
import storage from '../services/storage'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Tooltip, Legend)

type AdminSummary = {
  totals: {
    totalUsers: number
    totalPublications: number
    activePublications: number
    totalViews: number
    totalLikes: number
    totalShares: number
    totalWhatsappClicks: number
    businessUsers: number
    personalUsers: number
  }
  timeline: Array<{ date: string; count: number }>
  categories: Array<{ name: string; count: number }>
  publicationsByCountry: Array<{ name: string; count: number }>
  usersByCountry: Array<{ name: string; count: number }>
  sharesByCountry: Array<{ name: string; count: number }>
  whatsappByCountry: Array<{ name: string; count: number }>
  topUsers: Array<{
    userId: string
    name?: string
    email?: string
    totalViews: number
    totalShares: number
    totalWhatsappClicks: number
    totalPublications: number
  }>
}

export function AdminDashboardPage() {
  const [isDark, setIsDark] = useState<boolean>(() => {
    try {
      const stored = localStorage.getItem('theme')
      if (stored) return stored === 'dark'
    } catch {
      // ignore
    }
    return window.matchMedia?.('(prefers-color-scheme: dark)')?.matches ?? false
  })
  const [summary, setSummary] = useState<AdminSummary | null>(null)
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [deleteId, setDeleteId] = useState('')
  const [deleteStatus, setDeleteStatus] = useState('')
  const [adminEmail, setAdminEmail] = useState('')
  const [adminStatus, setAdminStatus] = useState('')
  const [showBannerModal, setShowBannerModal] = useState(false)
  const [bannerFile, setBannerFile] = useState<File | null>(null)
  const [bannerPreview, setBannerPreview] = useState('')
  const [bannerStatus, setBannerStatus] = useState('')
  const [bannerButtonEnabled, setBannerButtonEnabled] = useState(false)
  const [bannerButtonText, setBannerButtonText] = useState('')
  const [bannerButtonUrl, setBannerButtonUrl] = useState('')
  const [bannerButtonPosition, setBannerButtonPosition] = useState<'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'>('bottom-right')
  const navigate = useNavigate()
  const lightSectionStyle = !isDark
    ? {
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

  useEffect(() => {
    const user = storage.getUser()
    if (!user?.isAdmin) {
      navigate('/')
    }
  }, [navigate])

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      setErrorMessage('')
      try {
        const data = (await adminApi.getSummary()) as AdminSummary
        setSummary(data)
      } catch (error) {
        console.error('Error cargando dashboard admin:', error)
        setErrorMessage('No se pudo cargar el panel. Verificá permisos.')
      } finally {
        setLoading(false)
      }
    }

    load()
    const interval = window.setInterval(load, 15000)

    return () => window.clearInterval(interval)
  }, [])

  const totals = summary?.totals

  const timelineData = useMemo(() => {
    const labels = summary?.timeline?.map((t) => t.date) || []
    const values = summary?.timeline?.map((t) => t.count) || []
    return {
      labels,
      datasets: [
        {
          label: 'Publicaciones por día',
          data: values,
          borderColor: '#7c3aed',
          backgroundColor: 'rgba(124,58,237,0.2)',
          tension: 0.3
        }
      ]
    }
  }, [summary])

  const categoriesData = useMemo(() => {
    const labels = summary?.categories?.map((c) => c.name) || []
    const values = summary?.categories?.map((c) => c.count) || []
    return {
      labels,
      datasets: [
        {
          label: 'Publicaciones por categoría',
          data: values,
          backgroundColor: 'rgba(16,185,129,0.7)'
        }
      ]
    }
  }, [summary])

  const countriesData = useMemo(() => {
    const labels = summary?.publicationsByCountry?.map((c) => c.name) || []
    const values = summary?.publicationsByCountry?.map((c) => c.count) || []
    return {
      labels,
      datasets: [
        {
          label: 'Publicaciones por país',
          data: values,
          backgroundColor: 'rgba(59,130,246,0.7)'
        }
      ]
    }
  }, [summary])

  const shareCountriesData = useMemo(() => {
    const labels = summary?.sharesByCountry?.map((c) => c.name) || []
    const values = summary?.sharesByCountry?.map((c) => c.count) || []
    return {
      labels,
      datasets: [
        {
          label: 'Compartidos por país',
          data: values,
          backgroundColor: 'rgba(168,85,247,0.7)'
        }
      ]
    }
  }, [summary])

  const whatsappCountriesData = useMemo(() => {
    const labels = summary?.whatsappByCountry?.map((c) => c.name) || []
    const values = summary?.whatsappByCountry?.map((c) => c.count) || []
    return {
      labels,
      datasets: [
        {
          label: 'WhatsApp por país',
          data: values,
          backgroundColor: 'rgba(16,185,129,0.7)'
        }
      ]
    }
  }, [summary])

  const userCountriesData = useMemo(() => {
    const labels = summary?.usersByCountry?.map((c) => c.name) || []
    const values = summary?.usersByCountry?.map((c) => c.count) || []
    return {
      labels,
      datasets: [
        {
          label: 'Usuarios por país',
          data: values,
          backgroundColor: 'rgba(244,63,94,0.7)'
        }
      ]
    }
  }, [summary])

  const handleDelete = async () => {
    if (!deleteId.trim()) return
    if (!confirm('¿Eliminar publicación por ID?')) return
    setDeleteStatus('')
    try {
      await adminApi.deletePublicationById(deleteId.trim())
      setDeleteStatus('Publicación eliminada.')
      setDeleteId('')
    } catch (error) {
      console.error('Error eliminando publicación:', error)
      setDeleteStatus('No se pudo eliminar la publicación.')
    }
  }

  const handleGrantAdmin = async () => {
    if (!adminEmail.trim()) return
    if (!confirm('¿Asignar permisos de admin a este correo?')) return
    setAdminStatus('')
    try {
      await adminApi.grantAdminByEmail(adminEmail.trim())
      setAdminStatus('Permisos asignados correctamente.')
      setAdminEmail('')
    } catch (error) {
      console.error('Error asignando admin:', error)
      setAdminStatus('No se pudo asignar admin.')
    }
  }

  const handleOpenBanner = () => {
    setBannerStatus('')
    setShowBannerModal(true)
  }

  const handleCloseBanner = () => {
    setShowBannerModal(false)
  }

  const handleBannerFileChange = (file?: File | null) => {
    if (!file) {
      setBannerFile(null)
      setBannerPreview('')
      return
    }
    setBannerFile(file)
    const previewUrl = URL.createObjectURL(file)
    setBannerPreview(previewUrl)
  }

  const handleUploadBanner = async () => {
    if (!bannerFile) {
      setBannerStatus('Seleccioná una imagen.')
      return
    }
    if (bannerButtonEnabled && (!bannerButtonText.trim() || !bannerButtonUrl.trim())) {
      setBannerStatus('Completa texto y link del botón o desactívalo.')
      return
    }

    const formData = new FormData()
    formData.append('image', bannerFile)
    if (bannerButtonEnabled) {
      formData.append('buttonText', bannerButtonText.trim())
      formData.append('buttonUrl', bannerButtonUrl.trim())
      formData.append('buttonPosition', bannerButtonPosition)
    } else {
      formData.append('buttonText', '')
      formData.append('buttonUrl', '')
      formData.append('buttonPosition', bannerButtonPosition)
    }

    setBannerStatus('')
    try {
      await adminApi.uploadBanner(formData)
      setBannerStatus('Banner actualizado.')
      setBannerFile(null)
      setBannerPreview('')
      setBannerButtonEnabled(false)
      setBannerButtonText('')
      setBannerButtonUrl('')
      setBannerButtonPosition('bottom-right')
    } catch (error) {
      console.error('Error subiendo banner:', error)
      setBannerStatus('No se pudo subir el banner.')
    }
  }

  return (
    <div className={isDark ? 'dark' : ''}>
      <div className="min-h-screen bg-background text-foreground flex flex-col">
        <Header isDark={isDark} onToggleTheme={toggleTheme} />
        <main className="mx-auto w-full max-w-6xl px-4 pb-12 flex-1">
          <div className="mt-6 flex flex-col gap-2">
            <h1 className="text-lg font-semibold">Dashboard Admin</h1>
            <p className="text-xs text-muted">Actualización automática cada 15 segundos.</p>
          </div>

          <div className="mt-4 grid gap-3 lg:grid-cols-3">
            <div
              style={lightSectionStyle}
              className="w-full rounded-2xl border border-card/50 bg-card/60 p-4 shadow-[0_20px_50px_-35px_rgba(0,0,0,0.6)] dark:border-slate-700/60 dark:bg-[linear-gradient(180deg,rgba(255,255,255,0.08)_0%,rgba(255,255,255,0.04)_35%,rgba(255,255,255,0)_100%)]"
            >
              <h2 className="text-sm font-semibold">Eliminar publicación por ID</h2>
              <div className="mt-3 flex flex-col gap-2">
                <input
                  value={deleteId}
                  onChange={(event) => setDeleteId(event.target.value)}
                  placeholder="ID de publicación"
                  className="w-full rounded-lg border border-card/40 bg-background px-3 py-2 text-xs"
                />
                <button
                  onClick={handleDelete}
                  className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-xs font-semibold text-red-600"
                >
                  Eliminar
                </button>
              </div>
              {deleteStatus ? <p className="mt-2 text-xs text-muted">{deleteStatus}</p> : null}
            </div>

            <div
              style={lightSectionStyle}
              className="w-full rounded-2xl border border-card/50 bg-card/60 p-4 shadow-[0_20px_50px_-35px_rgba(0,0,0,0.6)] dark:border-slate-700/60 dark:bg-[linear-gradient(180deg,rgba(255,255,255,0.08)_0%,rgba(255,255,255,0.04)_35%,rgba(255,255,255,0)_100%)]"
            >
              <h2 className="text-sm font-semibold">Agregar admin por correo</h2>
              <div className="mt-3 flex flex-col gap-2">
                <input
                  value={adminEmail}
                  onChange={(event) => setAdminEmail(event.target.value)}
                  placeholder="correo@dominio.com"
                  className="w-full rounded-lg border border-card/40 bg-background px-3 py-2 text-xs"
                />
                <button
                  onClick={handleGrantAdmin}
                  className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2 text-xs font-semibold text-emerald-700"
                >
                  Agregar admin
                </button>
              </div>
              {adminStatus ? <p className="mt-2 text-xs text-muted">{adminStatus}</p> : null}
            </div>

            <div
              style={lightSectionStyle}
              className="w-full rounded-2xl border border-card/50 bg-card/60 p-4 shadow-[0_20px_50px_-35px_rgba(0,0,0,0.6)] dark:border-slate-700/60 dark:bg-[linear-gradient(180deg,rgba(255,255,255,0.08)_0%,rgba(255,255,255,0.04)_35%,rgba(255,255,255,0)_100%)]"
            >
              <h2 className="text-sm font-semibold">Subir banner</h2>
              <p className="mt-1 text-[11px] text-muted">Se muestra en el Home.</p>
              <div className="mt-3">
                <button
                  onClick={handleOpenBanner}
                  className="w-full rounded-lg border border-primary/20 bg-primary/10 px-4 py-2 text-xs font-semibold text-primary"
                >
                  Subir banner
                </button>
              </div>
              {bannerStatus ? <p className="mt-2 text-xs text-muted">{bannerStatus}</p> : null}
            </div>
          </div>

          {errorMessage ? <p className="mt-3 text-xs text-red-500">{errorMessage}</p> : null}
          {loading && !summary ? <p className="mt-3 text-xs text-muted">Cargando...</p> : null}

          {totals ? (
            <div className="mt-4 grid gap-2 grid-cols-3 sm:grid-cols-3 lg:grid-cols-6">
              <div
                style={lightCardStyle}
                className="min-h-[72px] rounded-xl border border-card/50 bg-card/60 p-2 text-center shadow-[0_12px_30px_-22px_rgba(0,0,0,0.55)] flex flex-col items-center justify-center gap-1 dark:border-slate-700/60 dark:bg-[linear-gradient(180deg,rgba(255,255,255,0.08)_0%,rgba(255,255,255,0.04)_35%,rgba(255,255,255,0)_100%)]"
              >
                <p className="text-[10px] leading-tight text-muted">Usuarios</p>
                <p className="text-lg font-semibold">{totals.totalUsers}</p>
              </div>
              <div
                style={lightCardStyle}
                className="min-h-[72px] rounded-xl border border-card/50 bg-card/60 p-2 text-center shadow-[0_12px_30px_-22px_rgba(0,0,0,0.55)] flex flex-col items-center justify-center gap-1 dark:border-slate-700/60 dark:bg-[linear-gradient(180deg,rgba(255,255,255,0.08)_0%,rgba(255,255,255,0.04)_35%,rgba(255,255,255,0)_100%)]"
              >
                <p className="text-[10px] leading-tight text-muted">Perfil empresa</p>
                <p className="text-lg font-semibold">{totals.businessUsers}</p>
              </div>
              <div
                style={lightCardStyle}
                className="min-h-[72px] rounded-xl border border-card/50 bg-card/60 p-2 text-center shadow-[0_12px_30px_-22px_rgba(0,0,0,0.55)] flex flex-col items-center justify-center gap-1 dark:border-slate-700/60 dark:bg-[linear-gradient(180deg,rgba(255,255,255,0.08)_0%,rgba(255,255,255,0.04)_35%,rgba(255,255,255,0)_100%)]"
              >
                <p className="text-[10px] leading-tight text-muted">Perfil personal</p>
                <p className="text-lg font-semibold">{totals.personalUsers}</p>
              </div>
              <div
                style={lightCardStyle}
                className="min-h-[72px] rounded-xl border border-card/50 bg-card/60 p-2 text-center shadow-[0_12px_30px_-22px_rgba(0,0,0,0.55)] flex flex-col items-center justify-center gap-1 dark:border-slate-700/60 dark:bg-[linear-gradient(180deg,rgba(255,255,255,0.08)_0%,rgba(255,255,255,0.04)_35%,rgba(255,255,255,0)_100%)]"
              >
                <p className="text-[10px] leading-tight text-muted">Publicaciones</p>
                <p className="text-lg font-semibold">{totals.totalPublications}</p>
              </div>
              <div
                style={lightCardStyle}
                className="min-h-[72px] rounded-xl border border-card/50 bg-card/60 p-2 text-center shadow-[0_12px_30px_-22px_rgba(0,0,0,0.55)] flex flex-col items-center justify-center gap-1 dark:border-slate-700/60 dark:bg-[linear-gradient(180deg,rgba(255,255,255,0.08)_0%,rgba(255,255,255,0.04)_35%,rgba(255,255,255,0)_100%)]"
              >
                <p className="text-[10px] leading-tight text-muted">Activas</p>
                <p className="text-lg font-semibold">{totals.activePublications}</p>
              </div>
              <div
                style={lightCardStyle}
                className="min-h-[72px] rounded-xl border border-card/50 bg-card/60 p-2 text-center shadow-[0_12px_30px_-22px_rgba(0,0,0,0.55)] flex flex-col items-center justify-center gap-1 dark:border-slate-700/60 dark:bg-[linear-gradient(180deg,rgba(255,255,255,0.08)_0%,rgba(255,255,255,0.04)_35%,rgba(255,255,255,0)_100%)]"
              >
                <p className="text-[10px] leading-tight text-muted">Vistas</p>
                <p className="text-lg font-semibold">{totals.totalViews}</p>
              </div>
              <div
                style={lightCardStyle}
                className="min-h-[72px] rounded-xl border border-card/50 bg-card/60 p-2 text-center shadow-[0_12px_30px_-22px_rgba(0,0,0,0.55)] flex flex-col items-center justify-center gap-1 dark:border-slate-700/60 dark:bg-[linear-gradient(180deg,rgba(255,255,255,0.08)_0%,rgba(255,255,255,0.04)_35%,rgba(255,255,255,0)_100%)]"
              >
                <p className="text-[10px] leading-tight text-muted">Favoritos</p>
                <p className="text-lg font-semibold">{totals.totalLikes}</p>
              </div>
              <div
                style={lightCardStyle}
                className="min-h-[72px] rounded-xl border border-card/50 bg-card/60 p-2 text-center shadow-[0_12px_30px_-22px_rgba(0,0,0,0.55)] flex flex-col items-center justify-center gap-1 dark:border-slate-700/60 dark:bg-[linear-gradient(180deg,rgba(255,255,255,0.08)_0%,rgba(255,255,255,0.04)_35%,rgba(255,255,255,0)_100%)]"
              >
                <p className="text-[10px] leading-tight text-muted">Compartidos</p>
                <p className="text-lg font-semibold">{totals.totalShares}</p>
              </div>
              <div
                style={lightCardStyle}
                className="min-h-[72px] rounded-xl border border-card/50 bg-card/60 p-2 text-center shadow-[0_12px_30px_-22px_rgba(0,0,0,0.55)] flex flex-col items-center justify-center gap-1 dark:border-slate-700/60 dark:bg-[linear-gradient(180deg,rgba(255,255,255,0.08)_0%,rgba(255,255,255,0.04)_35%,rgba(255,255,255,0)_100%)]"
              >
                <p className="text-[10px] leading-tight text-muted">WhatsApp</p>
                <p className="text-lg font-semibold">{totals.totalWhatsappClicks}</p>
              </div>
            </div>
          ) : null}

          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            <div
              style={lightSectionStyle}
              className="rounded-2xl border border-card/50 bg-card/60 p-4 shadow-[0_20px_50px_-35px_rgba(0,0,0,0.6)] dark:border-slate-700/60 dark:bg-[linear-gradient(180deg,rgba(255,255,255,0.08)_0%,rgba(255,255,255,0.04)_35%,rgba(255,255,255,0)_100%)]"
            >
              <h2 className="text-sm font-semibold">Publicaciones últimos 14 días</h2>
              <div className="mt-3">
                <Line data={timelineData} options={{ responsive: true, plugins: { legend: { display: false } } }} />
              </div>
            </div>
            <div
              style={lightSectionStyle}
              className="rounded-2xl border border-card/50 bg-card/60 p-4 shadow-[0_20px_50px_-35px_rgba(0,0,0,0.6)] dark:border-slate-700/60 dark:bg-[linear-gradient(180deg,rgba(255,255,255,0.08)_0%,rgba(255,255,255,0.04)_35%,rgba(255,255,255,0)_100%)]"
            >
              <h2 className="text-sm font-semibold">Publicaciones por categoría</h2>
              <div className="mt-3">
                <Bar data={categoriesData} options={{ responsive: true, plugins: { legend: { display: false } } }} />
              </div>
            </div>
            <div
              style={lightSectionStyle}
              className="rounded-2xl border border-card/50 bg-card/60 p-4 shadow-[0_20px_50px_-35px_rgba(0,0,0,0.6)] dark:border-slate-700/60 dark:bg-[linear-gradient(180deg,rgba(255,255,255,0.08)_0%,rgba(255,255,255,0.04)_35%,rgba(255,255,255,0)_100%)]"
            >
              <h2 className="text-sm font-semibold">Publicaciones por país</h2>
              <div className="mt-3">
                <Bar data={countriesData} options={{ responsive: true, plugins: { legend: { display: false } } }} />
              </div>
            </div>
            <div
              style={lightSectionStyle}
              className="rounded-2xl border border-card/50 bg-card/60 p-4 shadow-[0_20px_50px_-35px_rgba(0,0,0,0.6)] dark:border-slate-700/60 dark:bg-[linear-gradient(180deg,rgba(255,255,255,0.08)_0%,rgba(255,255,255,0.04)_35%,rgba(255,255,255,0)_100%)]"
            >
              <h2 className="text-sm font-semibold">Usuarios por país</h2>
              <div className="mt-3">
                <Bar data={userCountriesData} options={{ responsive: true, plugins: { legend: { display: false } } }} />
              </div>
            </div>
            <div
              style={lightSectionStyle}
              className="rounded-2xl border border-card/50 bg-card/60 p-4 shadow-[0_20px_50px_-35px_rgba(0,0,0,0.6)] dark:border-slate-700/60 dark:bg-[linear-gradient(180deg,rgba(255,255,255,0.08)_0%,rgba(255,255,255,0.04)_35%,rgba(255,255,255,0)_100%)]"
            >
              <h2 className="text-sm font-semibold">Compartidos por país</h2>
              <div className="mt-3">
                <Bar data={shareCountriesData} options={{ responsive: true, plugins: { legend: { display: false } } }} />
              </div>
            </div>
            <div
              style={lightSectionStyle}
              className="rounded-2xl border border-card/50 bg-card/60 p-4 shadow-[0_20px_50px_-35px_rgba(0,0,0,0.6)] dark:border-slate-700/60 dark:bg-[linear-gradient(180deg,rgba(255,255,255,0.08)_0%,rgba(255,255,255,0.04)_35%,rgba(255,255,255,0)_100%)]"
            >
              <h2 className="text-sm font-semibold">WhatsApp por país</h2>
              <div className="mt-3">
                <Bar data={whatsappCountriesData} options={{ responsive: true, plugins: { legend: { display: false } } }} />
              </div>
            </div>
          </div>

          <div
            style={lightSectionStyle}
            className="mt-4 rounded-2xl border border-card/50 bg-card/60 p-4 shadow-[0_20px_50px_-35px_rgba(0,0,0,0.6)] dark:border-slate-700/60 dark:bg-[linear-gradient(180deg,rgba(255,255,255,0.08)_0%,rgba(255,255,255,0.04)_35%,rgba(255,255,255,0)_100%)]"
          >
            <h2 className="text-sm font-semibold">Top usuarios por actividad</h2>
            <div className="mt-3 overflow-auto">
              <table className="w-full text-xs">
                <thead className="text-muted">
                  <tr>
                    <th className="py-2 text-left">Usuario</th>
                    <th className="py-2 text-left">Email</th>
                    <th className="py-2 text-right">Publicaciones</th>
                    <th className="py-2 text-right">Vistas</th>
                    <th className="py-2 text-right">Compartidos</th>
                    <th className="py-2 text-right">WhatsApp</th>
                  </tr>
                </thead>
                <tbody>
                  {summary?.topUsers?.map((user) => (
                    <tr key={user.userId} className="border-t border-card/40">
                      <td className="py-2">{user.name || '—'}</td>
                      <td className="py-2 text-muted">{user.email || '—'}</td>
                      <td className="py-2 text-right">{user.totalPublications}</td>
                      <td className="py-2 text-right">{user.totalViews}</td>
                      <td className="py-2 text-right">{user.totalShares}</td>
                      <td className="py-2 text-right">{user.totalWhatsappClicks}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </main>
        <Footer />
      </div>

      {showBannerModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md rounded-2xl border border-card/40 bg-background p-4 shadow-xl">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold">Subir banner</h3>
              <button onClick={handleCloseBanner} className="text-xs text-muted">Cerrar</button>
            </div>

            <div className="mt-3 flex flex-col gap-3">
              <input
                type="file"
                accept="image/*"
                onChange={(event) => handleBannerFileChange(event.target.files?.[0])}
                className="w-full text-xs"
              />

              {bannerPreview ? (
                <div className="overflow-hidden rounded-xl border border-card/40">
                  <img src={bannerPreview} alt="Preview banner" className="h-32 w-full object-cover" />
                </div>
              ) : null}

              <label className="flex items-center gap-2 text-xs text-muted">
                <input
                  type="checkbox"
                  checked={bannerButtonEnabled}
                  onChange={(event) => setBannerButtonEnabled(event.target.checked)}
                />
                Mostrar botón
              </label>

              {bannerButtonEnabled ? (
                <div className="flex flex-col gap-2">
                  <input
                    value={bannerButtonText}
                    onChange={(event) => setBannerButtonText(event.target.value)}
                    placeholder="Texto del botón"
                    className="w-full rounded-lg border border-card/40 bg-background px-3 py-2 text-xs"
                  />
                  <input
                    value={bannerButtonUrl}
                    onChange={(event) => setBannerButtonUrl(event.target.value)}
                    placeholder="Link del botón"
                    className="w-full rounded-lg border border-card/40 bg-background px-3 py-2 text-xs"
                  />
                  <select
                    value={bannerButtonPosition}
                    onChange={(event) => setBannerButtonPosition(event.target.value as typeof bannerButtonPosition)}
                    className="w-full rounded-lg border border-card/40 bg-background px-3 py-2 text-xs"
                  >
                    <option value="top-left">Esquina superior izquierda</option>
                    <option value="top-right">Esquina superior derecha</option>
                    <option value="bottom-left">Esquina inferior izquierda</option>
                    <option value="bottom-right">Esquina inferior derecha</option>
                  </select>
                </div>
              ) : (
                <div className="text-[11px] text-muted">El botón es opcional.</div>
              )}

              <div className="mt-2 flex gap-2">
                <button
                  onClick={handleUploadBanner}
                  className="flex-1 rounded-lg border border-primary/20 bg-primary/10 px-4 py-2 text-xs font-semibold text-primary"
                >
                  Guardar banner
                </button>
                <button
                  onClick={handleCloseBanner}
                  className="rounded-lg border border-card/40 bg-surface px-4 py-2 text-xs"
                >
                  Cancelar
                </button>
              </div>
              {bannerStatus ? <p className="text-xs text-muted">{bannerStatus}</p> : null}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
