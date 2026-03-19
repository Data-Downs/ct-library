import { useState, useMemo, useRef, useEffect } from 'react'
import { books, themeDescriptions } from '../data'
import { BookCard } from '../components/BookCard'
import { BookModal } from '../components/BookModal'
import { RecommendationCard } from '../components/RecommendationCard'
import type { Book, Genre, Subject, Theme, ViewMode, SortMode } from '../types'

const ACTIVE_GENRES: Genre[] = ['Fiction', 'Non-fiction', 'Poetry', 'Philosophy', 'Art Catalogue', 'Reference']

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

const sortOptions: { value: SortMode; label: string }[] = [
  { value: 'title', label: 'Title A–Z' },
  { value: 'author', label: 'Author A–Z' },
  { value: 'year-desc', label: 'Newest first' },
  { value: 'year-asc', label: 'Oldest first' },
]

function Dropdown({ label, activeLabel, children, className = '' }: {
  label: string
  activeLabel?: string
  children: React.ReactNode
  className?: string
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    if (open) document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [open])

  return (
    <div ref={ref} className={`relative ${className}`}>
      <button
        onClick={() => setOpen(!open)}
        className={`text-sm px-4 py-2.5 border rounded-md cursor-pointer transition-colors flex items-center gap-2 whitespace-nowrap ${
          activeLabel
            ? 'border-fg bg-fg text-bg'
            : 'border-gray-400 bg-transparent text-gray-500 hover:border-fg hover:text-fg'
        }`}
      >
        {activeLabel || label}
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
          <path d={open ? 'M2 6.5L5 3.5L8 6.5' : 'M2 3.5L5 6.5L8 3.5'} />
        </svg>
      </button>
      {open && (
        <div className="absolute top-full left-0 mt-2 bg-bg border border-gray-400 rounded-lg shadow-xl z-50 min-w-[220px] max-h-[400px] overflow-y-auto animate-[fadeIn_0.15s_ease-out]">
          <div className="p-2" onClick={() => setOpen(false)}>
            {children}
          </div>
        </div>
      )}
    </div>
  )
}

function DropdownItem({ label, count, active, onClick }: {
  label: string
  count?: number
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left text-sm px-3 py-2 rounded-md cursor-pointer transition-colors flex items-center justify-between ${
        active ? 'bg-fg text-bg' : 'bg-transparent text-fg hover:bg-gray-300/50'
      }`}
    >
      <span>{label}</span>
      {count !== undefined && <span className={`text-xs ${active ? 'text-bg/70' : 'text-gray-400'}`}>{count}</span>}
    </button>
  )
}

export function Library() {
  const [selectedGenre, setSelectedGenre] = useState<Genre | null>(null)
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null)
  const [selectedTheme, setSelectedTheme] = useState<Theme | null>(null)
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [sortMode, setSortMode] = useState<SortMode>('title')
  const [search, setSearch] = useState('')
  const [selectedBook, setSelectedBook] = useState<Book | null>(null)
  const [themesOpen, setThemesOpen] = useState(false)
  const [descriptionOpen, setDescriptionOpen] = useState(false)

  const activeBooks = useMemo(() => books.filter((b) => b.genre !== 'Cookbook'), [])

  const genreCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    activeBooks.forEach((b) => { counts[b.genre] = (counts[b.genre] || 0) + 1 })
    return counts
  }, [activeBooks])

  const genreFiltered = useMemo(() => {
    if (!selectedGenre) return activeBooks
    return activeBooks.filter((b) => b.genre === selectedGenre)
  }, [activeBooks, selectedGenre])

  const subjectCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    genreFiltered.forEach((b) => {
      b.subjects.forEach((s) => { counts[s] = (counts[s] || 0) + 1 })
    })
    return counts
  }, [genreFiltered])

  const subjectFiltered = useMemo(() => {
    if (!selectedSubject) return genreFiltered
    return genreFiltered.filter((b) => b.subjects.includes(selectedSubject))
  }, [genreFiltered, selectedSubject])

  const themeCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    activeBooks.forEach((b) => {
      b.themes.forEach((t) => { counts[t] = (counts[t] || 0) + 1 })
    })
    return counts
  }, [activeBooks])

  const filteredBooks = useMemo(() => {
    let result = subjectFiltered
    if (selectedTheme) {
      result = result.filter((b) => b.themes.includes(selectedTheme))
    }
    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter(
        (b) => b.title.toLowerCase().includes(q) || b.author.toLowerCase().includes(q)
      )
    }
    return sortBooks(result, sortMode)
  }, [subjectFiltered, selectedTheme, search, sortMode])

  const subjects = Object.keys(subjectCounts).sort() as Subject[]

  const handleGenreChange = (genre: Genre | null) => {
    setSelectedGenre(genre)
    setSelectedSubject(null)
    setSelectedTheme(null)
  }

  const handleSubjectChange = (subject: Subject | null) => {
    setSelectedSubject(subject)
    setSelectedTheme(null)
  }

  const handleThemeSelect = (theme: Theme) => {
    setSelectedTheme(selectedTheme === theme ? null : theme)
    setSelectedGenre(null)
    setSelectedSubject(null)
    setDescriptionOpen(false)
  }

  const activeFilters: { label: string; onClear: () => void }[] = []
  if (selectedGenre) activeFilters.push({ label: selectedGenre, onClear: () => handleGenreChange(null) })
  if (selectedSubject) activeFilters.push({ label: selectedSubject, onClear: () => handleSubjectChange(null) })
  if (selectedTheme) activeFilters.push({ label: selectedTheme, onClear: () => setSelectedTheme(null) })

  const selectedThemeData = selectedTheme
    ? themeDescriptions.find((t) => t.name === selectedTheme)
    : null

  const viewCls = (m: ViewMode) =>
    `px-3.5 py-2.5 text-sm cursor-pointer transition-colors ${
      viewMode === m ? 'bg-fg text-bg' : 'bg-transparent text-gray-500 hover:text-fg'
    }`

  return (
    <div className="max-w-7xl mx-auto px-6 py-16">
      {/* Header */}
      <div className="mb-10">
        <h2 className="text-4xl md:text-5xl font-normal text-fg mb-2">Library</h2>
        <p className="text-gray-500 text-base">{activeBooks.length} books across {Object.keys(genreCounts).length} genres</p>
      </div>

      {/* Compact filter bar */}
      <div className="space-y-2.5 mb-6">
        {/* Row 1 mobile: Search + view toggle */}
        <div className="flex items-center gap-2 md:hidden">
          <input
            type="text"
            placeholder="Search by title or author..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 text-sm px-4 py-2.5 border border-gray-400 rounded-md bg-transparent placeholder:text-gray-500 text-fg focus:outline-none focus:border-fg transition-colors"
          />
          <div className="flex border border-gray-400 rounded-md overflow-hidden flex-shrink-0">
            <button onClick={() => setViewMode('grid')} className={viewCls('grid')} title="Grid view">
              <svg width="16" height="16" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="1" y="1" width="5" height="5" rx="0.5" />
                <rect x="8" y="1" width="5" height="5" rx="0.5" />
                <rect x="1" y="8" width="5" height="5" rx="0.5" />
                <rect x="8" y="8" width="5" height="5" rx="0.5" />
              </svg>
            </button>
            <button onClick={() => setViewMode('list')} className={`${viewCls('list')} border-l border-gray-400`} title="List view">
              <svg width="16" height="16" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
                <line x1="1" y1="3" x2="13" y2="3" />
                <line x1="1" y1="7" x2="13" y2="7" />
                <line x1="1" y1="11" x2="13" y2="11" />
              </svg>
            </button>
          </div>
        </div>

        {/* Row 2 mobile: Type + Subject + Sort aligned | Desktop: full controls row */}
        <div className="flex items-center gap-2 md:gap-3">
          {/* Search — desktop only, inline */}
          <input
            type="text"
            placeholder="Search by title or author..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="hidden md:block flex-1 min-w-[180px] max-w-sm text-sm px-4 py-2.5 border border-gray-400 rounded-md bg-transparent placeholder:text-gray-500 text-fg focus:outline-none focus:border-fg transition-colors"
          />

          <Dropdown label="Type" activeLabel={selectedGenre ? selectedGenre : undefined}>
            <DropdownItem label="All types" count={activeBooks.length} active={selectedGenre === null} onClick={() => handleGenreChange(null)} />
            {ACTIVE_GENRES.filter((g) => genreCounts[g]).map((genre) => (
              <DropdownItem
                key={genre}
                label={genre}
                count={genreCounts[genre]}
                active={selectedGenre === genre}
                onClick={() => handleGenreChange(selectedGenre === genre ? null : genre)}
              />
            ))}
          </Dropdown>

          {subjects.length > 0 && (
            <Dropdown label="Subject" activeLabel={selectedSubject ? selectedSubject : undefined}>
              <DropdownItem label="All subjects" active={selectedSubject === null} onClick={() => handleSubjectChange(null)} />
              {subjects.map((subject) => (
                <DropdownItem
                  key={subject}
                  label={subject}
                  count={subjectCounts[subject]}
                  active={selectedSubject === subject}
                  onClick={() => handleSubjectChange(selectedSubject === subject ? null : subject)}
                />
              ))}
            </Dropdown>
          )}

          <select
            value={sortMode}
            onChange={(e) => setSortMode(e.target.value as SortMode)}
            className="text-sm px-4 py-2.5 border border-gray-400 rounded-md bg-transparent text-gray-500 cursor-pointer focus:outline-none focus:border-fg transition-colors"
          >
            {sortOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>

          {/* View toggle — desktop only */}
          <div className="hidden md:flex border border-gray-400 rounded-md overflow-hidden ml-auto">
            <button onClick={() => setViewMode('grid')} className={viewCls('grid')} title="Grid view">
              <svg width="16" height="16" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="1" y="1" width="5" height="5" rx="0.5" />
                <rect x="8" y="1" width="5" height="5" rx="0.5" />
                <rect x="1" y="8" width="5" height="5" rx="0.5" />
                <rect x="8" y="8" width="5" height="5" rx="0.5" />
              </svg>
            </button>
            <button onClick={() => setViewMode('list')} className={`${viewCls('list')} border-l border-gray-400`} title="List view">
              <svg width="16" height="16" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
                <line x1="1" y1="3" x2="13" y2="3" />
                <line x1="1" y1="7" x2="13" y2="7" />
                <line x1="1" y1="11" x2="13" y2="11" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Active filter chips */}
      {activeFilters.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-6">
          {activeFilters.map((f) => (
            <span key={f.label} className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full bg-fg text-bg">
              {f.label}
              <button onClick={f.onClear} className="cursor-pointer bg-transparent border-0 text-bg/70 hover:text-bg">
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <line x1="2" y1="2" x2="8" y2="8" /><line x1="8" y1="2" x2="2" y2="8" />
                </svg>
              </button>
            </span>
          ))}
          <button
            onClick={() => { handleGenreChange(null); setSearch('') }}
            className="text-xs text-gray-500 hover:text-fg cursor-pointer bg-transparent border-0 underline"
          >
            Clear all
          </button>
        </div>
      )}

      {/* Charlotte's Themes — accordion */}
      {!selectedTheme && (
        <div className="mb-6">
          {/* Accordion trigger */}
          <button
            onClick={() => setThemesOpen(!themesOpen)}
            className="w-full flex items-center gap-4 py-3.5 px-4 md:px-5 rounded-lg border border-gray-400 bg-transparent cursor-pointer transition-all hover:border-fg hover:shadow-sm group"
          >
            <div className="w-1 h-8 rounded-full bg-[#c45a2d] flex-shrink-0" />
            <div className="flex-1 text-left min-w-0">
              <span className="text-sm font-medium text-fg">Charlotte's Themes</span>
              <span className="text-xs text-gray-400 ml-2 hidden sm:inline">
                {themeDescriptions.filter(t => themeCounts[t.name]).length} curated journeys through the library
              </span>
            </div>
            <svg
              width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
              className={`text-[#c45a2d] flex-shrink-0 transition-transform duration-200 ${themesOpen ? 'rotate-180' : ''}`}
            >
              <path d="M3 5.5L7 9.5L11 5.5" />
            </svg>
          </button>

          {/* Accordion content */}
          <div
            className={`grid transition-all duration-300 ease-out ${
              themesOpen ? 'grid-rows-[1fr] opacity-100 mt-3' : 'grid-rows-[0fr] opacity-0 mt-0'
            }`}
          >
            <div className="overflow-hidden">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                {themeDescriptions.map(({ name, tagline }) => (
                  themeCounts[name] ? (
                    <button
                      key={name}
                      onClick={() => handleThemeSelect(name)}
                      className="text-left p-3.5 md:p-4 rounded-lg border border-gray-300 bg-transparent cursor-pointer transition-all group hover:border-fg hover:shadow-sm"
                    >
                      <h4 className="text-sm font-medium text-fg m-0 mb-1 group-hover:text-gray-600 transition-colors leading-tight">
                        {name}
                      </h4>
                      <p className="text-xs text-gray-500 m-0 leading-relaxed line-clamp-2 mb-2.5">
                        {tagline}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-400">
                          {themeCounts[name]} books
                        </span>
                        <svg
                          width="16" height="16" viewBox="0 0 16 16" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                          className="text-[#c45a2d] opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all"
                          stroke="currentColor"
                        >
                          <path d="M3 8h10" />
                          <path d="M9 4l4 4-4 4" />
                        </svg>
                      </div>
                    </button>
                  ) : null
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Active theme: description + exit */}
      {selectedThemeData && (
        <div className="mb-6 py-4 md:py-6 border-t border-b border-gray-300">
          <div className="flex items-start justify-between gap-4 mb-4">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-normal text-fg leading-tight m-0">
              {selectedThemeData.name}
            </h2>
            <button
              onClick={() => { setSelectedTheme(null); setDescriptionOpen(false) }}
              className="flex-shrink-0 text-xs text-gray-500 hover:text-fg cursor-pointer bg-transparent border border-gray-400 rounded-full px-4 py-2 hover:border-fg transition-colors whitespace-nowrap mt-2"
            >
              All themes
            </button>
          </div>
          <p className="text-lg sm:text-xl text-gray-600 leading-snug mb-3 max-w-3xl font-normal">
            {selectedThemeData.tagline}
          </p>
          <p className="text-sm md:text-base text-gray-500 leading-relaxed max-w-3xl">
            {selectedThemeData.description}
          </p>

          {/* Expandable extended description */}
          {selectedThemeData.descriptionExpanded && (
            <>
              <div
                className={`grid transition-all duration-300 ease-out ${
                  descriptionOpen ? 'grid-rows-[1fr] opacity-100 mt-4' : 'grid-rows-[0fr] opacity-0 mt-0'
                }`}
              >
                <div className="overflow-hidden">
                  <div className="max-w-3xl space-y-4">
                    {selectedThemeData.descriptionExpanded.split('\n\n').map((para, i) => (
                      <p key={i} className="text-sm md:text-base text-gray-500 leading-relaxed">
                        {para}
                      </p>
                    ))}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setDescriptionOpen(!descriptionOpen)}
                className="mt-4 flex items-center gap-2 text-xs text-gray-400 hover:text-fg cursor-pointer bg-transparent border-0 transition-colors group"
              >
                <span className="border-t border-gray-300 w-8 group-hover:border-fg transition-colors" />
                <span>{descriptionOpen ? 'Read less' : 'Read more'}</span>
                <svg
                  width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"
                  className={`transition-transform duration-200 ${descriptionOpen ? 'rotate-180' : ''}`}
                >
                  <path d="M2 4L5 7L8 4" />
                </svg>
              </button>
            </>
          )}
        </div>
      )}

      {/* Results count */}
      <p className="text-sm text-gray-500 mb-4">{filteredBooks.length} books</p>

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

      {/* Recommendations */}
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

      {selectedBook && <BookModal book={selectedBook} onClose={() => setSelectedBook(null)} />}
    </div>
  )
}
