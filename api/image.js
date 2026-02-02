// Image proxy with on-the-fly resizing/format conversion using sharp.
// Usage: GET /api/image?url=<encoded image url>&w=1200&fmt=jpeg&q=80
export default async function handler(req, res) {
  try {
    const raw = req.query?.url || (req.url && req.url.split('?url=')[1])
    if (!raw) return res.status(400).send('Missing url')
    const imageUrl = decodeURIComponent(raw)

    if (!/^https?:\/\//i.test(imageUrl)) return res.status(400).send('Invalid url')

    const w = req.query?.w ? Number(req.query.w) : undefined
    const fmt = req.query?.fmt ? String(req.query.fmt).toLowerCase() : 'jpeg'
    const q = req.query?.q ? Math.max(30, Math.min(90, Number(req.query.q))) : 80

    const fetchFn = (typeof fetch === 'function') ? fetch : (await import('node-fetch')).default
    const upstream = await fetchFn(imageUrl, { redirect: 'follow' })
    if (!upstream.ok) return res.status(502).send('Failed to fetch image')

    const arrayBuffer = await upstream.arrayBuffer()
    const input = Buffer.from(arrayBuffer)

    const sharpModule = (await import('sharp')).default
    let pipeline = sharpModule(input)
    if (w && Number.isFinite(w) && w > 0) pipeline = pipeline.resize({ width: Math.floor(w), withoutEnlargement: true })

    let outputBuffer
    let contentType = 'image/jpeg'

    if (fmt === 'webp') {
      outputBuffer = await pipeline.webp({ quality: q }).toBuffer()
      contentType = 'image/webp'
    } else if (fmt === 'avif') {
      outputBuffer = await pipeline.avif({ quality: q }).toBuffer()
      contentType = 'image/avif'
    } else if (fmt === 'png') {
      outputBuffer = await pipeline.png().toBuffer()
      contentType = 'image/png'
    } else {
      outputBuffer = await pipeline.jpeg({ quality: q }).toBuffer()
      contentType = 'image/jpeg'
    }

    res.setHeader('Content-Type', contentType)
    res.setHeader('Cache-Control', 'public, max-age=86400')
    res.setHeader('Content-Length', String(outputBuffer.length))
    return res.status(200).send(outputBuffer)
  } catch (err) {
    console.error('api/image error', err)
    return res.status(500).send('Error proxying image')
  }
}
