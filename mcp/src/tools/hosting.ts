import { z } from 'zod'
import { appRequest } from '../lib/api.js'

export const hostingTools = {
  blink_hosting_status: {
    description: 'Check hosting status — state, tier, production URL',
    inputSchema: z.object({ projectId: z.string() }),
    execute: async ({ projectId }: { projectId: string }) =>
      appRequest(`/api/project/${projectId}/hosting/status`),
  },
  blink_hosting_activate: {
    description: 'Activate production hosting for a project',
    inputSchema: z.object({ projectId: z.string() }),
    execute: async ({ projectId }: { projectId: string }) =>
      appRequest(`/api/project/${projectId}/hosting/activate`, { method: 'POST', body: {} }),
  },
  blink_hosting_deactivate: {
    description: 'Deactivate hosting — site goes offline',
    inputSchema: z.object({ projectId: z.string() }),
    execute: async ({ projectId }: { projectId: string }) =>
      appRequest(`/api/project/${projectId}/hosting/deactivate`, { method: 'POST', body: {} }),
  },
}
