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
    <div className="max-w-7xl mx-auto px-6 py-16">
      {/* Header area */}
      <div className="mb-10">
        <h2 className="text-4xl md:text-5xl font-normal text-fg mb-2">
          Library
        </h2>
        <p className="text-gray-500 text-base">
          {libraryBooks.length} books across {Object.keys(bookCounts).length} themes
          {cookbookBooks.length > 0 && ` · ${cookbookBooks.length} cookbooks`}
        </p>
      </div>

      {/* Section toggle */}
      <div className="flex gap-6 mb-8 border-b border-gray-400">
        <button
          onClick={() => { setSection('library'); setSelectedTheme(null) }}
          className={`pb-2.5 text-sm transition-colors cursor-pointer bg-transparent border-b-2 ${
            section === 'library'
              ? 'border-fg text-fg font-semibold'
              : 'border-transparent text-gray-500 hover:text-fg'
          }`}
        >
          Library
        </button>
        <button
          onClick={() => { setSection('cookbooks'); setSelectedTheme(null) }}
          className={`pb-2.5 text-sm transition-colors cursor-pointer bg-transparent border-b-2 ${
            section === 'cookbooks'
              ? 'border-fg text-fg font-semibold'
              : 'border-transparent text-gray-500 hover:text-fg'
          }`}
        >
          Cookbooks
        </button>
      </div>

      {/* Controls row */}
      <div className="flex items-center gap-4 flex-wrap mb-4">
        <input
          type="text"
          placeholder="Search by title or author..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 min-w-[200px] max-w-md text-base px-4 py-2.5 border border-gray-400 rounded-md bg-transparent placeholder:text-gray-400 text-fg focus:outline-none focus:border-fg transition-colors"
        />
        <SortControl mode={sortMode} onChange={setSortMode} />
        <ViewToggle mode={viewMode} onChange={setViewMode} />
      </div>

      {/* Charlotte's themes */}
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
        <p className="text-center text-gray-500 text-base py-16">No books found.</p>
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
          <div className="grid grid-cols-[1fr_1fr_4rem] gap-x-4 px-2 pb-2 border-b border-gray-400">
            <span className="text-xs text-gray-400">Title</span>
            <span className="text-xs text-gray-400">Author</span>
            <span className="text-xs text-gray-400 text-right">Year</span>
          </div>
          <div>
            {filteredBooks.map((book) => (
              <div key={book.id} className="border-b border-gray-300/50">
                <BookCard book={book} viewMode="list" onSelect={setSelectedBook} activeTheme={selectedTheme} />
              </div>
            ))}
          </div>
        </div>
      )}

      {selectedBook && (
        <BookModal book={selectedBook} onClose={() => setSelectedBook(null)} />
      )}
    </div>
  )
}
