import { z } from 'zod'
import { appRequest } from '../lib/api.js'

export const versionTools = {
  blink_versions_list: {
    description: 'List saved version snapshots for a project',
    inputSchema: z.object({ projectId: z.string() }),
    execute: async ({ projectId }: { projectId: string }) =>
      appRequest(`/api/versions?projectId=${projectId}`),
  },
  blink_versions_save: {
    description: 'Save a version snapshot',
    inputSchema: z.object({ projectId: z.string(), description: z.string() }),
    execute: async (input: { projectId: string; description: string }) =>
      appRequest('/api/save-version', { body: { projectId: input.projectId, description: input.description } }),
  },
  blink_versions_restore: {
    description: 'Restore a project to a saved version',
    inputSchema: z.object({ projectId: z.string(), versionId: z.string() }),
    execute: async (input: { projectId: string; versionId: string }) =>
      appRequest('/api/versions/restore', { body: { projectId: input.projectId, identifier: input.versionId, authToken: process.env.BLINK_API_KEY ?? '' } }),
  },
}
