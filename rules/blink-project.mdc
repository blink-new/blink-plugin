---
description: Rules for building apps on Blink infrastructure. Apply when using @blinkdotnew/sdk, blink CLI, or Blink MCP tools.
alwaysApply: true
globs: "**/*.{ts,tsx,js,jsx}"
---

When building on Blink infrastructure:

- Initialize the SDK with both `projectId` and `publishableKey`:
  ```typescript
  import { createClient } from '@blinkdotnew/sdk'
  const blink = createClient({
    projectId: import.meta.env.VITE_BLINK_PROJECT_ID || 'your-project-id',
    publishableKey: import.meta.env.VITE_BLINK_PUBLISHABLE_KEY || 'blnk_pk_xxx',
    auth: { mode: 'managed' },
  })
  ```

- Use `blink.db.<tableName>` for database CRUD — never raw SQL from client code. The SDK auto-converts camelCase JS to snake_case SQL.

- Use `blink.auth` for authentication. Enable providers first: `blink auth-config set --provider google --enabled true`

- Backend must be a Hono server in `backend/index.ts` that exports default. Deploy with `blink backend deploy`.

- Build before deploying frontend: `npm run build && blink deploy ./dist --prod`

- Store secrets via `blink env set KEY value` — never hardcode API keys.

- SQLite booleans are integers: use `1`/`0`, not `true`/`false`. Filter with `{ isActive: 1 }`.

- All database IDs should be strings, generated with a prefix pattern like `usr_${generateId()}`.

- Queue tasks are delivered to `POST /api/queue` on the backend. Name tasks clearly: `send-welcome-email`, `process-image`.
