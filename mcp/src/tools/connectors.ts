import { z } from 'zod'
import { resourcesRequest } from '../lib/api.js'

export const connectorTools = {
  blink_connector_exec: {
    description: 'Execute an API call on a connected OAuth provider (e.g. Google, Notion, Slack, GitHub, Stripe, Jira)',
    inputSchema: z.object({
      provider: z.string().describe('Provider name (e.g. notion, slack, github, google, stripe)'),
      endpoint: z.string().describe('API endpoint path (e.g. /search, /users/me)'),
      httpMethod: z.enum(['GET', 'POST', 'PUT', 'PATCH', 'DELETE']).optional().default('GET'),
      params: z.record(z.unknown()).optional().describe('Request body or query params (JSON)'),
      accountId: z.string().optional().describe('Account ID if multiple accounts connected'),
    }),
    execute: async (input: { provider: string; endpoint: string; httpMethod?: string; params?: Record<string, unknown>; accountId?: string }) => {
      const body: Record<string, unknown> = { method: input.endpoint, http_method: input.httpMethod ?? 'GET' }
      if (input.params) body.params = input.params
      if (input.accountId) body.account_id = input.accountId
      return resourcesRequest(`/v1/connectors/${input.provider}/execute`, { body })
    },
  },
  blink_connector_linked: {
    description: 'List all connected OAuth providers in the workspace',
    inputSchema: z.object({}),
    execute: async () => resourcesRequest('/v1/connectors/linked'),
  },
  blink_connector_status: {
    description: 'Check connection status for a specific provider',
    inputSchema: z.object({ provider: z.string().describe('Provider name') }),
    execute: async ({ provider }: { provider: string }) =>
      resourcesRequest(`/v1/connectors/${provider}/status`),
  },
}
