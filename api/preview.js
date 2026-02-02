import express from 'express'
import Publication from '../models/Publication.js'

const router = express.Router()

// GET /publicacion/:id -> returns HTML with Open Graph meta tags for previews
// (mounted at /publicacion in server.js)
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params
    if (!id) return res.status(400).send('Missing id')

    const pub = await Publication.findById(id).lean()
    if (!pub) return res.status(404).send('Publicación no encontrada')

    const frontendBase = process.env.FRONTEND_URL || 'https://compra-venta-j-s.vercel.app'
    // Prefer virtual imagenPrincipal if available (fall back to frontend static image)
    const imageUrl = (pub.imagenes && pub.imagenes.length > 0)
      ? pub.imagenes[0].url
      : `${frontendBase}/static/default-product.jpg`

    // Serve the preview image through the FRONTEND image proxy so the backend
    // host is never exposed in OG tags. Crawlers will request the image under
    // the frontend domain (e.g. https://your-frontend/api/image?...)
    const isAbsoluteImage = /^https?:\/\//i.test(imageUrl)
    const ogImage = isAbsoluteImage
      ? imageUrl
      : `${frontendBase.replace(/\/$/, '')}/api/image?url=${encodeURIComponent(imageUrl)}&w=1200&fmt=jpeg&q=80&v=${encodeURIComponent(id)}`

    const pageUrl = `${frontendBase.replace(/\/$/, '')}/publicacion/${id}`

    const title = pub.nombre || 'Publicación en Compra-Venta'
    const description = (pub.descripcion && pub.descripcion.substring(0, 200)) || ''

    // Return simple HTML with OG tags so Telegram, WhatsApp, Facebook, etc. can crawl it.
    const html = `<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>${escapeHtml(title)}</title>

  <!-- Open Graph -->
  <meta property="og:type" content="website" />
  <meta property="og:title" content="${escapeHtml(title)}" />
  <meta property="og:description" content="${escapeHtml(description)}" />
  <meta property="og:image" content="${ogImage}" />
  <meta property="og:image:secure_url" content="${ogImage}" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta property="og:image:alt" content="${escapeHtml(title)}" />
  <meta property="og:url" content="${pageUrl}" />

  <!-- Twitter card -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${escapeHtml(title)}" />
  <meta name="twitter:description" content="${escapeHtml(description)}" />
  <meta name="twitter:image" content="${ogImage}" />

  <link rel="canonical" href="${pageUrl}" />
  <meta http-equiv="refresh" content="0;url=${pageUrl}" />
  <script>window.location.replace('${pageUrl}')</script>
</head>
<body>
  <p>Redirigiendo a la publicación...</p>
</body>
</html>`

    // Cache preview responses for a short time to avoid overloading DB
    res.set('Cache-Control', 'public, max-age=300')
    res.type('html').send(html)
  } catch (err) {
    console.error('Preview route error:', err?.message || err)
    res.status(500).send('Error generating preview')
  }
})

function escapeHtml(str) {
  if (!str) return ''
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

export default router
