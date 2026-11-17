---
name: blink-auth
description: Authentication with managed and headless modes. Social providers, email/password, email verification and sign-up settings, magic links, RBAC, and the security policy that decides which modules (db, ai, storage, realtime, rag) need a signed-in user.
---

**Important**: Enable providers via CLI or MCP before using them in your app: `blink auth-config set --provider google --enabled true`

## MCP Tools

`blink_auth_get_config` · `blink_auth_set_config`

## Getting Started

```bash
# Enable auth providers via CLI
blink auth-config set --provider google --enabled true
blink auth-config set --provider github --enabled true
blink auth-config set --provider email --enabled true
```

## Email verification and open sign-up

`blink auth-config set` changes providers and mode only. Email settings live in the same config: read it, edit it, write the whole object back.

The curl recipes below need `BLINK_API_KEY` set to your workspace key (`blnk_ak_...`); `blink login` alone keeps it in the CLI's config, not the environment.

```bash
APP=${BLINK_APP_URL:-https://blink.new}; P=<project_id>; H="Authorization: Bearer $BLINK_API_KEY"  # workspace key, blnk_ak_...
curl -s "$APP/api/projects/$P/auth" -H "$H"
# → {"auth":{"providers":{"email":true,"google":true,...},"email":{"require_verification":true,"allow_signup":true}}}
# PUT back the inner object (the value of "auth", not {"auth":...}) with your edits, e.g. "require_verification": false.
# A wrapped {"auth":...} body still returns success but loses the mode and email settings.
curl -s -X PUT "$APP/api/projects/$P/auth" -H "$H" -H 'Content-Type: application/json' -d '<the edited auth object>'
```

Set `email.require_verification`, `email.allow_signup` and each provider you care about explicitly, even when the GET already shows the value you want: a project that never saved auth settings gets a template from GET (`require_verification: true`, `github: true`), not what it enforces (verification off, GitHub off), and the PUT makes whatever you send real.

## Which modules need a signed-in user (security policy)

Each module (`db`, `ai`, `storage`, `realtime`, `rag`, `agent`, `queue`, …) has `require_auth`; a module with no rule of its own follows `defaults.require_auth`, except `db` (a missing db rule is enforced as sign-in required, whatever `get` shows) and `analytics` (public). Read it with `blink security get --json`.

Change one module with one call; every other module and table rule keeps its stored value:

```bash
blink security set --module ai --require-auth true   # CLI 0.10.0+ (check `blink --version`; upgrade: npm install -g @blinkdotnew/cli@latest)
```

On CLI 0.9.x `blink security set` fails with `version must be 1` (`POLICY_INVALID`); don't retry it. Send the same change directly instead:

```bash
APP=${BLINK_APP_URL:-https://blink.new}; P=<project_id>; H="Authorization: Bearer $BLINK_API_KEY"
curl -s -X PATCH "$APP/api/project/$P/security" -H "$H" -H 'Content-Type: application/json' -d '{"module":"ai","require_auth":true}'
```

Don't GET the policy and PUT it back: the GET can show defaults that differ from what is enforced, so the round trip can open the database to signed-out visitors.

Making ai, agent, rag, queue, sandbox or data public bills every anonymous call to the user's credits, so both calls above refuse it (`NEEDS_APPROVAL`, HTTP 403). Ask the user to approve it in the Blink app (project Settings → Security); don't look for another way.

## Two Auth Modes

### Managed Mode (Quick Setup)

Redirects to hosted auth page. Best for websites and MVPs. **Not for mobile.**

> **CRITICAL**: In managed mode, ONLY `blink.auth.login()` and `blink.auth.logout()` are available. Calling `signInWithGoogle()`, `signInWithEmail()`, or any other auth method will throw: `"signInWithGoogle is only available in headless mode"`. If you need a custom auth UI, use headless mode instead.

```typescript
const blink = createClient({
  projectId: import.meta.env.VITE_BLINK_PROJECT_ID || 'your-project-id',
  publishableKey: import.meta.env.VITE_BLINK_PUBLISHABLE_KEY || 'blnk_pk_xxx',
  auth: { mode: 'managed' },
})

blink.auth.login()                            // ✅ Redirects to blink.new/auth
blink.auth.login('https://app.com/dashboard') // ✅ Custom redirect after login
blink.auth.logout()                           // ✅ Sign out

// ❌ These ALL throw in managed mode:
// blink.auth.signInWithGoogle()
// blink.auth.signInWithEmail(email, password)
// blink.auth.signUp({ email, password })
```

### Headless Mode (Custom UI)

Full control over the auth UI. **Required for mobile (Expo/React Native) and any custom sign-in form.**

```typescript
const blink = createClient({
  projectId: import.meta.env.VITE_BLINK_PROJECT_ID || 'your-project-id',
  publishableKey: import.meta.env.VITE_BLINK_PUBLISHABLE_KEY || 'blnk_pk_xxx',
  auth: { mode: 'headless' },  // ← must be headless for all methods below
})

await blink.auth.signUp({ email, password })
await blink.auth.signInWithEmail(email, password)
await blink.auth.signInWithGoogle()    // ✅ only works in headless mode
await blink.auth.signInWithGitHub()
await blink.auth.signInWithApple()
await blink.auth.signInWithMicrosoft()
```

### Mode Comparison


| Feature  | Managed       | Headless     |
| -------- | ------------- | ------------ |
| Setup    | 1 line        | Custom UI    |
| Mobile   | ❌             | ✅ Required   |
| Branding | Blink-branded | Fully custom |


## Auth State Listener (Required for React)

```typescript
useEffect(() => {
  const unsubscribe = blink.auth.onAuthStateChanged((state) => {
    setUser(state.user)
    if (!state.isLoading) setLoading(false)  // Only set false, never reset to true
  })
  return unsubscribe
}, [])
```

**Loading state**: Always show a spinner or skeleton while loading — never `return null` (causes blank screen in production).

## Signup with Custom Fields

```typescript
await blink.auth.signUp({
  email: 'user@example.com',
  password: 'password123',
  displayName: 'John Doe',
  role: 'editor',
  metadata: { company: 'Acme Inc' },
})
```

## Password Reset

```typescript
await blink.auth.sendPasswordResetEmail(email)
await blink.auth.confirmPasswordReset(token, newPassword)

// Custom email: SERVER-ONLY (backend / edge function), never browser code.
// Returns a live reset token, so it needs the secret key; without it the call fails (403).
const serverBlink = createClient({ projectId: env.BLINK_PROJECT_ID, secretKey: env.BLINK_SECRET_KEY })
const { token, resetUrl } = await serverBlink.auth.generatePasswordResetToken(email)
```

`generateMagicLinkToken()` has the same rule. From browser code, use `sendPasswordResetEmail()` / `sendMagicLink()`.

## Magic Links

```typescript
await blink.auth.sendMagicLink(email)
await blink.auth.verifyMagicLink(token)
```

## RBAC (Role-Based Access)

```typescript
const blink = createClient({
  projectId: import.meta.env.VITE_BLINK_PROJECT_ID || 'your-project-id',
  publishableKey: import.meta.env.VITE_BLINK_PUBLISHABLE_KEY || 'blnk_pk_xxx',
  auth: {
    mode: 'headless',
    roles: {
      admin: { permissions: ['*'] },
      editor: { permissions: ['posts.create', 'posts.update'], inherit: ['viewer'] },
      viewer: { permissions: ['posts.read'] },
    },
  },
})

blink.auth.can('posts.update')    // Check permission
blink.auth.hasRole('admin')       // Check role
```

## Core Methods

```typescript
const user = await blink.auth.me()
await blink.auth.updateMe({ displayName: 'New Name' })
const token = await blink.auth.getValidToken()
await blink.auth.signOut()
```

## How Auth Interacts with Blink APIs

When signed in, the SDK attaches `Authorization: Bearer <JWT>` automatically. Most modules require auth. Public exceptions: analytics ingest, storage upload (add-only).

## Expo/React Native Setup

```typescript
import * as WebBrowser from 'expo-web-browser'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { createClient, AsyncStorageAdapter } from '@blinkdotnew/sdk'

const blink = createClient({
  projectId: process.env.EXPO_PUBLIC_BLINK_PROJECT_ID!,
  publishableKey: process.env.EXPO_PUBLIC_BLINK_PUBLISHABLE_KEY!,
  auth: { mode: 'headless', webBrowser: WebBrowser },
  storage: new AsyncStorageAdapter(AsyncStorage),
})
```

<!-- BEGIN GENERATED: troubleshooting (bun scripts/agent-docs/sync-skill-docs.ts; do not edit by hand) -->
## Troubleshooting

Blink Cloud error bodies carry `code`, `hint`, `docs`, `retryable` and `request_id` beside the `error` text. Do what `hint` says first; fetch `docs` (markdown) for the full fix. Every code: https://blink.new/docs/errors.md

- **`AUTH_REQUIRED`** (HTTP 401, don't retry as is): From a server, send the project's secret key (blnk_sk_...) as `Authorization: Bearer <key>`. In a browser app, pass the publishable key (blnk_pk_...) to createClient, or sign the user in. [Details](https://core.blink.new/errors/AUTH_REQUIRED.md)
- **`AUTH_SERVER_KEY_REQUIRED`** (HTTP 401, don't retry as is): A workspace API key (blnk_ak_...) works only with the Blink CLI and blink.new/api/v1: for SQL run `blink db query "<sql>"`. To call core.blink.new directly, use the project secret key (blnk_sk_...). [Details](https://core.blink.new/errors/AUTH_SERVER_KEY_REQUIRED.md)
- **`AUTH_SECRET_KEY_INVALID`** (HTTP 401, don't retry as is): The secret key was rotated, revoked or mistyped. Get the current one from the project's API keys in blink.new (Project settings > API keys), or ask the user for it. Retrying with the same key will not help. [Details](https://core.blink.new/errors/AUTH_SECRET_KEY_INVALID.md)
- **`AUTH_TOKEN_EXPIRED`** (HTTP 401, don't retry as is): Refresh the user's session: the Blink SDK does this automatically when it holds the refresh token; otherwise sign the user in again. Retrying with the same token will not help. [Details](https://core.blink.new/errors/AUTH_TOKEN_EXPIRED.md)
- **`AUTH_TOKEN_INVALID`** (HTTP 401, don't retry as is): This is not a valid Blink token for this project. From a server, send the project secret key (blnk_sk_...); a workspace API key (blnk_ak_...) works only with the Blink CLI and blink.new/api/v1. [Details](https://core.blink.new/errors/AUTH_TOKEN_INVALID.md)
- **`AUTH_PROJECT_MISMATCH`** (HTTP 403, don't retry as is): This credential belongs to a different project. Use the project id this app is linked to (BLINK_PROJECT_ID, or `blink status`), or that project's own key. [Details](https://core.blink.new/errors/AUTH_PROJECT_MISMATCH.md)
- **`AUTH_UNAVAILABLE`** (HTTP 503, retry may help): Blink could not check this key because of a temporary problem on its side; the key itself may be fine. Retry in a few seconds with the same key. Do not rotate or replace it. If it keeps failing, report the request_id. [Details](https://core.blink.new/errors/AUTH_UNAVAILABLE.md)
<!-- END GENERATED: troubleshooting -->
