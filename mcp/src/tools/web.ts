import { z } from 'zod'
import { resourcesRequest } from '../lib/api.js'

export const webTools = {
  blink_web_search: {
    description: 'Search the web and return results with titles, URLs, and snippets',
    inputSchema: z.object({
      query: z.string(),
      count: z.number().optional().default(5),
    }),
    execute: async (input: { query: string; count?: number }) =>
      resourcesRequest('/api/v1/search', { body: { query: input.query, count: input.count ?? 5 } }),
  },
  blink_web_fetch: {
    description: 'Fetch a URL and return its content as clean text',
    inputSchema: z.object({
      url: z.string(),
      method: z.string().optional().default('GET'),
      body: z.string().optional(),
    }),
    execute: async (input: { url: string; method?: string; body?: string }) =>
      resourcesRequest('/api/v1/fetch', { body: input }),
  },
}
