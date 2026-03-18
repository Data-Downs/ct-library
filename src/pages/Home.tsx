import { useState } from 'react'
import { books, heroSelection } from '../data/books'
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
    <div className="max-w-4xl mx-auto px-6 py-12">
      {/* Hero intro */}
      <section className="mb-16 text-center">
        <h2 className="font-serif text-5xl md:text-6xl font-medium text-charcoal mb-5 tracking-tight">
          {heroSelection.title}
        </h2>
        <p className="text-stone text-base md:text-lg leading-relaxed max-w-2xl mx-auto">
          {heroSelection.description}
        </p>
      </section>

      {/* Hero book picks */}
      <section className="space-y-14 mb-16">
        {heroBooks.map(({ book, note }, i) => (
          <article
            key={book.id}
            className={`flex flex-col md:flex-row gap-8 items-start ${
              i % 2 === 1 ? 'md:flex-row-reverse' : ''
            }`}
          >
            <button
              onClick={() => setSelectedBook(book)}
              className="flex-shrink-0 hover:scale-105 transition-transform cursor-pointer bg-transparent border-0 p-0"
            >
              <BookCover book={book} size="lg" />
            </button>
            <div className="flex-1">
              <button
                onClick={() => setSelectedBook(book)}
                className="bg-transparent border-0 p-0 cursor-pointer text-left"
              >
                <h3 className="font-serif text-3xl font-semibold text-charcoal mb-1 hover:text-terracotta transition-colors">
                  {book.title}
                </h3>
              </button>
              <p className="text-base text-stone mb-3">{book.author}</p>
              <p className="text-base text-charcoal/80 leading-relaxed mb-4">
                {book.description}
              </p>
              <div className="border-l-2 border-sage pl-4">
                <p className="text-base text-charcoal/70 leading-relaxed italic font-serif">
                  "{note}"
                </p>
              </div>
            </div>
          </article>
        ))}
      </section>

      {/* Link to library */}
      <section className="text-center py-8 border-t border-stone-light/50">
        <p className="text-stone text-base mb-4">Want to see the full collection?</p>
        <Link
          to="/library"
          className="inline-block text-base font-medium text-charcoal border border-charcoal px-7 py-3 rounded-full no-underline hover:bg-charcoal hover:text-cream transition-colors"
        >
          Browse the Library
        </Link>
      </section>

      {/* Book detail modal */}
      {selectedBook && (
        <BookModal book={selectedBook} onClose={() => setSelectedBook(null)} />
      )}
    </div>
  )
}
