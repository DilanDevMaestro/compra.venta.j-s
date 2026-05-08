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
  collapsible?: boolean
  defaultOpen?: boolean
  compact?: boolean
  maxHeight?: string
  noContainer?: boolean
}

export function LocationSection({
  title,
  items,
  onSelect,
  collapsible = false,
  defaultOpen = false,
  compact = false,
  maxHeight,
  noContainer = false
}: LocationSectionProps) {
  const containerClass = compact
    ? 'rounded-xl border border-card/40 bg-surface p-2 shadow-soft dark:border-slate-700/50 dark:bg-[linear-gradient(180deg,rgba(255,255,255,0.03)_0%,rgba(255,255,255,0.02)_35%,rgba(0,0,0,0.06)_100%)]'
    : 'mt-4 rounded-2xl border border-card/40 bg-surface p-4 shadow-soft dark:border-slate-700/50 dark:bg-[linear-gradient(180deg,rgba(255,255,255,0.03)_0%,rgba(255,255,255,0.02)_35%,rgba(0,0,0,0.06)_100%)]'

  const listClass = compact ? 'mt-2 grid gap-1' : 'mt-3 grid gap-2 sm:grid-cols-2'
  const itemClass = compact
    ? 'flex w-full items-center justify-between rounded-lg border border-black/10 bg-background px-2 py-1 text-left text-[11px] font-semibold transition hover:border-foreground/30 dark:border-slate-700/50 dark:bg-[linear-gradient(180deg,rgba(255,255,255,0.03)_0%,rgba(255,255,255,0.02)_35%,rgba(0,0,0,0.06)_100%)]'
    : 'flex w-full items-center justify-between rounded-xl border border-black/10 bg-background px-3 py-2 text-left text-[12px] font-semibold transition hover:border-foreground/30 dark:border-slate-700/50 dark:bg-[linear-gradient(180deg,rgba(255,255,255,0.03)_0%,rgba(255,255,255,0.02)_35%,rgba(0,0,0,0.06)_100%)]'

  const content = (
    <>
      <div className={listClass} style={maxHeight ? { maxHeight, overflow: 'auto' } : undefined}>
        {items.map((item, index) => (
          <button
            key={`${item.name}-${index}`}
            type="button"
            onClick={() => onSelect?.(item)}
            className={itemClass}
          >
            <span className="flex flex-col">
              <span className="text-foreground dark:text-white">{item.name || 'Sin definir'}</span>
              {item.country ? (
                <span className={compact ? 'text-[9px] text-muted' : 'text-[10px] text-muted'}>
                  {item.country}{item.province ? ` · ${item.province}` : ''}
                </span>
              ) : null}
            </span>
            <span className={compact ? 'text-[9px] text-muted' : 'text-[10px] text-muted'}>{item.count}</span>
          </button>
        ))}
      </div>
    </>
  )

  if (collapsible) {
    const body = (
      <details open={defaultOpen}>
        <summary className="flex cursor-pointer items-center justify-between text-[12px] font-semibold uppercase tracking-[0.2em] text-muted">
          <span>{title}</span>
          <span className="text-[10px] text-muted">Publicaciones</span>
        </summary>
        {content}
      </details>
    )
    if (noContainer) return body
    return <section className={containerClass}>{body}</section>
  }

  const plain = (
    <>
      <div className="flex items-center justify-between">
        <h3 className="text-[12px] font-semibold uppercase tracking-[0.2em] text-muted">{title}</h3>
        <span className="text-[10px] text-muted">Publicaciones</span>
      </div>
      {content}
    </>
  )

  if (noContainer) return plain

  return <section className={containerClass}>{plain}</section>
}
