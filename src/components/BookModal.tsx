import { useEffect, useRef } from 'react'
import type { Book } from '../types'
import { BookCover } from './BookCover'

interface BookModalProps {
  book: Book
  onClose: () => void
}

export function BookModal({ book, onClose }: BookModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleEsc)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handleEsc)
      document.body.style.overflow = ''
    }
  }, [onClose])

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current) onClose()
  }

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className="fixed inset-0 z-50 bg-charcoal/40 backdrop-blur-sm flex items-start justify-center overflow-y-auto py-8 px-4"
    >
      <div
        ref={panelRef}
        className="bg-cream rounded-xl shadow-2xl max-w-2xl w-full my-auto animate-[fadeIn_0.2s_ease-out]"
      >
        {/* Header with close button */}
        <div className="flex justify-end p-4 pb-0">
          <button
            onClick={onClose}
            className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-warm-white transition-colors cursor-pointer text-stone hover:text-charcoal"
            aria-label="Close"
          >
            <svg width="18" height="18" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="4" y1="4" x2="12" y2="12" />
              <line x1="12" y1="4" x2="4" y2="12" />
            </svg>
          </button>
        </div>

        {/* Book content */}
        <div className="px-8 pb-8">
          <div className="flex flex-col sm:flex-row gap-6 mb-6">
            {/* Cover */}
            <div className="flex-shrink-0 self-center sm:self-start">
              <BookCover book={book} size="lg" />
            </div>

            {/* Title and meta */}
            <div className="flex-1 min-w-0">
              <h2 className="font-serif text-3xl font-semibold text-charcoal mb-1 leading-tight">
                {book.title}
              </h2>
              <p className="text-base text-stone mb-4">{book.author}</p>

              {/* Meta row */}
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-stone mb-4">
                <span>Published {book.year}</span>
                {book.pages && <span>{book.pages} pages</span>}
              </div>

              {/* Themes */}
              {book.themes.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {book.themes.map((theme) => (
                    <span
                      key={theme}
                      className="text-xs px-2.5 py-1 rounded-full bg-sage-light text-sage-dark"
                    >
                      {theme}
                    </span>
                  ))}
                </div>
              )}

              {/* Short description */}
              <p className="text-base text-charcoal/70 leading-relaxed italic">
                {book.description}
              </p>
            </div>
          </div>

          {/* Synopsis */}
          <div className="border-t border-stone-light/40 pt-6 mb-6">
            <h3 className="font-serif text-xl font-medium text-charcoal mb-3">Synopsis</h3>
            <p className="text-base text-charcoal/80 leading-relaxed">
              {book.synopsis}
            </p>
          </div>

          {/* Amazon link */}
          <div className="flex justify-center">
            <a
              href={book.amazonUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-base font-medium text-cream bg-charcoal px-7 py-3 rounded-full no-underline hover:bg-charcoal/80 transition-colors"
            >
              <svg width="18" height="18" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 3H3v10h10v-3" />
                <path d="M9 2h5v5" />
                <path d="M14 2L7 9" />
              </svg>
              View on Amazon
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
