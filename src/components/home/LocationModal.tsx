type LocationItem = { name: string; count: number; country?: string; province?: string }

type LocationModalProps = {
  open: boolean
  countries: LocationItem[]
  provinces: LocationItem[]
  cities: LocationItem[]
  onClose: () => void
  onSelect: (payload: { country: string; province?: string; city?: string }) => void
}

import { LocationTree } from './LocationTree'

export function LocationModal({ open, countries, provinces, cities, onClose, onSelect }: LocationModalProps) {
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
          <span className={isDark ? 'text-white' : 'text-foreground'}>Ubicaciones</span>
          <button
            onClick={onClose}
            className="rounded-full border border-black/10 px-2 py-1 text-[10px] font-semibold uppercase tracking-widest text-muted dark:border-white/10"
          >
            Cerrar
          </button>
        </div>
        <div className="max-h-[60vh] overflow-auto px-3 py-3 scrollbar-hidden">
          <LocationTree
            title="Países"
            countries={countries}
            provinces={provinces}
            cities={cities}
            onSelect={(payload) => {
              onSelect(payload)
            }}
          />
        </div>
      </div>
    </div>
  )
}
