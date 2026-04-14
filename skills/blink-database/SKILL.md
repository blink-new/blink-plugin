---
name: blink-database
description: Database CRUD with automatic camelCase conversion. Create, list, update, delete, upsert, count, exists. Raw SQL via CLI. Boolean handling for SQLite.
---

## MCP Tools

`blink_db_query` · `blink_db_schema`

## Getting Started

```bash
# Create a table
blink db query "CREATE TABLE todos (id TEXT PRIMARY KEY, title TEXT NOT NULL, user_id TEXT, is_completed INTEGER DEFAULT 0, created_at TEXT DEFAULT (datetime('now')))"

# Inspect schema
blink db query "SELECT name FROM sqlite_master WHERE type='table'"

# Run any SQL
blink db query "SELECT * FROM todos LIMIT 10"
```

## Automatic Case Conversion

SDK converts camelCase ↔ snake_case automatically. **Always use camelCase in code.**

```typescript
// ✅ Correct
await blink.db.emailDrafts.create({ userId: user.id, createdAt: new Date() })

// ❌ Wrong — never use snake_case in SDK calls
await blink.db.email_drafts.create({ user_id: user.id })
```

## CRUD Operations

```typescript
// Create (ID auto-generates as string)
const todo = await blink.db.todos.create({ title: 'Learn Blink', userId: user.id, isCompleted: false })

// Get by ID
const todo = await blink.db.todos.get('todo_12345')

// List with filtering
const todos = await blink.db.todos.list({
  where: { AND: [{ userId: user.id }, { OR: [{ status: 'open' }, { priority: 'high' }] }] },
  orderBy: { createdAt: 'desc' },
  limit: 20,
  offset: 0,
})

// Update
await blink.db.todos.update('todo_12345', { isCompleted: true })

// Delete
await blink.db.todos.delete('todo_12345')

// Upsert
await blink.db.todos.upsert({ id: 'todo_12345', title: 'Updated', userId: user.id })

// Count / Exists
const count = await blink.db.todos.count({ where: { userId: user.id } })
const exists = await blink.db.todos.exists({ where: { id: 'todo_12345' } })
```

### Batch Operations

```typescript
await blink.db.todos.createMany([{ title: 'Task 1', userId: user.id }, { title: 'Task 2', userId: user.id }])
await blink.db.todos.updateMany([{ id: 'todo_1', isCompleted: true }, { id: 'todo_2', isCompleted: true }])
await blink.db.todos.deleteMany({ where: { userId: user.id, isCompleted: "1" } })
```

## Boolean Handling (CRITICAL)

SQLite returns booleans as `"0"`/`"1"` strings, not `true`/`false`.

```typescript
// ✅ Correct
const completed = todos.filter(todo => Number(todo.isCompleted) > 0)

// Filter in queries
const done = await blink.db.todos.list({ where: { isCompleted: "1" } })
```

## TypeScript

```typescript
interface Todo {
  id: string        // MUST be string, never number
  title: string
  isCompleted: boolean  // Returned as "0"/"1" from SQLite
  userId: string
  createdAt: string
}

// Typed queries
const todos = await blink.db.table<Todo>('todos').list()
```

## Filtering Options

| Option | Type | Example |
|--------|------|---------|
| `where` | object | `{ userId: 'abc', status: 'active' }` |
| `orderBy` | object | `{ createdAt: 'desc' }` |
| `limit` | number | `20` |
| `offset` | number | `0` |
| `select` | array | `['id', 'title']` |

## Auth & RLS

REST CRUD is JWT-protected by default — initialize with auth for user-scoped data. RLS enforces per-user access server-side.

```typescript
const blink = createClient({
  projectId: process.env.NEXT_PUBLIC_BLINK_PROJECT_ID,
  publishableKey: process.env.NEXT_PUBLIC_BLINK_PUBLISHABLE_KEY,
  auth: { mode: 'managed' },
})
```

## Async Operations Warning

Never create a DB record before an async operation (AI, upload) completes — nullable fields or missing data will fail NOT NULL constraints. Create records only **after** you have all data.
