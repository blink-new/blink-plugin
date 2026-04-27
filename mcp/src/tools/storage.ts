import { z } from 'zod'
import { projectResourcesRequest } from '../lib/api.js'

export const storageTools = {
  blink_storage_list: {
    description: 'List files in project storage',
    inputSchema: z.object({ projectId: z.string(), prefix: z.string().optional() }),
    execute: async (input: { projectId: string; prefix?: string }) => {
      const params = new URLSearchParams()
      if (input.prefix) params.set('path', input.prefix)
      return projectResourcesRequest(input.projectId, `/api/storage/${input.projectId}/list?${params}`)
    },
  },
  blink_storage_url: {
    description: 'Get the public CDN URL for a storage file',
    inputSchema: z.object({ projectId: z.string(), path: z.string() }),
    execute: async (input: { projectId: string; path: string }) =>
      projectResourcesRequest(
        input.projectId,
        `/api/storage/${input.projectId}/public-url?path=${encodeURIComponent(input.path)}`,
      ),
  },
  blink_storage_delete: {
    description: 'Delete a file from storage',
    inputSchema: z.object({ projectId: z.string(), path: z.string() }),
    execute: async (input: { projectId: string; path: string }) =>
      projectResourcesRequest(input.projectId, `/api/storage/${input.projectId}/remove`, {
        method: 'DELETE',
        body: { paths: [input.path] },
      }),
  },
}
