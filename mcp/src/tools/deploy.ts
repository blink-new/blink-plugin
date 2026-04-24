import { z } from 'zod'
import { appRequest } from '../lib/api.js'

export const deployTools = {
  blink_rollback: {
    description: 'Rollback a project to a previously saved version snapshot',
    inputSchema: z.object({
      projectId: z.string(),
      versionId: z.string().describe('Version identifier from blink_versions_list'),
    }),
    execute: async (input: { projectId: string; versionId: string }) =>
      appRequest('/api/versions/restore', { body: { projectId: input.projectId, identifier: input.versionId } }),
  },
}
