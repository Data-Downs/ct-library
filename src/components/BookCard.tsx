import { useState, useCallback } from 'react'
import type { Book, Theme, ViewMode } from '../types'
import { BookCover } from './BookCover'
import { getCoverImageUrl } from '../utils/coverImage'

interface BookCardProps {
  book: Book
  viewMode: ViewMode
  onSelect: (book: Book) => void
  activeTheme?: Theme | null
}

function SmartCover({ book }: { book: Book }) {
  const [failed, setFailed] = useState(false)
  const imageUrl = getCoverImageUrl(book.amazonUrl)

  const handleLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget
    if (img.naturalWidth <= 1 || img.naturalHeight <= 1) {
      setFailed(true)
    }
  }, [])

  if (failed || !imageUrl) {
    return <BookCover book={book} size="md" />
  }

  return (
    <img
      src={imageUrl}
      alt={book.title}
      onError={() => setFailed(true)}
      onLoad={handleLoad}
      className="w-28 h-auto rounded-sm shadow-md object-cover"
      loading="lazy"
    />
  )
}

export function BookCard({ book, viewMode, onSelect, activeTheme }: BookCardProps) {
  const themeNote = activeTheme ? book.themeNotes[activeTheme] : undefined

  if (viewMode === 'list') {
    return (
      <button
        onClick={() => onSelect(book)}
        className="grid grid-cols-[1fr_1fr_4rem] gap-x-4 items-baseline py-2.5 px-2 w-full text-left bg-transparent border-0 cursor-pointer group hover:bg-warm-white transition-colors"
      >
        <span className="font-serif text-base font-medium text-charcoal group-hover:text-terracotta transition-colors truncate">
          {book.title}
        </span>
        <span className="text-sm text-stone truncate">
          {book.author}
        </span>
        <span className="text-sm text-stone-light text-right tabular-nums">
          {book.year}
        </span>
      </button>
    )
  }

  // Grid view — real cover images with HTML fallback
  return (
    <button
      onClick={() => onSelect(book)}
      className="flex flex-col items-center text-center p-3 rounded-lg hover:bg-warm-white transition-colors cursor-pointer bg-transparent border-0 group"
    >
      <SmartCover book={book} />
      <h3 className="font-serif text-sm font-semibold text-charcoal mt-2.5 mb-0.5 group-hover:text-terracotta transition-colors leading-tight">
        {book.title}
      </h3>
      <p className="text-xs text-stone m-0">
        {book.author.split('&')[0].split(',')[0].trim()}
      </p>
      {themeNote && (
        <p className="text-xs text-charcoal/60 leading-relaxed mt-1.5 m-0 line-clamp-3">
          {themeNote}
        </p>
      )}
    </button>
  )
}
