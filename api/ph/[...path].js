const POSTHOG_HOST = 'https://eu.i.posthog.com'

async function readBody(req) {
  if (req.body !== undefined) {
    return typeof req.body === 'string' || Buffer.isBuffer(req.body)
      ? req.body
      : JSON.stringify(req.body)
  }

  const chunks = []
  for await (const chunk of req) {
    chunks.push(chunk)
  }
  return Buffer.concat(chunks)
}

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    res.status(204).end()
    return
  }

  const incomingUrl = new URL(req.url || '/', 'https://codetrace.tashif.codes')
  const posthogPath = incomingUrl.pathname.replace(/^\/(api\/)?ph\/?/, '')
  const upstreamUrl = `${POSTHOG_HOST}/${posthogPath}${incomingUrl.search}`
  const headers = new Headers()

  for (const [key, value] of Object.entries(req.headers)) {
    if (value === undefined) continue
    if (['host', 'content-length'].includes(key.toLowerCase())) continue
    headers.set(key, Array.isArray(value) ? value.join(', ') : value)
  }

  const upstream = await fetch(upstreamUrl, {
    method: req.method,
    headers,
    body: req.method === 'GET' || req.method === 'HEAD' ? undefined : await readBody(req),
    redirect: 'manual',
  })

  res.status(upstream.status)
  upstream.headers.forEach((value, key) => {
    if (['connection', 'content-encoding', 'content-length', 'transfer-encoding'].includes(key.toLowerCase())) return
    res.setHeader(key, value)
  })

  const body = Buffer.from(await upstream.arrayBuffer())
  res.end(body)
}
