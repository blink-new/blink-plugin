import { z } from 'zod'
import { resourcesRequest } from '../lib/api.js'

export const realtimeTools = {
  blink_realtime_publish: {
    description: 'Publish a realtime event to a channel (WebSocket pub/sub)',
    inputSchema: z.object({
      projectId: z.string(),
      channel: z.string().describe('Channel name'),
      data: z.record(z.unknown()).describe('Event payload (JSON)'),
    }),
    execute: async (input: { projectId: string; channel: string; data: Record<string, unknown> }) =>
      resourcesRequest(`/api/realtime/${input.projectId}/publish`, { body: { channel: input.channel, data: input.data } }),
  },
}
