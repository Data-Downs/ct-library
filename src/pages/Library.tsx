import { useState, useMemo } from 'react'
import { books, themeDescriptions } from '../data/books'
import { BookCard } from '../components/BookCard'
import { BookModal } from '../components/BookModal'
import { RecommendationCard } from '../components/RecommendationCard'
import { GenreFilter } from '../components/GenreFilter'
import { SubjectFilter } from '../components/SubjectFilter'
import { ThemeFilter } from '../components/ThemeFilter'
import { SortControl } from '../components/SortControl'
import { ViewToggle } from '../components/ViewToggle'
import type { Book, Genre, Subject, Theme, ViewMode, SortMode } from '../types'

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
  const [selectedGenre, setSelectedGenre] = useState<Genre | null>(null)
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null)
  const [selectedTheme, setSelectedTheme] = useState<Theme | null>(null)
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [sortMode, setSortMode] = useState<SortMode>('title')
  const [search, setSearch] = useState('')
  const [selectedBook, setSelectedBook] = useState<Book | null>(null)

  // Genre counts (always from full library)
  const genreCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    books.forEach((b) => { counts[b.genre] = (counts[b.genre] || 0) + 1 })
    return counts
  }, [])

  // Books filtered by genre
  const genreFiltered = useMemo(() => {
    if (!selectedGenre) return books
    return books.filter((b) => b.genre === selectedGenre)
  }, [selectedGenre])

  // Subject counts (from genre-filtered books)
  const subjectCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    genreFiltered.forEach((b) => {
      b.subjects.forEach((s) => { counts[s] = (counts[s] || 0) + 1 })
    })
    return counts
  }, [genreFiltered])

  // Books filtered by genre + subject
  const subjectFiltered = useMemo(() => {
    if (!selectedSubject) return genreFiltered
    return genreFiltered.filter((b) => b.subjects.includes(selectedSubject))
  }, [genreFiltered, selectedSubject])

  // Theme counts (from genre+subject filtered, excluding cookbooks)
  const themeCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    subjectFiltered.forEach((b) => {
      b.themes.forEach((t) => { counts[t] = (counts[t] || 0) + 1 })
    })
    return counts
  }, [subjectFiltered])

  // Final filtered + sorted books
  const filteredBooks = useMemo(() => {
    let result = subjectFiltered
    if (selectedTheme) {
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
  }, [subjectFiltered, selectedTheme, search, sortMode])

  const showThemes = selectedGenre !== 'Cookbook' && selectedGenre !== 'Reference'

  const handleGenreChange = (genre: Genre | null) => {
    setSelectedGenre(genre)
    setSelectedSubject(null)
    setSelectedTheme(null)
  }

  const handleSubjectChange = (subject: Subject | null) => {
    setSelectedSubject(subject)
    setSelectedTheme(null)
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-16">
      {/* Header */}
      <div className="mb-10">
        <h2 className="text-4xl md:text-5xl font-normal text-fg mb-2">
          Library
        </h2>
        <p className="text-gray-500 text-base">
          {books.length} books across {Object.keys(genreCounts).length} genres
        </p>
      </div>

      {/* Genre tabs */}
      <div className="mb-6">
        <GenreFilter
          selected={selectedGenre}
          onSelect={handleGenreChange}
          counts={genreCounts}
        />
      </div>

      {/* Controls row */}
      <div className="flex items-center gap-4 flex-wrap mb-4">
        <input
          type="text"
          placeholder="Search by title or author..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 min-w-[200px] max-w-md text-base px-4 py-2.5 border border-gray-400 rounded-md bg-transparent placeholder:text-gray-500 text-fg focus:outline-none focus:border-fg transition-colors"
        />
        <SortControl mode={sortMode} onChange={setSortMode} />
        <ViewToggle mode={viewMode} onChange={setViewMode} />
      </div>

      {/* Subject filter */}
      {Object.keys(subjectCounts).length > 0 && (
        <div className="mb-4">
          <SubjectFilter
            selected={selectedSubject}
            onSelect={handleSubjectChange}
            counts={subjectCounts}
          />
        </div>
      )}

      {/* Charlotte's themes */}
      {showThemes && Object.keys(themeCounts).length > 0 && (
        <div className="mb-8">
          <ThemeFilter
            selected={selectedTheme}
            onSelect={setSelectedTheme}
            bookCounts={themeCounts}
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
            <span className="text-xs text-gray-500">Title</span>
            <span className="text-xs text-gray-500">Author</span>
            <span className="text-xs text-gray-500 text-right">Year</span>
          </div>
          <div>
            {filteredBooks.map((book) => (
              <BookCard key={book.id} book={book} viewMode="list" onSelect={setSelectedBook} activeTheme={selectedTheme} />
            ))}
          </div>
        </div>
      )}

      {/* Recommendations (when theme is active) */}
      {selectedTheme && (() => {
        const themeData = themeDescriptions.find((t) => t.name === selectedTheme)
        if (!themeData?.recommendations?.length) return null
        return (
          <div className="mt-14">
            <div className="border-t border-gray-400 pt-6 mb-6">
              <h3 className="text-lg font-normal text-fg m-0">Recommendations</h3>
              <p className="text-sm text-gray-500 mt-1">Other books along the lines of this theme</p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              {themeData.recommendations.map((rec) => (
                <RecommendationCard key={rec.title} rec={rec} />
              ))}
            </div>
          </div>
        )
      })()}

      {selectedBook && (
        <BookModal book={selectedBook} onClose={() => setSelectedBook(null)} />
      )}
    </div>
  )
}
