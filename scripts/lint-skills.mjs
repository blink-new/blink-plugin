#!/usr/bin/env node
/**
 * Checks every skills/<name>/SKILL.md against the Agent Skills spec (agentskills.io):
 * frontmatter `name` equals the folder, is ≤64 chars of a-z, 0-9 and single hyphens (not at
 * either end); `description` is 1–1024 chars (plain or a > / | block); the file stays under 500 lines.
 *   node scripts/lint-skills.mjs
 */
import { existsSync, readdirSync, readFileSync } from 'fs'
import { join } from 'path'
import { fileURLToPath } from 'url'

const SKILLS_DIR = fileURLToPath(new URL('../skills/', import.meta.url))
const NAME = /^[a-z0-9]+(-[a-z0-9]+)*$/

function frontmatter(markdown) {
  const match = markdown.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n/)
  if (!match) return null
  return { name: field(match[1], 'name'), description: field(match[1], 'description') }
}

/** A plain one-line value, or a folded/literal block (`>`, `|`) joined from its indented lines. */
function field(yaml, key) {
  const lines = yaml.split(/\r?\n/)
  const at = lines.findIndex(l => l.startsWith(`${key}:`))
  if (at === -1) return ''
  const value = lines[at].slice(key.length + 1).trim()
  if (!/^[>|][-+]?$/.test(value)) return value
  const body = []
  for (const line of lines.slice(at + 1)) {
    if (!/^\s/.test(line) && line !== '') break
    body.push(line.trim())
  }
  return body.join(' ').trim()
}

function descriptionProblem(description) {
  if (!description || description.length > 1024) return 'description must be 1-1024 chars'
  return null
}

function problemsOf(dir) {
  const markdown = readFileSync(join(SKILLS_DIR, dir, 'SKILL.md'), 'utf-8')
  const fm = frontmatter(markdown)
  if (!fm) return ['no YAML frontmatter']
  const lines = markdown.replace(/\r?\n$/, '').split(/\r?\n/).length
  return [
    fm.name !== dir && `name "${fm.name}" is not the folder name`,
    !(fm.name.length <= 64 && NAME.test(fm.name)) && 'name must be ≤64 chars of a-z, 0-9 and single inner hyphens',
    descriptionProblem(fm.description),
    lines >= 500 && `${lines} lines; keep it under 500 and move detail into a reference file`,
  ].filter(Boolean)
}

const dirs = readdirSync(SKILLS_DIR).filter(d => existsSync(join(SKILLS_DIR, d, 'SKILL.md')))
const failures = dirs.map(d => [d, problemsOf(d)]).filter(([, p]) => p.length)
for (const [d, problems] of failures) for (const p of problems) console.error(`${d}: ${p}`)
console.log(`${dirs.length - failures.length}/${dirs.length} skills pass`)
if (failures.length) process.exit(1)
