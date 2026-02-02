export function buildPreviewHtml(pub, frontend) {
  const title = pub && pub.nombre ? escapeHtml(pub.nombre) : 'Publicación'
  const description = pub && pub.descripcion ? escapeHtml(String(pub.descripcion).slice(0, 200)) : ''
  const originalImage = (pub && pub.imagenes && pub.imagenes[0] && pub.imagenes[0].url)
    ? pub.imagenes[0].url
    : `${(frontend || '').replace(/\/$/, '')}/static/default-product.jpg`

  const isAbsoluteImage = /^https?:\/\//i.test(originalImage)
  // Prefer direct product image URL so WhatsApp can fetch it without extra hops.
  // Fallback to frontend proxy only when the URL is not absolute.
  const image = isAbsoluteImage
    ? originalImage
    : `${(frontend || '').replace(/\/$/, '')}/api/image?url=${encodeURIComponent(originalImage)}&w=1200&fmt=jpeg&v=${encodeURIComponent(id)}`
  const id = pub && (pub._id || pub.id) ? (pub._id || pub.id) : ''
  const pageUrl = `${(frontend || '').replace(/\/$/, '')}/publicacion/${id}`

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
  <meta property="og:url" content="${pageUrl}" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${title}" />
  <meta name="twitter:description" content="${description}" />
  <meta name="twitter:image" content="${image}" />
  <link rel="canonical" href="${pageUrl}" />
  <meta http-equiv="refresh" content="0;url=${pageUrl}" />
  <script>window.location.replace('${pageUrl}')</script>
</head>
<body>
  <p>Redirigiendo a la publicación...</p>
</body>
</html>`

  return html
}

function escapeHtml(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}
