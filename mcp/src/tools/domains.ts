import { z } from 'zod'
import { appRequest } from '../lib/api.js'

export const domainTools = {
  blink_domains_list: {
    description: 'List custom domains on a project',
    inputSchema: z.object({ projectId: z.string() }),
    execute: async ({ projectId }: { projectId: string }) =>
      appRequest(`/api/project/${projectId}/domains`),
  },
  blink_domains_add: {
    description: 'Add a custom domain to a project',
    inputSchema: z.object({ projectId: z.string(), domain: z.string() }),
    execute: async (input: { projectId: string; domain: string }) =>
      appRequest(`/api/project/${input.projectId}/domains`, { body: { domain: input.domain } }),
  },
  blink_domains_verify: {
    description: 'Trigger DNS verification for a domain',
    inputSchema: z.object({ projectId: z.string(), domainId: z.string() }),
    execute: async (input: { projectId: string; domainId: string }) =>
      appRequest(`/api/project/${input.projectId}/domains/${input.domainId}`, { method: 'POST', body: {} }),
  },
  blink_domains_search: {
    description: 'Search available domains for purchase',
    inputSchema: z.object({ query: z.string() }),
    execute: async ({ query }: { query: string }) =>
      appRequest(`/api/domains/search?q=${encodeURIComponent(query)}`),
  },
}
