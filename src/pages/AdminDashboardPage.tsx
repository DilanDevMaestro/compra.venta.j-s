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
  const navigate = useNavigate()

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

  return (
    <div className={isDark ? 'dark' : ''}>
      <div className="min-h-screen bg-background text-foreground flex flex-col">
        <Header isDark={isDark} onToggleTheme={toggleTheme} />
        <main className="mx-auto w-full max-w-6xl px-4 pb-12 flex-1">
          <div className="mt-6 flex flex-col gap-2">
            <h1 className="text-lg font-semibold">Dashboard Admin</h1>
            <p className="text-xs text-muted">Actualización automática cada 15 segundos.</p>
          </div>

          {errorMessage ? <p className="mt-3 text-xs text-red-500">{errorMessage}</p> : null}
          {loading && !summary ? <p className="mt-3 text-xs text-muted">Cargando...</p> : null}

          {totals ? (
            <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-xl border border-card/40 bg-surface p-3 text-center">
                <p className="text-[10px] text-muted">Usuarios</p>
                <p className="text-lg font-semibold">{totals.totalUsers}</p>
              </div>
              <div className="rounded-xl border border-card/40 bg-surface p-3 text-center">
                <p className="text-[10px] text-muted">Perfil empresa</p>
                <p className="text-lg font-semibold">{totals.businessUsers}</p>
              </div>
              <div className="rounded-xl border border-card/40 bg-surface p-3 text-center">
                <p className="text-[10px] text-muted">Perfil personal</p>
                <p className="text-lg font-semibold">{totals.personalUsers}</p>
              </div>
              <div className="rounded-xl border border-card/40 bg-surface p-3 text-center">
                <p className="text-[10px] text-muted">Publicaciones</p>
                <p className="text-lg font-semibold">{totals.totalPublications}</p>
              </div>
              <div className="rounded-xl border border-card/40 bg-surface p-3 text-center">
                <p className="text-[10px] text-muted">Activas</p>
                <p className="text-lg font-semibold">{totals.activePublications}</p>
              </div>
              <div className="rounded-xl border border-card/40 bg-surface p-3 text-center">
                <p className="text-[10px] text-muted">Vistas</p>
                <p className="text-lg font-semibold">{totals.totalViews}</p>
              </div>
              <div className="rounded-xl border border-card/40 bg-surface p-3 text-center">
                <p className="text-[10px] text-muted">Favoritos</p>
                <p className="text-lg font-semibold">{totals.totalLikes}</p>
              </div>
              <div className="rounded-xl border border-card/40 bg-surface p-3 text-center">
                <p className="text-[10px] text-muted">Compartidos</p>
                <p className="text-lg font-semibold">{totals.totalShares}</p>
              </div>
              <div className="rounded-xl border border-card/40 bg-surface p-3 text-center">
                <p className="text-[10px] text-muted">WhatsApp</p>
                <p className="text-lg font-semibold">{totals.totalWhatsappClicks}</p>
              </div>
            </div>
          ) : null}

          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            <div className="rounded-2xl border border-card/40 bg-surface p-4">
              <h2 className="text-sm font-semibold">Publicaciones últimos 14 días</h2>
              <div className="mt-3">
                <Line data={timelineData} options={{ responsive: true, plugins: { legend: { display: false } } }} />
              </div>
            </div>
            <div className="rounded-2xl border border-card/40 bg-surface p-4">
              <h2 className="text-sm font-semibold">Publicaciones por categoría</h2>
              <div className="mt-3">
                <Bar data={categoriesData} options={{ responsive: true, plugins: { legend: { display: false } } }} />
              </div>
            </div>
            <div className="rounded-2xl border border-card/40 bg-surface p-4">
              <h2 className="text-sm font-semibold">Publicaciones por país</h2>
              <div className="mt-3">
                <Bar data={countriesData} options={{ responsive: true, plugins: { legend: { display: false } } }} />
              </div>
            </div>
            <div className="rounded-2xl border border-card/40 bg-surface p-4">
              <h2 className="text-sm font-semibold">Usuarios por país</h2>
              <div className="mt-3">
                <Bar data={userCountriesData} options={{ responsive: true, plugins: { legend: { display: false } } }} />
              </div>
            </div>
            <div className="rounded-2xl border border-card/40 bg-surface p-4">
              <h2 className="text-sm font-semibold">Compartidos por país</h2>
              <div className="mt-3">
                <Bar data={shareCountriesData} options={{ responsive: true, plugins: { legend: { display: false } } }} />
              </div>
            </div>
            <div className="rounded-2xl border border-card/40 bg-surface p-4">
              <h2 className="text-sm font-semibold">WhatsApp por país</h2>
              <div className="mt-3">
                <Bar data={whatsappCountriesData} options={{ responsive: true, plugins: { legend: { display: false } } }} />
              </div>
            </div>
          </div>

          <div className="mt-4 rounded-2xl border border-card/40 bg-surface p-4">
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

          <div className="mt-4 rounded-2xl border border-card/40 bg-surface p-4">
            <h2 className="text-sm font-semibold">Eliminar publicación por ID</h2>
            <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center">
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
        </main>
        <Footer />
      </div>
    </div>
  )
}
