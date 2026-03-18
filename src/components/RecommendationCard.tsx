import { useState, useCallback } from 'react'
import type { ThemeRecommendation } from '../types'

function getCoverUrl(amazonUrl: string): string {
  const match = amazonUrl.match(/\/dp\/(\w+)/)
  const isbn = match?.[1]
  if (!isbn) return ''
  return `https://covers.openlibrary.org/b/isbn/${isbn}-L.jpg`
}

/** Simple hash to pick a muted cover colour from the title */
function coverColour(title: string): string {
  const colours = ['#7a8a7e', '#8a7a6e', '#6e7a8a', '#8a6e7a', '#7a7a6e', '#6e8a7a']
  let hash = 0
  for (let i = 0; i < title.length; i++) hash = title.charCodeAt(i) + ((hash << 5) - hash)
  return colours[Math.abs(hash) % colours.length]
}

function HtmlCover({ title, author }: { title: string; author: string }) {
  const bg = coverColour(title)
  return (
    <div
      className="w-28 h-40 rounded-sm shadow-md flex-shrink-0 flex flex-col justify-between px-2 py-3 relative overflow-hidden"
      style={{ backgroundColor: bg }}
    >
      <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-black/15" />
      <div className="absolute left-[3px] top-0 bottom-0 w-px bg-white/10" />
      <p className="text-[11px] font-semibold leading-tight m-0 text-white/90">
        {title}
      </p>
      <p className="text-[8px] leading-tight m-0 text-white/60">
        {author}
      </p>
    </div>
  )
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
    <div className="flex flex-col items-center text-center p-3 opacity-80 hover:opacity-100 transition-opacity">
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
        <div className="mb-3">
          <HtmlCover title={rec.title} author={rec.author} />
        </div>
      )}

      {/* Title & author */}
      <h5 className="text-sm font-medium text-fg m-0 mb-0.5 leading-tight">
        {rec.title}
      </h5>
      <p className="text-xs text-gray-500 m-0 mb-2">{rec.author}</p>

      {/* Reason */}
      <p className="text-xs text-gray-500 leading-relaxed m-0 mb-3">
        {rec.reason}
      </p>

      {/* Amazon button */}
      <a
        href={rec.amazonUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 text-xs text-fg border border-gray-400 px-3 py-1.5 rounded-full no-underline hover:bg-white hover:border-fg transition-colors mt-auto"
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
