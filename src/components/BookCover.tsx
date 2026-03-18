import type { Book } from '../types'

function getContrastColour(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
  return luminance > 0.6 ? '#2d2d2d' : '#faf7f2'
}

interface BookCoverProps {
  book: Book
  size?: 'sm' | 'md' | 'lg'
}

export function BookCover({ book, size = 'md' }: BookCoverProps) {
  const textColour = getContrastColour(book.coverColour)
  const dims = {
    sm: { w: 'w-20', h: 'h-28', text: 'text-[9px]', author: 'text-[7px]', px: 'px-1.5', py: 'py-2' },
    md: { w: 'w-28', h: 'h-40', text: 'text-[11px]', author: 'text-[8px]', px: 'px-2', py: 'py-3' },
    lg: { w: 'w-36', h: 'h-52', text: 'text-sm', author: 'text-[10px]', px: 'px-3', py: 'py-4' },
  }[size]

  return (
    <div
      className={`${dims.w} ${dims.h} rounded-sm shadow-md flex-shrink-0 flex flex-col justify-between ${dims.px} ${dims.py} relative overflow-hidden`}
      style={{ backgroundColor: book.coverColour }}
    >
      {/* Spine effect */}
      <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-black/15" />
      <div className="absolute left-[3px] top-0 bottom-0 w-px bg-white/10" />

      <div>
        <p
          className={`${dims.text} font-serif font-semibold leading-tight m-0`}
          style={{ color: textColour }}
        >
          {book.title}
        </p>
      </div>
      <p
        className={`${dims.author} leading-tight m-0 opacity-80`}
        style={{ color: textColour }}
      >
        {book.author.split('&')[0].split(',')[0].trim()}
      </p>
    </div>
  )
}
