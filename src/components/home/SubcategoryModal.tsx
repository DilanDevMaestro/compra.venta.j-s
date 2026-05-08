type SubcategoryModalProps = {
  open: boolean
  subcategories: string[]
  onClose: () => void
  onSelect: (subcategory: string) => void
}

export function SubcategoryModal({ open, subcategories, onClose, onSelect }: SubcategoryModalProps) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
      <div className="w-full max-w-sm rounded-2xl border border-black/10 bg-surface shadow-soft dark:border-white/10">
        <div className="flex items-center justify-between border-b border-black/10 px-4 py-3 text-sm font-semibold dark:border-white/10">
          <span>Subcategorías</span>
          <button
            onClick={onClose}
            className="rounded-full border border-black/10 px-2 py-1 text-[10px] font-semibold uppercase tracking-widest text-muted dark:border-white/10"
          >
            Cerrar
          </button>
        </div>
        <div className="max-h-[60vh] overflow-auto px-3 py-3 scrollbar-hidden">
          <div className="grid gap-2">
            <button
              onClick={() => onSelect('')}
              className="flex w-full items-center justify-between rounded-xl border border-black/10 bg-background px-3 py-2 text-left text-[11px] font-semibold text-white transition hover:border-foreground/30 dark:border-white/10"
            >
              <span>Todas</span>
            </button>
            {subcategories.map((subcategory) => (
              <button
                key={subcategory}
                onClick={() => onSelect(subcategory)}
                className="flex w-full items-center justify-between rounded-xl border border-black/10 bg-background px-3 py-2 text-left text-[11px] font-semibold text-white transition hover:border-foreground/30 dark:border-white/10"
              >
                <span>{subcategory}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
