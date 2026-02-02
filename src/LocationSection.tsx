type LocationItem = {
  name: string
  count: number
  country?: string
  province?: string
}

type LocationSectionProps = {
  title: string
  items: LocationItem[]
  onSelect?: (item: LocationItem) => void
}

export function LocationSection({ title, items, onSelect }: LocationSectionProps) {
  return (
    <section className="mt-4 rounded-2xl border border-card/40 bg-surface p-4 shadow-soft dark:border-slate-700/50 dark:bg-[linear-gradient(180deg,rgba(255,255,255,0.03)_0%,rgba(255,255,255,0.02)_35%,rgba(0,0,0,0.06)_100%)]">
      <div className="flex items-center justify-between">
        <h3 className="text-[12px] font-semibold uppercase tracking-[0.2em] text-muted">{title}</h3>
        <span className="text-[10px] text-muted">Publicaciones</span>
      </div>
      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        {items.map((item, index) => (
          <button
            key={`${item.name}-${index}`}
            type="button"
            onClick={() => onSelect?.(item)}
            className="flex w-full items-center justify-between rounded-xl border border-black/10 bg-background px-3 py-2 text-left text-[12px] font-semibold transition hover:border-foreground/30 dark:border-slate-700/50 dark:bg-[linear-gradient(180deg,rgba(255,255,255,0.03)_0%,rgba(255,255,255,0.02)_35%,rgba(0,0,0,0.06)_100%)]"
          >
            <span className="flex flex-col">
              <span className="text-foreground dark:text-white">{item.name || 'Sin definir'}</span>
              {item.country ? (
                <span className="text-[10px] text-muted">{item.country}{item.province ? ` · ${item.province}` : ''}</span>
              ) : null}
            </span>
            <span className="text-[10px] text-muted">{item.count}</span>
          </button>
        ))}
      </div>
    </section>
  )
}
