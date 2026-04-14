---
name: blink-auth
description: Authentication with managed and headless modes. Social providers, email/password, magic links, RBAC.
---

**Important**: Enable providers via CLI or MCP before using them in your app: `blink auth-config set --provider google --enabled true`

## MCP Tools

`blink_auth_config_get` · `blink_auth_config_set`

## Getting Started

```bash
# Enable auth providers via CLI
blink auth-config set --provider google --enabled true
blink auth-config set --provider github --enabled true
blink auth-config set --provider email --enabled true
```

## Two Auth Modes

### Managed Mode (Quick Setup)

Redirects to hosted auth page. Best for websites and MVPs. **Not for mobile.**

```typescript
const blink = createClient({
  projectId: import.meta.env.VITE_BLINK_PROJECT_ID || 'your-project-id',
  publishableKey: import.meta.env.VITE_BLINK_PUBLISHABLE_KEY || 'blnk_pk_xxx',
  auth: { mode: 'managed' },
})

blink.auth.login()                            // Redirects to blink.new/auth
blink.auth.login('https://app.com/dashboard') // Custom redirect after login
blink.auth.logout()
```

### Headless Mode (Custom UI)

Full control. **Required for mobile (Expo/React Native).**

```typescript
const blink = createClient({
  projectId: import.meta.env.VITE_BLINK_PROJECT_ID || 'your-project-id',
  publishableKey: import.meta.env.VITE_BLINK_PUBLISHABLE_KEY || 'blnk_pk_xxx',
  auth: { mode: 'headless' },
})

await blink.auth.signUp({ email, password })
await blink.auth.signInWithEmail(email, password)
await blink.auth.signInWithGoogle()
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

// Custom flow: generate token, send your own email
const { token, resetUrl } = await blink.auth.generatePasswordResetToken(email)
```

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

