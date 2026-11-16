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

```bash
APP=${BLINK_APP_URL:-https://blink.new}; P=<project_id>; H="Authorization: Bearer $BLINK_API_KEY"
curl -s "$APP/api/projects/$P/auth" -H "$H"
# → {"auth":{"providers":{"email":true,"google":true,...},"email":{"require_verification":true,"allow_signup":true}}}
# PUT the "auth" object back with your edits (e.g. "require_verification": false):
curl -s -X PUT "$APP/api/projects/$P/auth" -H "$H" -H 'Content-Type: application/json' -d '<the edited auth object>'
```

## Which modules need a signed-in user (security policy)

Each module (`db`, `ai`, `storage`, `realtime`, `rag`) has `require_auth`; modules not listed follow `defaults.require_auth`. Read it with `blink security get --json`.

CLI 0.10.0+ changes one module in one command and keeps the rest of the policy: `blink security set --module ai --require-auth true` (check `blink --version`; upgrade with `npm install -g @blinkdotnew/cli@latest`). It refuses to make ai, agent, rag, queue, sandbox or data public, since every anonymous call bills the user's credits: ask the user to do that in the Blink app.

Without the CLI (or on CLI 0.9.x), read the policy, edit that module, and PUT the **whole** policy back, `version` and the other modules included. With CLI 0.9.x, `blink security set` sends only the one module and fails with `version must be 1` (`POLICY_INVALID`), so don't retry it.

```bash
APP=${BLINK_APP_URL:-https://blink.new}; P=<project_id>; H="Authorization: Bearer $BLINK_API_KEY"
curl -s "$APP/api/project/$P/security" -H "$H" \
  | node -e 'let s="";process.stdin.on("data",d=>s+=d).on("end",()=>{const {policy}=JSON.parse(s);policy.modules.ai={...policy.modules.ai,require_auth:true};console.log(JSON.stringify({policy}))})' \
  | curl -s -X PUT "$APP/api/project/$P/security" -H "$H" -H 'Content-Type: application/json' --data-binary @-
```

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

