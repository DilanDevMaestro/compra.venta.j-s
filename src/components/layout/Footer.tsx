export function Footer() {
  return (
    <footer className="border-t border-black/10 bg-surface dark:border-white/10">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-10 text-sm text-muted md:flex-row md:items-center md:justify-between">
        <div>
          <p className="font-semibold text-foreground">CompraVenta</p>
          <p>Mercado local para publicar, vender y comprar sin vueltas.</p>
        </div>
        <div className="flex gap-6">
          <span>Privacidad</span>
          <span>Términos</span>
          <span>Ayuda</span>
        </div>
      </div>
    </footer>
  )
}
