import { z } from 'zod'
import { resourcesRequest } from '../lib/api.js'

export const storageTools = {
  blink_storage_list: {
    description: 'List files in project storage',
    inputSchema: z.object({ projectId: z.string(), prefix: z.string().optional() }),
    execute: async (input: { projectId: string; prefix?: string }) =>
      resourcesRequest(`/api/storage/${input.projectId}/list`, { body: { prefix: input.prefix ?? '' } }),
  },
  blink_storage_url: {
    description: 'Get the public CDN URL for a storage file',
    inputSchema: z.object({ projectId: z.string(), path: z.string() }),
    execute: async (input: { projectId: string; path: string }) =>
      resourcesRequest(`/api/storage/${input.projectId}/public-url`, { body: { path: input.path } }),
  },
  blink_storage_delete: {
    description: 'Delete a file from storage',
    inputSchema: z.object({ projectId: z.string(), path: z.string() }),
    execute: async (input: { projectId: string; path: string }) =>
      resourcesRequest(`/api/storage/${input.projectId}/remove`, { method: 'DELETE', body: { path: input.path } }),
  },
}
