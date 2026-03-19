/**
 * One-time migration: consolidate 3 TS data files into clean JSON.
 *
 * Produces:
 *   src/data/library.json  — all books, clean schema
 *   src/data/themes.json   — theme descriptions
 *   src/data/hero.json     — hero selection
 */

import { readFileSync, writeFileSync } from 'fs'
import { join } from 'path'

const ROOT = join(import.meta.dirname, '..')

// We dynamically import the existing TS modules
async function main() {
  // Import the current data (these files are valid TS modules)
  const booksModule = await import(join(ROOT, 'src/data/books.ts'))
  const newBooksModule = await import(join(ROOT, 'src/data/new-books.ts'))
  const reviewedBooksModule = await import(join(ROOT, 'src/data/reviewed-books.ts'))

  // Use the merged export which already combines all three arrays
  const mergedBooks = booksModule.books || []
  const themeDescriptions = booksModule.themeDescriptions || []
  const heroSelection = booksModule.heroSelection || {}

  console.log(`Found ${mergedBooks.length} books`)
  console.log(`Found ${themeDescriptions.length} theme descriptions`)

  // Deduplicate by id
  const seen = new Set<string>()
  const deduped: any[] = []
  for (const book of mergedBooks) {
    if (seen.has(book.id)) {
      console.log(`  Duplicate: ${book.id} — skipping`)
      continue
    }
    seen.add(book.id)
    deduped.push(book)
  }

  // Map to new schema
  const library = deduped.map((b: any) => {
    const dateAdded = b.source === 'initial' ? '2026-03-01'
      : b.source?.includes('review') ? '2026-03-18'
      : '2026-03-15'

    return {
      id: b.id,
      title: b.title,
      author: b.author,
      tagline: b.description || '',          // old "description" → "tagline"
      description: b.synopsis || '',         // old "synopsis" → "description"
      year: b.year,
      ...(b.pages && { pages: b.pages }),
      coverColour: b.coverColour || '#616161',
      genre: b.genre || 'Non-fiction',
      subjects: b.subjects || [],
      themes: (b.themes || []).filter((t: string) =>
        ['The Politics of Otherness', 'Seeing and Power', 'What Lies Beneath',
         'Ruins and Resilience', 'The Body as Battleground', 'Place and Belonging',
         'Consciousness and the Sacred', 'The Machine and the Human'].includes(t)
      ),
      themeNotes: b.themeNotes || {},
      links: {
        ...(b.amazonUrl && { amazon: b.amazonUrl }),
        // Don't migrate coverUrl — it was unreliable
      },
      dateAdded,
    }
  })

  // Sort by id for stable diffs
  library.sort((a: any, b: any) => a.id.localeCompare(b.id))

  // Validate
  let errors = 0
  for (const book of library) {
    if (!book.id || !book.title || !book.author) {
      console.error(`  Invalid: missing id/title/author — ${JSON.stringify(book).slice(0, 100)}`)
      errors++
    }
    if (!book.genre) {
      console.error(`  Invalid: missing genre for ${book.id}`)
      errors++
    }
    if (!book.coverColour?.match(/^#[0-9a-fA-F]{6}$/)) {
      console.warn(`  Warning: invalid coverColour for ${book.id}: ${book.coverColour}`)
    }
  }

  if (errors > 0) {
    console.error(`\n${errors} validation errors found`)
  }

  // Write outputs
  writeFileSync(
    join(ROOT, 'src/data/library.json'),
    JSON.stringify(library, null, 2)
  )
  console.log(`\nWrote src/data/library.json (${library.length} books)`)

  writeFileSync(
    join(ROOT, 'src/data/themes.json'),
    JSON.stringify(themeDescriptions, null, 2)
  )
  console.log(`Wrote src/data/themes.json (${themeDescriptions.length} themes)`)

  writeFileSync(
    join(ROOT, 'src/data/hero.json'),
    JSON.stringify(heroSelection, null, 2)
  )
  console.log(`Wrote src/data/hero.json`)

  console.log('\nDone. Now:')
  console.log('  1. Create src/data/index.ts')
  console.log('  2. Update component imports')
  console.log('  3. Delete old TS data files')
}

main().catch(console.error)
