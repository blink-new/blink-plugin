import { z } from 'zod'
import { appRequest } from '../lib/api.js'

export const authConfigTools = {
  blink_auth_get_config: {
    description: 'Get auth configuration — providers, mode, BYOC settings',
    inputSchema: z.object({ projectId: z.string() }),
    execute: async ({ projectId }: { projectId: string }) =>
      appRequest(`/api/projects/${projectId}/auth`),
  },
  blink_auth_set_config: {
    description: 'Update auth configuration — enable/disable providers, change mode',
    inputSchema: z.object({
      projectId: z.string(),
      provider: z.string().optional().describe('google, github, microsoft, apple, email'),
      enabled: z.boolean().optional(),
      mode: z.enum(['managed', 'headless']).optional(),
    }),
    execute: async (input: { projectId: string; provider?: string; enabled?: boolean; mode?: string }) => {
      const current = await appRequest(`/api/projects/${input.projectId}/auth`) as any
      const auth = current?.auth ?? current ?? {}
      if (input.mode) auth.mode = input.mode
      if (input.provider && input.enabled !== undefined) {
        if (!auth.providers) auth.providers = {}
        const existing = auth.providers[input.provider]
        const cfg = typeof existing === 'object' && existing ? existing : {}
        auth.providers[input.provider] = { ...cfg, enabled: input.enabled }
      }
      return appRequest(`/api/projects/${input.projectId}/auth`, { method: 'PUT', body: auth })
    },
  },
}
