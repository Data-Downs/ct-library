import type { Book, Theme, ViewMode } from '../types'
import { BookCover } from './BookCover'

interface BookCardProps {
  book: Book
  viewMode: ViewMode
  onSelect: (book: Book) => void
  activeTheme?: Theme | null
}

export function BookCard({ book, viewMode, onSelect, activeTheme }: BookCardProps) {
  const themeNote = activeTheme ? book.themeNotes[activeTheme] : undefined

  if (viewMode === 'list') {
    return (
      <button
        onClick={() => onSelect(book)}
        className="flex gap-5 items-start p-4 rounded-lg hover:bg-warm-white transition-colors text-left w-full cursor-pointer bg-transparent border-0 group"
      >
        <BookCover book={book} size="sm" />
        <div className="flex-1 min-w-0 py-1">
          <h3 className="font-serif text-lg font-semibold text-charcoal m-0 group-hover:text-terracotta transition-colors">
            {book.title}
          </h3>
          <p className="text-sm text-stone mt-0.5 mb-2">{book.author}</p>
          {themeNote ? (
            <p className="text-sm text-charcoal/70 leading-relaxed m-0 line-clamp-3">
              {themeNote}
            </p>
          ) : (
            <p className="text-sm text-stone-light leading-relaxed m-0 line-clamp-2">
              {book.description}
            </p>
          )}
          {book.themes.length > 0 && !activeTheme && (
            <div className="flex flex-wrap gap-1.5 mt-2.5">
              {book.themes.map((theme) => (
                <span
                  key={theme}
                  className="text-xs px-2.5 py-0.5 rounded-full bg-sage-light text-sage-dark"
                >
                  {theme}
                </span>
              ))}
            </div>
          )}
        </div>
      </button>
    )
  }

  return (
    <button
      onClick={() => onSelect(book)}
      className={`flex flex-col items-start text-left p-3 rounded-lg hover:bg-warm-white transition-colors cursor-pointer bg-transparent border-0 group ${
        themeNote ? '' : 'items-center text-center'
      }`}
    >
      <div className={themeNote ? '' : 'self-center'}>
        <BookCover book={book} size="sm" />
      </div>
      <h3 className="font-serif text-sm font-semibold text-charcoal mt-2 mb-0.5 group-hover:text-terracotta transition-colors leading-tight">
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
