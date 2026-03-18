import type { Book, ViewMode } from '../types'
import { BookCover } from './BookCover'

interface BookCardProps {
  book: Book
  viewMode: ViewMode
  onSelect: (book: Book) => void
}

export function BookCard({ book, viewMode, onSelect }: BookCardProps) {
  if (viewMode === 'list') {
    return (
      <button
        onClick={() => onSelect(book)}
        className="flex gap-4 items-start p-3 rounded-lg hover:bg-warm-white transition-colors text-left w-full cursor-pointer bg-transparent border-0 group"
      >
        <BookCover book={book} size="sm" />
        <div className="flex-1 min-w-0 py-1">
          <h3 className="font-serif text-base font-semibold text-charcoal m-0 group-hover:text-terracotta transition-colors">
            {book.title}
          </h3>
          <p className="text-xs text-stone mt-0.5 mb-1.5">{book.author}</p>
          <p className="text-xs text-stone-light leading-relaxed m-0 line-clamp-2">
            {book.description}
          </p>
          <div className="flex flex-wrap gap-1.5 mt-2">
            {book.themes.map((theme) => (
              <span
                key={theme}
                className="text-[10px] px-2 py-0.5 rounded-full bg-sage-light text-sage-dark"
              >
                {theme}
              </span>
            ))}
          </div>
        </div>
      </button>
    )
  }

  return (
    <button
      onClick={() => onSelect(book)}
      className="flex flex-col items-center text-center p-3 rounded-lg hover:bg-warm-white transition-colors cursor-pointer bg-transparent border-0 group"
    >
      <BookCover book={book} size="sm" />
      <h3 className="font-serif text-xs font-semibold text-charcoal mt-2 mb-0.5 group-hover:text-terracotta transition-colors leading-tight">
        {book.title}
      </h3>
      <p className="text-[10px] text-stone m-0">
        {book.author.split('&')[0].split(',')[0].trim()}
      </p>
    </button>
  )
}
