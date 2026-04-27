import { z } from 'zod'
import { appRequest } from '../lib/api.js'

export const backendTools = {
  blink_backend_deploy: {
    description: 'Deploy backend files to Cloudflare Workers. Send all backend/*.ts files as source code. Requires Pro+ plan.',
    inputSchema: z.object({
      projectId: z.string(),
      files: z.array(z.object({
        path: z.string().describe('File path (e.g. backend/index.ts)'),
        source_code: z.string().describe('Full file content'),
      })),
    }),
    execute: async (input: { projectId: string; files: { path: string; source_code: string }[] }) =>
      appRequest(`/api/v1/projects/${input.projectId}/backend/deploy`, { body: { files: input.files } }),
  },
  blink_backend_status: {
    description: 'Check backend deployment status, tier, and request count. Requires Pro+ plan.',
    inputSchema: z.object({ projectId: z.string() }),
    execute: async ({ projectId }: { projectId: string }) =>
      appRequest(`/api/v1/projects/${projectId}/backend/status`),
  },
  blink_backend_logs: {
    description: 'View recent backend request logs. Requires Pro+ plan.',
    inputSchema: z.object({
      projectId: z.string(),
      slug: z.string().default('index'),
      minutes: z.number().default(30),
    }),
    execute: async (input: { projectId: string; slug: string; minutes: number }) => {
      const since = new Date(Date.now() - input.minutes * 60 * 1000).toISOString()
      return appRequest(`/api/v1/projects/${input.projectId}/functions/${input.slug}/logs?since=${since}`)
    },
  },
}
