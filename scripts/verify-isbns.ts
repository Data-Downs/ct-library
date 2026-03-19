/**
 * ISBN Verification Pipeline
 *
 * For each book in the library:
 * 1. Check if existing ASIN is a valid ISBN via Open Library
 * 2. If not, search Open Library + Google Books by title/author
 * 3. Score candidates and pick the best ISBN
 * 4. Verify cover image availability
 * 5. Output results to isbn-results.json
 */

import { readFileSync, writeFileSync } from 'fs'
import { join } from 'path'

const DELAY_MS = 100 // between API calls
const ROOT = join(import.meta.dirname, '..')

interface BookMeta {
  id: string
  title: string
  author: string
  currentAsin: string
  file: string
}

interface VerifiedBook {
  id: string
  title: string
  isbn: string
  confidence: number
  coverAvailable: boolean
  source: string
}

interface Result {
  verified: VerifiedBook[]
  noCover: { id: string; title: string; bestIsbn?: string }[]
  failed: { id: string; title: string; reason: string }[]
}

// ── Extract books from data files ───────────────────────────────────

function extractBooks(): BookMeta[] {
  const books: BookMeta[] = []
  const files = [
    'src/data/books.ts',
    'src/data/new-books.ts',
    'src/data/reviewed-books.ts',
  ]

  for (const file of files) {
    const content = readFileSync(join(ROOT, file), 'utf-8')
    // Match book objects with id, title, author, amazonUrl
    const regex = /id:\s*'([^']+)'.*?title:\s*'([^']*)'.*?author:\s*'([^']*)'.*?amazonUrl:\s*'([^']*)'/gs
    let match
    while ((match = regex.exec(content)) !== null) {
      const [, id, title, author, amazonUrl] = match
      const asinMatch = amazonUrl.match(/\/dp\/(\w+)/)
      books.push({
        id,
        title: title.replace(/\\'/g, "'"),
        author: author.replace(/\\'/g, "'"),
        currentAsin: asinMatch?.[1] || '',
        file,
      })
    }
  }
  return books
}

// ── API helpers ─────────────────────────────────────────────────────

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms))

async function fetchJson(url: string): Promise<any> {
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(8000) })
    if (!res.ok) return null
    return await res.json()
  } catch {
    return null
  }
}

// Check if an ASIN is already a valid ISBN on Open Library
async function checkExistingAsin(asin: string): Promise<{ valid: boolean; title?: string }> {
  if (!asin || asin.length < 10) return { valid: false }
  const data = await fetchJson(`https://openlibrary.org/isbn/${asin}.json`)
  if (data?.title) return { valid: true, title: data.title }
  return { valid: false }
}

// Search Open Library by title + author
async function searchOpenLibrary(title: string, author: string): Promise<string[]> {
  const authorSurname = author.split(' ').pop() || author
  const q = encodeURIComponent(`${title}`)
  const a = encodeURIComponent(authorSurname)
  const data = await fetchJson(`https://openlibrary.org/search.json?title=${q}&author=${a}&limit=3`)
  if (!data?.docs?.length) return []

  const isbns: string[] = []
  for (const doc of data.docs) {
    if (doc.isbn) {
      // Prefer ISBN-10 (for Open Library covers)
      const isbn10s = doc.isbn.filter((i: string) => i.length === 10)
      const isbn13s = doc.isbn.filter((i: string) => i.length === 13)
      isbns.push(...isbn10s.slice(0, 3), ...isbn13s.slice(0, 2))
    }
  }
  return [...new Set(isbns)].slice(0, 8)
}

// Search Google Books by title + author
async function searchGoogleBooks(title: string, author: string): Promise<string[]> {
  const authorSurname = author.split(' ').pop() || author
  const q = encodeURIComponent(`intitle:${title} inauthor:${authorSurname}`)
  const data = await fetchJson(`https://www.googleapis.com/books/v1/volumes?q=${q}&maxResults=3`)
  if (!data?.items?.length) return []

  const isbns: string[] = []
  for (const item of data.items) {
    const identifiers = item.volumeInfo?.industryIdentifiers || []
    for (const id of identifiers) {
      if (id.type === 'ISBN_10' || id.type === 'ISBN_13') {
        isbns.push(id.identifier)
      }
    }
  }
  return [...new Set(isbns)]
}

// Check if a cover image exists on Open Library (GET and check body size)
async function checkCover(isbn: string): Promise<boolean> {
  try {
    const res = await fetch(`https://covers.openlibrary.org/b/isbn/${isbn}-M.jpg`, {
      signal: AbortSignal.timeout(8000),
    })
    if (!res.ok) return false
    const buf = await res.arrayBuffer()
    // Placeholder is ~43 bytes, real covers are >1KB
    return buf.byteLength > 1000
  } catch {
    return false
  }
}

// Fuzzy title match (simple normalised comparison)
function titleSimilarity(a: string, b: string): number {
  const na = a.toLowerCase().replace(/[^a-z0-9]/g, '')
  const nb = b.toLowerCase().replace(/[^a-z0-9]/g, '')
  if (na === nb) return 1
  if (na.includes(nb) || nb.includes(na)) return 0.8
  // Simple character overlap
  const chars = new Set(na.split(''))
  let matches = 0
  for (const c of nb) if (chars.has(c)) matches++
  return matches / Math.max(na.length, nb.length)
}

// ── Main pipeline ───────────────────────────────────────────────────

async function main() {
  console.log('Extracting books from data files...')
  const books = extractBooks()
  console.log(`Found ${books.length} books\n`)

  const result: Result = { verified: [], noCover: [], failed: [] }
  let processed = 0

  for (const book of books) {
    processed++
    const progress = `[${processed}/${books.length}]`

    // Phase 1: Check if existing ASIN is valid
    await sleep(DELAY_MS)
    const existing = await checkExistingAsin(book.currentAsin)
    if (existing.valid) {
      // Verify cover exists
      await sleep(DELAY_MS)
      const hasCover = await checkCover(book.currentAsin)
      if (hasCover) {
        console.log(`${progress} ✓ ${book.title} — existing ASIN confirmed with cover`)
        result.verified.push({
          id: book.id, title: book.title, isbn: book.currentAsin,
          confidence: 10, coverAvailable: true, source: 'existing-asin',
        })
        continue
      }
    }

    // Phase 2: Search Open Library + Google Books
    await sleep(DELAY_MS)
    const [olIsbns, gbIsbns] = await Promise.all([
      searchOpenLibrary(book.title, book.author),
      searchGoogleBooks(book.title, book.author),
    ])

    const allCandidates = [...new Set([...olIsbns, ...gbIsbns])]

    if (allCandidates.length === 0) {
      console.log(`${progress} ✗ ${book.title} — no ISBNs found`)
      result.failed.push({ id: book.id, title: book.title, reason: 'No ISBNs found' })
      continue
    }

    // Phase 3: Score candidates and check covers
    let bestIsbn = ''
    let bestScore = 0
    let bestHasCover = false

    for (const isbn of allCandidates.slice(0, 6)) {
      let score = 0
      if (olIsbns.includes(isbn) && gbIsbns.includes(isbn)) score += 3
      else if (olIsbns.includes(isbn)) score += 2
      else if (gbIsbns.includes(isbn)) score += 1
      if (isbn === book.currentAsin) score += 2
      if (isbn.length === 10) score += 1

      await sleep(50)
      const hasCover = await checkCover(isbn)
      if (hasCover) score += 5 // Strong bonus for having a cover

      if (score > bestScore) {
        bestScore = score
        bestIsbn = isbn
        bestHasCover = hasCover
      }
    }

    if (bestHasCover) {
      console.log(`${progress} ✓ ${book.title} — found ISBN ${bestIsbn} with cover (score: ${bestScore})`)
      result.verified.push({
        id: book.id, title: book.title, isbn: bestIsbn,
        confidence: bestScore, coverAvailable: true, source: 'search',
      })
    } else if (bestIsbn) {
      console.log(`${progress} ~ ${book.title} — ISBN ${bestIsbn} but no cover`)
      result.noCover.push({ id: book.id, title: book.title, bestIsbn })
    } else {
      console.log(`${progress} ✗ ${book.title} — no valid ISBN`)
      result.failed.push({ id: book.id, title: book.title, reason: 'No valid cover' })
    }
  }

  // Output results
  const outputPath = join(ROOT, 'scripts/isbn-results.json')
  writeFileSync(outputPath, JSON.stringify(result, null, 2))

  console.log('\n' + '='.repeat(60))
  console.log(`Results:`)
  console.log(`  Verified with cover: ${result.verified.length}`)
  console.log(`  ISBN found, no cover: ${result.noCover.length}`)
  console.log(`  Failed: ${result.failed.length}`)
  console.log(`  Total: ${books.length}`)
  console.log(`\nOutput: ${outputPath}`)
}

main().catch(console.error)
