/**
 * Apply approved cover URLs to library.json
 *
 * Usage:
 *   npx tsx scripts/apply-approved-covers.ts <approved-covers.json>
 *
 * Input: [{ "id": "being-and-time", "coverUrl": "https://..." }, ...]
 */

import { readFileSync, writeFileSync } from 'fs'
import { join } from 'path'

const ROOT = join(import.meta.dirname, '..')
const LIBRARY_PATH = join(ROOT, 'src/data/library.json')

const inputFile = process.argv[2]
if (!inputFile) {
  console.error('Usage: npx tsx scripts/apply-approved-covers.ts <approved-covers.json>')
  process.exit(1)
}

const approved: { id: string; coverUrl: string }[] = JSON.parse(readFileSync(inputFile, 'utf-8'))
const library = JSON.parse(readFileSync(LIBRARY_PATH, 'utf-8'))

const bookMap = new Map<string, any>()
for (const book of library) {
  bookMap.set(book.id, book)
}

let applied = 0
for (const { id, coverUrl } of approved) {
  const book = bookMap.get(id)
  if (book) {
    book.links.cover = coverUrl
    applied++
    console.log(`  ✓ ${book.title}`)
  } else {
    console.log(`  ✗ ${id} — not found in library`)
  }
}

writeFileSync(LIBRARY_PATH, JSON.stringify(library, null, 2))
console.log(`\nApplied ${applied} covers to library.json`)
