#!/usr/bin/env node
// Smoke test: boot the built MCP server, send `initialize`, and verify it
// responds with tools capability. Catches the v1.3.5 regression where the
// tool-registration loop passed plain JSON schemas instead of Zod `.shape`
// and the SDK rejected every tool at startup ("expected a Zod schema or
// ToolAnnotations").
//
// Runs as part of `prepublishOnly` so a broken build can never reach npm.

import { spawn } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
import { existsSync } from 'node:fs'

const __dirname = dirname(fileURLToPath(import.meta.url))
const dist = resolve(__dirname, '..', 'dist', 'index.js')

if (!existsSync(dist)) {
  console.error(`smoke: dist/index.js missing at ${dist} — run \`tsup\` first`)
  process.exit(1)
}

const proc = spawn(process.execPath, [dist], {
  stdio: ['pipe', 'pipe', 'pipe'],
  env: { ...process.env, BLINK_API_KEY: process.env.BLINK_API_KEY ?? 'blnk_ak_smoke_test_dummy' },
})

let stdout = ''
let stderr = ''
proc.stdout.on('data', (d) => { stdout += d.toString() })
proc.stderr.on('data', (d) => { stderr += d.toString() })

const initMsg = JSON.stringify({
  jsonrpc: '2.0',
  id: 1,
  method: 'initialize',
  params: {
    protocolVersion: '2025-03-26',
    capabilities: {},
    clientInfo: { name: 'smoke', version: '1' },
  },
}) + '\n'

proc.stdin.write(initMsg)

const timeout = setTimeout(() => {
  proc.kill('SIGKILL')
  console.error('smoke: TIMEOUT waiting 5s for initialize response')
  console.error('--- stderr ---\n' + stderr)
  process.exit(1)
}, 5000)

proc.on('exit', (code) => {
  clearTimeout(timeout)
  if (code !== 0 && code !== null) {
    console.error(`smoke: server exited with code ${code} before responding`)
    console.error('--- stderr ---\n' + stderr)
    process.exit(1)
  }
  let response
  try {
    response = JSON.parse(stdout.trim().split('\n')[0])
  } catch (err) {
    console.error('smoke: could not parse JSON response')
    console.error('--- stdout ---\n' + stdout)
    console.error('--- stderr ---\n' + stderr)
    process.exit(1)
  }
  if (response?.error) {
    console.error('smoke: server returned JSON-RPC error:', response.error)
    process.exit(1)
  }
  if (!response?.result?.capabilities?.tools) {
    console.error('smoke: response missing tools capability')
    console.error(JSON.stringify(response, null, 2))
    process.exit(1)
  }
  console.log(`smoke: OK — server ${response.result.serverInfo?.name}@${response.result.serverInfo?.version} advertises tools capability`)
  process.exit(0)
})

// Watch for the specific class of crash we're guarding against.
proc.on('error', (err) => {
  clearTimeout(timeout)
  console.error('smoke: failed to spawn:', err.message)
  process.exit(1)
})

// Close stdin after a short delay so the server has time to respond first.
setTimeout(() => {
  try { proc.stdin.end() } catch {}
}, 1500)
