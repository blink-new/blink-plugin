import { z } from 'zod'
import { appRequest } from '../lib/api.js'

export const hostingTools = {
  blink_hosting_status: {
    description: 'Check hosting status — billing state, tier, production URL. Note: status="inactive" does NOT mean the site is down — a CLI-deployed project can be fully live while showing inactive (billing lifecycle not started).',
    inputSchema: z.object({ projectId: z.string() }),
    execute: async ({ projectId }: { projectId: string }) =>
      appRequest(`/api/project/${projectId}/hosting/status`),
  },
  blink_hosting_activate: {
    description: 'Activate hosting for a project built in the Blink AI editor (blink.new). WARNING: DO NOT call this after "blink deploy ./dist --prod" — it rebuilds from the Blink sandbox and overwrites CLI-deployed files with the AI template. Only use for projects whose source code lives in the Blink sandbox.',
    inputSchema: z.object({ projectId: z.string() }),
    execute: async ({ projectId }: { projectId: string }) =>
      appRequest(`/api/project/${projectId}/hosting/activate`, { method: 'POST', body: {} }),
  },
  blink_hosting_deactivate: {
    description: 'Deactivate hosting — takes the site offline and stops billing',
    inputSchema: z.object({ projectId: z.string() }),
    execute: async ({ projectId }: { projectId: string }) =>
      appRequest(`/api/project/${projectId}/hosting/deactivate`, { method: 'POST', body: {} }),
  },
  blink_hosting_reactivate: {
    description: 'Reactivate hosting for a previously deactivated project (restores billing and site)',
    inputSchema: z.object({ projectId: z.string() }),
    execute: async ({ projectId }: { projectId: string }) =>
      appRequest(`/api/project/${projectId}/hosting/reactivate`, { method: 'POST', body: {} }),
  },
}
