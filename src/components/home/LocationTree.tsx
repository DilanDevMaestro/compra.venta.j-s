type LocationItem = {
  name: string
  count: number
  country?: string
  province?: string
}

type LocationTreeProps = {
  title?: string
  countries: LocationItem[]
  provinces: LocationItem[]
  cities: LocationItem[]
  onSelect?: (payload: { country: string; province?: string; city?: string }) => void
  maxHeight?: string
}

type CityNode = { name: string; count: number }

type ProvinceNode = {
  name: string
  count: number
  cities: CityNode[]
}

type CountryNode = {
  name: string
  count: number
  provinces: ProvinceNode[]
}

const normalizeName = (value: string) => value.trim()

const sortByCount = <T extends { count: number; name: string }>(list: T[]) =>
  [...list].sort((a, b) => (b.count !== a.count ? b.count - a.count : a.name.localeCompare(b.name)))

const buildTree = (countries: LocationItem[], provinces: LocationItem[], cities: LocationItem[]) => {
  const countryMap = new Map<string, CountryNode>()

  countries.forEach((country) => {
    const name = normalizeName(country.name || '')
    if (!name) return
    countryMap.set(name, { name, count: country.count || 0, provinces: [] })
  })

  const provinceMap = new Map<string, Map<string, ProvinceNode>>()

  provinces.forEach((province) => {
    const countryName = normalizeName(province.country || '')
    const provinceName = normalizeName(province.name || '')
    if (!countryName || !provinceName) return

    if (!countryMap.has(countryName)) {
      countryMap.set(countryName, { name: countryName, count: 0, provinces: [] })
    }

    const byCountry = provinceMap.get(countryName) || new Map<string, ProvinceNode>()
    byCountry.set(provinceName, { name: provinceName, count: province.count || 0, cities: [] })
    provinceMap.set(countryName, byCountry)
  })

  cities.forEach((city) => {
    const countryName = normalizeName(city.country || '')
    const provinceName = normalizeName(city.province || '')
    const cityName = normalizeName(city.name || '')
    if (!countryName || !provinceName || !cityName) return

    if (!countryMap.has(countryName)) {
      countryMap.set(countryName, { name: countryName, count: 0, provinces: [] })
    }

    const byCountry = provinceMap.get(countryName) || new Map<string, ProvinceNode>()
    const provinceNode = byCountry.get(provinceName) || { name: provinceName, count: 0, cities: [] }
    provinceNode.cities.push({ name: cityName, count: city.count || 0 })
    byCountry.set(provinceName, provinceNode)
    provinceMap.set(countryName, byCountry)
  })

  const tree: CountryNode[] = []

  countryMap.forEach((countryNode, countryName) => {
    const byCountry = provinceMap.get(countryName)
    if (byCountry) {
      const provincesList = Array.from(byCountry.values()).map((provinceNode) => ({
        ...provinceNode,
        cities: sortByCount(provinceNode.cities)
      }))

      countryNode.provinces = sortByCount(provincesList)

      if (!countryNode.count) {
        countryNode.count = countryNode.provinces.reduce((sum, p) => sum + (p.count || 0), 0)
      }
    }

    tree.push(countryNode)
  })

  return sortByCount(tree)
}

export function LocationTree({ title = 'Países', countries, provinces, cities, onSelect, maxHeight }: LocationTreeProps) {
  const tree = buildTree(countries, provinces, cities)
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
    <div
      className="rounded-xl border p-2 dark:border-slate-700/50 dark:shadow-[0_12px_40px_-30px_rgba(0,0,0,0.65)] dark:bg-[linear-gradient(180deg,rgba(255,255,255,0.03)_0%,rgba(255,255,255,0.02)_35%,rgba(0,0,0,0.06)_100%)]"
      style={isDark ? undefined : { ...lightBg, borderColor: 'rgba(0,0,0,0.18)' }}
    >
      <h3 className="text-[10px] font-semibold uppercase tracking-widest text-muted">{title}</h3>
      <div className="mt-2 space-y-2 overflow-auto pr-1 scrollbar-hidden" style={maxHeight ? { maxHeight } : undefined}>
        {tree.map((country) => (
          <details key={country.name} open>
            <summary className="flex cursor-pointer items-center justify-between rounded-md px-1 py-0.5 text-left text-[11px] font-semibold text-foreground">
              <span>{country.name}</span>
              <div className="flex items-center gap-2 text-[9px] text-muted">
                <button
                  type="button"
                  onClick={(event) => {
                    event.preventDefault()
                    event.stopPropagation()
                    onSelect?.({ country: country.name })
                  }}
                  className="rounded-full border border-card/40 px-2 py-0.5 text-[9px] text-muted hover:text-foreground"
                >
                  Ver
                </button>
                <span>{country.count}</span>
              </div>
            </summary>
            <div className="mt-1 space-y-1 pl-3">
              {country.provinces.map((province) => (
                <details key={`${country.name}-${province.name}`}>
                  <summary className="flex cursor-pointer items-center justify-between rounded-md px-1 py-0.5 text-left text-[10px] font-semibold text-foreground">
                    <span>{province.name}</span>
                    <div className="flex items-center gap-2 text-[9px] text-muted">
                      <button
                        type="button"
                        onClick={(event) => {
                          event.preventDefault()
                          event.stopPropagation()
                          onSelect?.({ country: country.name, province: province.name })
                        }}
                        className="rounded-full border border-card/40 px-2 py-0.5 text-[9px] text-muted hover:text-foreground"
                      >
                        Ver
                      </button>
                      <span>{province.count}</span>
                    </div>
                  </summary>
                  <div className="mt-1 space-y-1 pl-3">
                    {province.cities.map((city) => (
                      <button
                        key={`${country.name}-${province.name}-${city.name}`}
                        type="button"
                        onClick={() => onSelect?.({ country: country.name, province: province.name, city: city.name })}
                        className="flex w-full items-center justify-between rounded-md px-1 py-0.5 text-left text-[10px] font-medium text-foreground hover:text-accent"
                      >
                        <span>{city.name}</span>
                        <span className="text-[9px] text-muted">{city.count}</span>
                      </button>
                    ))}
                  </div>
                </details>
              ))}
            </div>
          </details>
        ))}
      </div>
    </div>
  )
}
