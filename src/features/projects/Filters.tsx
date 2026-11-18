import { useEffect, useState } from 'react'
import { availableProjects, toolLabel, type Filters as FilterState } from '../../data/derive.ts'
import type { Category, ToolId } from '../../data/types.ts'
import { projects } from '../../data/projects.ts'

interface Props {
  value: FilterState
  onChange: (next: FilterState) => void
  shown: number
  total: number
}

const available = availableProjects(projects)
const CATEGORIES = [...new Set(available.map((p) => p.category))] as Category[]
const TOOLS = [...new Set(available.flatMap((p) => p.tools))] as ToolId[]

function toggle<T>(list: T[], item: T): T[] {
  return list.includes(item) ? list.filter((x) => x !== item) : [...list, item]
}

export function Filters({ value, onChange, shown, total }: Props) {
  // Le compteur lu par les lecteurs d'écran est différé de 300 ms.
  const [announced, setAnnounced] = useState(shown)
  useEffect(() => {
    const t = setTimeout(() => setAnnounced(shown), 300)
    return () => clearTimeout(t)
  }, [shown])

  const [open, setOpen] = useState(() => window.matchMedia('(min-width: 768px)').matches)
  const active = value.categories.length + value.tools.length > 0

  return (
    <details className="filters" open={open} onToggle={(e) => setOpen(e.currentTarget.open)}>
      <summary>Filtrer</summary>
      <div className="filter-groups">
        <fieldset>
          <legend>Catégorie</legend>
          {CATEGORIES.map((c) => (
            <label key={c} className="check">
              <input
                type="checkbox"
                checked={value.categories.includes(c)}
                onChange={() => onChange({ ...value, categories: toggle(value.categories, c) })}
              />
              {c}
            </label>
          ))}
        </fieldset>
        <fieldset>
          <legend>Technologie</legend>
          {TOOLS.map((t) => (
            <label key={t} className="check">
              <input
                type="checkbox"
                checked={value.tools.includes(t)}
                onChange={() => onChange({ ...value, tools: toggle(value.tools, t) })}
              />
              {toolLabel(t)}
            </label>
          ))}
        </fieldset>
      </div>
      <p className="filter-count tnum" aria-live="polite">
        {announced} projet{announced > 1 ? 's' : ''} sur {total}
      </p>
      {active ? (
        <button
          type="button"
          className="btn btn-outline"
          onClick={() => onChange({ categories: [], tools: [] })}
        >
          Réinitialiser les filtres
        </button>
      ) : null}
    </details>
  )
}
