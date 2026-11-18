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
      model: z.string().optional().describe('e.g. google/gemini-2.5-flash-image, openai/gpt-image-1'),
      n: z.number().optional().default(1),
    }),
    execute: async (input: { prompt: string; model?: string; n?: number }) => {
      const raw = await resourcesRequest('/api/v1/ai/image', { body: { prompt: input.prompt, model: input.model, n: input.n ?? 1 } }) as any
      // Normalize: API may return { result: { data: [...] } } (Vercel AI Gateway) or { data: [...] } (legacy)
      return raw?.result ?? raw
    },
  },
  blink_ai_video: {
    description: 'Generate a video from a text prompt (takes 1-2 minutes)',
    inputSchema: z.object({
      prompt: z.string(),
      model: z.string().optional(),
      duration: z.string().optional().describe('e.g. 5s, 10s'),
      aspect: z.string().optional().describe('e.g. 16:9, 9:16, 1:1'),
    }),
    // The route reads `aspect_ratio`; an `aspect` field is ignored.
    execute: async (input: { prompt: string; model?: string; duration?: string; aspect?: string }) =>
      resourcesRequest('/api/v1/ai/video', {
        body: { prompt: input.prompt, model: input.model, duration: input.duration, aspect_ratio: input.aspect },
      }),
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
    // The route reads `audio_url`; a body with `url` is refused with 400.
    execute: async (input: { url: string; language?: string }) =>
      resourcesRequest('/api/v1/ai/transcribe', { body: { audio_url: input.url, language: input.language } }),
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
  blink_ai_image_edit: {
    description: 'Edit an image using an AI model with a text prompt',
    inputSchema: z.object({
      prompt: z.string(),
      imageUrl: z.string().describe('URL of the source image to edit'),
      model: z.string().optional(),
    }),
    // The route edits the images in `images[]`; an `image` field is ignored and a new image is generated.
    execute: async (input: { prompt: string; imageUrl: string; model?: string }) => {
      const raw = await resourcesRequest('/api/v1/ai/image', { body: { prompt: input.prompt, images: [input.imageUrl], model: input.model, n: 1 } }) as any
      return raw?.result ?? raw
    },
  },
  blink_ai_animate: {
    description: 'Animate a still image into a video',
    inputSchema: z.object({
      prompt: z.string(),
      imageUrl: z.string().describe('URL of the source image to animate'),
      model: z.string().optional().describe('An image-to-video model: fal-ai/veo3.1/fast/image-to-video (default) or fal-ai/sora-2/image-to-video/pro'),
      duration: z.string().optional().describe('e.g. 5s, 10s'),
    }),
    // The route reads `image_url` and, without a model, runs text-to-video, so the image-to-video default is set here.
    execute: async (input: { prompt: string; imageUrl: string; model?: string; duration?: string }) =>
      resourcesRequest('/api/v1/ai/video', {
        body: { prompt: input.prompt, image_url: input.imageUrl, model: input.model ?? 'fal-ai/veo3.1/fast/image-to-video', duration: input.duration },
      }),
  },
  blink_ai_call_status: {
    description: 'Check the status of an AI phone call',
    inputSchema: z.object({ callId: z.string() }),
    execute: async ({ callId }: { callId: string }) =>
      resourcesRequest(`/api/v1/ai/call/${callId}`),
  },
}
