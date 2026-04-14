---
name: blink-queue
description: Background task queue and cron schedules. Enqueue tasks, named FIFO queues with parallelism, auto-retry. Requires Blink Backend (Pro+).
---

## MCP Tools

`blink_queue_enqueue` · `blink_queue_schedule` · `blink_queue_list` · `blink_queue_stats` · `blink_queue_cancel` · `blink_queue_get` · `blink_queue_retry_dead` · `blink_queue_create_queue`

## Getting Started

```bash
# Check backend is deployed (required for queue delivery)
blink backend status

# Enqueue a task
blink queue enqueue send-welcome-email --payload '{"to":"user@example.com"}'

# Create a cron schedule
blink queue schedule create daily-digest "0 9 * * *" --payload '{"reportType":"daily"}'

# List tasks
blink queue list --status pending

# View stats
blink queue stats
```

**Min SDK: `@blinkdotnew/sdk >= 2.5.0`**

## Critical Rules

1. **Backend required** — deploy backend first; queue delivery fails without it
2. **Write handler first** — add `POST /api/queue` to `backend/index.ts` BEFORE enqueueing
3. **Schedule name = taskName** — handler receives schedule `name` as `taskName`
4. **Deploy after handler changes** — `blink backend deploy`
5. **Return 2xx** — non-2xx triggers retry, then dead-letter queue

## Step 1 — Add Handler to `backend/index.ts`

```typescript
app.post('/api/queue', async (c) => {
  const { taskName, payload } = await c.req.json()

  switch (taskName) {
    case 'send-welcome-email':
      await sendEmail(payload.to, payload.displayName)
      return c.json({ ok: true })

    case 'daily-digest':
      await generateDigest(payload.reportType)
      return c.json({ ok: true })

    default:
      return c.json({ error: `Unknown task: ${taskName}` }, 400)
  }
})
```

**Payload by source:**

| Source | Delivered body |
|--------|---------------|
| `blink.queue.enqueue(taskName, payload)` | `{ taskName, taskId, payload }` |
| `blink.queue.schedule(name, cron, payload)` | `{ taskName: name, payload }` (no taskId) |

## Step 2 — Deploy, Then Enqueue

```bash
blink backend deploy
blink queue enqueue send-welcome-email --payload '{"to":"user@example.com"}' --queue emails --delay 10s
```

## SDK Methods

```typescript
// Enqueue
await blink.queue.enqueue('send-welcome-email', { to: 'user@example.com' })
await blink.queue.enqueue('send-welcome-email', { to: 'user@example.com' }, {
  queue: 'emails', delay: '5m', retries: 3,
})

// Schedule — name IS the taskName
await blink.queue.schedule('daily-digest', '0 9 * * *', { type: 'daily' })
await blink.queue.schedule('daily-digest', '0 9 * * *', { type: 'daily' }, {
  timezone: 'America/New_York',
})

// Manage schedules
await blink.queue.pauseSchedule('daily-digest')
await blink.queue.resumeSchedule('daily-digest')
await blink.queue.deleteSchedule('daily-digest')

// Named queues (create once, idempotent)
await blink.queue.createQueue('emails', { parallelism: 10 })

// Inspect & manage
const tasks = await blink.queue.list({ status: 'pending', queue: 'emails' })
await blink.queue.cancel(taskId)
const dead = await blink.queue.listDead()
await blink.queue.retryDead(taskId)
const stats = await blink.queue.stats()
```

## Cron Patterns

| Cron | When |
|------|------|
| `0 9 * * *` | Daily at 9am |
| `0 * * * *` | Every hour |
| `*/15 * * * *` | Every 15 minutes |
| `0 9 * * 1` | Every Monday at 9am |

## Common Errors

| Error | Cause | Fix |
|-------|-------|-----|
| Tasks not delivering | Backend not deployed | `blink backend deploy` |
| `Unknown task: X` | Missing case in handler | Add matching case |
| Tasks retrying | Handler returning non-2xx | Return `c.json({ ok: true })` |
| `cancel` returns 409 | Task not pending | Can only cancel `'pending'` tasks |

## Billing

1 credit = 1,000 tasks (0.001 credits/task). Retries and reads are free. Pro+ only.
