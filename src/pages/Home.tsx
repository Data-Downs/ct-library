import { useState } from 'react'
import { books, heroSelection } from '../data'
import { BookCover } from '../components/BookCover'
import { BookModal } from '../components/BookModal'
import { Link } from 'react-router-dom'
import type { Book } from '../types'

export function Home() {
  const [selectedBook, setSelectedBook] = useState<Book | null>(null)

  const heroBooks = heroSelection.picks.map((pick) => ({
    ...pick,
    book: books.find((b) => b.id === pick.bookId)!,
  }))

  return (
    <div className="max-w-3xl mx-auto px-6 py-20">
      {/* Hero intro */}
      <section className="mb-20">
        <h2 className="text-5xl md:text-7xl font-normal text-fg mb-6 leading-tight">
          {heroSelection.title}
        </h2>
        <p className="text-gray-600 text-lg leading-relaxed">
          {heroSelection.description}
        </p>
      </section>

      {/* Hero book picks */}
      <section className="space-y-16 mb-20">
        {heroBooks.map(({ book, note }) => (
          <article
            key={book.id}
            className="border-t border-gray-400 pt-10"
          >
            <div className="flex flex-col md:flex-row gap-8 items-start">
              <button
                onClick={() => setSelectedBook(book)}
                className="flex-shrink-0 hover:opacity-80 transition-opacity cursor-pointer bg-transparent border-0 p-0"
              >
                <BookCover book={book} size="lg" />
              </button>
              <div className="flex-1">
                <button
                  onClick={() => setSelectedBook(book)}
                  className="bg-transparent border-0 p-0 cursor-pointer text-left"
                >
                  <h3 className="text-2xl font-normal text-fg mb-1 hover:text-gray-600 transition-colors">
                    {book.title}
                  </h3>
                </button>
                <p className="text-sm text-gray-500 mb-4">{book.author}</p>
                <p className="text-base text-gray-600 leading-relaxed mb-5">
                  {book.tagline}
                </p>
                <blockquote className="border-l-2 border-gray-300 pl-4">
                  <p className="text-base text-gray-500 leading-relaxed italic">
                    "{note}"
                  </p>
                </blockquote>
              </div>
            </div>
          </article>
        ))}
      </section>

      {/* Link to library */}
      <section className="text-center py-10 border-t border-gray-400">
        <p className="text-gray-500 text-base mb-4">View the full collection</p>
        <Link
          to="/library"
          className="inline-block text-sm text-fg border-b-2 border-gray-900 pb-1 no-underline hover:text-gray-600 hover:border-gray-500 transition-colors"
        >
          Browse the Library
        </Link>
      </section>

      {selectedBook && (
        <BookModal book={selectedBook} onClose={() => setSelectedBook(null)} />
      )}
    </div>
  )
}
