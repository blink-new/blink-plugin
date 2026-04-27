import { z } from 'zod'
import { projectResourcesRequest } from '../lib/api.js'

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
      const path = input.ai ? 'ai-search' : 'search'
      return projectResourcesRequest(input.projectId, `/api/rag/${input.projectId}/${path}`, {
        body: { query: input.query, limit: input.limit ?? 5 },
      })
    },
  },
  blink_rag_collections: {
    description: 'List knowledge base collections',
    inputSchema: z.object({ projectId: z.string() }),
    execute: async ({ projectId }: { projectId: string }) =>
      projectResourcesRequest(projectId, `/api/rag/${projectId}/collections`),
  },
}
