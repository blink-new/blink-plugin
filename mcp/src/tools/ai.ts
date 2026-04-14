import { z } from 'zod'
import { resourcesRequest } from '../lib/api.js'

export const aiTools = {
  blink_ai_text: {
    description: 'Generate text using an AI model',
    inputSchema: z.object({
      prompt: z.string(),
      model: z.string().optional().describe('e.g. anthropic/claude-sonnet-4.5, openai/gpt-4o'),
    }),
    execute: async (input: { prompt: string; model?: string }) =>
      resourcesRequest('/api/v1/ai/chat/completions', {
        body: { messages: [{ role: 'user', content: input.prompt }], model: input.model },
      }),
  },
  blink_ai_image: {
    description: 'Generate an image from a text prompt',
    inputSchema: z.object({
      prompt: z.string(),
      model: z.string().optional().describe('e.g. fal-ai/flux-pro/v1.1'),
      n: z.number().optional().default(1),
    }),
    execute: async (input: { prompt: string; model?: string; n?: number }) =>
      resourcesRequest('/api/v1/ai/image', { body: { prompt: input.prompt, model: input.model, n: input.n ?? 1 } }),
  },
  blink_ai_video: {
    description: 'Generate a video from a text prompt (takes 1-2 minutes)',
    inputSchema: z.object({
      prompt: z.string(),
      model: z.string().optional(),
      duration: z.string().optional().describe('e.g. 5s, 10s'),
      aspect: z.string().optional().describe('e.g. 16:9, 9:16, 1:1'),
    }),
    execute: async (input: { prompt: string; model?: string; duration?: string; aspect?: string }) =>
      resourcesRequest('/api/v1/ai/video', { body: input }),
  },
  blink_ai_speech: {
    description: 'Convert text to speech audio',
    inputSchema: z.object({
      text: z.string(),
      voice: z.string().optional().describe('e.g. alloy, nova, shimmer'),
    }),
    execute: async (input: { text: string; voice?: string }) =>
      resourcesRequest('/api/v1/ai/speech', { body: input }),
  },
  blink_ai_transcribe: {
    description: 'Transcribe audio to text from a URL',
    inputSchema: z.object({
      url: z.string().describe('URL of audio file'),
      language: z.string().optional(),
    }),
    execute: async (input: { url: string; language?: string }) =>
      resourcesRequest('/api/v1/ai/transcribe', { body: input }),
  },
  blink_ai_call: {
    description: 'Make an AI phone call to any number',
    inputSchema: z.object({
      phoneNumber: z.string().describe('Phone number with country code (e.g. +14155551234)'),
      systemPrompt: z.string().describe('Instructions for the AI voice agent'),
      voice: z.string().optional(),
    }),
    execute: async (input: { phoneNumber: string; systemPrompt: string; voice?: string }) =>
      resourcesRequest('/api/v1/ai/call', { body: { phone_number: input.phoneNumber, system_prompt: input.systemPrompt, voice: input.voice } }),
  },
}
