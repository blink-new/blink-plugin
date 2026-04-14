import { z } from 'zod'
import { appRequest } from '../lib/api.js'

export const functionTools = {
  blink_functions_list: {
    description: 'List edge functions deployed to a project',
    inputSchema: z.object({ projectId: z.string() }),
    execute: async ({ projectId }: { projectId: string }) =>
      appRequest(`/api/v1/projects/${projectId}/functions`),
  },
  blink_functions_get: {
    description: 'Get details of a specific edge function',
    inputSchema: z.object({ projectId: z.string(), slug: z.string() }),
    execute: async (input: { projectId: string; slug: string }) =>
      appRequest(`/api/v1/projects/${input.projectId}/functions/${input.slug}`),
  },
  blink_functions_delete: {
    description: 'Delete an edge function',
    inputSchema: z.object({ projectId: z.string(), slug: z.string() }),
    execute: async (input: { projectId: string; slug: string }) =>
      appRequest(`/api/v1/projects/${input.projectId}/functions/${input.slug}`, { method: 'DELETE' }),
  },
  blink_functions_logs: {
    description: 'View edge function logs',
    inputSchema: z.object({ projectId: z.string(), slug: z.string(), minutes: z.number().optional().default(30) }),
    execute: async (input: { projectId: string; slug: string; minutes?: number }) => {
      const since = new Date(Date.now() - (input.minutes ?? 30) * 60 * 1000).toISOString()
      return appRequest(`/api/v1/projects/${input.projectId}/functions/${input.slug}/logs?since=${since}`)
    },
  },
}
