import type { Category } from '../../data/categories'

type CategoryModalProps = {
  open: boolean
  categories: Category[]
  onClose: () => void
  onSelect: (category: Category) => void
}

export function CategoryModal({ open, categories, onClose, onSelect }: CategoryModalProps) {
  if (!open) return null

  const isDark = (() => {
    try {
      const stored = localStorage.getItem('theme')
      if (stored) return stored === 'dark'
    } catch {
      /* ignored */
    }
    return window.matchMedia?.('(prefers-color-scheme: dark)')?.matches ?? true
  })()

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
        <div className="w-full max-w-sm rounded-2xl border border-black/10 bg-surface shadow-soft dark:border-slate-700/50 dark:shadow-[0_20px_60px_-40px_rgba(0,0,0,0.7)]">
        <div className="flex items-center justify-between border-b border-black/10 px-4 py-3 text-sm font-semibold dark:border-slate-700/50">
          <span className="text-foreground dark:text-white">Categorías</span>
          <button
            onClick={onClose}
            className="rounded-full border border-black/10 px-2 py-1 text-[10px] font-semibold uppercase tracking-widest text-muted dark:border-white/10"
          >
            Cerrar
          </button>
        </div>
        <div className="max-h-[60vh] overflow-auto px-3 py-3 scrollbar-hidden">
          <div className="grid gap-2">
            {categories.map((category) => (
              <button
            key={category.id}
            onClick={() => onSelect(category)}
            className={`flex w-full items-center justify-between rounded-xl border border-black/10 bg-background px-3 py-2 text-left text-[11px] font-semibold transition hover:border-foreground/30 dark:border-slate-700/50 dark:bg-[linear-gradient(180deg,rgba(255,255,255,0.03)_0%,rgba(255,255,255,0.02)_35%,rgba(0,0,0,0.06)_100%)] ${isDark ? 'text-white' : 'text-foreground'}`}
          >
                <span className="flex items-center gap-2">
                  <span className="text-sm">{category.icon}</span>
                  <span>{category.name}</span>
                </span>
                <span className="text-[10px] text-muted">{category.count}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
