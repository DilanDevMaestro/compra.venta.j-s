// Serverless preview endpoint for social crawlers.
// Usage: GET /api/preview?id=PUBLICATION_ID
export default async function handler(req, res) {
  try {
    const id = req.query?.id || (req.url && req.url.split('?id=')[1])
    if (!id) return res.status(400).send('Missing id')

    const backend = process.env.API_URL || process.env.VITE_API_URL || 'https://backend-compraventa-ofic-production.up.railway.app'
    const frontend = process.env.FRONTEND_URL || process.env.VITE_FRONTEND_URL || 'https://compra-venta-j-s.vercel.app'

    const fetchFn = (typeof fetch === 'function') ? fetch : (await import('node-fetch')).default

    const pubRes = await fetchFn(`${backend.replace(/\/$/, '')}/publications/${id}`)
    if (!pubRes.ok) {
      res.setHeader('Cache-Control', 'public, max-age=120')
      return res.redirect(302, pageUrl)
    }
    const pub = await pubRes.json()

    // Build the canonical page URL
    const pageUrl = `${(frontend || '').replace(/\/$/, '')}/publicacion/${id}`

    // Always return OG HTML so WhatsApp/Telegram reliably pick the product preview.
    // The HTML includes a meta refresh + JS redirect to the SPA page.
    const { buildPreviewHtml } = await import('../src/services/previewService.js')
    const html = buildPreviewHtml(pub, frontend, backend)

    res.setHeader('Content-Type', 'text/html')
    res.setHeader('Cache-Control', 'public, max-age=300')
    return res.status(200).send(html)
  } catch (err) {
    console.error('preview function error', err)
    return res.status(500).send('Error generating preview')
  }
}

function escapeHtml(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}
