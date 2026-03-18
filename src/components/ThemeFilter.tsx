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
          className={`text-sm px-4 py-2 rounded-full border transition-colors cursor-pointer ${
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
              className={`text-sm px-4 py-2 rounded-full border transition-colors cursor-pointer ${
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
        <div className="mt-6 py-6 border-t border-stone-light/40">
          <h3 className="font-serif text-2xl md:text-3xl font-medium text-charcoal leading-snug mb-3">
            {selectedDescription.tagline}
          </h3>
          <p className="text-base text-stone leading-relaxed max-w-3xl">
            {selectedDescription.description}
          </p>
        </div>
      )}
    </div>
  )
}
