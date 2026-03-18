import type { ViewMode } from '../types'

interface ViewToggleProps {
  mode: ViewMode
  onChange: (mode: ViewMode) => void
}

export function ViewToggle({ mode, onChange }: ViewToggleProps) {
  return (
    <div className="flex border border-stone-light rounded-md overflow-hidden">
      <button
        onClick={() => onChange('grid')}
        className={`px-3 py-1.5 text-xs cursor-pointer transition-colors ${
          mode === 'grid'
            ? 'bg-charcoal text-cream'
            : 'bg-transparent text-stone hover:text-charcoal'
        }`}
        title="Grid view"
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
          <rect x="1" y="1" width="5" height="5" rx="0.5" />
          <rect x="8" y="1" width="5" height="5" rx="0.5" />
          <rect x="1" y="8" width="5" height="5" rx="0.5" />
          <rect x="8" y="8" width="5" height="5" rx="0.5" />
        </svg>
      </button>
      <button
        onClick={() => onChange('list')}
        className={`px-3 py-1.5 text-xs cursor-pointer transition-colors border-l border-stone-light ${
          mode === 'list'
            ? 'bg-charcoal text-cream'
            : 'bg-transparent text-stone hover:text-charcoal'
        }`}
        title="List view"
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
          <line x1="1" y1="3" x2="13" y2="3" />
          <line x1="1" y1="7" x2="13" y2="7" />
          <line x1="1" y1="11" x2="13" y2="11" />
        </svg>
      </button>
    </div>
  )
}
