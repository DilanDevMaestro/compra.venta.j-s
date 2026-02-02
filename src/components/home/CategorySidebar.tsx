import type { Category } from '../../data/categories'

type CategorySidebarProps = {
  categories: Category[]
  onSelect?: (category: Category) => void
}

export function CategorySidebar({ categories, onSelect }: CategorySidebarProps) {
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
    <aside className="hidden w-40 shrink-0 lg:block lg:mt-4">
      <div
        className="rounded-xl border p-2 dark:border-slate-700/50 dark:shadow-[0_12px_40px_-30px_rgba(0,0,0,0.65)] dark:bg-[linear-gradient(180deg,rgba(255,255,255,0.03)_0%,rgba(255,255,255,0.02)_35%,rgba(0,0,0,0.06)_100%)]"
        style={isDark ? undefined : { ...lightBg, borderColor: 'rgba(0,0,0,0.18)' }}
      >
        <h3 className="text-[10px] font-semibold uppercase tracking-widest text-muted">Categorías</h3>
        <div className="mt-2 max-h-[460px] space-y-1 overflow-auto pr-1 scrollbar-hidden">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => onSelect?.(category)}
              className="flex w-full items-center justify-between rounded-md p-0 text-left text-[11px] font-medium text-foreground hover:text-accent"
            >
              <span className="flex items-center gap-2">
                <span className="text-xs">{category.icon}</span>
                <span>{category.name}</span>
              </span>
              <span className="text-[9px] text-muted">{category.count}</span>
            </button>
          ))}
        </div>
      </div>
    </aside>
  )
}
