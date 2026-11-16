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

const SKILLS_DIR = new URL('../skills/', import.meta.url).pathname
const LIVE = 'https://blink.new/.well-known/agent-skills'
const BLOCK = /<!-- BEGIN GENERATED: ([\w-]+) [^\n]*-->\n[\s\S]*?<!-- END GENERATED: \1 -->/g

const args = process.argv.slice(2)
const check = args.includes('--check')
const fromDir = args.includes('--from') ? args[args.indexOf('--from') + 1] : null

async function sourceOf(name) {
  if (fromDir) {
    const file = join(fromDir, name, 'SKILL.md')
    return existsSync(file) ? readFileSync(file, 'utf-8') : null
  }
  const res = await fetch(`${LIVE}/${name}/SKILL.md`)
  if (res.status === 404) return null
  if (!res.ok) throw new Error(`${LIVE}/${name}/SKILL.md: HTTP ${res.status}`)
  return res.text()
}

/** Same rule as auto-engineer's writeBlock: replace between the markers, or append at the end. */
function writeBlock(markdown, name, block) {
  const existing = [...markdown.matchAll(BLOCK)].find(m => m[1] === name)
  if (!existing) return `${markdown.trimEnd()}\n\n${block}\n`
  return markdown.slice(0, existing.index) + block + markdown.slice(existing.index + existing[0].length)
}

function withSourceBlocks(markdown, source) {
  return [...source.matchAll(BLOCK)].reduce((md, m) => writeBlock(md, m[1], m[0]), markdown)
}

async function syncSkill(name) {
  const file = join(SKILLS_DIR, name, 'SKILL.md')
  const source = await sourceOf(name)
  if (source === null) return { name, status: 'not served yet' }
  const current = readFileSync(file, 'utf-8')
  const next = withSourceBlocks(current, source)
  if (next === current) return { name, status: 'current' }
  if (!check) writeFileSync(file, next)
  return { name, status: check ? 'DRIFTED' : 'updated' }
}

const names = readdirSync(SKILLS_DIR).filter(n => existsSync(join(SKILLS_DIR, n, 'SKILL.md')))
const results = await Promise.all(names.map(syncSkill))
for (const r of results) console.log(`${r.status.padEnd(14)} ${r.name}`)
const drifted = results.filter(r => r.status === 'DRIFTED')
if (drifted.length) {
  console.error(`\n${drifted.length} skill(s) differ from ${fromDir ?? LIVE}. Run: node scripts/sync-skill-blocks.mjs`)
  process.exit(1)
}
