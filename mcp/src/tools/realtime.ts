import { z } from 'zod'
import { projectResourcesRequest } from '../lib/api.js'

export const realtimeTools = {
  blink_realtime_publish: {
    description: 'Publish a realtime event to a channel (WebSocket pub/sub)',
    inputSchema: z.object({
      projectId: z.string(),
      channel: z.string().describe('Channel name (e.g. "chat-room", "notifications")'),
      type: z.string().describe('Event type name (e.g. "message", "update", "alert")'),
      data: z.record(z.string(), z.unknown()).describe('Event payload (JSON)'),
    }),
    execute: async (input: { projectId: string; channel: string; type: string; data: Record<string, unknown> }) =>
      projectResourcesRequest(input.projectId, `/api/realtime/${input.projectId}/publish`, {
        body: { channel: input.channel, type: input.type, data: input.data },
      }),
  },
}
