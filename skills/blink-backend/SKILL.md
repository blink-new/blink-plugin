---
name: blink-backend
description: Blink Backend — Hono server on CF Workers for webhooks, server-side secrets, custom APIs. Pro+ only. Deploy via CLI.
---

## MCP Tools

`blink_backend_status` · `blink_backend_deploy` · `blink_backend_logs`

## When to Use

- **Prefer SDK** for auth, db, storage, AI (~95% of cases)
- **Use backend** for: webhooks, server-side secrets, third-party callbacks, heavy processing
- **Never** create a backend just for CRUD — use `blink.db` instead

## Getting Started

```bash
# Check backend eligibility (Pro/Max/Team)
blink backend status

# Create the entry point
mkdir -p backend
# Write backend/index.ts (see below)

# Deploy
blink backend deploy

# View logs
blink backend logs
```

## Structure

```
backend/
├── index.ts          ← REQUIRED: export default Hono app
├── routes/
│   ├── stripe.ts
│   └── webhooks.ts
└── lib/
    └── auth.ts
```

## `backend/index.ts` (Required Entry Point)

```typescript
import { Hono } from "hono"
import { cors } from "hono/cors"
import { createClient } from "@blinkdotnew/sdk"

const app = new Hono()
app.use("*", cors())

const getBlink = (env: Record<string, string>) =>
  createClient({
    projectId: env.BLINK_PROJECT_ID,
    secretKey: env.BLINK_SECRET_KEY,  // server key, not publishableKey
  })

app.get("/health", (c) => c.json({ ok: true }))

app.post("/api/example", async (c) => {
  const blink = getBlink(c.env as Record<string, string>)
  const body = await c.req.json()
  return c.json({ success: true })
})

export default app
```

## Secrets

**Auto-injected** (never hardcode): `BLINK_PROJECT_ID`, `BLINK_SECRET_KEY`, `BLINK_PUBLISHABLE_KEY`

**User secrets** (third-party keys): Add via project settings or CLI, access as `c.env.MY_SECRET`.

## JWT Verification

```typescript
app.post("/api/protected", async (c) => {
  const blink = getBlink(c.env as Record<string, string>)
  const auth = await blink.auth.verifyToken(c.req.header("Authorization"))
  if (!auth.valid) return c.json({ error: auth.error }, 401)
  return c.json({ userId: auth.userId })
})
```

## Calling from Frontend

```typescript
// Direct fetch
const res = await fetch("https://{projectId8}.backend.blink.new/api/example", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ key: "value" }),
})

// Via SDK
const data = await blink.functions.invoke("api/example", { body: { key: "value" } })
```

`projectId8` = last 8 chars of the full project ID.

## Deployment Flow

```bash
# 1. Check eligibility
blink backend status

# 2. Write backend/index.ts

# 3. Deploy (reads all backend/ files, bundles with esbuild, deploys to CF Workers)
blink backend deploy

# 4. URL is printed: https://{projectId8}.backend.blink.new
```

## Common Errors


| Error                  | Cause                  | Fix                                   |
| ---------------------- | ---------------------- | ------------------------------------- |
| `BACKEND_REQUIRES_PRO` | Free/Starter workspace | Upgrade to Pro+                       |
| `MISSING_ENTRYPOINT`   | No `backend/index.ts`  | Create with `export default app`      |
| CORS error             | Missing middleware     | Add `app.use("*", cors())`            |
| 401 on blink-apis      | Wrong key              | Use `secretKey`, not `publishableKey` |


## Checklist

- `backend/index.ts` exports `default app`
- `app.use("*", cors())` present
- Uses `secretKey` in `createClient` (not publishableKey)
- Deployed with `blink backend deploy`
- AbortController timeout on all external `fetch()` calls

