import { z } from 'zod'
import { resourcesRequest, projectResourcesRequest } from '../lib/api.js'

export const notificationTools = {
  blink_notify_email: {
    description: 'Send an email notification',
    inputSchema: z.object({
      projectId: z.string(),
      to: z.string().describe('Recipient email address'),
      subject: z.string(),
      html: z.string().optional().describe('HTML email body'),
      text: z.string().optional().describe('Plain text email body'),
    }),
    // Uses projectResourcesRequest because /api/notifications/:project_id/email
    // requires a project secret key (blnk_sk_*) — workspace API keys are rejected
    // by the CORS middleware for project-scoped resource endpoints.
    // API requires `html` or `text` (not `body`) as the email content field.
    execute: async (input: { projectId: string; to: string; subject: string; html?: string; text?: string }) =>
      projectResourcesRequest(input.projectId, `/api/notifications/${input.projectId}/email`, {
        body: { to: input.to, subject: input.subject, html: input.html, text: input.text },
      }),
  },
  blink_sms_send: {
    description: 'Send an SMS message from your workspace phone number',
    inputSchema: z.object({
      to: z.string().describe('Phone number with country code'),
      message: z.string(),
      from: z.string().optional().describe('Sender phone number (defaults to workspace primary)'),
    }),
    // /api/v1/sms/send uses requireV1Auth which accepts workspace API keys — no change needed
    execute: async (input: { to: string; message: string; from?: string }) =>
      resourcesRequest('/api/v1/sms/send', { body: input }),
  },
}
