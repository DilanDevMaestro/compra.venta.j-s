import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { categories } from '../data/categories'
import { CategoryModal } from '../components/home/CategoryModal'
import { Header } from '../components/layout/Header'
import { Footer } from '../components/layout/Footer'
import { publicationsApi } from '../services/api'
import { categoryToSlug } from '../utils/categories'

const estados = [
  { value: 'nuevo', label: 'Nuevo' },
  { value: 'usado', label: 'Usado' },
  { value: 'seminuevo', label: 'Seminuevo' }
]

export function PublicarPage() {
  const [isDark, setIsDark] = useState<boolean>(() => {
    try {
      const stored = localStorage.getItem('theme')
      if (stored) return stored === 'dark'
    } catch (e) {}
    return window.matchMedia?.('(prefers-color-scheme: dark)')?.matches ?? false
  })

  const toggleTheme = () => {
    setIsDark((prev) => {
      const next = !prev
      try {
        localStorage.setItem('theme', next ? 'dark' : 'light')
      } catch (e) {}
      return next
    })
  }
  const [nombre, setNombre] = useState('')
  const [estado, setEstado] = useState('nuevo')
  const [categoria, setCategoria] = useState('')
  const [showCategoryModal, setShowCategoryModal] = useState(false)
  const [subcategoria, setSubcategoria] = useState('')
  const [precio, setPrecio] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [whatsapp, setWhatsapp] = useState('')
  const [imagenes, setImagenes] = useState<File[]>([])
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const navigate = useNavigate()

  const selectedCategory = useMemo(() => {
    if (!categoria) return undefined
    return categories.find((cat) => cat.name === categoria)
  }, [categoria])

  const needsSubcategory = Boolean(selectedCategory?.subcategories?.length)

  const handleImagesChange = (files: FileList | null) => {
    if (!files) {
      setImagenes([])
      return
    }
    setImagenes(Array.from(files).slice(0, 3))
  }

  const handleRemoveImage = (index: number) => {
    setImagenes((prev) => prev.filter((_, i) => i !== index))
  }

  const validate = () => {
    if (!nombre.trim()) return 'Ingresá un título.'
    if (!categoria) return 'Seleccioná una categoría.'
    if (needsSubcategory && !subcategoria) return 'Seleccioná una subcategoría.'
    if (!precio || Number(precio) <= 0) return 'Ingresá un precio válido.'
    if (!descripcion.trim()) return 'Agregá una descripción.'
    if (!whatsapp.trim()) return 'Ingresá un número de WhatsApp.'
    if (imagenes.length === 0) return 'Subí al menos una imagen.'
    return ''
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setError('')
    setSuccess('')

    const message = validate()
    if (message) {
      setError(message)
      return
    }

    try {
      setSubmitting(true)
      const formData = new FormData()
      formData.append('nombre', nombre)
      formData.append('estado', estado)
      formData.append('categoria', categoria)
      if (subcategoria) {
        formData.append('subcategoria', subcategoria)
      }
      formData.append('precio', precio)
      formData.append('descripcion', descripcion)
      formData.append('whatsapp', whatsapp)
      imagenes.forEach((file) => formData.append('imagenes', file))

      await publicationsApi.create(formData)
      setSuccess('Publicación creada correctamente.')
      navigate(`/categoria/${categoryToSlug(categoria)}`)
    } catch (err: any) {
      setError(err?.message || 'No se pudo crear la publicación.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className={isDark ? 'dark' : ''}>
      <div className="min-h-screen bg-background text-foreground flex flex-col">
        <Header isDark={isDark} onToggleTheme={toggleTheme} />
        <main className="mx-auto w-full max-w-2xl px-4 pb-12 flex-1">
          <div className="mt-6 rounded-2xl p-6 shadow-soft dark-gradient-bg ring-1 ring-card/30">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="text-lg font-semibold">Publicar producto o servicio</h1>
                <p className="mt-1 text-[12px] text-muted">Completá los datos. Las subcategorías son obligatorias si la categoría las tiene.</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="mt-5 grid gap-6 md:grid-cols-3">
              <div className="md:col-span-2 space-y-4">
                <div className="grid gap-3 md:grid-cols-2">
                  <label className="text-[12px] font-semibold">
                    Título
                    <input
                      value={nombre}
                      onChange={(event) => setNombre(event.target.value)}
                      className="mt-1.5 w-full rounded-lg border border-card/60 bg-background px-3 py-2 text-[13px] focus:outline-none focus:ring-2 focus:ring-accent/40"
                      placeholder="Ej: Notebook gamer"
                    />
                  </label>

                  <label className="text-[12px] font-semibold">
                    Estado
                    <select
                      value={estado}
                      onChange={(event) => setEstado(event.target.value)}
                      className="mt-1.5 w-full rounded-lg border border-card/60 bg-background px-3 py-2 text-[13px] focus:outline-none focus:ring-2 focus:ring-accent/40"
                    >
                      {estados.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>

                <div className="grid gap-3 md:grid-cols-2">
                  <label className="text-[12px] font-semibold">
                    Categoría
                    <div>
                      <button
                        type="button"
                        onClick={() => setShowCategoryModal(true)}
                        className="mt-1.5 w-full text-left rounded-lg border border-card/60 bg-background px-3 py-2 text-[13px] focus:outline-none focus:ring-2 focus:ring-accent/40"
                      >
                        {categoria || 'Seleccionar'}
                      </button>
                    </div>
                  </label>

                  <label className="text-[12px] font-semibold">
                    Subcategoría
                    <select
                      value={subcategoria}
                      onChange={(event) => setSubcategoria(event.target.value)}
                      disabled={!needsSubcategory}
                      className="mt-1.5 w-full rounded-lg border border-card/60 bg-background px-3 py-2 text-[13px] disabled:cursor-not-allowed disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-accent/40 scrollbar-hidden"
                    >
                      <option value="">
                        {needsSubcategory ? 'Seleccionar' : 'No aplica'}
                      </option>
                      {selectedCategory?.subcategories.map((sub) => (
                        <option key={sub} value={sub}>
                          {sub}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>

                <div className="grid gap-3 md:grid-cols-2">
                  <label className="text-[12px] font-semibold">
                    Precio
                    <input
                      value={precio}
                      onChange={(event) => setPrecio(event.target.value)}
                      className="mt-1.5 w-full rounded-lg border border-card/60 bg-background px-3 py-2 text-[13px] focus:outline-none focus:ring-2 focus:ring-accent/40 no-spinner"
                      placeholder="Ej: 125000"
                      type="number"
                      min="0"
                      step="1"
                    />
                  </label>

                  <label className="text-[12px] font-semibold">
                    WhatsApp
                    <input
                      value={whatsapp}
                      onChange={(event) => setWhatsapp(event.target.value)}
                      className="mt-1.5 w-full rounded-lg border border-card/60 bg-background px-3 py-2 text-[13px] focus:outline-none focus:ring-2 focus:ring-accent/40"
                      placeholder="Ej: 11 1234 5678"
                    />
                  </label>
                </div>

                <label className="text-[12px] font-semibold">
                  Descripción
                  <textarea
                    value={descripcion}
                    onChange={(event) => setDescripcion(event.target.value)}
                    className="mt-1.5 min-h-[120px] w-full rounded-lg border border-card/60 bg-background px-3 py-2 text-[13px] focus:outline-none focus:ring-2 focus:ring-accent/40"
                    placeholder="Contá detalles del producto o servicio"
                  />
                </label>

                <div>
                  {error ? <p className="text-sm text-red-400">{error}</p> : null}
                  {success ? <p className="text-sm text-green-400">{success}</p> : null}
                </div>

                <div className="flex items-center justify-end gap-2">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="rounded-full bg-foreground px-4 py-2 text-[12px] font-semibold uppercase tracking-widest text-background disabled:opacity-60"
                  >
                    {submitting ? 'Publicando...' : 'Publicar'}
                  </button>
                </div>
              </div>

              <aside className="md:col-span-1">
                <div className="rounded-lg border border-card/60 bg-background/60 p-3">
                  <label className="text-[12px] font-semibold">Imágenes (hasta 3)</label>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(event) => handleImagesChange(event.target.files)}
                    className="mt-2 block w-full text-[12px] text-muted file:mr-3 file:rounded-full file:border-0 file:bg-foreground file:px-3 file:py-1.5 file:text-[11px] file:font-semibold file:text-background"
                  />

                  <div className="mt-3 grid grid-cols-3 gap-2">
                    {imagenes.map((file, idx) => {
                      const url = URL.createObjectURL(file)
                      return (
                        <div key={idx} className="relative h-20 w-full overflow-hidden rounded-md">
                          <img src={url} className="h-full w-full object-cover" alt={`preview-${idx}`} />
                          <button type="button" onClick={() => handleRemoveImage(idx)} className="absolute top-1 right-1 rounded-full bg-black/50 px-1.5 py-0.5 text-[11px] text-white">×</button>
                        </div>
                      )
                    })}
                  </div>
                  <p className="mt-2 text-[11px] text-muted">Sugerencia: imágenes claras y sin textos superpuestos mejoran las ventas.</p>
                </div>
              </aside>
            </form>
              <CategoryModal
                open={showCategoryModal}
                categories={categories}
                onClose={() => setShowCategoryModal(false)}
                onSelect={(cat) => {
                  setCategoria(cat.name)
                  setSubcategoria('')
                  setShowCategoryModal(false)
                }}
              />
          </div>
        </main>
        <Footer />
      </div>
    </div>
  )
}
