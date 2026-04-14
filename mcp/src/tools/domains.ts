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
  blink_domains_remove: {
    description: 'Remove a custom domain from a project',
    inputSchema: z.object({ projectId: z.string(), domainId: z.string() }),
    execute: async (input: { projectId: string; domainId: string }) =>
      appRequest(`/api/project/${input.projectId}/domains/${input.domainId}`, { method: 'DELETE' }),
  },
  blink_domains_purchase: {
    description: 'Purchase a domain',
    inputSchema: z.object({ domain: z.string(), period: z.number().describe('Registration period in years') }),
    execute: async (input: { domain: string; period: number }) =>
      appRequest('/api/domains/purchase', { body: { domain: input.domain, period: input.period } }),
  },
  blink_domains_connect: {
    description: 'Connect a purchased domain to a project',
    inputSchema: z.object({ domainId: z.string(), projectId: z.string() }),
    execute: async (input: { domainId: string; projectId: string }) =>
      appRequest('/api/domains/connect', { body: { domainId: input.domainId, projectId: input.projectId } }),
  },
  blink_domains_my: {
    description: 'List all domains you own',
    inputSchema: z.object({}),
    execute: async () => appRequest('/api/domains/my'),
  },
}
