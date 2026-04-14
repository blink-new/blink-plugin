---
name: blink-rag
description: Knowledge base with vector search, document upload, collections, and AI-powered Q&A with citations. Semantic search over uploaded documents.
---

## Getting Started

```bash
# Search a collection
blink rag search docs "How do I configure auth?"

# Upload a document
blink rag upload docs ./guide.txt

# List collections
blink rag collections
```

## MCP Tools

| Tool | Description |
|------|-------------|
| `blink_rag_search` | Semantic search or AI Q&A over a collection |
| `blink_rag_collections` | List available collections |

## SDK Methods

```typescript
// Create collection
const col = await blink.rag.createCollection({ name: 'docs', description: 'Product docs' })

// Upload document
const doc = await blink.rag.upload({
  collectionName: 'docs',
  filename: 'guide.txt',
  content: 'Your content...',
})
await blink.rag.waitForReady(doc.id)

// Vector search
const results = await blink.rag.search({
  collectionName: 'docs',
  query: 'How do I configure auth?',
  maxResults: 5,
})

// AI search (RAG) — returns answer + sources
const result = await blink.rag.aiSearch({
  collectionName: 'docs',
  query: 'What are the main features?',
  model: 'google/gemini-3-flash',
})
console.log(result.answer, result.sources)
```

## Upload Methods

```typescript
// Text content
await blink.rag.upload({ collectionName: 'docs', filename: 'notes.txt', content: 'Text...' })

// From URL
await blink.rag.upload({ collectionName: 'docs', filename: 'article.html', url: 'https://example.com/article' })

// File (base64)
await blink.rag.upload({ collectionName: 'docs', filename: 'report.pdf', file: { data: base64, contentType: 'application/pdf' } })
```

## Critical: PDF Upload Pattern

**Do NOT upload PDFs directly as base64** — embeddings may store incorrectly. Extract text first:

```typescript
// 1. Upload PDF to storage
const { publicUrl } = await blink.storage.upload(pdfFile, `docs/${Date.now()}_${pdfFile.name}`)

// 2. Extract text
const text = await blink.data.extractFromUrl(publicUrl)

// 3. Upload extracted text as content
await blink.rag.upload({ collectionName: 'docs', filename: pdfFile.name, content: text })
```

## Document Lifecycle

Documents go through: `pending` → `processing` → `ready` (or `error`). Processing takes 30-40 seconds. Always wait before searching:

```typescript
const doc = await blink.rag.upload({ ... })
await blink.rag.waitForReady(doc.id, { timeoutMs: 120000 })
```

## Streaming AI Search

```typescript
const stream = await blink.rag.aiSearch({
  collectionName: 'docs',
  query: 'Explain the architecture',
  stream: true,
})
```

## Model Selection

**Always use `google/gemini-3-flash`** for RAG AI search. Deprecated models will fail.

## Common Errors

| Error | Fix |
|-------|-----|
| 409 "Collection exists" | Catch and reuse existing collection |
| Zero tokens in search | Document still processing — wait for `ready` status |
| "Identical content" on upload | Duplicate doc — catch error, use existing doc ID |
