import type { Theme } from '../types'

const ALL_THEMES: Theme[] = [
  'Cookbooks & Food',
  'Literature & Fiction',
  'Art & Architecture',
  'Philosophy & Ideas',
  'Memoir & Life Writing',
  'Travel & Places',
  'History & Politics',
  'Nature & Environment',
  'Poetry',
  'Design & Photography',
]

interface ThemeFilterProps {
  selected: Theme | null
  onSelect: (theme: Theme | null) => void
  bookCounts: Record<string, number>
}

export function ThemeFilter({ selected, onSelect, bookCounts }: ThemeFilterProps) {
  return (
    <div className="flex flex-wrap gap-2">
      <button
        onClick={() => onSelect(null)}
        className={`text-xs px-3 py-1.5 rounded-full border transition-colors cursor-pointer ${
          selected === null
            ? 'bg-charcoal text-cream border-charcoal'
            : 'bg-transparent text-stone border-stone-light hover:border-charcoal hover:text-charcoal'
        }`}
      >
        All ({Object.values(bookCounts).reduce((a, b) => a + b, 0)})
      </button>
      {ALL_THEMES.filter((t) => bookCounts[t]).map((theme) => (
        <button
          key={theme}
          onClick={() => onSelect(selected === theme ? null : theme)}
          className={`text-xs px-3 py-1.5 rounded-full border transition-colors cursor-pointer ${
            selected === theme
              ? 'bg-charcoal text-cream border-charcoal'
              : 'bg-transparent text-stone border-stone-light hover:border-charcoal hover:text-charcoal'
          }`}
        >
          {theme} ({bookCounts[theme]})
        </button>
      ))}
    </div>
  )
}
