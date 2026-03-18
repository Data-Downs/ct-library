import type { Theme } from '../types'
import { themeDescriptions } from '../data/books'

interface ThemeFilterProps {
  selected: Theme | null
  onSelect: (theme: Theme | null) => void
  bookCounts: Record<string, number>
  totalBooks: number
}

export function ThemeFilter({ selected, onSelect, bookCounts, totalBooks }: ThemeFilterProps) {
  const selectedDescription = selected
    ? themeDescriptions.find((t) => t.name === selected)
    : null

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => onSelect(null)}
          className={`text-xs px-3 py-1.5 rounded-full border transition-colors cursor-pointer ${
            selected === null
              ? 'bg-charcoal text-cream border-charcoal'
              : 'bg-transparent text-stone border-stone-light hover:border-charcoal hover:text-charcoal'
          }`}
        >
          All ({totalBooks})
        </button>
        {themeDescriptions.map(({ name }) => (
          bookCounts[name] ? (
            <button
              key={name}
              onClick={() => onSelect(selected === name ? null : name)}
              className={`text-xs px-3 py-1.5 rounded-full border transition-colors cursor-pointer ${
                selected === name
                  ? 'bg-charcoal text-cream border-charcoal'
                  : 'bg-transparent text-stone border-stone-light hover:border-charcoal hover:text-charcoal'
              }`}
            >
              {name} ({bookCounts[name]})
            </button>
          ) : null
        ))}
      </div>
      {selectedDescription && (
        <div className="mt-4 p-4 bg-warm-white rounded-lg">
          <p className="text-sm font-serif italic text-charcoal/70 mb-1">
            {selectedDescription.tagline}
          </p>
          <p className="text-xs text-stone leading-relaxed">
            {selectedDescription.description}
          </p>
        </div>
      )}
    </div>
  )
}
