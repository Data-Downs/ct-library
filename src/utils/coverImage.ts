/**
 * Return an Open Library cover image URL using the verified ISBN field,
 * falling back to extracting ASIN from the Amazon URL.
 */
export function getCoverImageUrl(book: { isbn?: string; amazonUrl: string }, size: 'S' | 'M' | 'L' = 'L'): string {
  const isbn = book.isbn || book.amazonUrl.match(/\/dp\/(\w+)/)?.[1]
  if (!isbn) return ''
  return `https://covers.openlibrary.org/b/isbn/${isbn}-${size}.jpg`
}
