#!/usr/bin/env node
/**
 * Copies the generated blocks (each skill's Troubleshooting, the `blink` skill's index) into
 * skills/<name>/SKILL.md from the copies blink.new serves. auto-engineer renders them from its
 * error registries, so this repo never edits them by hand; the hand-written text stays here.
 *   node scripts/sync-skill-blocks.mjs                     write from https://blink.new
 *   node scripts/sync-skill-blocks.mjs --check             exit 1 if any block differs
 *   node scripts/sync-skill-blocks.mjs --from <dir>        read <dir>/<name>/SKILL.md instead
 */
import { existsSync, readdirSync, readFileSync, writeFileSync } from 'fs'
import { join } from 'path'
import { fileURLToPath } from 'url'

const SKILLS_DIR = fileURLToPath(new URL('../skills/', import.meta.url))
const LIVE = 'https://blink.new/.well-known/agent-skills'
const BLOCK = /<!-- BEGIN GENERATED: ([\w-]+) [^\r\n]*-->\r?\n[\s\S]*?<!-- END GENERATED: \1 -->/g

function parseArgs(argv) {
  const known = new Set(['--check', '--from'])
  const unknown = argv.filter((a, i) => !known.has(a) && argv[i - 1] !== '--from')
  if (unknown.length) fail(`Unknown option(s): ${unknown.join(' ')}`)
  if (!argv.includes('--from')) return { check: argv.includes('--check'), fromDir: null }
  const fromDir = argv[argv.indexOf('--from') + 1]
  if (!fromDir || fromDir.startsWith('--')) fail('--from needs a directory')
  if (!existsSync(fromDir)) fail(`--from ${fromDir}: no such directory`)
  return { check: argv.includes('--check'), fromDir }
}

function fail(message) {
  console.error(message)
  process.exit(2)
}

/** null for a 404; throws unless the body really is this skill (a 200 challenge page is not). */
async function fetchOnce(name) {
  const res = await fetch(`${LIVE}/${name}/SKILL.md`, { signal: AbortSignal.timeout(15_000) })
  if (res.status === 404) return null
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  const body = await res.text()
  if (!new RegExp(`^---\\r?\\nname: ${name}\\r?\\n`).test(body)) throw new Error('response is not a SKILL.md')
  return body
}

async function fetchLive(name, attempt = 1) {
  try {
    return await fetchOnce(name)
  } catch (error) {
    if (attempt >= 3) throw new Error(`${LIVE}/${name}/SKILL.md: ${error.message}`)
    await new Promise(resolve => setTimeout(resolve, 1000 * attempt))
    return fetchLive(name, attempt + 1)
  }
}

function sourceOf(name, fromDir) {
  if (!fromDir) return fetchLive(name)
  const file = join(fromDir, name, 'SKILL.md')
  return existsSync(file) ? readFileSync(file, 'utf-8') : null
}

const blocksOf = markdown => new Map([...markdown.matchAll(BLOCK)].map(m => [m[1], m]))

/** Same rule as auto-engineer's writeBlock: replace between the markers, or append at the end. */
function writeBlock(markdown, name, block) {
  const existing = blocksOf(markdown).get(name)
  if (!existing) return `${markdown.trimEnd()}\n\n${block}\n`
  return markdown.slice(0, existing.index) + block + markdown.slice(existing.index + existing[0].length)
}

/** A block blink.new no longer renders goes too, with the blank lines before it. */
function removeBlock(markdown, name) {
  const existing = blocksOf(markdown).get(name)
  const head = markdown.slice(0, existing.index)
  const before = head.replace(/(\r?\n)+$/, head.includes('\r\n') ? '\r\n' : '\n')
  return before + markdown.slice(existing.index + existing[0].length).replace(/^\r?\n/, '')
}

function withSourceBlocks(markdown, source) {
  const wanted = blocksOf(source)
  const stale = [...blocksOf(markdown).keys()].filter(name => !wanted.has(name))
  const pruned = stale.reduce(removeBlock, markdown)
  return [...wanted.values()].reduce((md, m) => writeBlock(md, m[1], m[0]), pruned)
}

async function syncSkill(name, { check, fromDir }) {
  const file = join(SKILLS_DIR, name, 'SKILL.md')
  const source = await sourceOf(name, fromDir)
  if (source === null) return { name, status: 'not served yet' }
  const current = readFileSync(file, 'utf-8')
  const next = withSourceBlocks(current, source)
  if (next === current) return { name, status: 'current' }
  if (!check) writeFileSync(file, next)
  return { name, status: check ? 'DRIFTED' : 'updated' }
}

function report(results, { fromDir }) {
  for (const r of results) console.log(`${r.status.padEnd(14)} ${r.name}`)
  if (results.every(r => r.status === 'not served yet')) fail(`${fromDir ?? LIVE} serves none of these skills — wrong source?`)
  const drifted = results.filter(r => r.status === 'DRIFTED')
  if (!drifted.length) return
  console.error(`\n${drifted.length} skill(s) differ from ${fromDir ?? LIVE}. Run: node scripts/sync-skill-blocks.mjs`)
  process.exit(1)
}

const opts = parseArgs(process.argv.slice(2))
const names = readdirSync(SKILLS_DIR).filter(n => existsSync(join(SKILLS_DIR, n, 'SKILL.md')))
report(await Promise.all(names.map(n => syncSkill(n, opts))), opts)
