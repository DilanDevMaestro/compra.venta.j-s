import type { Category } from '../../data/categories'

type CategorySidebarProps = {
  categories: Category[]
  onSelect?: (category: Category) => void
}

export function CategorySidebar({ categories, onSelect }: CategorySidebarProps) {
  return (
    <aside className="hidden w-40 shrink-0 lg:block lg:mt-4">
      <div className="rounded-xl border border-black/10 bg-surface p-2 dark:border-white/10">
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
