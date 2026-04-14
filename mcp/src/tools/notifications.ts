import { z } from 'zod'
import { resourcesRequest } from '../lib/api.js'

export const notificationTools = {
  blink_notify_email: {
    description: 'Send an email notification',
    inputSchema: z.object({
      projectId: z.string(),
      to: z.string().describe('Recipient email'),
      subject: z.string(),
      body: z.string().describe('Email body (plain text or HTML)'),
    }),
    execute: async (input: { projectId: string; to: string; subject: string; body: string }) =>
      resourcesRequest(`/api/notifications/${input.projectId}/email`, { body: { to: input.to, subject: input.subject, body: input.body } }),
  },
  blink_sms_send: {
    description: 'Send an SMS message from your workspace phone number',
    inputSchema: z.object({
      to: z.string().describe('Phone number with country code'),
      message: z.string(),
      from: z.string().optional().describe('Sender phone number (defaults to workspace primary)'),
    }),
    execute: async (input: { to: string; message: string; from?: string }) =>
      resourcesRequest('/api/v1/sms/send', { body: input }),
  },
}
