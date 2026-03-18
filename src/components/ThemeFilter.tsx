import type { Theme } from '../types'
import { themeDescriptions } from '../data/books'

interface ThemeFilterProps {
  selected: Theme | null
  onSelect: (theme: Theme | null) => void
  bookCounts: Record<string, number>
}

export function ThemeFilter({ selected, onSelect, bookCounts }: ThemeFilterProps) {
  const selectedDescription = selected
    ? themeDescriptions.find((t) => t.name === selected)
    : null

  const pillCls = (active: boolean) =>
    `text-sm px-4 py-2 rounded-full border transition-colors cursor-pointer ${
      active
        ? 'bg-charcoal text-cream border-charcoal'
        : 'bg-transparent text-stone border-stone-light hover:border-charcoal hover:text-charcoal'
    }`

  return (
    <div className="border-t border-stone-light/40 pt-5">
      <div className="flex items-center gap-2 mb-3">
        <h4 className="font-serif text-base font-medium text-charcoal m-0">Charlotte's Themes</h4>
        <span className="text-xs text-stone italic">— derived from the library</span>
      </div>
      <div className="flex flex-wrap gap-2">
        <button onClick={() => onSelect(null)} className={pillCls(selected === null)}>
          All
        </button>
        {themeDescriptions.map(({ name }) => (
          bookCounts[name] ? (
            <button
              key={name}
              onClick={() => onSelect(selected === name ? null : name)}
              className={pillCls(selected === name)}
            >
              {name} ({bookCounts[name]})
            </button>
          ) : null
        ))}
      </div>
      {selectedDescription && (
        <div className="mt-5 py-5 border-t border-stone-light/30">
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
