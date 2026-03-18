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
        ? 'bg-fg text-bg border-fg'
        : 'bg-transparent text-gray-500 border-gray-400 hover:border-fg hover:text-fg'
    }`

  return (
    <div className="border-t border-gray-400 pt-5">
      <div className="flex items-center gap-2 mb-3">
        <h4 className="text-sm font-normal text-fg m-0">Charlotte's Themes</h4>
        <span className="text-xs text-gray-400 italic">— derived from the library</span>
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
        <div className="mt-5 py-5 border-t border-gray-300">
          <h3 className="text-2xl md:text-3xl font-normal text-fg leading-snug mb-3">
            {selectedDescription.tagline}
          </h3>
          <p className="text-base text-gray-500 leading-relaxed max-w-3xl mb-8">
            {selectedDescription.description}
          </p>

          {/* Recommendations */}
          {selectedDescription.recommendations.length > 0 && (
            <div className="border-t border-gray-300 pt-6">
              <h4 className="text-sm text-gray-400 mb-4">
                Charlotte might also consider
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {selectedDescription.recommendations.map((rec) => (
                  <a
                    key={rec.title}
                    href={rec.amazonUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group no-underline block"
                  >
                    <h5 className="text-base font-medium text-fg m-0 mb-0.5 group-hover:text-gray-600 transition-colors">
                      {rec.title}
                    </h5>
                    <p className="text-sm text-gray-400 m-0 mb-2">{rec.author}</p>
                    <p className="text-sm text-gray-500 leading-relaxed m-0">
                      {rec.reason}
                    </p>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
