import type { Category } from '../../data/categories'

type CategoryGridProps = {
  categories: Category[]
  onSelect?: (category: Category) => void
}

export function CategoryGrid({ categories, onSelect }: CategoryGridProps) {
  const isDark = (() => {
    try {
      const stored = localStorage.getItem('theme')
      if (stored) return stored === 'dark'
    } catch (e) {}
    return window.matchMedia?.('(prefers-color-scheme: dark)')?.matches ?? true
  })()

  const lightBg = { backgroundColor: '#efe6d9' }
  return (
    <section className="mt-6 lg:hidden">
      <div className="mb-3">
        <h2 className="text-xs font-semibold">Categorías</h2>
      </div>
      <div className="grid gap-1 sm:grid-cols-2 lg:grid-cols-4">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => onSelect?.(category)}
            className="group rounded-lg border p-1.5 text-left transition hover:border-foreground/30 dark:border-white/10"
            style={isDark ? undefined : { ...lightBg, borderColor: 'rgba(0,0,0,0.18)' }}
          >
            <div className="mb-1 flex h-5 w-5 items-center justify-center rounded bg-background text-[10px]">
              {category.icon}
            </div>
            <p className="text-[10px] font-semibold">{category.name}</p>
            <p className="text-[9px] text-muted">{category.count} publicaciones</p>
          </button>
        ))}
      </div>
    </section>
  )
}
