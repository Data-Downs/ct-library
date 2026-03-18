import { useEffect, useRef } from 'react'
import type { Book } from '../types'
import { BookCover } from './BookCover'

interface BookModalProps {
  book: Book
  onClose: () => void
}

export function BookModal({ book, onClose }: BookModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null)

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
      className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm flex items-start justify-center overflow-y-auto py-8 px-4"
    >
      <div className="bg-bg rounded-lg shadow-2xl max-w-2xl w-full my-auto animate-[fadeIn_0.2s_ease-out]">
        <div className="flex justify-end p-4 pb-0">
          <button
            onClick={onClose}
            className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-300/50 transition-colors cursor-pointer text-gray-500 hover:text-fg"
            aria-label="Close"
          >
            <svg width="18" height="18" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="4" y1="4" x2="12" y2="12" />
              <line x1="12" y1="4" x2="4" y2="12" />
            </svg>
          </button>
        </div>

        <div className="px-8 pb-8">
          <div className="flex flex-col sm:flex-row gap-6 mb-6">
            <div className="flex-shrink-0 self-center sm:self-start">
              <BookCover book={book} size="lg" />
            </div>

            <div className="flex-1 min-w-0">
              <h2 className="text-3xl font-normal text-fg mb-1 leading-tight">
                {book.title}
              </h2>
              <p className="text-sm text-gray-500 mb-4">{book.author}</p>

              <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-500 mb-4">
                <span>{book.genre}</span>
                <span>Published {book.year}</span>
                {book.pages && <span>{book.pages} pages</span>}
              </div>

              {book.subjects.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {book.subjects.map((subject) => (
                    <span key={subject} className="text-xs px-2.5 py-1 rounded-full border border-gray-400 text-gray-600">
                      {subject}
                    </span>
                  ))}
                </div>
              )}

              {book.themes.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {book.themes.map((theme) => (
                    <span
                      key={theme}
                      className="text-xs px-2.5 py-1 rounded-full bg-gray-300/50 text-gray-600"
                    >
                      {theme}
                    </span>
                  ))}
                </div>
              )}

              <p className="text-base text-gray-500 leading-relaxed italic">
                {book.description}
              </p>
            </div>
          </div>

          <div className="border-t border-gray-300 pt-6 mb-6">
            <h3 className="text-xl font-normal text-fg mb-3">Synopsis</h3>
            <p className="text-base text-gray-600 leading-relaxed">
              {book.synopsis}
            </p>
          </div>

          <div className="flex justify-center">
            <a
              href={book.amazonUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm text-fg border-b-2 border-gray-900 pb-1 no-underline hover:text-gray-600 hover:border-gray-500 transition-colors"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
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
