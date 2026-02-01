import { Link } from 'react-router-dom'
import { SearchBar } from './SearchBar'

type HeaderProps = {
  isDark: boolean
  onToggleTheme: () => void
}

export function Header({ isDark, onToggleTheme }: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-black/10 bg-header/90 backdrop-blur dark:border-white/10">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-2">
        <Link to="/" className="flex items-center gap-2">
          <img
            src="/image/j&s-compra22.png"
            alt="CompraVenta"
            className="h-8 w-auto"
          />
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
