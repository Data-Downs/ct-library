import { useState } from 'react'
import type { Book, Theme, ViewMode } from '../types'
import { BookCover } from './BookCover'

interface BookCardProps {
  book: Book
  viewMode: ViewMode
  onSelect: (book: Book) => void
  activeTheme?: Theme | null
}

function SmartCover({ book }: { book: Book }) {
  const [failed, setFailed] = useState(false)

  if (!book.links.cover || failed) {
    return <BookCover book={book} size="md" />
  }

  return (
    <img
      src={book.links.cover}
      alt={book.title}
      onError={() => setFailed(true)}
      className="w-28 h-auto rounded-sm shadow-md object-cover"
      loading="lazy"
    />
  )
}

export function BookCard({ book, viewMode, onSelect, activeTheme }: BookCardProps) {
  const themeNote = activeTheme ? book.themeNotes[activeTheme as string] : undefined

  if (viewMode === 'list') {
    return (
      <button
        onClick={() => onSelect(book)}
        className="grid grid-cols-[1fr_1fr_4rem] gap-x-4 items-baseline py-2.5 px-2 w-full text-left bg-transparent border-0 cursor-pointer group hover:bg-white transition-colors border-b border-gray-400/60"
      >
        <span className="text-base font-semibold text-fg group-hover:text-gray-600 transition-colors truncate">
          {book.title}
        </span>
        <span className="text-sm text-gray-500 truncate">
          {book.author}
        </span>
        <span className="text-sm text-gray-500 text-right tabular-nums">
          {book.year}
        </span>
      </button>
    )
  }

  return (
    <button
      onClick={() => onSelect(book)}
      className="flex flex-col items-center text-center p-3 rounded-lg hover:bg-gray-300/30 transition-colors cursor-pointer bg-transparent border-0 group"
    >
      <SmartCover book={book} />
      <h3 className="text-sm font-medium text-fg mt-2.5 mb-0.5 group-hover:text-gray-600 transition-colors leading-tight">
        {book.title}
      </h3>
      <p className="text-xs text-gray-500 m-0">
        {book.author.split('&')[0].split(',')[0].trim()}
      </p>
      {themeNote && (
        <p className="text-xs text-gray-500 leading-relaxed mt-1.5 m-0 line-clamp-3">
          {themeNote}
        </p>
      )}
    </button>
  )
}
