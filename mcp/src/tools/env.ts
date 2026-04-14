import { z } from 'zod'
import { appRequest } from '../lib/api.js'

export const envTools = {
  blink_env_list: {
    description: 'List environment variables (secrets) for a project',
    inputSchema: z.object({ projectId: z.string() }),
    execute: async ({ projectId }: { projectId: string }) =>
      appRequest(`/api/projects/${projectId}/secrets`),
  },
  blink_env_set: {
    description: 'Set an environment variable (creates or updates)',
    inputSchema: z.object({
      projectId: z.string(),
      key: z.string().describe('Variable name (UPPER_SNAKE_CASE)'),
      value: z.string().describe('Variable value'),
    }),
    execute: async (input: { projectId: string; key: string; value: string }) =>
      appRequest(`/api/projects/${input.projectId}/secrets`, { body: { key: input.key, value: input.value } }),
  },
  blink_env_delete: {
    description: 'Delete an environment variable',
    inputSchema: z.object({ projectId: z.string(), secretId: z.string().describe('Secret ID (sec_xxx)') }),
    execute: async (input: { projectId: string; secretId: string }) =>
      appRequest(`/api/projects/${input.projectId}/secrets/${input.secretId}`, { method: 'DELETE' }),
  },
}
