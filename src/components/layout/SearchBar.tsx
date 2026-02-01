import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { publicationsApi } from '../../services/api'

type SearchResult = {
  _id: string
  nombre: string
  precio: number
  imagenes?: { url: string }[]
}

type SearchBarProps = {
  placeholder?: string
}

export function SearchBar({ placeholder = 'Buscar productos, servicios...' }: SearchBarProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement | null>(null)
  const debounceRef = useRef<number | null>(null)
  const navigate = useNavigate()

  useEffect(() => {
    const handler = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  useEffect(() => {
    if (debounceRef.current) {
      window.clearTimeout(debounceRef.current)
    }

    if (query.trim().length < 2) {
      setResults([])
      setOpen(false)
      return
    }

    debounceRef.current = window.setTimeout(async () => {
      setLoading(true)
      try {
        const data = (await publicationsApi.search(query.trim())) as SearchResult[]
        setResults(data)
        setOpen(true)
      } catch (error) {
        console.error('Error en búsqueda:', error)
        setResults([])
        setOpen(false)
      } finally {
        setLoading(false)
      }
    }, 300)

    return () => {
      if (debounceRef.current) {
        window.clearTimeout(debounceRef.current)
      }
    }
  }, [query])

  const handleSelect = (item: SearchResult) => {
    setOpen(false)
    setQuery('')
    navigate(`/publicacion/${item._id}`)
  }

  return (
    <div ref={containerRef} className="relative w-full max-w-xs md:w-[360px]">
      <input
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder={placeholder}
        className="w-full rounded-full border border-black/10 bg-background px-3 py-1 text-[11px] text-foreground shadow-sm focus:outline-none focus:ring-2 focus:ring-foreground/40 dark:border-white/10"
      />
      {open && (
        <div className="absolute top-8 z-50 w-full rounded-xl border border-black/10 bg-surface p-1.5 shadow-soft dark:border-white/10">
          {loading ? (
            <div className="px-2 py-2 text-xs text-muted">Buscando...</div>
          ) : results.length === 0 ? (
            <div className="px-2 py-2 text-xs text-muted">Sin resultados</div>
          ) : (
            <ul className="max-h-64 space-y-1 overflow-auto scrollbar-hidden">
              {results.map((item) => (
                <li key={item._id}>
                  <button
                    onClick={() => handleSelect(item)}
                    className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-[11px] hover:bg-background"
                  >
                    {item.imagenes?.[0]?.url ? (
                      <img
                        src={item.imagenes[0].url}
                        alt={item.nombre}
                        className="h-7 w-7 rounded-md object-cover"
                      />
                    ) : (
                      <div className="h-7 w-7 rounded-md bg-background" />
                    )}
                    <div>
                      <p className="font-semibold">{item.nombre}</p>
                      <p className="text-[10px] text-muted">${item.precio?.toLocaleString?.('es-AR')}</p>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}
