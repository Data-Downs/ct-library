/**
 * Book Ingestion Script
 *
 * Appends new books to the master library.json file.
 *
 * Usage:
 *   npx tsx scripts/ingest.ts scripts/new-books-input.json
 *
 * Input format (from review tool or manual creation):
 * [
 *   { "title": "Being and Time", "author": "Martin Heidegger" },
 *   { "title": "The Outsider", "author": "Albert Camus" }
 * ]
 *
 * The script will:
 * 1. Skip books already in library.json (by title match)
 * 2. Look up metadata from Google Books (year, pages, description)
 * 3. Append new books to library.json with sensible defaults
 * 4. Print a summary of what was added
 */

import { readFileSync, writeFileSync } from 'fs'
import { join } from 'path'

const ROOT = join(import.meta.dirname, '..')
const LIBRARY_PATH = join(ROOT, 'src/data/library.json')
const DELAY_MS = 200

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms))

interface InputBook {
  title: string
  author: string
  note?: string
}

function slugify(title: string): string {
  return title
    .toLowerCase()
    .replace(/['']/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 60)
}

// Generate a muted cover colour from the title
function coverColour(title: string): string {
  const colours = [
    '#616161', '#795548', '#546e7a', '#455a64', '#4e342e',
    '#37474f', '#263238', '#1a237e', '#00695c', '#880e4f',
    '#4a148c', '#1b5e20', '#bf360c', '#311b92', '#827717',
  ]
  let hash = 0
  for (let i = 0; i < title.length; i++) {
    hash = title.charCodeAt(i) + ((hash << 5) - hash)
  }
  return colours[Math.abs(hash) % colours.length]
}

async function lookupGoogleBooks(title: string, author: string) {
  const authorSurname = author.split(/[,&]/).shift()?.trim().split(' ').pop() || author
  const q = encodeURIComponent(`${title} ${authorSurname}`)

  try {
    const res = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${q}&maxResults=1`, {
      signal: AbortSignal.timeout(8000),
    })
    if (!res.ok) return null
    const data = await res.json()
    const item = data.items?.[0]?.volumeInfo
    if (!item) return null

    return {
      year: item.publishedDate ? parseInt(item.publishedDate.slice(0, 4), 10) : 0,
      pages: item.pageCount || undefined,
      description: item.description?.slice(0, 500) || '',
      publisher: item.publisher || undefined,
      isbn13: item.industryIdentifiers?.find((i: any) => i.type === 'ISBN_13')?.identifier || undefined,
    }
  } catch {
    return null
  }
}

async function main() {
  const inputFile = process.argv[2]
  if (!inputFile) {
    console.error('Usage: npx tsx scripts/ingest.ts <input.json>')
    process.exit(1)
  }

  const input: InputBook[] = JSON.parse(readFileSync(inputFile, 'utf-8'))
  const library = JSON.parse(readFileSync(LIBRARY_PATH, 'utf-8'))

  const existingTitles = new Set(library.map((b: any) => b.title.toLowerCase()))
  const existingIds = new Set(library.map((b: any) => b.id))

  console.log(`Library has ${library.length} books`)
  console.log(`Input has ${input.length} books\n`)

  const added: string[] = []
  const skipped: string[] = []
  const failed: string[] = []

  for (const book of input) {
    if (existingTitles.has(book.title.toLowerCase())) {
      skipped.push(book.title)
      continue
    }

    await sleep(DELAY_MS)
    const metadata = await lookupGoogleBooks(book.title, book.author)

    let id = slugify(book.title)
    while (existingIds.has(id)) id += '-2'

    const newBook = {
      id,
      title: book.title,
      author: book.author,
      tagline: '',
      description: metadata?.description || '',
      year: metadata?.year || 0,
      ...(metadata?.pages && { pages: metadata.pages }),
      ...(metadata?.isbn13 && { isbn13: metadata.isbn13 }),
      ...(metadata?.publisher && { publisher: metadata.publisher }),
      coverColour: coverColour(book.title),
      genre: 'Non-fiction',
      subjects: [],
      themes: [],
      themeNotes: {},
      links: {},
      dateAdded: new Date().toISOString().slice(0, 10),
      source: inputFile.split('/').pop(),
    }

    library.push(newBook)
    existingIds.add(id)
    existingTitles.add(book.title.toLowerCase())
    added.push(book.title)
    console.log(`  + ${book.title}`)
  }

  // Sort by id
  library.sort((a: any, b: any) => a.id.localeCompare(b.id))

  // Write back
  writeFileSync(LIBRARY_PATH, JSON.stringify(library, null, 2))

  console.log('\n' + '='.repeat(50))
  console.log(`Added: ${added.length}`)
  console.log(`Skipped (already in library): ${skipped.length}`)
  console.log(`Library now has ${library.length} books`)
}

main().catch(console.error)
