import type { SortMode } from '../types'

interface SortControlProps {
  mode: SortMode
  onChange: (mode: SortMode) => void
}

const options: { value: SortMode; label: string }[] = [
  { value: 'title', label: 'Title A–Z' },
  { value: 'author', label: 'Author A–Z' },
  { value: 'year-desc', label: 'Newest first' },
  { value: 'year-asc', label: 'Oldest first' },
]

export function SortControl({ mode, onChange }: SortControlProps) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-stone">Sort by</span>
      <select
        value={mode}
        onChange={(e) => onChange(e.target.value as SortMode)}
        className="text-sm px-3 py-1.5 border border-stone-light rounded-md bg-transparent text-charcoal cursor-pointer focus:outline-none focus:border-charcoal transition-colors"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
  )
}
