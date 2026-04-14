const APP_URL = process.env.BLINK_APP_URL ?? 'https://blink.new'
const API_URL = process.env.BLINK_APIS_URL ?? 'https://core.blink.new'

function getToken(): string {
  const key = process.env.BLINK_API_KEY
  if (!key) throw new Error('BLINK_API_KEY not set. Run: blink login')
  return key
}

interface RequestOpts {
  method?: string
  body?: unknown
}

async function request(baseUrl: string, path: string, opts: RequestOpts = {}): Promise<unknown> {
  const headers: Record<string, string> = { Authorization: `Bearer ${getToken()}` }
  let body: string | undefined
  if (opts.body) {
    headers['Content-Type'] = 'application/json'
    body = JSON.stringify(opts.body)
  }
  const res = await fetch(`${baseUrl}${path}`, {
    method: opts.method ?? (body ? 'POST' : 'GET'),
    headers,
    body,
  })
  if (!res.ok) {
    const text = await res.text()
    let msg = `HTTP ${res.status}`
    try {
      const parsed = JSON.parse(text)
      msg = parsed.error ?? parsed.message ?? msg
    } catch {}
    throw new Error(msg)
  }
  const ct = res.headers.get('content-type') ?? ''
  if (ct.includes('application/json')) return res.json()
  return res.text()
}

export function appRequest(path: string, opts: RequestOpts = {}) {
  return request(APP_URL, path, opts)
}

export function resourcesRequest(path: string, opts: RequestOpts = {}) {
  return request(API_URL, path, opts)
}

export function getProjectId(): string {
  const id = process.env.BLINK_PROJECT_ID
  if (!id) throw new Error('BLINK_PROJECT_ID not set. Set it or use blink link.')
  return id
}
