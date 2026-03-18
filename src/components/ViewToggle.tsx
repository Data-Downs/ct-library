import type { ViewMode } from '../types'

interface ViewToggleProps {
  mode: ViewMode
  onChange: (mode: ViewMode) => void
}

export function ViewToggle({ mode, onChange }: ViewToggleProps) {
  const cls = (m: ViewMode) =>
    `px-3.5 py-2.5 text-sm cursor-pointer transition-colors ${
      mode === m ? 'bg-fg text-bg' : 'bg-transparent text-gray-500 hover:text-fg'
    }`

  return (
    <div className="flex border border-gray-400 rounded-md overflow-hidden">
      <button onClick={() => onChange('grid')} className={cls('grid')} title="Grid view">
        <svg width="16" height="16" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
          <rect x="1" y="1" width="5" height="5" rx="0.5" />
          <rect x="8" y="1" width="5" height="5" rx="0.5" />
          <rect x="1" y="8" width="5" height="5" rx="0.5" />
          <rect x="8" y="8" width="5" height="5" rx="0.5" />
        </svg>
      </button>
      <button onClick={() => onChange('list')} className={`${cls('list')} border-l border-gray-400`} title="List view">
        <svg width="16" height="16" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
          <line x1="1" y1="3" x2="13" y2="3" />
          <line x1="1" y1="7" x2="13" y2="7" />
          <line x1="1" y1="11" x2="13" y2="11" />
        </svg>
      </button>
    </div>
  )
}
