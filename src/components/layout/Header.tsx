import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { SearchBar } from './SearchBar'
import { loginWithGoogle } from '../../services/auth'

type HeaderProps = {
  isDark: boolean
  onToggleTheme: () => void
}

export function Header({ isDark, onToggleTheme }: HeaderProps) {
  const [user, setUser] = useState<{ name?: string; picture?: string } | null>(null)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement | null>(null)
  const navigate = useNavigate()
  const logoPrimary = '/image/sj-2.png'
  const logoSecondary = '/image/sj-4.png'

  useEffect(() => {
    const storedUser = localStorage.getItem('user')
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }
  }, [])

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
    <header className="sticky top-0 z-40 border-b border-black/10 bg-header/90 backdrop-blur dark:border-white/10">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-2">
        <Link to="/" className="flex items-center gap-2">
          <img src={logoPrimary} alt="S & J" className="h-8 w-auto" />
          <img src={logoSecondary} alt="Compra Venta" className="h-8 w-auto" />
          <div>
            <p className="text-sm font-semibold">Publicá y vendé rápido</p>
          </div>
        </Link>

        <div className="hidden items-center gap-2 md:flex">
          <SearchBar />
          <Link
            to="/publicar"
            className="rounded-full bg-foreground px-3 py-1.5 text-[10px] font-semibold uppercase tracking-widest text-background"
          >
            Publicar
          </Link>
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
                    onClick={() => {
                      localStorage.removeItem('token')
                      localStorage.removeItem('user')
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
            onClick={onToggleTheme}
            className="rounded-full border border-black/10 px-2.5 py-1.5 text-[10px] uppercase tracking-widest text-muted dark:border-white/10"
          >
            {isDark ? 'Claro' : 'Oscuro'}
          </button>
        </div>
      </div>
    </header>
  )
}
