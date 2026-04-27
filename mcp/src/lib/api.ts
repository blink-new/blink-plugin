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

async function request(baseUrl: string, path: string, opts: RequestOpts = {}, authToken?: string): Promise<unknown> {
  const token = authToken ?? getToken()
  const headers: Record<string, string> = { Authorization: `Bearer ${token}` }
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
      const err = parsed.error ?? parsed.message
      msg = typeof err === 'string' ? err : (err ? JSON.stringify(err) : msg)
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

// Cache of projectId → project secret key (blnk_sk_*)
// Used for core.blink.new requests that require server-to-server auth
const secretKeyCache = new Map<string, string>()

async function getProjectSecretKey(projectId: string): Promise<string> {
  if (secretKeyCache.has(projectId)) return secretKeyCache.get(projectId)!
  const res = await appRequest(`/api/project/${projectId}/api-keys/reveal`, {
    method: 'POST',
    body: { type: 'secret' },
  }) as any
  const key = res?.key
  if (!key || typeof key !== 'string') {
    throw new Error(`Could not obtain project secret key for ${projectId}. Go to blink.new and ensure the project exists.`)
  }
  secretKeyCache.set(projectId, key)
  return key
}

// Makes a request to core.blink.new using the project secret key (blnk_sk_*).
// Automatically fetches and caches the key on first use per project.
export async function projectResourcesRequest(projectId: string, path: string, opts: RequestOpts = {}): Promise<unknown> {
  const secretKey = await getProjectSecretKey(projectId)
  return request(API_URL, path, opts, secretKey)
}

export function getProjectId(): string {
  const id = process.env.BLINK_PROJECT_ID
  if (!id) throw new Error('BLINK_PROJECT_ID not set. Set it or use blink link.')
  return id
}
