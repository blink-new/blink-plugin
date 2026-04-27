import { z } from 'zod'
import { appRequest } from '../lib/api.js'

function queuePath(pid: string, path: string) {
  return `/api/project/${pid}/queue/${path}`
}

export const queueTools = {
  blink_queue_enqueue: {
    description: 'Enqueue a background task. Delivered to backend at /api/queue.',
    inputSchema: z.object({
      projectId: z.string(),
      taskName: z.string(),
      payload: z.record(z.string(), z.unknown()).optional(),
      queue: z.string().optional().describe('Named queue for FIFO ordering'),
      delay: z.string().optional().describe('Delay (e.g. 30s, 5m)'),
      retries: z.number().optional().default(3),
    }),
    execute: async (input: { projectId: string; taskName: string; payload?: Record<string, unknown>; queue?: string; delay?: string; retries?: number }) => {
      const body: Record<string, unknown> = { taskName: input.taskName, payload: input.payload ?? {}, retries: input.retries ?? 3 }
      if (input.queue) body.queue = input.queue
      if (input.delay) body.delay = input.delay
      return appRequest(queuePath(input.projectId, 'enqueue'), { body })
    },
  },
  blink_queue_schedule: {
    description: 'Create or update a cron schedule',
    inputSchema: z.object({
      projectId: z.string(),
      name: z.string(),
      cron: z.string().describe('Cron expression (e.g. "0 9 * * *")'),
      payload: z.record(z.string(), z.unknown()).optional(),
      timezone: z.string().optional().default('UTC'),
    }),
    execute: async (input: { projectId: string; name: string; cron: string; payload?: Record<string, unknown>; timezone?: string }) => {
      const { projectId, ...body } = input
      return appRequest(queuePath(projectId, 'schedule'), { body })
    },
  },
  blink_queue_list: {
    description: 'List tasks with optional status/queue filter',
    inputSchema: z.object({
      projectId: z.string(),
      status: z.string().optional().describe('pending, completed, failed, dead'),
      queue: z.string().optional(),
      limit: z.number().optional().default(20),
    }),
    execute: async (input: { projectId: string; status?: string; queue?: string; limit?: number }) => {
      const params = new URLSearchParams()
      if (input.status) params.set('status', input.status)
      if (input.queue) params.set('queue', input.queue)
      if (input.limit) params.set('limit', String(input.limit))
      return appRequest(queuePath(input.projectId, `tasks?${params}`))
    },
  },
  blink_queue_stats: {
    description: 'Get queue statistics — pending, completed, failed, dead, schedules',
    inputSchema: z.object({ projectId: z.string() }),
    execute: async ({ projectId }: { projectId: string }) =>
      appRequest(queuePath(projectId, 'stats')),
  },
  blink_queue_cancel: {
    description: 'Cancel a pending task',
    inputSchema: z.object({ projectId: z.string(), taskId: z.string() }),
    execute: async (input: { projectId: string; taskId: string }) =>
      appRequest(queuePath(input.projectId, `tasks/${input.taskId}`), { method: 'DELETE' }),
  },
  blink_queue_schedules: {
    description: 'List all cron schedules',
    inputSchema: z.object({ projectId: z.string() }),
    execute: async ({ projectId }: { projectId: string }) =>
      appRequest(queuePath(projectId, 'schedules')),
  },
  blink_queue_dlq: {
    description: 'List dead letter queue (failed tasks that exhausted retries)',
    inputSchema: z.object({ projectId: z.string() }),
    execute: async ({ projectId }: { projectId: string }) =>
      appRequest(queuePath(projectId, 'dlq')),
  },
  blink_queue_get: {
    description: 'Get details of a specific task',
    inputSchema: z.object({ projectId: z.string(), taskId: z.string() }),
    execute: async (input: { projectId: string; taskId: string }) =>
      appRequest(queuePath(input.projectId, `tasks/${input.taskId}`)),
  },
  blink_queue_create_queue: {
    description: 'Create a named queue with optional parallelism',
    inputSchema: z.object({
      projectId: z.string(),
      name: z.string(),
      parallelism: z.number().optional().describe('Max concurrent tasks'),
    }),
    execute: async (input: { projectId: string; name: string; parallelism?: number }) =>
      appRequest(queuePath(input.projectId, 'queues'), { body: { name: input.name, parallelism: input.parallelism } }),
  },
  blink_queue_list_queues: {
    description: 'List all named queues',
    inputSchema: z.object({ projectId: z.string() }),
    execute: async ({ projectId }: { projectId: string }) =>
      appRequest(queuePath(projectId, 'queues')),
  },
  blink_queue_delete_queue: {
    description: 'Delete a named queue',
    inputSchema: z.object({ projectId: z.string(), name: z.string() }),
    execute: async (input: { projectId: string; name: string }) =>
      appRequest(queuePath(input.projectId, `queues/${input.name}`), { method: 'DELETE' }),
  },
  blink_queue_schedule_pause: {
    description: 'Pause a cron schedule',
    inputSchema: z.object({ projectId: z.string(), name: z.string() }),
    execute: async (input: { projectId: string; name: string }) =>
      appRequest(queuePath(input.projectId, `schedules/${input.name}/pause`), { method: 'POST', body: {} }),
  },
  blink_queue_schedule_resume: {
    description: 'Resume a paused cron schedule',
    inputSchema: z.object({ projectId: z.string(), name: z.string() }),
    execute: async (input: { projectId: string; name: string }) =>
      appRequest(queuePath(input.projectId, `schedules/${input.name}/resume`), { method: 'POST', body: {} }),
  },
  blink_queue_schedule_delete: {
    description: 'Delete a cron schedule',
    inputSchema: z.object({ projectId: z.string(), name: z.string() }),
    execute: async (input: { projectId: string; name: string }) =>
      appRequest(queuePath(input.projectId, `schedules/${input.name}`), { method: 'DELETE' }),
  },
  blink_queue_dlq_retry: {
    description: 'Retry a dead letter queue task',
    inputSchema: z.object({ projectId: z.string(), taskId: z.string() }),
    execute: async (input: { projectId: string; taskId: string }) =>
      appRequest(queuePath(input.projectId, `dlq/${input.taskId}/retry`), { method: 'POST', body: {} }),
  },
}
