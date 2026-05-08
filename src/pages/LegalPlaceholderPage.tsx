import { Link } from 'react-router-dom'

type LegalPlaceholderPageProps = {
  title: string
}

export function LegalPlaceholderPage({ title }: LegalPlaceholderPageProps) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <main className="mx-auto flex min-h-[70vh] max-w-lg flex-col justify-center px-4 py-16">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted">Compra-Venta J&S</p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">{title}</h1>
        <p className="mt-4 text-sm leading-relaxed text-muted">
          Estamos preparando esta sección. Si necesitás algo urgente, escribinos por Telegram o Facebook desde el pie
          de página.
        </p>
        <Link
          to="/"
          className="mt-10 inline-flex w-fit items-center gap-2 rounded-full border border-black/15 bg-surface px-5 py-2.5 text-sm font-medium text-foreground transition hover:border-black/25 hover:bg-background dark:border-white/15 dark:hover:border-white/25"
        >
          <span aria-hidden>←</span> Volver al inicio
        </Link>
      </main>
    </div>
  )
}
