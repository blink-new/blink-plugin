---
name: blink-ai
description: AI Gateway for text generation, image generation/editing, video generation, text-to-speech, audio transcription, and AI phone calls. Unified access to 50+ models.
---

## Getting Started

```bash
# Generate text
blink ai text "Write a poem about coding"

# Generate image
blink ai image "A sunset over mountains" --model fal-ai/nano-banana-pro

# Generate video
blink ai video "A cooking tutorial scene" --aspect-ratio 9:16

# Text-to-speech
blink ai speech "Hello world" --voice nova

# Transcribe audio
blink ai transcribe ./recording.mp3

# AI phone call
blink ai call +15551234567 --prompt "Remind about appointment tomorrow at 3pm"
```

## MCP Tools

| Tool | Description |
|------|-------------|
| `blink_ai_text` | Generate text from prompt or messages |
| `blink_ai_image` | Generate or edit images |
| `blink_ai_video` | Generate video from text or image |
| `blink_ai_speech` | Convert text to audio |
| `blink_ai_transcribe` | Convert audio to text |
| `blink_ai_call` | Make AI-powered phone call |

## SDK Methods

```typescript
const { text } = await blink.ai.generateText({ prompt: 'Hello', search: true })
const { data } = await blink.ai.generateImage({ prompt: 'A robot', model: 'fal-ai/nano-banana-pro' })
const { result } = await blink.ai.generateVideo({ prompt: 'Ocean waves', model: 'fal-ai/veo3.1/fast' })
const { url } = await blink.ai.generateSpeech({ text: 'Hello', voice: 'nova' })
const { text } = await blink.ai.transcribeAudio({ audio: audioData, language: 'en' })
```

## Text Generation

```bash
# Simple prompt
blink ai text "Summarize quantum computing"

# With web search for real-time info
blink ai text "Latest AI news today" --search

# Stream output
blink ai text "Write a story" --stream
```

```typescript
await blink.ai.streamText(
  { prompt: 'Write a story...', search: true },
  (chunk) => setText(prev => prev + chunk)
)
```

## Image Models

| Model | Speed | Quality | Best For |
|-------|-------|---------|----------|
| `fal-ai/nano-banana` (default) | Fast | Good | Prototypes |
| `fal-ai/nano-banana-pro` | Standard | Excellent | Marketing, high-fidelity |
| `fal-ai/nano-banana/edit` | Fast | Good | Quick adjustments, style transfer |
| `fal-ai/nano-banana-pro/edit` | Standard | Excellent | Detailed retouching |

## Video Models

| Model | Type | Best For |
|-------|------|----------|
| `fal-ai/veo3.1/fast` (default) | T2V | Fast, good quality |
| `fal-ai/veo3.1` | T2V | Best quality |
| `fal-ai/sora-2/text-to-video/pro` | T2V | Cinematic |
| `fal-ai/veo3.1/image-to-video` | I2V | Animate images |

## Speech Voices

`alloy` (default), `echo`, `fable`, `nova`, `onyx`, `shimmer`

## Transcription Models

| Model | Notes |
|-------|-------|
| `fal-ai/whisper` (default) | Best accuracy |
| `fal-ai/wizper` | Faster, Whisper v3 optimized |
| `fal-ai/speech-to-text/turbo` | Fast, lower cost |

## Critical Rules

1. **Image URLs must be HTTPS with extension** — `.jpg`, `.png`, `.gif`, `.webp`
2. **Style transfer** — provide ALL images in array, reference by position in prompt
3. **I2V requires image upload** — upload to storage first, use public URL
4. **generateObject schema must be `type: "object"`** — wrap arrays inside object
5. **System prompts must be domain-specific** — never use "You are a helpful assistant"

## AI Phone Calls

```bash
# Outbound call with custom prompt
blink ai call +15551234567 --prompt "You are a scheduling assistant. Confirm the appointment."

# With voice selection
blink ai call +15551234567 --prompt "Remind about meeting" --voice nova
```

Requires a phone number — see `blink-notifications` skill for `blink phone buy`.
