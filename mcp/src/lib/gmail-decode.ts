/**
 * Transforms Gmail API responses for LLM consumption.
 *
 * Gmail's users.messages.get / threads.get return body content as base64url in
 * payload.body.data and payload.parts[].body.data. Feeding raw base64 into an
 * LLM wastes massive context (a 1MB PDF = ~325K tokens of unreadable garbage).
 *
 * This helper is applied at the MCP tool boundary (not the API layer) so the
 * underlying /v1/connectors/google_gmail/execute endpoint remains a faithful
 * Gmail proxy for any non-agent caller.
 *
 * Rules:
 * - text/* parts: replace body.data with decoded UTF-8 string (same field name)
 * - non-text attachments: strip body.data entirely, keep attachmentId/size/filename/mimeType
 * - container parts (multipart/*): untouched
 * - large attachments (only attachmentId present, no data): untouched
 */

// base64url uses [A-Za-z0-9_-], optionally with trailing = padding.
// Gmail's body.data includes padding in practice even though the spec says
// base64url omits it. Already-decoded text contains spaces/punctuation/HTML
// which don't match this pattern, so the check makes decode idempotent.
const BASE64URL_RE = /^[A-Za-z0-9_-]+=*$/

function decodeGmailPayload(payload: any): void {
  if (!payload) return
  const body = payload.body
  const mime: string | undefined = payload.mimeType
  if (body?.data && typeof body.data === 'string') {
    if (mime?.startsWith('text/')) {
      if (BASE64URL_RE.test(body.data)) {
        body.data = Buffer.from(body.data, 'base64url').toString('utf-8')
      }
      // else: already decoded (or not base64url) — leave as-is
    } else {
      delete body.data
    }
  }
  if (Array.isArray(payload.parts)) {
    for (const part of payload.parts) decodeGmailPayload(part)
  }
}

/**
 * Detects whether a given Gmail API endpoint returns a message or thread with
 * body content, and applies the transform. No-op for other endpoints and providers.
 *
 * @param provider Connector provider name (must be 'google_gmail' to apply)
 * @param endpoint Gmail API method path (e.g. "users/me/messages/abc123")
 * @param response The parsed JSON response from the Gmail API
 */
export function maybeDecodeGmailResponse(provider: string, endpoint: string, response: any): any {
  if (provider !== 'google_gmail' || !response) return response

  // users.messages.get: users/me/messages/:id, optionally with query params
  const path = endpoint.split('?')[0].replace(/^\//, '')

  const isMessageGet = /^users\/me\/messages\/[^/]+$/.test(path) || /^messages\/[^/]+$/.test(path)
  const isThreadGet = /^users\/me\/threads\/[^/]+$/.test(path) || /^threads\/[^/]+$/.test(path)

  const data = response.data ?? response

  if (isMessageGet && data?.payload) {
    decodeGmailPayload(data.payload)
  } else if (isThreadGet && Array.isArray(data?.messages)) {
    for (const msg of data.messages) {
      if (msg?.payload) decodeGmailPayload(msg.payload)
    }
  }

  return response
}
