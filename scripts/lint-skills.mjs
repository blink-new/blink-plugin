#!/usr/bin/env node
/**
 * Checks every skills/<name>/SKILL.md against the Agent Skills spec (agentskills.io):
 * frontmatter `name` equals the folder and is ≤64 chars of a-z, 0-9 and hyphens;
 * `description` is 1–1024 chars; the file stays under 500 lines.
 *   node scripts/lint-skills.mjs
 */
import { existsSync, readdirSync, readFileSync } from 'fs'
import { join } from 'path'

const SKILLS_DIR = new URL('../skills/', import.meta.url).pathname

function frontmatter(markdown) {
  const match = markdown.match(/^---\n([\s\S]*?)\n---\n/)
  if (!match) return null
  const field = key => match[1].match(new RegExp(`^${key}:\\s*(.*)$`, 'm'))?.[1].trim() ?? ''
  return { name: field('name'), description: field('description') }
}

function problemsOf(dir) {
  const markdown = readFileSync(join(SKILLS_DIR, dir, 'SKILL.md'), 'utf-8')
  const fm = frontmatter(markdown)
  if (!fm) return ['no YAML frontmatter']
  const problems = []
  if (fm.name !== dir) problems.push(`name "${fm.name}" is not the folder name`)
  if (!/^[a-z0-9-]{1,64}$/.test(fm.name)) problems.push('name must be 1-64 chars of a-z, 0-9, -')
  if (!fm.description || fm.description.length > 1024) problems.push('description must be 1-1024 chars')
  if (markdown.split('\n').length >= 500) problems.push('500+ lines; move detail into a reference file')
  return problems
}

const dirs = readdirSync(SKILLS_DIR).filter(d => existsSync(join(SKILLS_DIR, d, 'SKILL.md')))
const failures = dirs.flatMap(d => problemsOf(d).map(p => `${d}: ${p}`))
for (const f of failures) console.error(f)
console.log(`${dirs.length - new Set(failures.map(f => f.split(':')[0])).size}/${dirs.length} skills pass`)
if (failures.length) process.exit(1)
