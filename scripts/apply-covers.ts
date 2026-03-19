/**
 * Apply verified cover URLs from cover-results.json to data files.
 * Adds coverUrl: 'https://...' after each book's amazonUrl line.
 */

import { readFileSync, writeFileSync } from 'fs'
import { join } from 'path'

const ROOT = join(import.meta.dirname, '..')

const results = JSON.parse(readFileSync(join(ROOT, 'scripts/cover-results.json'), 'utf-8'))
const coverMap = new Map<string, string>()

for (const r of results.results) {
  coverMap.set(r.id, r.coverUrl)
}

console.log(`Applying ${coverMap.size} cover URLs...\n`)

const files = [
  'src/data/books.ts',
  'src/data/new-books.ts',
  'src/data/reviewed-books.ts',
]

let total = 0

for (const file of files) {
  const path = join(ROOT, file)
  let content = readFileSync(path, 'utf-8')
  let count = 0

  for (const [id, coverUrl] of coverMap) {
    // Escape any special regex chars in the URL
    const escapedUrl = coverUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

    // Check if already has coverUrl
    const hasIt = new RegExp(`id:\\s*'${id}'[^}]*coverUrl:`).test(content)
    if (hasIt) continue

    // Add coverUrl after amazonUrl line for this book
    const pattern = new RegExp(`(id:\\s*'${id}'[^}]*?amazonUrl:\\s*'[^']*')`)
    if (pattern.test(content)) {
      content = content.replace(pattern, `$1,\n    coverUrl: '${coverUrl}'`)
      count++
    }
  }

  writeFileSync(path, content)
  console.log(`${file}: ${count} covers applied`)
  total += count
}

console.log(`\nTotal: ${total}`)
