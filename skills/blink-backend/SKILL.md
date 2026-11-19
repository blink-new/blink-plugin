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

**Auto-injected** (never hardcode): `BLINK_PROJECT_ID`, `BLINK_SECRET_KEY`. A backend gets no publishable key: call Blink with `BLINK_SECRET_KEY` or the caller's token.

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

<!-- BEGIN GENERATED: troubleshooting (bun scripts/agent-docs/sync-skill-docs.ts; do not edit by hand) -->
## Troubleshooting

Blink Cloud error bodies carry `code`, `hint`, `docs`, `retryable` and `request_id` beside the `error` text. Do what `hint` says first; fetch `docs` (markdown) for the full fix. Every code: https://blink.new/docs/errors.md

- **`AUTH_WORKLOAD_CREDENTIAL_INVALID`** (HTTP 401, don't retry as is): This blnk_wt_ credential is issued and rotated by Blink (BLINK_SECRET_KEY in a Blink backend). Redeploy the backend (`blink backend deploy`) so Blink issues a fresh one. Do not swap in the project secret key. [Details](https://core.blink.new/errors/AUTH_WORKLOAD_CREDENTIAL_INVALID.md)
- **`FUNCTION_NOT_FOUND`** (HTTP 404, don't retry as is): No function with this slug. List them with `blink functions list` (or GET .../functions) and use a listed slug. [Details](https://blink.new/api/v1/errors/FUNCTION_NOT_FOUND.md)
- **`MISSING_PARAMETER`** (HTTP 400, don't retry as is): A required query parameter is missing; `error` names it. Add it (for example `?slug=my-function`) and resend. [Details](https://blink.new/api/v1/errors/MISSING_PARAMETER.md)
- **`INVALID_FUNCTION_SLUG`** (HTTP 400, don't retry as is): Use a slug of letters, numbers and hyphens only, for example `send-email`. [Details](https://blink.new/api/v1/errors/INVALID_FUNCTION_SLUG.md)
- **`MISSING_NAME`** (HTTP 400, don't retry as is): Add `name` to the metadata part of the deploy request. [Details](https://blink.new/api/v1/errors/MISSING_NAME.md)
- **`MISSING_FILES`** (HTTP 400, don't retry as is): Send `files` as a non-empty array of { name, content }. [Details](https://blink.new/api/v1/errors/MISSING_FILES.md)
- **`INVALID_FILE_FORMAT`** (HTTP 400, don't retry as is): Every entry in `files` needs string `name` and `content` properties. [Details](https://blink.new/api/v1/errors/INVALID_FILE_FORMAT.md)
- **`FORM_PARSE_ERROR`** (HTTP 400, don't retry as is): The multipart body could not be read; `error` says why. Send a `metadata` JSON part plus file parts, or send JSON instead. [Details](https://blink.new/api/v1/errors/FORM_PARSE_ERROR.md)
- **`MISSING_ENVIRONMENT_VARIABLES`** (HTTP 400, don't retry as is): The code reads env vars the project lacks (`details.missing_variables`). Set each with `blink env set KEY value`; ask the user for any value you do not have, never invent one. Then deploy again. [Details](https://blink.new/api/v1/errors/MISSING_ENVIRONMENT_VARIABLES.md)
- **`SECRET_VALIDATION_ERROR`** (HTTP 503, retry may help): Blink could not read the project secrets to check them; nothing in your request is wrong. Retry in a few seconds; if it fails again, stop and report the request_id. [Details](https://blink.new/api/v1/errors/SECRET_VALIDATION_ERROR.md)
- **`BUILD_FAILED`** (HTTP 400, don't retry as is): `build_error` has the compiler output. Fix the code it points at, then deploy again; redeploying unchanged code fails the same way. [Details](https://blink.new/api/v1/errors/BUILD_FAILED.md)
- **`DEPLOYMENT_FAILED`** (HTTP 500, retry may help): The deploy failed after building. Retry once; if it fails again, stop and report the request_id. [Details](https://blink.new/api/v1/errors/DEPLOYMENT_FAILED.md)
- **`CODE_DEPLOYMENT_NOT_SUPPORTED`** (HTTP 400, don't retry as is): PATCH only changes function settings. Send code changes with POST /api/v1/projects/{id}/backend/deploy or `blink backend deploy`. [Details](https://blink.new/api/v1/errors/CODE_DEPLOYMENT_NOT_SUPPORTED.md)
- **`FUNCTION_DEPLOY_REMOVED`** (HTTP 410, don't retry as is): Run `blink backend deploy`, or POST every file under backend/ to /api/v1/projects/{id}/backend/deploy. It replaces the whole backend, so send all of it. Retrying this route will not help. [Details](https://blink.new/api/v1/errors/FUNCTION_DEPLOY_REMOVED.md)
- **`FILES_REQUIRED`** (HTTP 400, don't retry as is): Send every file under backend/ as `files: [{ path, source_code }]` (the deploy replaces the whole backend). `blink backend deploy` does this for you. [Details](https://blink.new/api/v1/errors/FILES_REQUIRED.md)
- **`MISSING_ENTRYPOINT`** (HTTP 400, don't retry as is): Create backend/index.ts that exports a Hono app as default (`export default app`), then run `blink backend deploy` again. [Details](https://blink.new/api/v1/errors/MISSING_ENTRYPOINT.md)
- **`BACKEND_TOO_LARGE`** (HTTP 413, don't retry as is): The backend source is over the size limit. Remove generated, vendored or data files from backend/, then deploy again. [Details](https://blink.new/api/v1/errors/BACKEND_TOO_LARGE.md)
- **`INVALID_BODY`** (HTTP 400, don't retry as is): The body must be JSON (optionally gzip-compressed) of the form { files: [...] }. Use `blink backend deploy` rather than building the request by hand. [Details](https://blink.new/api/v1/errors/INVALID_BODY.md)
- **`INVALID_BACKEND_CONFIG`** (HTTP 500, don't retry as is): backend/wrangler.json(c) is invalid; the message says how. Fix it (keep only one of wrangler.json or wrangler.jsonc) and deploy again. Retrying unchanged will fail. [Details](https://blink.new/api/v1/errors/INVALID_BACKEND_CONFIG.md)
- **`BACKEND_CLI_ONLY`** (HTTP 409, don't retry as is): The project owner allows backend deploys only from the Blink CLI or API. Nothing was deployed. Tell the user; never try another way to deploy. The owner can turn it off in the Backend panel. [Details](https://blink.new/api/v1/errors/BACKEND_CLI_ONLY.md)
- **`BUNDLE_FAILED`** (HTTP 500, don't retry as is): The backend did not bundle; the message has the bundler error (usually an import that does not resolve). Fix that file and deploy again. [Details](https://blink.new/api/v1/errors/BUNDLE_FAILED.md)
<!-- END GENERATED: troubleshooting -->
