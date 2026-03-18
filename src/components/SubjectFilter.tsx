import type { Subject } from '../types'

interface SubjectFilterProps {
  selected: Subject | null
  onSelect: (subject: Subject | null) => void
  counts: Record<string, number>
}

export function SubjectFilter({ selected, onSelect, counts }: SubjectFilterProps) {
  const subjects = Object.keys(counts).sort() as Subject[]

  if (subjects.length === 0) return null

  const pillCls = (active: boolean) =>
    `text-sm px-4 py-2 rounded-full border transition-colors cursor-pointer whitespace-nowrap ${
      active
        ? 'bg-fg text-bg border-fg'
        : 'bg-transparent text-gray-500 border-gray-400 hover:border-fg hover:text-fg'
    }`

  return (
    <div className="flex flex-wrap gap-2">
      <button onClick={() => onSelect(null)} className={pillCls(selected === null)}>
        All subjects
      </button>
      {subjects.map((subject) => (
        <button
          key={subject}
          onClick={() => onSelect(selected === subject ? null : subject)}
          className={pillCls(selected === subject)}
        >
          {subject} ({counts[subject]})
        </button>
      ))}
    </div>
  )
}
