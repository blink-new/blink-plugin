---
name: blink-database
description: Database CRUD with automatic camelCase conversion. Create, list, update, delete, upsert, count, exists. Raw SQL via CLI. Boolean handling for SQLite.
---

## MCP Tools

`blink_db_query` · `blink_db_schema`

- **`blink_db_query`** — Run any SQL query (SELECT, INSERT, UPDATE, DELETE, CREATE TABLE, etc.)
- **`blink_db_schema`** — Get full schema: all tables with column names, types, nullability, defaults, and primary keys

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

<!-- BEGIN GENERATED: troubleshooting (bun scripts/agent-docs/sync-skill-docs.ts; do not edit by hand) -->
## Troubleshooting

Blink Cloud error bodies carry `code`, `hint`, `docs`, `retryable` and `request_id` beside the `error` text. Do what `hint` says first; fetch `docs` (markdown) for the full fix. Every code: https://blink.new/docs/errors.md

- **`DB_COLUMN_NOT_FOUND`** (HTTP 500, don't retry as is): Read the table columns with `PRAGMA table_info(<table>)` and use one of them. Do not add a column to match a guessed name. [Details](https://core.blink.new/errors/DB_COLUMN_NOT_FOUND.md)
- **`DB_COLUMN_EXISTS`** (HTTP 500, don't retry as is): If ALTER TABLE ADD COLUMN hit this, the column already exists: skip it, or check `PRAGMA table_info(<table>)` first. If CREATE TABLE listed a name twice, the table was not created: remove the duplicate. Retrying fails the same way. [Details](https://core.blink.new/errors/DB_COLUMN_EXISTS.md)
- **`DB_TABLE_NOT_FOUND`** (HTTP 500, don't retry as is): The table does not exist. List tables with `SELECT name FROM sqlite_master WHERE type='table'` and use a real name, or create it with your migration first. Retrying fails the same way. [Details](https://core.blink.new/errors/DB_TABLE_NOT_FOUND.md)
- **`DB_REST_TABLE_NOT_FOUND`** (HTTP 404, don't retry as is): This project's database has no table with that name. Check the name against your migration, or create the table first (`blink db exec <file.sql>`; `blink db list` lists tables). Retrying will not help. [Details](https://core.blink.new/errors/DB_REST_TABLE_NOT_FOUND.md)
- **`DB_NOT_NULL_VIOLATION`** (HTTP 500, don't retry as is): A column declared NOT NULL got no value; `details` names it as table.column. Send a value for it in every insert, or give the column a DEFAULT in the table migration. The same row fails the same way on retry. [Details](https://core.blink.new/errors/DB_NOT_NULL_VIOLATION.md)
- **`DB_FILTER_INVALID`** (HTTP 400, don't retry as is): A query filter could not be parsed; `error` says where. Write it as column=operator.value (eq, neq, gt, gte, lt, lte, like, ilike, in, is) and OR as or=(a.eq.1,b.gt.2). The same filter fails the same way. [Details](https://core.blink.new/errors/DB_FILTER_INVALID.md)
- **`DB_SIGN_IN_REQUIRED`** (HTTP 401, don't retry as is): This table is not public, so the call needs a signed-in user (sign them in with blink.auth first) or, from server code, the project secret key. Retrying will not help. Do not make the table public unless its rows are meant for everyone. [Details](https://core.blink.new/errors/DB_SIGN_IN_REQUIRED.md)
- **`MISSING_SQL`** (HTTP 400, don't retry as is): Send the statement as `sql` in the JSON body, or run `blink db query "<sql>"`. [Details](https://blink.new/api/v1/errors/MISSING_SQL.md)
- **`SQL_EXECUTION_ERROR`** (HTTP 400, don't retry as is): `error` is the SQLite message. For a missing table or column, read the schema first (`blink db query "PRAGMA table_info(<table>)"`, GET .../databases/schema) instead of guessing names. Same SQL fails the same way. [Details](https://blink.new/api/v1/errors/SQL_EXECUTION_ERROR.md)
- **`WRITE_SQL_IN_QUERY`** (HTTP 400, don't retry as is): This tool is read-only. Send writes (INSERT, UPDATE, DELETE, DDL) through the execute tool or `blink db exec`. [Details](https://blink.new/api/v1/errors/WRITE_SQL_IN_QUERY.md)
- **`DATABASE_NOT_FOUND`** (HTTP 404, don't retry as is): The project has no database yet. Create it with POST /api/v1/projects/{id}/databases, then retry this call. Retrying before that will not help. [Details](https://blink.new/api/v1/errors/DATABASE_NOT_FOUND.md)
- **`ROUTER_CONFIG_ERROR`** (HTTP 500, don't retry as is): Blink cannot create databases on this server right now (a configuration problem on our side). Stop and report the request_id; retrying will not help. [Details](https://blink.new/api/v1/errors/ROUTER_CONFIG_ERROR.md)
<!-- END GENERATED: troubleshooting -->
