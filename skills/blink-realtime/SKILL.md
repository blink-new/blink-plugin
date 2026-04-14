---
name: blink-realtime
description: WebSocket pub/sub messaging with channels, presence tracking, and message history. Real-time communication for chat, collaboration, and live updates.
---

## Getting Started

```bash
# Publish a message to a channel
blink realtime publish chat-room --type message --data '{"text":"Hello everyone!"}'

# Publish with user context
blink realtime publish notifications --type alert --data '{"level":"info","text":"Deploy complete"}'
```

## MCP Tools

| Tool | Description |
|------|-------------|
| `blink_realtime_publish` | Publish event to a channel |

## SDK Methods

```typescript
// Simple subscribe/publish
const unsubscribe = await blink.realtime.subscribe('chat-room', (message) => {
  console.log(message.data)
})

await blink.realtime.publish('chat-room', 'message', { text: 'Hello!' })
unsubscribe()
```

## Channel API (Advanced)

```typescript
const channel = blink.realtime.channel('game-lobby')

await channel.subscribe({
  userId: user.id,
  metadata: { displayName: user.name, status: 'online' }
})

channel.onMessage((msg) => {
  if (msg.type === 'chat') addMessage(msg.data)
})

channel.onPresence((users) => {
  setOnlineUsers(users)
})

await channel.publish('chat', { text: 'Hello!' }, { userId: user.id })

const history = await channel.getMessages({ limit: 50 })
const users = await channel.getPresence()

await channel.unsubscribe()
```

## Message Format

```typescript
{
  id: '1640995200000-0',
  type: 'chat',
  data: { text: 'Hello!' },
  timestamp: 1640995200000,
  userId: 'user123',
  metadata: { displayName: 'John' }
}
```

## Presence Format

```typescript
{
  userId: 'user123',
  metadata: { displayName: 'John', status: 'online' },
  joinedAt: 1640995200000,
  lastSeen: 1640995230000
}
```

## React Cleanup (Critical)

```typescript
useEffect(() => {
  if (!user?.id) return

  let channel: any = null

  const init = async () => {
    channel = blink.realtime.channel('room')
    await channel.subscribe({ userId: user.id })
    channel.onMessage((msg: any) => setMessages(prev => [...prev, msg]))
  }

  init().catch(console.error)

  return () => { channel?.unsubscribe() }
}, [user?.id])
```

**Never** return cleanup from inside an async function — it gets lost. Store channel reference outside and clean up synchronously.

## Use Cases

- **Chat apps** — messages + presence + history
- **Live collaboration** — cursor positions, document edits
- **Notifications** — real-time alerts pushed to connected clients
- **Gaming** — game state sync, lobby management
- **Dashboards** — live data updates
