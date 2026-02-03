import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { SearchBar } from './SearchBar'
import { loginWithGoogle, fetchUserData } from '../../services/auth'
import storage from '../../services/storage'
import { config } from '../../config/config'

type HeaderProps = {
  isDark: boolean
  onToggleTheme: () => void
}

export function Header({ isDark, onToggleTheme }: HeaderProps) {
  const [user, setUser] = useState<{ name?: string; picture?: string; isAdmin?: boolean } | null>(() => {
    try {
      return (storage.getUser() as { name?: string; picture?: string; isAdmin?: boolean } | null) ?? null
    } catch {
      return null
    }
  })
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement | null>(null)
  const navigate = useNavigate()
  const logoPrimary = '/image/sj-2.png'
  const logoSecondary = '/image/sj-4.png'

  // user is initialized lazily from storage to avoid setState in effect
  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'user') {
        try {
          const u = storage.getUser()
          setUser(u)
        } catch {
          setUser(null)
        }
      }
    }
    const handleUserUpdated = (event: Event) => {
      const detail = (event as CustomEvent<{ name?: string; picture?: string; isAdmin?: boolean } | null>).detail
      if (detail) {
        setUser(detail)
      } else {
        setUser(null)
      }
    }
    window.addEventListener('storage', handleStorage)
    window.addEventListener('user:updated', handleUserUpdated)
    return () => {
      window.removeEventListener('storage', handleStorage)
      window.removeEventListener('user:updated', handleUserUpdated)
    }
  }, [])

  useEffect(() => {
    if (!mobileOpen) return
    // refresh user from local storage or API when opening mobile menu
    const local = storage.getUser()
    if (local) {
      // schedule setState to avoid synchronous setState inside effect
      Promise.resolve().then(() => setUser(local))
      return
    }
    void (async () => {
      try {
        const data = await fetchUserData()
        if (data) {
          const d = data as Record<string, unknown>
          const safeUser = {
            _id: typeof d._id === 'string' ? (d._id as string) : undefined,
            name: typeof d.name === 'string' ? (d.name as string) : undefined,
            picture: typeof d.picture === 'string' ? (d.picture as string) : undefined,
            isAdmin: typeof d.isAdmin === 'boolean' ? (d.isAdmin as boolean) : undefined,
            businessProfile: typeof d.businessProfile === 'object' && d.businessProfile !== null ? (d.businessProfile as Record<string, unknown>) : undefined
          }
          storage.setUser(safeUser)
          Promise.resolve().then(() => setUser({ name: safeUser.name, picture: safeUser.picture, isAdmin: safeUser.isAdmin }))
        }
      } catch {
        // ignore
      }
    })()
  }, [mobileOpen])
  useEffect(() => {
    if (!isMenuOpen) return
    const handleClick = (event: MouseEvent) => {
      if (!menuRef.current) return
      if (!menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false)
      }
    }
    window.addEventListener('mousedown', handleClick)
    return () => window.removeEventListener('mousedown', handleClick)
  }, [isMenuOpen])

  return (
    <header
      className="sticky top-0 z-40 border-b border-black/10 backdrop-blur dark:border-white/10"
      style={{
        backgroundColor: isDark ? 'rgba(16,16,16,0.9)' : 'rgba(217,207,193,0.86)'
      }}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-2">
        <Link to="/" className="flex items-center gap-2">
          <img src={logoPrimary} alt="S & J" className="h-8 w-auto" />
          <img src={logoSecondary} alt="Compra Venta" className="h-8 w-auto" />
          <div className="hidden md:block">
            <p className="text-sm font-semibold">Publicá y vendé rápido</p>
          </div>
        </Link>

        <div className="flex-1 mx-4 md:hidden">
          <SearchBar />
        </div>

        <div className="hidden items-center gap-2 md:flex">
          <SearchBar />
          {user ? (
            <Link
              to="/publicar"
              className="rounded-full bg-foreground px-3 py-1.5 text-[10px] font-semibold uppercase tracking-widest text-background"
            >
              Publicar
            </Link>
          ) : null}
          {user?.isAdmin ? (
            <Link
              to="/admin"
              className="rounded-full border border-black/10 bg-surface px-3 py-1.5 text-[10px] font-semibold uppercase tracking-widest text-foreground dark:border-white/10"
            >
              Dashboard Admin
            </Link>
          ) : null}
          {user ? (
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setIsMenuOpen((prev) => !prev)}
                className="flex items-center gap-2 rounded-full border border-black/10 bg-surface px-3 py-1.5 text-[10px] font-semibold uppercase tracking-widest text-foreground dark:border-slate-700/60"
              >
                <span className="flex h-6 w-6 items-center justify-center overflow-hidden rounded-full border border-black/10 bg-background dark:border-slate-700/60">
                  <img
                    src={user.picture || '/image/perfil-defecto.png'}
                    alt={user.name || 'Perfil'}
                    className="h-full w-full object-cover"
                  />
                </span>
                <span>Mi perfil</span>
              </button>
              {isMenuOpen ? (
                <div className="absolute right-0 mt-2 w-40 rounded-xl border border-black/10 bg-surface p-2 shadow-soft dark:border-slate-700/60">
                  <button
                    onClick={() => {
                      setIsMenuOpen(false)
                      navigate('/perfil')
                    }}
                    className="w-full rounded-lg px-3 py-2 text-left text-[11px] font-semibold text-foreground hover:bg-black/5 dark:hover:bg-white/5"
                  >
                    Ir al perfil
                  </button>
                  <button
                    onClick={async () => {
                      try {
                        await fetch(`${config.API_URL}/auth/logout`, { method: 'POST', credentials: 'include' })
                      } catch (e) {
                        console.error('Logout error', e)
                      }
                      storage.removeToken()
                      storage.removeUser()
                      setIsMenuOpen(false)
                      setUser(null)
                      navigate('/')
                    }}
                    className="w-full rounded-lg px-3 py-2 text-left text-[11px] font-semibold text-muted hover:bg-black/5 dark:hover:bg-white/5"
                  >
                    Desconectar
                  </button>
                </div>
              ) : null}
            </div>
          ) : (
            <button
              onClick={loginWithGoogle}
              className="rounded-full border border-black/10 bg-surface px-3 py-1.5 text-[10px] font-semibold uppercase tracking-widest text-foreground dark:border-white/10"
            >
              Google
            </button>
          )}
          <button
            onClick={() => {
              const next = !isDark
              if (next) document.documentElement.classList.add('dark')
              else document.documentElement.classList.remove('dark')
              onToggleTheme()
            }}
            className="rounded-full border border-black/10 px-2.5 py-1.5 text-[10px] uppercase tracking-widest text-muted dark:border-white/10"
          >
            {isDark ? 'Claro' : 'Oscuro'}
          </button>
        </div>
        <div className="flex items-center gap-2 md:hidden">
          <button
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Abrir menú"
            className="rounded-md p-2 text-foreground hover:bg-black/5 dark:hover:bg-white/5"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>

      {mobileOpen ? (
        <div className="md:hidden fixed inset-0 z-50 flex items-start justify-center pt-20">
          <div className="absolute inset-0 bg-black/60" onClick={() => setMobileOpen(false)} />
          <div
            className="relative w-full max-w-md mx-4 rounded-xl p-4 shadow-xl"
            style={{
              backgroundColor: isDark ? '#0b0b0b' : 'rgba(247,242,234,0.98)',
              color: isDark ? '#ffffff' : '#1a1a1a'
            }}
          >
            <button
              onClick={() => setMobileOpen(false)}
              aria-label="Cerrar"
              className="absolute right-3 top-3 rounded-md px-2 py-1 hover:opacity-90"
              style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)', color: isDark ? '#fff' : '#1a1a1a' }}
            >
              ✕
            </button>

            <nav className="mt-6 flex flex-col gap-3">
              {user ? (
                <div
                  className="flex items-center gap-3 rounded-lg px-3 py-2"
                  style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.6)' }}
                >
                  <div className="h-10 w-10 overflow-hidden rounded-full" style={{ border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.12)' }}>
                    <img src={user.picture || '/image/perfil-defecto.png'} alt={user.name || 'Perfil'} className="h-full w-full object-cover" />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-semibold" style={{ color: isDark ? '#fff' : '#1a1a1a' }}>{user.name}</div>
                    <button
                      onClick={() => {
                        setMobileOpen(false)
                        navigate('/perfil')
                      }}
                      className="text-xs"
                      style={{ color: isDark ? 'rgba(255,255,255,0.85)' : 'rgba(0,0,0,0.7)' }}
                    >
                      Ir al perfil
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => {
                    setMobileOpen(false)
                    loginWithGoogle()
                  }}
                  className="rounded-lg px-3 py-2 text-sm font-semibold"
                  style={{ backgroundColor: isDark ? '#ffffff' : 'white', color: isDark ? '#000' : '#000', border: isDark ? 'none' : '1px solid rgba(0,0,0,0.12)' }}
                >
                  Iniciar con Google
                </button>
              )}

              {user && (
                <button
                  onClick={async () => {
                    try {
                      await fetch(`${config.API_URL}/auth/logout`, { method: 'POST', credentials: 'include' })
                    } catch (e) {
                      console.error('Logout error', e)
                    }
                    storage.removeToken()
                    storage.removeUser()
                    setUser(null)
                    setMobileOpen(false)
                    navigate('/')
                  }}
                  className="w-full rounded-lg px-3 py-2 text-left text-sm font-semibold"
                  style={{ color: isDark ? 'rgba(255,255,255,0.9)' : '#1a1a1a', backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.6)', border: isDark ? '1px solid rgba(255,255,255,0.04)' : '1px solid rgba(0,0,0,0.06)' }}
                >
                  Desconectar
                </button>
              )}

              {user ? (
                <Link
                  to="/publicar"
                  onClick={() => setMobileOpen(false)}
                  className="w-full rounded-lg px-3 py-2 text-left text-sm font-semibold"
                  style={{ color: isDark ? 'rgba(255,255,255,0.9)' : '#1a1a1a', backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.6)', border: isDark ? '1px solid rgba(255,255,255,0.04)' : '1px solid rgba(0,0,0,0.06)' }}
                >
                  Publicar
                </Link>
              ) : null}

              {user?.isAdmin ? (
                <Link
                  to="/admin"
                  onClick={() => setMobileOpen(false)}
                  className="w-full rounded-lg px-3 py-2 text-left text-sm font-semibold"
                  style={{ color: isDark ? 'rgba(255,255,255,0.9)' : '#1a1a1a', backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.6)', border: isDark ? '1px solid rgba(255,255,255,0.04)' : '1px solid rgba(0,0,0,0.06)' }}
                >
                  Dashboard Admin
                </Link>
              ) : null}

              <button
                onClick={() => {
                  const next = !isDark
                  if (next) document.documentElement.classList.add('dark')
                  else document.documentElement.classList.remove('dark')
                  onToggleTheme()
                  setMobileOpen(false)
                }}
                className="rounded-lg px-3 py-2 text-sm font-semibold"
                style={{ color: isDark ? 'rgba(255,255,255,0.9)' : '#1a1a1a', backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.6)', border: isDark ? '1px solid rgba(255,255,255,0.04)' : '1px solid rgba(0,0,0,0.06)' }}
              >
                {isDark ? 'Claro' : 'Oscuro'}
              </button>
            </nav>
          </div>
        </div>
      ) : null}
    </header>
  )
}
