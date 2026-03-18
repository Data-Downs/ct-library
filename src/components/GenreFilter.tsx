import type { Genre } from '../types'

const ALL_GENRES: Genre[] = ['Fiction', 'Non-fiction', 'Poetry', 'Philosophy', 'Art Catalogue', 'Reference', 'Cookbook']

interface GenreFilterProps {
  selected: Genre | null
  onSelect: (genre: Genre | null) => void
  counts: Record<string, number>
}

export function GenreFilter({ selected, onSelect, counts }: GenreFilterProps) {
  return (
    <div className="flex gap-6 border-b border-gray-400 overflow-x-auto">
      <button
        onClick={() => onSelect(null)}
        className={`pb-2.5 text-sm whitespace-nowrap transition-colors cursor-pointer bg-transparent border-b-2 ${
          selected === null
            ? 'border-fg text-fg font-semibold'
            : 'border-transparent text-gray-500 hover:text-fg'
        }`}
      >
        All ({Object.values(counts).reduce((a, b) => a + b, 0)})
      </button>
      {ALL_GENRES.filter((g) => counts[g]).map((genre) => (
        <button
          key={genre}
          onClick={() => onSelect(selected === genre ? null : genre)}
          className={`pb-2.5 text-sm whitespace-nowrap transition-colors cursor-pointer bg-transparent border-b-2 ${
            selected === genre
              ? 'border-fg text-fg font-semibold'
              : 'border-transparent text-gray-500 hover:text-fg'
          }`}
        >
          {genre} ({counts[genre]})
        </button>
      ))}
    </div>
  )
}
