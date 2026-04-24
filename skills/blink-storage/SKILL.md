---
name: blink-storage
description: File upload with progress tracking and public URLs. Download, remove files. CLI for management. Extension auto-detection.
---

## MCP Tools

| Tool | Description |
|------|-------------|
| `blink_storage_list` | List files in project storage with optional path prefix |
| `blink_storage_url` | Get the public CDN URL for a stored file |
| `blink_storage_delete` | Delete a file from storage |

## Getting Started

```bash
# Upload a file
blink storage upload ./photo.jpg --path uploads/photo.jpg

# List files
blink storage list

# List files in a path
blink storage list uploads/
```

## Auth Requirements


| Operation    | Auth Required | Notes                          |
| ------------ | ------------- | ------------------------------ |
| `upload()`   | ❌ No          | Public add-only (no overwrite) |
| `download()` | ✅ Yes         | Signed URL                     |
| `remove()`   | ✅ Yes         | Requires JWT                   |


## Upload

```typescript
const { publicUrl } = await blink.storage.upload(
  file,
  `uploads/${Date.now()}.${file.name.split('.').pop()}`,
  { onProgress: (percent) => console.log(`${percent}%`) }
)
```

SDK auto-detects file type from content and corrects the extension. Uploads are **add-only** — duplicate paths return `409`. Use timestamps or random IDs for uniqueness.

## Download

```typescript
const { downloadUrl, filename } = await blink.storage.download('images/photo.jpg')
window.open(downloadUrl, '_blank')

// Custom filename
const { downloadUrl } = await blink.storage.download('images/photo.jpg', {
  filename: 'my-photo.jpg',
})
```

## Remove

```typescript
await blink.storage.remove('uploads/file1.jpg')
await blink.storage.remove('file1.jpg', 'file2.jpg', 'file3.png')  // multiple
```

## Common Patterns

### Avatar Upload

```typescript
const handleAvatarUpload = async (file: File) => {
  const { publicUrl } = await blink.storage.upload(
    file,
    `avatars/${user.id}-${Date.now()}.${file.name.split('.').pop()}`
  )
  await blink.auth.updateMe({ avatar: publicUrl })
  return publicUrl
}
```

### Upload with Progress

```typescript
const [progress, setProgress] = useState(0)

const handleUpload = async (file: File) => {
  const { publicUrl } = await blink.storage.upload(
    file,
    `documents/${Date.now()}.${file.name.split('.').pop()}`,
    { onProgress: (percent) => setProgress(percent) }
  )
  return publicUrl
}
```

### For AI Image Input

Upload first to get an HTTPS URL with extension — required for AI vision.

```typescript
const { publicUrl } = await blink.storage.upload(photo, `photos/${Date.now()}.jpg`)
const { text } = await blink.ai.generateText({
  messages: [{ role: "user", content: [
    { type: "text", text: "What's in this image?" },
    { type: "image", image: publicUrl },
  ]}],
})
```

## URL Format

Uploaded files return direct HTTPS URLs: `https://storage.googleapis.com/{project}/uploads/{filename}.{ext}` — publicly accessible, HTTPS, with file extension.

## Common Errors


| Error          | Cause               | Fix                                                   |
| -------------- | ------------------- | ----------------------------------------------------- |
| 409 conflict   | Path already exists | Add timestamp/random ID                               |
| Invalid path   | Special characters  | Sanitize: `path.replace(/[^a-zA-Z0-9_\-\/\.]/g, '_')` |
| File too large | Exceeds limit       | Compress or split file                                |


