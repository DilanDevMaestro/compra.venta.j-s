import { Link } from 'react-router-dom'
import { FaFacebookF, FaTelegramPlane } from 'react-icons/fa'

const legalLinks = [
  { to: '/privacidad', label: 'Privacidad' },
  { to: '/terminos', label: 'Términos' },
  { to: '/ayuda', label: 'Ayuda' }
] as const

export function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="relative mt-auto overflow-hidden border-t border-black/[0.08] dark:border-white/[0.08]">
      {/* Línea superior sutil */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-foreground/12 to-transparent dark:via-white/15"
        aria-hidden
      />
      {/* Fondo: vidrio alineado al tema */}
      <div
        className="absolute inset-0 bg-[linear-gradient(180deg,color-mix(in_srgb,var(--background)_96%,transparent)_0%,color-mix(in_srgb,var(--background)_88%,transparent)_55%,color-mix(in_srgb,var(--header)_40%,var(--background))_100%)] dark:bg-[linear-gradient(180deg,color-mix(in_srgb,var(--background)_96%,transparent)_0%,color-mix(in_srgb,var(--background)_90%,transparent)_50%,color-mix(in_srgb,var(--surface)_55%,var(--background))_100%)]"
        aria-hidden
      />
      <div className="relative backdrop-blur-[14px]">
        <div className="mx-auto max-w-5xl px-4 pb-10 pt-12 md:pb-12 md:pt-14">
          <div className="grid gap-10 md:grid-cols-12 md:gap-8 lg:gap-12">
            {/* Marca */}
            <div className="flex flex-col items-center text-center md:col-span-5 md:items-start md:text-left">
              <Link to="/" className="group inline-flex flex-col items-center md:items-start" aria-label="Ir al inicio">
                <img
                  src="/image/logo-footer.png"
                  alt=""
                  className="h-12 w-auto opacity-95 transition duration-300 group-hover:opacity-100 md:h-14"
                />
                <span className="mt-3 text-base font-semibold tracking-tight text-foreground">
                  Compra-Venta J&S
                </span>
              </Link>
              <p className="mt-3 max-w-[22rem] text-sm leading-relaxed text-muted md:max-w-none">
                Mercado local para publicar, vender y comprar sin vueltas.
              </p>
            </div>

            {/* Redes */}
            <div className="flex flex-col items-center md:col-span-4 md:items-start">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted">Seguinos</p>
              <div className="mt-4 flex flex-wrap justify-center gap-3 md:justify-start">
                <a
                  href="https://t.me/CompraVentaJySOficial"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-surface/80 px-4 py-2.5 text-sm font-medium text-foreground shadow-[0_2px_12px_-4px_rgba(0,0,0,0.12)] transition hover:-translate-y-0.5 hover:border-black/18 hover:shadow-[0_8px_24px_-8px_rgba(0,0,0,0.18)] dark:border-white/12 dark:bg-white/[0.06] dark:shadow-[0_4px_24px_-10px_rgba(0,0,0,0.65)] dark:hover:border-white/20"
                  aria-label="Canal de Telegram"
                >
                  <FaTelegramPlane className="h-[1.1rem] w-[1.1rem] text-sky-600 dark:text-sky-400" aria-hidden />
                  Telegram
                </a>
                <a
                  href="https://www.facebook.com/profile.php?id=61580012303758"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-surface/80 px-4 py-2.5 text-sm font-medium text-foreground shadow-[0_2px_12px_-4px_rgba(0,0,0,0.12)] transition hover:-translate-y-0.5 hover:border-black/18 hover:shadow-[0_8px_24px_-8px_rgba(0,0,0,0.18)] dark:border-white/12 dark:bg-white/[0.06] dark:shadow-[0_4px_24px_-10px_rgba(0,0,0,0.65)] dark:hover:border-white/20"
                  aria-label="Facebook"
                >
                  <FaFacebookF className="h-[1rem] w-[1rem] text-blue-700 dark:text-blue-400" aria-hidden />
                  Facebook
                </a>
              </div>
            </div>

            {/* Legal */}
            <nav
              className="flex flex-col items-center md:col-span-3 md:items-end"
              aria-label="Información legal"
            >
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted">Sitio</p>
              <ul className="mt-4 flex flex-col items-center gap-2 md:items-end">
                {legalLinks.map(({ to, label }) => (
                  <li key={to}>
                    <Link
                      to={to}
                      className="text-sm text-muted underline-offset-4 transition hover:text-foreground hover:underline"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-black/[0.06] pt-8 text-center dark:border-white/[0.07] md:flex-row md:text-left">
            <p className="text-[12px] text-muted">
              © {year} Compra-Venta J&S. Todos los derechos reservados.
            </p>
            <p className="text-[11px] text-muted/80">Hecho con cuidado para compradores y vendedores locales.</p>
          </div>
        </div>
      </div>
    </footer>
  )
}
