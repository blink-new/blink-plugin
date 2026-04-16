/**
 * Transforms OAuth connector API responses for LLM consumption.
 *
 * Several providers return base64-encoded content and/or binary blobs in their
 * standard API responses. Feeding these into an LLM wastes massive context
 * (a 1MB file = ~325K tokens of unreadable base64). This helper decodes text
 * content to UTF-8 and strips binary blobs, preserving metadata so the agent
 * can fetch the binary separately if needed.
 *
 * Applied at the CLI/MCP tool boundary — the underlying API remains a faithful
 * proxy to the upstream provider so non-agent callers get standard responses.
 *
 * Providers handled:
 * - google_gmail: messages/threads — text/* body.data decoded, attachments stripped
 * - github: contents and git blobs — base64 content decoded to UTF-8
 * - microsoft / microsoft_outlook: attachments — contentBytes stripped, metadata kept
 */

// base64url variant (Gmail) — allows - _ and = padding
const BASE64URL_RE = /^[A-Za-z0-9_-]+=*$/

// Standard base64 (GitHub, Microsoft Graph) — allows + / and = padding, plus \n
const BASE64_RE = /^[A-Za-z0-9+/\n\r=]+$/

function normalizePath(endpoint: string): string {
  return endpoint.split('?')[0].replace(/^\//, '').replace(/\/$/, '')
}

// ─── Gmail ────────────────────────────────────────────────────────────────

function decodeGmailPayload(payload: any): void {
  if (!payload) return
  const body = payload.body
  const mime: string | undefined = payload.mimeType
  if (body?.data && typeof body.data === 'string') {
    if (mime?.startsWith('text/')) {
      if (BASE64URL_RE.test(body.data)) {
        body.data = Buffer.from(body.data, 'base64url').toString('utf-8')
      }
    } else {
      delete body.data
    }
  }
  if (Array.isArray(payload.parts)) {
    for (const part of payload.parts) decodeGmailPayload(part)
  }
}

function transformGmailResponse(endpoint: string, response: any): void {
  const path = normalizePath(endpoint)
  const isMessage = /^users\/me\/messages\/[^/]+$/.test(path) || /^messages\/[^/]+$/.test(path)
  const isThread = /^users\/me\/threads\/[^/]+$/.test(path) || /^threads\/[^/]+$/.test(path)
  const data = response.data ?? response
  if (isMessage && data?.payload) decodeGmailPayload(data.payload)
  else if (isThread && Array.isArray(data?.messages)) {
    for (const msg of data.messages) if (msg?.payload) decodeGmailPayload(msg.payload)
  }
}

// ─── GitHub ───────────────────────────────────────────────────────────────

function transformGitHubResponse(endpoint: string, response: any): void {
  const path = normalizePath(endpoint)
  // /repos/:owner/:repo/contents/:path  (may have nested paths)
  const isContents = /^repos\/[^/]+\/[^/]+\/contents(\/.*)?$/.test(path)
  // /repos/:owner/:repo/git/blobs/:sha
  const isBlob = /^repos\/[^/]+\/[^/]+\/git\/blobs\/[^/]+$/.test(path)
  if (!isContents && !isBlob) return

  const data = response.data ?? response
  // Contents can return a single file or a directory listing (array). Only transform files.
  const items = Array.isArray(data) ? data : [data]
  for (const item of items) {
    if (!item || typeof item !== 'object') continue
    if (item.encoding === 'base64' && typeof item.content === 'string' && item.content.length > 0) {
      // Strip newlines GitHub inserts at 60-char boundaries, then verify base64
      const cleaned = item.content.replace(/\s/g, '')
      if (BASE64_RE.test(item.content) || BASE64_RE.test(cleaned)) {
        item.content = Buffer.from(cleaned, 'base64').toString('utf-8')
        item.encoding = 'utf-8'
      }
    }
  }
}

// ─── Microsoft Graph (Outlook) ────────────────────────────────────────────

function stripContentBytes(attachment: any): void {
  if (attachment && typeof attachment === 'object' && typeof attachment.contentBytes === 'string') {
    delete attachment.contentBytes
  }
}

function transformMicrosoftResponse(endpoint: string, response: any): void {
  const path = normalizePath(endpoint)
  // /me/messages/:id/attachments  or  /me/messages/:id/attachments/:id
  // /users/:userid/messages/:id/attachments[/:id]
  const isAttachments = /\/attachments(\/[^/]+)?$/.test(path) &&
    (/^(me|users\/[^/]+)\/messages\/[^/]+\/attachments/.test(path))
  if (!isAttachments) return

  const data = response.data ?? response
  // List: { value: [...] }  |  Single: attachment object directly
  if (Array.isArray(data?.value)) {
    for (const att of data.value) stripContentBytes(att)
  } else {
    stripContentBytes(data)
  }
}

// ─── Main entry point ─────────────────────────────────────────────────────

export function transformConnectorResponse(provider: string, endpoint: string, response: any): any {
  if (!response) return response
  switch (provider) {
    case 'google_gmail':
      transformGmailResponse(endpoint, response)
      break
    case 'github':
      transformGitHubResponse(endpoint, response)
      break
    case 'microsoft':
    case 'microsoft_outlook':
      transformMicrosoftResponse(endpoint, response)
      break
  }
  return response
}
