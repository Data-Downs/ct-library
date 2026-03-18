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
      <span className="text-sm text-gray-500">Sort</span>
      <select
        value={mode}
        onChange={(e) => onChange(e.target.value as SortMode)}
        className="text-sm px-3 py-1.5 border border-gray-400 rounded-md bg-transparent text-fg cursor-pointer focus:outline-none focus:border-fg transition-colors"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
  )
}
