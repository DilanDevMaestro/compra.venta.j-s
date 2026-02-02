export function Footer() {
  return (
    <footer className="border-t border-black/10 bg-surface dark:border-white/10">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-10 text-sm text-muted items-center text-center md:flex-row md:items-center md:justify-between md:text-left">
        <div className="flex flex-col items-start gap-2">
          <a href="/" aria-label="Inicio">
            <img src="/image/logo-footer.png" alt="Compra-Venta J&S" className="h-14 md:h-20 w-auto" />
          </a>
          <p className="text-sm">Mercado local para publicar, vender y comprar sin vueltas.</p>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex gap-4">
            <a href="https://t.me/CompraVentaJySOficial" target="_blank" rel="noopener noreferrer" title="Canal de Telegram" aria-label="Canal de Telegram" className="inline-flex items-center gap-2 text-muted hover:text-foreground">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                <path d="M21 3L3.5 10.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M21 3L14 21l-3.5-7L3.5 10.5 21 3z" fill="currentColor" opacity="0.12" />
                <path d="M21 3L14 21l-3.5-7L3.5 10.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span className="text-[13px]">Telegram</span>
            </a>

            <a href="https://www.facebook.com/profile.php?id=61580012303758" target="_blank" rel="noopener noreferrer" title="Facebook" aria-label="Facebook" className="inline-flex items-center gap-2 text-muted hover:text-foreground">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                <path d="M22 12.07C22 6.48 17.52 2 11.93 2S2 6.48 2 12.07c0 4.99 3.66 9.13 8.44 9.92V14.9H8.1v-2.9h2.34V9.41c0-2.32 1.38-3.6 3.5-3.6 1.01 0 2 .2 2 .2v2.2h-1.2c-1.2 0-1.5.7-1.5 1.4V12h2.6l-.4 2.9h-2.2v7.02C18.34 21.2 22 16.99 22 12.07z" />
              </svg>
              <span className="text-[13px]">Facebook</span>
            </a>
          </div>

          <div className="hidden md:flex gap-6">
            <span>Privacidad</span>
            <span>Términos</span>
            <span>Ayuda</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
