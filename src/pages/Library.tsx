import { useState, useMemo } from 'react'
import { books } from '../data/books'
import { BookCard } from '../components/BookCard'
import { BookModal } from '../components/BookModal'
import { ThemeFilter } from '../components/ThemeFilter'
import { ViewToggle } from '../components/ViewToggle'
import type { Book, Theme, ViewMode } from '../types'

type Section = 'library' | 'cookbooks'

export function Library() {
  const [section, setSection] = useState<Section>('library')
  const [selectedTheme, setSelectedTheme] = useState<Theme | null>(null)
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
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
    return result.sort((a, b) => a.title.localeCompare(b.title))
  }, [activeBooks, selectedTheme, search, section])

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      {/* Header area */}
      <div className="mb-8">
        <h2 className="font-serif text-3xl font-medium text-charcoal mb-1">
          The Library
        </h2>
        <p className="text-stone text-sm">
          {libraryBooks.length} books across {Object.keys(bookCounts).length} themes
          {cookbookBooks.length > 0 && ` · ${cookbookBooks.length} cookbooks`}
        </p>
      </div>

      {/* Section toggle */}
      <div className="flex gap-4 mb-6 border-b border-stone-light/40">
        <button
          onClick={() => { setSection('library'); setSelectedTheme(null) }}
          className={`pb-2 text-sm font-medium border-b-2 transition-colors cursor-pointer bg-transparent ${
            section === 'library'
              ? 'border-charcoal text-charcoal'
              : 'border-transparent text-stone hover:text-charcoal'
          }`}
        >
          Library
        </button>
        <button
          onClick={() => { setSection('cookbooks'); setSelectedTheme(null) }}
          className={`pb-2 text-sm font-medium border-b-2 transition-colors cursor-pointer bg-transparent ${
            section === 'cookbooks'
              ? 'border-charcoal text-charcoal'
              : 'border-transparent text-stone hover:text-charcoal'
          }`}
        >
          Cookbooks
        </button>
      </div>

      {/* Controls */}
      <div className="flex flex-col gap-4 mb-8">
        <div className="flex items-center gap-4 flex-wrap">
          <input
            type="text"
            placeholder="Search by title or author..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 min-w-[200px] text-sm px-4 py-2 border border-stone-light rounded-md bg-transparent placeholder:text-stone-light focus:outline-none focus:border-charcoal transition-colors"
          />
          <ViewToggle mode={viewMode} onChange={setViewMode} />
        </div>
        {section === 'library' && (
          <ThemeFilter
            selected={selectedTheme}
            onSelect={setSelectedTheme}
            bookCounts={bookCounts}
            totalBooks={libraryBooks.length}
          />
        )}
      </div>

      {/* Book grid/list */}
      {filteredBooks.length === 0 ? (
        <p className="text-center text-stone py-12">No books found.</p>
      ) : viewMode === 'grid' ? (
        <div className={selectedTheme
          ? 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-1'
          : 'grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7 gap-1'
        }>
          {filteredBooks.map((book) => (
            <BookCard key={book.id} book={book} viewMode="grid" onSelect={setSelectedBook} activeTheme={selectedTheme} />
          ))}
        </div>
      ) : (
        <div className="divide-y divide-stone-light/30">
          {filteredBooks.map((book) => (
            <BookCard key={book.id} book={book} viewMode="list" onSelect={setSelectedBook} activeTheme={selectedTheme} />
          ))}
        </div>
      )}

      {/* Book detail modal */}
      {selectedBook && (
        <BookModal book={selectedBook} onClose={() => setSelectedBook(null)} />
      )}
    </div>
  )
}
