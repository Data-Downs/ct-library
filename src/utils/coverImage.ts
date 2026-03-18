/**
 * Extract ISBN from an Amazon UK URL (the /dp/XXXXXXXXXX part)
 * and return an Open Library cover image URL.
 */
export function getCoverImageUrl(amazonUrl: string, size: 'S' | 'M' | 'L' = 'L'): string {
  const match = amazonUrl.match(/\/dp\/(\w+)/)
  const isbn = match?.[1]
  if (!isbn) return ''
  return `https://covers.openlibrary.org/b/isbn/${isbn}-${size}.jpg`
}
