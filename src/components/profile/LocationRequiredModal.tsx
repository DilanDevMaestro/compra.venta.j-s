import { useEffect, useMemo, useState } from 'react'
import { userApi } from '../../services/api'
import { countries } from '../../data/countries'
import { detectLocation } from '../../services/locationService'
import storage from '../../services/storage'

type ProfileResponse = {
  locationProfile?: {
    country?: string
    countryCode?: string
    province?: string
    city?: string
    postalCode?: string
    areaCode?: string
  }
  locationComplete?: boolean
}

export function LocationRequiredModal() {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const [country, setCountry] = useState('')
  const [countryCode, setCountryCode] = useState('')
  const [province, setProvince] = useState('')
  const [city, setCity] = useState('')
  const [postalCode, setPostalCode] = useState('')
  const [areaCode, setAreaCode] = useState('')

  const countryOptions = useMemo(() => countries, [])

  useEffect(() => {
    let alive = true
    const load = async () => {
      setLoading(true)
      setError('')
      try {
        const cachedUser = storage.getUser()
        if (!cachedUser) {
          setOpen(false)
          return
        }

        const profile = (await userApi.getProfile()) as ProfileResponse
        if (!alive) return

        const locationComplete = Boolean(profile?.locationComplete)
        if (locationComplete) {
          setOpen(false)
          return
        }

        const loc = profile?.locationProfile || {}
        setCountry(loc.country || '')
        setCountryCode(loc.countryCode || '')
        setProvince(loc.province || '')
        setCity(loc.city || '')
        setPostalCode(loc.postalCode || '')
        setAreaCode(loc.areaCode || '')

        setOpen(true)

        const detected = await detectLocation()
        if (!alive || !detected) return
        if (!loc.country && detected.country) setCountry(detected.country)
        if (!loc.countryCode && detected.countryCode) setCountryCode(detected.countryCode)
        if (!loc.province && detected.region) setProvince(detected.region)
        if (!loc.city && detected.city) setCity(detected.city)
        if (!loc.postalCode && detected.postalCode) setPostalCode(detected.postalCode)
      } catch {
        // Not authenticated or request failed, do not show modal
        if (!alive) return
        setOpen(false)
      } finally {
        if (alive) setLoading(false)
      }
    }

    void load()
    return () => {
      alive = false
    }
  }, [])

  const validate = () => {
    if (!country) return 'Seleccioná tu nacionalidad.'
    if (!province) return 'Completá provincia/estado.'
    if (!city) return 'Completá ciudad/departamento.'
    if (!postalCode) return 'Completá código postal.'
    return ''
  }

  const handleSave = async () => {
    setError('')
    const message = validate()
    if (message) {
      setError(message)
      return
    }

    try {
      setSaving(true)
      await userApi.updateLocation({
        country,
        countryCode,
        province,
        city,
        postalCode,
        areaCode
      })
      setOpen(false)
    } catch {
      setError('No se pudo guardar la ubicación. Intentá nuevamente.')
    } finally {
      setSaving(false)
    }
  }

  if (!open || loading) return null

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/60 px-4">
      <div className="w-full max-w-md rounded-2xl border border-black/10 bg-surface p-4 shadow-soft dark:border-slate-700/50">
        <div className="mb-3">
          <h2 className="text-sm font-semibold">Completá tu ubicación</h2>
          <p className="mt-1 text-[12px] text-muted">
            Necesitamos tu ubicación para mejorar los filtros por país, ciudad y radio.
          </p>
        </div>

        <div className="grid gap-3">
          <label className="text-[12px] font-semibold">
            Nacionalidad (País)
            <select
              value={country}
              onChange={(e) => {
                const selected = countryOptions.find((c) => c.name === e.target.value)
                setCountry(e.target.value)
                setCountryCode(selected?.code || '')
              }}
              className="mt-1 w-full rounded-lg border border-card/60 bg-background px-3 py-2 text-[13px]"
            >
              <option value="">Seleccionar</option>
              {countryOptions.map((c) => (
                <option key={c.code} value={c.name}>{c.name}</option>
              ))}
            </select>
          </label>

          <label className="text-[12px] font-semibold">
            Provincia / Estado
            <input
              value={province}
              onChange={(e) => setProvince(e.target.value)}
              className="mt-1 w-full rounded-lg border border-card/60 bg-background px-3 py-2 text-[13px]"
              placeholder="Ej: Entre Ríos"
            />
          </label>

          <label className="text-[12px] font-semibold">
            Ciudad / Departamento
            <input
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="mt-1 w-full rounded-lg border border-card/60 bg-background px-3 py-2 text-[13px]"
              placeholder="Ej: Paraná"
            />
          </label>

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="text-[12px] font-semibold">
              Código Postal
              <input
                value={postalCode}
                onChange={(e) => setPostalCode(e.target.value)}
                className="mt-1 w-full rounded-lg border border-card/60 bg-background px-3 py-2 text-[13px]"
                placeholder="Ej: 3100"
              />
            </label>
            <label className="text-[12px] font-semibold">
              Código de Área (opcional)
              <input
                value={areaCode}
                onChange={(e) => setAreaCode(e.target.value)}
                className="mt-1 w-full rounded-lg border border-card/60 bg-background px-3 py-2 text-[13px]"
                placeholder="Ej: 343"
              />
            </label>
          </div>
        </div>

        {error ? <p className="mt-2 text-[12px] text-red-400">{error}</p> : null}

        <div className="mt-4 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center justify-center rounded-full bg-foreground px-4 py-2 text-[11px] font-semibold uppercase tracking-widest text-background disabled:opacity-60"
          >
            {saving ? 'Guardando...' : 'Guardar ubicación'}
          </button>
        </div>
      </div>
    </div>
  )
}
