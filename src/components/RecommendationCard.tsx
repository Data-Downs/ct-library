import { useState, useCallback } from 'react'
import type { ThemeRecommendation } from '../types'

function getCoverUrl(amazonUrl: string): string {
  const match = amazonUrl.match(/\/dp\/(\w+)/)
  const isbn = match?.[1]
  if (!isbn) return ''
  return `https://covers.openlibrary.org/b/isbn/${isbn}-L.jpg`
}

export function RecommendationCard({ rec }: { rec: ThemeRecommendation }) {
  const [imgFailed, setImgFailed] = useState(false)
  const coverUrl = getCoverUrl(rec.amazonUrl)

  const handleLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget
    if (img.naturalWidth <= 1 || img.naturalHeight <= 1) {
      setImgFailed(true)
    }
  }, [])

  return (
    <div className="flex flex-col items-center text-center p-3">
      {/* Cover */}
      {!imgFailed && coverUrl ? (
        <img
          src={coverUrl}
          alt={rec.title}
          onError={() => setImgFailed(true)}
          onLoad={handleLoad}
          className="w-28 h-auto rounded-sm shadow-md object-cover mb-3"
          loading="lazy"
        />
      ) : (
        <div className="w-28 h-40 rounded-sm shadow-md bg-gray-300 flex items-center justify-center mb-3 px-2">
          <span className="text-xs text-gray-500 leading-tight text-center">{rec.title}</span>
        </div>
      )}

      {/* Title & author */}
      <h5 className="text-sm font-medium text-fg m-0 mb-0.5 leading-tight">
        {rec.title}
      </h5>
      <p className="text-xs text-gray-400 m-0 mb-2">{rec.author}</p>

      {/* Reason */}
      <p className="text-xs text-gray-500 leading-relaxed m-0 mb-3">
        {rec.reason}
      </p>

      {/* Amazon button */}
      <a
        href={rec.amazonUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 text-xs text-fg border border-gray-400 px-3 py-1.5 rounded-full no-underline hover:bg-white hover:border-fg transition-colors"
      >
        <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 3H3v10h10v-3" />
          <path d="M9 2h5v5" />
          <path d="M14 2L7 9" />
        </svg>
        Find on Amazon
      </a>
    </div>
  )
}
