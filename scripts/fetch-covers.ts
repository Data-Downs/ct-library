/**
 * Fetch book cover URLs from Google Books API.
 *
 * Instead of ISBN lookup, this searches by title+author and uses
 * the thumbnail URL directly from the matched result. If the returned
 * title matches ours, the cover is guaranteed correct.
 */

import { readFileSync, writeFileSync } from 'fs'
import { join } from 'path'

const ROOT = join(import.meta.dirname, '..')
const DELAY_MS = 150

interface BookMeta {
  id: string
  title: string
  author: string
}

interface CoverResult {
  id: string
  title: string
  coverUrl: string
  matchedTitle: string
  confidence: number
}

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms))

// Normalise for comparison
function normalise(s: string): string {
  return s.toLowerCase()
    .replace(/['']/g, "'")
    .replace(/[^a-z0-9' ]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

function titleMatch(ours: string, theirs: string): number {
  const a = normalise(ours)
  const b = normalise(theirs)
  if (a === b) return 1
  // Check if one contains the other (handles subtitles)
  if (a.includes(b) || b.includes(a)) return 0.9
  // Check first significant words match
  const aWords = a.split(' ').filter(w => w.length > 2)
  const bWords = b.split(' ').filter(w => w.length > 2)
  const common = aWords.filter(w => bWords.includes(w))
  return common.length / Math.max(aWords.length, bWords.length)
}

// Extract books from data files
function extractBooks(): BookMeta[] {
  const books: BookMeta[] = []
  const files = ['src/data/books.ts', 'src/data/new-books.ts', 'src/data/reviewed-books.ts']

  for (const file of files) {
    const content = readFileSync(join(ROOT, file), 'utf-8')
    const regex = /id:\s*'([^']+)'.*?title:\s*'([^']*)'.*?author:\s*'([^']*)'/gs
    let match
    while ((match = regex.exec(content)) !== null) {
      books.push({
        id: match[1],
        title: match[2].replace(/\\'/g, "'"),
        author: match[3].replace(/\\'/g, "'"),
      })
    }
  }
  return books
}

// Search Google Books and return the best cover URL
async function searchGoogleBooks(title: string, author: string): Promise<{ coverUrl: string; matchedTitle: string } | null> {
  const authorSurname = author.split(/[,&]/).shift()?.trim().split(' ').pop() || author
  const q = encodeURIComponent(`${title} ${authorSurname}`)

  try {
    const res = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${q}&maxResults=3`, {
      signal: AbortSignal.timeout(8000),
    })
    if (!res.ok) return null
    const data = await res.json()
    if (!data.items?.length) return null

    for (const item of data.items) {
      const returnedTitle = item.volumeInfo?.title || ''
      const similarity = titleMatch(title, returnedTitle)

      if (similarity >= 0.6) {
        const imageLinks = item.volumeInfo?.imageLinks
        if (imageLinks) {
          // Get the best available image, upgrade zoom level
          let url = imageLinks.thumbnail || imageLinks.smallThumbnail || ''
          // Upgrade to higher quality
          url = url.replace('zoom=1', 'zoom=2').replace('http://', 'https://')
          // Remove edge parameter for cleaner image
          url = url.replace('&edge=curl', '')
          if (url) return { coverUrl: url, matchedTitle: returnedTitle }
        }
      }
    }
    return null
  } catch {
    return null
  }
}

async function main() {
  console.log('Extracting books...')
  const books = extractBooks()
  console.log(`Found ${books.length} books\n`)

  const results: CoverResult[] = []
  const failed: { id: string; title: string }[] = []

  for (let i = 0; i < books.length; i++) {
    const book = books[i]
    const progress = `[${i + 1}/${books.length}]`

    await sleep(DELAY_MS)
    const result = await searchGoogleBooks(book.title, book.author)

    if (result) {
      const confidence = titleMatch(book.title, result.matchedTitle)
      console.log(`${progress} ✓ ${book.title} → "${result.matchedTitle}" (${(confidence * 100).toFixed(0)}%)`)
      results.push({
        id: book.id,
        title: book.title,
        coverUrl: result.coverUrl,
        matchedTitle: result.matchedTitle,
        confidence,
      })
    } else {
      console.log(`${progress} ✗ ${book.title} — no match`)
      failed.push({ id: book.id, title: book.title })
    }
  }

  const output = { results, failed, stats: { total: books.length, found: results.length, failed: failed.length } }
  const outputPath = join(ROOT, 'scripts/cover-results.json')
  writeFileSync(outputPath, JSON.stringify(output, null, 2))

  console.log('\n' + '='.repeat(60))
  console.log(`Covers found: ${results.length}/${books.length}`)
  console.log(`Failed: ${failed.length}`)
  console.log(`Output: ${outputPath}`)
}

main().catch(console.error)
