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
    description: 'Set require_auth for a specific module (db, ai, storage, realtime, rag)',
    inputSchema: z.object({
      projectId: z.string(),
      module: z.string().describe('db, ai, storage, realtime, rag'),
      requireAuth: z.boolean(),
    }),
    execute: async (input: { projectId: string; module: string; requireAuth: boolean }) => {
      // The security PUT endpoint requires the full policy object (version + defaults + modules).
      // Fetch current policy, merge the module change, then PUT the complete valid policy.
      const current = await appRequest(`/api/project/${input.projectId}/security`) as any
      const base = current?.policy ?? { version: 1, defaults: { require_auth: true }, modules: {} }
      const merged = {
        ...base,
        version: 1,
        defaults: base.defaults ?? { require_auth: true },
        modules: {
          ...base.modules,
          [input.module]: { ...(base.modules?.[input.module] ?? {}), require_auth: input.requireAuth },
        },
      }
      return appRequest(`/api/project/${input.projectId}/security`, {
        method: 'PUT',
        body: { policy: merged },
      })
    },
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
  blink_workspace_create: {
    description: 'Create a new workspace',
    inputSchema: z.object({ name: z.string() }),
    execute: async ({ name }: { name: string }) =>
      appRequest('/api/workspaces', { body: { name } }),
  },
  blink_workspace_switch: {
    description: 'Switch active workspace',
    inputSchema: z.object({ workspaceId: z.string() }),
    execute: async ({ workspaceId }: { workspaceId: string }) =>
      appRequest('/api/workspaces/switch', { body: { workspace_id: workspaceId } }),
  },
  blink_workspace_members: {
    description: 'List members of a workspace',
    inputSchema: z.object({ workspaceId: z.string() }),
    execute: async ({ workspaceId }: { workspaceId: string }) =>
      appRequest(`/api/workspaces/${workspaceId}/members`),
  },
  blink_workspace_invite: {
    description: 'Invite a user to a workspace',
    inputSchema: z.object({
      workspaceId: z.string(),
      email: z.string(),
      role: z.string().describe('admin, member, or viewer'),
    }),
    execute: async (input: { workspaceId: string; email: string; role: string }) =>
      appRequest(`/api/workspaces/${input.workspaceId}/invites`, { body: { emails: [input.email], role: input.role } }),
  },
  blink_cors_get: {
    description: 'Get CORS configuration for a project',
    inputSchema: z.object({ projectId: z.string() }),
    execute: async ({ projectId }: { projectId: string }) =>
      appRequest(`/api/project/${projectId}/cors`),
  },
  blink_usage: {
    description: 'Get usage summary for a billing period',
    inputSchema: z.object({ period: z.string().optional().default('month').describe('e.g. month, week') }),
    execute: async ({ period }: { period?: string }) =>
      appRequest(`/api/usage/summary?period=${period ?? 'month'}`),
  },
}
