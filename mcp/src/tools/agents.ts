import { z } from 'zod'
import { appRequest } from '../lib/api.js'

export const agentTools = {
  blink_agent_list: {
    description: 'List all Blink Claw agents in the workspace',
    inputSchema: z.object({}),
    execute: async () => appRequest('/api/claw/agents'),
  },
  blink_agent_status: {
    description: 'Get details for a specific Claw agent',
    inputSchema: z.object({ agentId: z.string() }),
    execute: async ({ agentId }: { agentId: string }) =>
      appRequest(`/api/claw/agents/${agentId}`),
  },
  blink_agent_secrets_list: {
    description: 'List secret key names for a Claw agent (values hidden)',
    inputSchema: z.object({ agentId: z.string() }),
    execute: async ({ agentId }: { agentId: string }) =>
      appRequest(`/api/claw/agents/${agentId}/secrets`),
  },
  blink_agent_secrets_set: {
    description: 'Set a secret on a Claw agent',
    inputSchema: z.object({
      agentId: z.string(),
      key: z.string(),
      value: z.string(),
    }),
    execute: async (input: { agentId: string; key: string; value: string }) =>
      appRequest(`/api/claw/agents/${input.agentId}/secrets`, { body: { key: input.key, value: input.value } }),
  },
  blink_agent_secrets_delete: {
    description: 'Delete a secret from a Claw agent',
    inputSchema: z.object({ agentId: z.string(), key: z.string() }),
    execute: async (input: { agentId: string; key: string }) =>
      appRequest(`/api/claw/agents/${input.agentId}/secrets?key=${encodeURIComponent(input.key)}`, { method: 'DELETE' }),
  },
}
