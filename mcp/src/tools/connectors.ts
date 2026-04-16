import { z } from 'zod'
import { resourcesRequest } from '../lib/api.js'
import { maybeDecodeGmailResponse } from '../lib/gmail-decode.js'

export const connectorTools = {
  blink_connector_exec: {
    description: 'Execute an API call on a connected OAuth provider (e.g. Google, Notion, Slack, GitHub, Stripe, Jira). Gmail message/thread responses have body content auto-decoded from base64url to plain text; binary attachments stripped to metadata.',
    inputSchema: z.object({
      projectId: z.string().describe('Project ID (needed for workspace context)'),
      provider: z.string().describe('Provider name (e.g. notion, slack, github, google, stripe)'),
      endpoint: z.string().describe('API endpoint path (e.g. /search, /users/me)'),
      httpMethod: z.enum(['GET', 'POST', 'PUT', 'PATCH', 'DELETE']).optional().default('GET'),
      params: z.record(z.unknown()).optional().describe('Request body or query params (JSON)'),
      accountId: z.string().optional().describe('Account ID if multiple accounts connected'),
    }),
    execute: async (input: { projectId: string; provider: string; endpoint: string; httpMethod?: string; params?: Record<string, unknown>; accountId?: string }) => {
      const body: Record<string, unknown> = { method: input.endpoint, http_method: input.httpMethod ?? 'GET', project_id: input.projectId }
      if (input.params) body.params = input.params
      if (input.accountId) body.account_id = input.accountId
      const response = await resourcesRequest(`/v1/connectors/${input.provider}/execute`, { body })
      return maybeDecodeGmailResponse(input.provider, input.endpoint, response)
    },
  },
  blink_connector_linked: {
    description: 'List all connected OAuth providers for a project',
    inputSchema: z.object({ projectId: z.string() }),
    execute: async ({ projectId }: { projectId: string }) =>
      resourcesRequest(`/v1/connectors/linked?project_id=${projectId}`),
  },
  blink_connector_status: {
    description: 'Check connection status for a specific provider',
    inputSchema: z.object({ projectId: z.string(), provider: z.string().describe('Provider name') }),
    execute: async (input: { projectId: string; provider: string }) =>
      resourcesRequest(`/v1/connectors/${input.provider}/status?project_id=${input.projectId}`),
  },
}
