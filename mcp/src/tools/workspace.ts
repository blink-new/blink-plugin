import { z } from 'zod'
import { appRequest } from '../lib/api.js'

export const workspaceTools = {
  blink_workspace_list: {
    description: 'List all workspaces you belong to',
    inputSchema: z.object({}),
    execute: async () => appRequest('/api/workspaces'),
  },
  blink_credits: {
    description: 'Check credit usage for the current billing period',
    inputSchema: z.object({}),
    execute: async () => appRequest('/api/usage/summary?period=month'),
  },
  blink_security_get: {
    description: 'Get per-module security policy (require auth for db, ai, storage, etc.)',
    inputSchema: z.object({ projectId: z.string() }),
    execute: async ({ projectId }: { projectId: string }) =>
      appRequest(`/api/project/${projectId}/security`),
  },
  blink_security_set: {
    description: 'Set require_auth for a specific module',
    inputSchema: z.object({
      projectId: z.string(),
      module: z.string().describe('db, ai, storage, realtime, rag'),
      requireAuth: z.boolean(),
    }),
    execute: async (input: { projectId: string; module: string; requireAuth: boolean }) =>
      appRequest(`/api/project/${input.projectId}/security`, {
        method: 'PUT',
        body: { policy: { modules: { [input.module]: { require_auth: input.requireAuth } } } },
      }),
  },
  blink_cors_set: {
    description: 'Set allowed CORS origins for a project',
    inputSchema: z.object({
      projectId: z.string(),
      origins: z.array(z.string()).describe('Allowed origin URLs'),
    }),
    execute: async (input: { projectId: string; origins: string[] }) =>
      appRequest(`/api/project/${input.projectId}/cors`, {
        method: 'PUT',
        body: { custom_origins: input.origins },
      }),
  },
}
