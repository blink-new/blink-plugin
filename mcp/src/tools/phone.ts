import { z } from 'zod'
import { resourcesRequest } from '../lib/api.js'

export const phoneTools = {
  blink_phone_list: {
    description: 'List all workspace phone numbers',
    inputSchema: z.object({}),
    execute: async () => resourcesRequest('/api/v1/phone-numbers'),
  },
  blink_phone_buy: {
    description: 'Buy a new phone number for AI calling and SMS (25 credits/month)',
    inputSchema: z.object({
      country: z.string().optional().default('US').describe('Country code: US, GB, CA, AU'),
      label: z.string().optional().describe('Label for the number'),
    }),
    execute: async (input: { country?: string; label?: string }) =>
      resourcesRequest('/api/v1/phone-numbers', { body: { country: input.country ?? 'US', label: input.label } }),
  },
  blink_phone_release: {
    description: 'Release a phone number (permanent, stops billing)',
    inputSchema: z.object({ numberId: z.string() }),
    execute: async ({ numberId }: { numberId: string }) =>
      resourcesRequest(`/api/v1/phone-numbers/${numberId}`, { method: 'DELETE' }),
  },
}
