type LocationItem = {
  name: string
  count: number
  country?: string
  province?: string
}

type LocationSidebarProps = {
  title?: string
  items: LocationItem[]
  onSelect?: (item: LocationItem) => void
}

export function LocationSidebar({ title = 'Ubicaciones', items, onSelect }: LocationSidebarProps) {
  const isDark = (() => {
    try {
      const stored = localStorage.getItem('theme')
      if (stored) return stored === 'dark'
    } catch {
      /* ignored */
    }
    return window.matchMedia?.('(prefers-color-scheme: dark)')?.matches ?? true
  })()

  const lightBg = { backgroundColor: '#efe6d9' }

  return (
    <aside className="hidden w-40 shrink-0 lg:block lg:mt-3">
      <div
        className="rounded-xl border p-2 dark:border-slate-700/50 dark:shadow-[0_12px_40px_-30px_rgba(0,0,0,0.65)] dark:bg-[linear-gradient(180deg,rgba(255,255,255,0.03)_0%,rgba(255,255,255,0.02)_35%,rgba(0,0,0,0.06)_100%)]"
        style={isDark ? undefined : { ...lightBg, borderColor: 'rgba(0,0,0,0.18)' }}
      >
        <h3 className="text-[10px] font-semibold uppercase tracking-widest text-muted">{title}</h3>
        <div className="mt-2 max-h-[260px] space-y-1 overflow-auto pr-1 scrollbar-hidden">
          {items.map((item, index) => (
            <button
              key={`${item.name}-${index}`}
              onClick={() => onSelect?.(item)}
              className="flex w-full items-center justify-between rounded-md p-0 text-left text-[11px] font-medium text-foreground hover:text-accent"
            >
              <span className="flex flex-col">
                <span className="text-xs">{item.name || 'Sin definir'}</span>
                {item.country ? (
                  <span className="text-[9px] text-muted">{item.country}{item.province ? ` · ${item.province}` : ''}</span>
                ) : null}
              </span>
              <span className="text-[9px] text-muted">{item.count}</span>
            </button>
          ))}
        </div>
      </div>
    </aside>
  )
}
