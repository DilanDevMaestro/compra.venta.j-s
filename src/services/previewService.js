export function getPreviewData(pub, frontend, backend) {
  const id = pub && (pub._id || pub.id) ? (pub._id || pub.id) : ''
  const title = pub && pub.nombre ? escapeHtml(pub.nombre) : 'Publicación'
  const description = buildPreviewDescription(pub)
  const candidateImage = pickProductImage(pub)
  const frontendBase = (frontend || '').replace(/\/$/, '')
  const backendBase = (backend || '').replace(/\/$/, '')
  const resolvedImage = resolveImageUrl(candidateImage, frontendBase, backendBase)
  const image = `${frontendBase}/api/image?url=${encodeURIComponent(resolvedImage)}&w=1200&fmt=jpeg&v=${encodeURIComponent(id)}`
  const pageUrl = `${frontendBase}/publicacion/${id}`

  return {
    id,
    title,
    description,
    image,
    pageUrl,
    resolvedImage,
    candidateImage
  }
}

export function buildPreviewHtml(pub, frontend, backend) {
  const { title, description, image, pageUrl } = getPreviewData(pub, frontend, backend)

  const html = `<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>${title}</title>
  <meta property="og:title" content="${title}" />
  <meta property="og:description" content="${description}" />
  <meta property="og:image" content="${image}" />
  <meta property="og:image:secure_url" content="${image}" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta property="og:image:alt" content="${title}" />
  <meta property="og:image:type" content="image/jpeg" />
  <meta property="og:url" content="${pageUrl}" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${title}" />
  <meta name="twitter:description" content="${description}" />
  <meta name="twitter:image" content="${image}" />
  <link rel="canonical" href="${pageUrl}" />
  <script>
    if (typeof window !== 'undefined') {
      window.location.replace('${pageUrl}')
    }
  </script>
</head>
<body>
  <p>Redirigiendo a la publicación...</p>
</body>
</html>`

  return html
}

function buildPreviewDescription(pub) {
  if (!pub) return ''
  const price = Number(pub.precio || 0)
  const views = Number(pub.vistas ?? 0)
  const priceLabel = price > 0 ? `Precio: $${price.toLocaleString('es-AR')}` : ''
  const viewsLabel = `Vistas: ${views.toLocaleString('es-AR')}`
  const base = pub.descripcion ? String(pub.descripcion).slice(0, 160) : ''
  const parts = [priceLabel, viewsLabel, base].filter(Boolean)
  return escapeHtml(parts.join(' · '))
}

function pickProductImage(pub) {
  if (!pub) return ''
  if (pub.imagenes && pub.imagenes.length > 0 && pub.imagenes[0]?.url) return pub.imagenes[0].url
  if (pub.imagenPrincipal) return pub.imagenPrincipal
  if (pub.imagen) return pub.imagen
  if (pub.imagenUrl) return pub.imagenUrl
  if (pub.image) return pub.image
  if (pub.imageUrl) return pub.imageUrl
  if (pub.foto) return pub.foto
  if (pub.fotos && pub.fotos.length > 0) return pub.fotos[0]
  return ''
}

function resolveImageUrl(raw, frontendBase, backendBase) {
  const fallback = `${frontendBase}/static/default-product.jpg`
  if (!raw || typeof raw !== 'string') return fallback
  const trimmed = raw.trim()
  if (!trimmed) return fallback
  if (/^https?:\/\//i.test(trimmed)) return trimmed
  if (trimmed.startsWith('/')) {
    return backendBase ? `${backendBase}${trimmed}` : `${frontendBase}${trimmed}`
  }
  return backendBase ? `${backendBase}/${trimmed}` : `${frontendBase}/${trimmed}`
}

function escapeHtml(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}
