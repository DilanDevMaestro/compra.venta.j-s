import type { Category } from '../../data/categories'

type CategoryGridProps = {
  categories: Category[]
  onSelect?: (category: Category) => void
}

export function CategoryGrid({ categories, onSelect }: CategoryGridProps) {
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
            className="group rounded-lg border border-black/10 bg-surface p-1.5 text-left transition hover:border-foreground/30 dark:border-white/10"
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
