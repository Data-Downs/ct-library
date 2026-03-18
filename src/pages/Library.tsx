import { useState, useMemo } from 'react'
import { books } from '../data/books'
import { BookCard } from '../components/BookCard'
import { BookModal } from '../components/BookModal'
import { ThemeFilter } from '../components/ThemeFilter'
import { SortControl } from '../components/SortControl'
import { ViewToggle } from '../components/ViewToggle'
import type { Book, Theme, ViewMode, SortMode } from '../types'

type Section = 'library' | 'cookbooks'

function sortBooks(list: Book[], mode: SortMode): Book[] {
  return [...list].sort((a, b) => {
    switch (mode) {
      case 'title':
        return a.title.localeCompare(b.title)
      case 'author': {
        const aLast = a.author.split(' ').pop() || ''
        const bLast = b.author.split(' ').pop() || ''
        return aLast.localeCompare(bLast)
      }
      case 'year-asc':
        return a.year - b.year
      case 'year-desc':
        return b.year - a.year
    }
  })
}

export function Library() {
  const [section, setSection] = useState<Section>('library')
  const [selectedTheme, setSelectedTheme] = useState<Theme | null>(null)
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [sortMode, setSortMode] = useState<SortMode>('title')
  const [search, setSearch] = useState('')
  const [selectedBook, setSelectedBook] = useState<Book | null>(null)

  const libraryBooks = useMemo(() => books.filter((b) => !b.isCookbook), [])
  const cookbookBooks = useMemo(() => books.filter((b) => b.isCookbook), [])

  const bookCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    libraryBooks.forEach((book) => {
      book.themes.forEach((theme) => {
        counts[theme] = (counts[theme] || 0) + 1
      })
    })
    return counts
  }, [libraryBooks])

  const activeBooks = section === 'library' ? libraryBooks : cookbookBooks

  const filteredBooks = useMemo(() => {
    let result = activeBooks
    if (section === 'library' && selectedTheme) {
      result = result.filter((b) => b.themes.includes(selectedTheme))
    }
    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter(
        (b) =>
          b.title.toLowerCase().includes(q) ||
          b.author.toLowerCase().includes(q)
      )
    }
    return sortBooks(result, sortMode)
  }, [activeBooks, selectedTheme, search, section, sortMode])

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      {/* Header area */}
      <div className="mb-8">
        <h2 className="font-serif text-4xl font-medium text-charcoal mb-2">
          The Library
        </h2>
        <p className="text-stone text-base">
          {libraryBooks.length} books across {Object.keys(bookCounts).length} themes
          {cookbookBooks.length > 0 && ` · ${cookbookBooks.length} cookbooks`}
        </p>
      </div>

      {/* Section toggle */}
      <div className="flex gap-6 mb-6 border-b border-stone-light/40">
        <button
          onClick={() => { setSection('library'); setSelectedTheme(null) }}
          className={`pb-2.5 text-base font-medium border-b-2 transition-colors cursor-pointer bg-transparent ${
            section === 'library'
              ? 'border-charcoal text-charcoal'
              : 'border-transparent text-stone hover:text-charcoal'
          }`}
        >
          Library
        </button>
        <button
          onClick={() => { setSection('cookbooks'); setSelectedTheme(null) }}
          className={`pb-2.5 text-base font-medium border-b-2 transition-colors cursor-pointer bg-transparent ${
            section === 'cookbooks'
              ? 'border-charcoal text-charcoal'
              : 'border-transparent text-stone hover:text-charcoal'
          }`}
        >
          Cookbooks
        </button>
      </div>

      {/* Controls row: search, sort, view */}
      <div className="flex items-center gap-4 flex-wrap mb-4">
        <input
          type="text"
          placeholder="Search by title or author..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 min-w-[200px] max-w-md text-base px-4 py-2.5 border border-stone-light rounded-md bg-transparent placeholder:text-stone-light focus:outline-none focus:border-charcoal transition-colors"
        />
        <SortControl mode={sortMode} onChange={setSortMode} />
        <ViewToggle mode={viewMode} onChange={setViewMode} />
      </div>

      {/* Charlotte's themes (library section only) */}
      {section === 'library' && (
        <div className="mb-8">
          <ThemeFilter
            selected={selectedTheme}
            onSelect={setSelectedTheme}
            bookCounts={bookCounts}
          />
        </div>
      )}

      {/* Book grid or list */}
      {filteredBooks.length === 0 ? (
        <p className="text-center text-stone text-base py-12">No books found.</p>
      ) : viewMode === 'grid' ? (
        <div className={selectedTheme
          ? 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2'
          : 'grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2'
        }>
          {filteredBooks.map((book) => (
            <BookCard key={book.id} book={book} viewMode="grid" onSelect={setSelectedBook} activeTheme={selectedTheme} />
          ))}
        </div>
      ) : (
        <div>
          {/* Column header */}
          <div className="grid grid-cols-[1fr_1fr_4rem] gap-x-4 px-2 pb-2 border-b border-stone-light/60">
            <span className="text-xs text-stone uppercase tracking-wider">Title</span>
            <span className="text-xs text-stone uppercase tracking-wider">Author</span>
            <span className="text-xs text-stone uppercase tracking-wider text-right">Year</span>
          </div>
          <div>
            {filteredBooks.map((book) => (
              <div key={book.id} className="border-b border-stone-light/20">
                <BookCard book={book} viewMode="list" onSelect={setSelectedBook} activeTheme={selectedTheme} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Book detail modal */}
      {selectedBook && (
        <BookModal book={selectedBook} onClose={() => setSelectedBook(null)} />
      )}
    </div>
  )
}
