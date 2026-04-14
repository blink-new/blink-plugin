import { z } from 'zod'
import { resourcesRequest } from '../lib/api.js'

export const ragTools = {
  blink_rag_search: {
    description: 'Search the knowledge base using semantic search',
    inputSchema: z.object({
      projectId: z.string(),
      query: z.string(),
      limit: z.number().optional().default(5),
      ai: z.boolean().optional().describe('Use AI to generate an answer from results'),
    }),
    execute: async (input: { projectId: string; query: string; limit?: number; ai?: boolean }) => {
      const params = new URLSearchParams({ query: input.query, limit: String(input.limit ?? 5) })
      if (input.ai) params.set('ai', 'true')
      return resourcesRequest(`/api/rag/${input.projectId}/search?${params}`)
    },
  },
  blink_rag_collections: {
    description: 'List knowledge base collections',
    inputSchema: z.object({ projectId: z.string() }),
    execute: async ({ projectId }: { projectId: string }) =>
      resourcesRequest(`/api/rag/${projectId}/collections`),
  },
}
