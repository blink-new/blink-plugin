import { z } from 'zod'
import { resourcesRequest } from '../lib/api.js'

export const connectorTools = {
  blink_connector_exec: {
    description: 'Execute an API call on a connected OAuth provider (e.g. Google, Notion, Slack, GitHub, Stripe, Jira)',
    inputSchema: z.object({
      provider: z.string().describe('Provider name (e.g. notion, slack, github, google, stripe)'),
      endpoint: z.string().describe('API endpoint path (e.g. /search, /users/me)'),
      method: z.enum(['GET', 'POST', 'PUT', 'PATCH', 'DELETE']).optional().default('GET'),
      params: z.record(z.unknown()).optional().describe('Request body or query params (JSON)'),
      account: z.string().optional().describe('Account ID if multiple accounts connected'),
    }),
    execute: async (input: { provider: string; endpoint: string; method?: string; params?: Record<string, unknown>; account?: string }) => {
      const body: Record<string, unknown> = { endpoint: input.endpoint, method: input.method ?? 'GET' }
      if (input.params) body.params = input.params
      if (input.account) body.account = input.account
      return resourcesRequest(`/v1/connectors/${input.provider}/execute`, { body })
    },
  },
  blink_connector_providers: {
    description: 'List all 38 supported OAuth connector providers',
    inputSchema: z.object({}),
    execute: async () => resourcesRequest('/v1/connectors/providers'),
  },
  blink_connector_status: {
    description: 'Check connection status for a provider or all providers',
    inputSchema: z.object({ provider: z.string().optional() }),
    execute: async (input: { provider?: string }) => {
      const path = input.provider ? `/v1/connectors/${input.provider}/status` : '/v1/connectors/status'
      return resourcesRequest(path)
    },
  },
}
