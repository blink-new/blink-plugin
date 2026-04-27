import { z } from 'zod'
import { appRequest } from '../lib/api.js'

export const projectTools = {
  blink_project_list: {
    description: 'List all projects in the workspace',
    inputSchema: z.object({}),
    execute: async () => appRequest('/api/v1/projects'),
  },
  blink_project_create: {
    description: 'Create a new Blink project',
    inputSchema: z.object({ name: z.string().describe('Project name') }),
    execute: async ({ name }: { name: string }) =>
      appRequest('/api/projects/create', { body: { prompt: name } }),
  },
  blink_project_get: {
    description: 'Get project details by ID',
    inputSchema: z.object({ projectId: z.string() }),
    execute: async ({ projectId }: { projectId: string }) =>
      appRequest(`/api/v1/projects/${projectId}`),
  },
  blink_project_update: {
    description: 'Update project name or visibility (public/private)',
    inputSchema: z.object({
      projectId: z.string(),
      name: z.string().optional(),
      visibility: z.enum(['public', 'private']).optional(),
    }),
    execute: async (input: { projectId: string; name?: string; visibility?: string }) => {
      const body: Record<string, string> = {}
      if (input.name) body.name = input.name
      if (input.visibility) body.visibility = input.visibility
      return appRequest(`/api/projects/${input.projectId}`, { method: 'PATCH', body })
    },
  },
  blink_project_delete: {
    description: 'Delete a project (irreversible)',
    inputSchema: z.object({ projectId: z.string() }),
    execute: async ({ projectId }: { projectId: string }) =>
      appRequest(`/api/projects/${projectId}`, { method: 'DELETE' }),
  },
  blink_project_keys: {
    description: 'Get the publishable API key for a project (blnk_pk_...). Required to initialize the Blink SDK in your app. Call this after blink_project_create.',
    inputSchema: z.object({ projectId: z.string() }),
    execute: async ({ projectId }: { projectId: string }) =>
      appRequest(`/api/project/${projectId}/api-keys/reveal`, {
        method: 'POST',
        body: { type: 'publishable' },
      }),
  },
}
