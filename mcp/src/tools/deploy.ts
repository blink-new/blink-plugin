import { z } from 'zod'
import { appRequest } from '../lib/api.js'

export const deployTools = {
  blink_deployments_list: {
    description: 'List past deployments for a project',
    inputSchema: z.object({ projectId: z.string() }),
    execute: async ({ projectId }: { projectId: string }) =>
      appRequest(`/api/project/${projectId}/deployments`),
  },
  blink_rollback: {
    description: 'Rollback production to a previous deployment',
    inputSchema: z.object({ projectId: z.string(), deploymentId: z.string().optional() }),
    execute: async (input: { projectId: string; deploymentId?: string }) =>
      appRequest(`/api/project/${input.projectId}/rollback`, { body: { deployment_id: input.deploymentId } }),
  },
}
