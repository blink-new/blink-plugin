---
name: blink-full-stack
description: End-to-end guide for building and shipping a Blink app. Project setup, SDK init, auth, database, backend, deploy, and custom domains. Index to all other skills.
---

## Prerequisites

Before building, ensure the Blink CLI is installed and authenticated:

```bash
npm install -g @blinkdotnew/cli
blink login
```

If `blink` is not installed, run the install command first. `blink login` opens the browser to create a workspace API key — follow the prompts and it saves credentials locally.

## Overview

This is the master guide for building a full-stack Blink app from zero to production. Each section links to a deeper skill.

## Step 1 — Project Setup

```bash
# Install SDK in your app directory
bun add @blinkdotnew/sdk
```

Or use MCP tools:
1. `blink_project_create` — creates the project, returns `id`
2. `blink_project_keys` — returns the `publishableKey` (`blnk_pk_...`) — **call this after create**

## Step 2 — SDK Initialization

```typescript
import { createClient } from '@blinkdotnew/sdk'

export const blink = createClient({
  projectId: process.env.NEXT_PUBLIC_BLINK_PROJECT_ID || 'your-project-id',
  publishableKey: process.env.NEXT_PUBLIC_BLINK_PUBLISHABLE_KEY || 'blnk_pk_xxx',
  auth: { mode: 'managed' },
})
```

Env var prefixes by framework: `NEXT_PUBLIC_` (Next.js), `VITE_` (Vite), `EXPO_PUBLIC_` (Expo).

**Why fallbacks?** If env vars are undefined, the SDK fails silently and the app hangs.

## Step 3 — Authentication

```typescript
blink.auth.login()  // managed mode — redirects to hosted auth
// OR headless mode for custom UI:
await blink.auth.signInWithEmail(email, password)
```

→ Full details: see `blink-auth` skill

## Step 4 — Database

```bash
# Create tables via CLI
blink db query "CREATE TABLE todos (id TEXT PRIMARY KEY, title TEXT NOT NULL, user_id TEXT, is_completed INTEGER DEFAULT 0, created_at TEXT DEFAULT (datetime('now')))"
```

```typescript
const todos = await blink.db.todos.list({
  where: { userId: user.id },
  orderBy: { createdAt: 'desc' },
})
```

→ Full details: see `blink-database` skill

## Step 5 — Backend (Pro+)

Write `backend/index.ts` with a Hono server for webhooks, secrets, server logic.

```bash
blink backend deploy
```

→ Full details: see `blink-backend` skill

## Step 6 — Deploy

```bash
npm run build
# Always pass project ID explicitly
blink deploy <project_id> ./dist --prod
# → site is live immediately at https://{project_slug}.blinkpowered.com
# The CLI prints the URL. Do NOT call blink_hosting_activate after this.
```

**Do NOT call `blink_hosting_activate`** — for externally-built apps it overwrites your files with the Blink AI template.

→ Full details: see `blink-deploy` skill

## Step 7 — Custom Domain

```bash
blink domains add myapp.com
# Follow DNS instructions from output
blink domains verify myapp.com
```

→ Full details: see `blink-domains` skill

## Key Rules

1. **camelCase everywhere** in SDK code — `userId`, `createdAt` (auto-converts to snake_case)
2. **Boolean values** from SQLite are `"0"`/`"1"` strings — use `Number(val) > 0`
3. **IDs are strings**, never numbers — `"todo_abc123"` format
4. **Auth required** for most SDK modules — set up auth before DB/storage calls

## Skill Index

| Skill | Use When |
|-------|----------|
| `blink-auth` | Login, signup, social providers, RBAC |
| `blink-database` | CRUD operations, filtering, raw SQL |
| `blink-storage` | File upload, download, management |
| `blink-backend` | Webhooks, server secrets, custom APIs |
| `blink-queue` | Background tasks, cron jobs |
| `blink-deploy` | Build and deploy to production |
| `blink-domains` | Custom domains, DNS, SSL |
| `blink-ai` | Text/image/video generation, TTS, transcription, AI calls |
| `blink-agents` | Managed AI agent hosting (Blink Claw) |
| `blink-connectors` | OAuth integrations (Slack, Google, Notion, 38+ services) |
| `blink-rag` | Knowledge base, vector search, AI Q&A with citations |
| `blink-realtime` | WebSocket pub/sub, presence, message history |
| `blink-notifications` | Email, SMS, phone numbers |

## Supported Frameworks

**Frontend**: React (Vite), Next.js (static export), Vue, Svelte, Astro, Expo React Native, plain HTML/CSS/JS

**Backend**: TypeScript/JavaScript only (Hono on CF Workers)
