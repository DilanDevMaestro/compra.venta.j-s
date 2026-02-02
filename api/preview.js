// Serverless preview endpoint for social crawlers.
// Usage: GET /api/preview?id=PUBLICATION_ID
export default async function handler(req, res) {
  try {
    const id = req.query?.id || (req.url && req.url.split('?id=')[1])
    if (!id) return res.status(400).send('Missing id')

    const backend = process.env.API_URL || process.env.VITE_API_URL || 'http://localhost:5000'
    const frontend = process.env.FRONTEND_URL || process.env.VITE_FRONTEND_URL || 'https://compra-venta-j-s.vercel.app'

    const fetchFn = (typeof fetch === 'function') ? fetch : (await import('node-fetch')).default

    const pubRes = await fetchFn(`${backend.replace(/\/$/, '')}/publications/${id}`)
    if (!pubRes.ok) return res.status(404).send('Publicación no encontrada')
    const pub = await pubRes.json()

    // Build the canonical page URL
    const pageUrl = `${(frontend || '').replace(/\/$/, '')}/publicacion/${id}`

    // Detect common crawler user-agents (Facebook, WhatsApp, Telegram, Twitter, LinkedIn)
    const ua = (req.headers && req.headers['user-agent']) ? String(req.headers['user-agent']).toLowerCase() : ''
    const isCrawler = /facebookexternalhit|facebot|twitterbot|linkedinbot|whatsapp|telegrambot|slackbot|discordbot|applebot|bingbot/i.test(ua)

    // If crawler, return OG HTML so social platforms show preview. For normal browsers, redirect to SPA page.
    if (!isCrawler) {
      // Redirect browsers straight to the SPA publication URL
      res.setHeader('Cache-Control', 'public, max-age=120')
      return res.redirect(302, pageUrl)
    }

    // Use shared service to build preview HTML for crawlers
    const { buildPreviewHtml } = await import('../src/services/previewService.js')
    const html = buildPreviewHtml(pub, frontend)

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
