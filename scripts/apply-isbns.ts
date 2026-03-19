/**
 * Apply verified ISBNs from isbn-results.json to the data files.
 * Adds isbn: 'XXXXXXXXXX' after each book's amazonUrl line.
 */

import { readFileSync, writeFileSync } from 'fs'
import { join } from 'path'

const ROOT = join(import.meta.dirname, '..')

interface VerifiedBook {
  id: string
  isbn: string
  coverAvailable: boolean
}

const results = JSON.parse(readFileSync(join(ROOT, 'scripts/isbn-results.json'), 'utf-8'))
const verified: VerifiedBook[] = results.verified

const isbnMap = new Map<string, string>()
for (const v of verified) {
  isbnMap.set(v.id, v.isbn)
}

console.log(`Applying ${isbnMap.size} verified ISBNs to data files...\n`)

const files = [
  'src/data/books.ts',
  'src/data/new-books.ts',
  'src/data/reviewed-books.ts',
]

let totalApplied = 0

for (const file of files) {
  const path = join(ROOT, file)
  let content = readFileSync(path, 'utf-8')
  let applied = 0

  for (const [id, isbn] of isbnMap) {
    // Find the book by id and add isbn after amazonUrl
    // Pattern: id: 'book-id', ... amazonUrl: 'https://...',
    const idPattern = new RegExp(`(id:\\s*'${id}'[^}]*?amazonUrl:\\s*'[^']*')`, 's')
    const match = content.match(idPattern)
    if (match) {
      // Check if isbn is already there
      const bookChunk = content.slice(match.index!, match.index! + match[0].length + 100)
      if (bookChunk.includes(`isbn: '`)) {
        // Already has isbn, update it
        content = content.replace(
          new RegExp(`(id:\\s*'${id}'[^}]*?)isbn:\\s*'[^']*'`, 's'),
          `$1isbn: '${isbn}'`
        )
      } else {
        // Add isbn after amazonUrl
        content = content.replace(
          idPattern,
          `$1,\n    isbn: '${isbn}'`
        )
      }
      applied++
    }
  }

  writeFileSync(path, content)
  console.log(`${file}: applied ${applied} ISBNs`)
  totalApplied += applied
}

console.log(`\nTotal: ${totalApplied} ISBNs applied`)
