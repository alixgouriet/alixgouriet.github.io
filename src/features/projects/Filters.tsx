import { useEffect, useId, useState } from 'react'
import { isFiltering, periods, usedTools, type Filters as FilterState } from '../../data/derive.ts'
import { projects } from '../../data/projects.ts'
import type { Semester } from '../../data/types.ts'

interface Props {
  value: FilterState
  onChange: (next: FilterState) => void
  onReset: () => void
  shown: number
  total: number
}

const TOOLS = usedTools(projects)
const PERIODS = periods(projects)
const SEMESTERS: { value: Semester | null; label: string }[] = [
  { value: null, label: 'Tous' },
  { value: 1, label: 'Semestre 1' },
  { value: 2, label: 'Semestre 2' },
]

export function Filters({ value, onChange, onReset, shown, total }: Props) {
  const uid = useId()
  const panelId = `${uid}-panel`
  // Compteur lu par les lecteurs d'écran : différé pour ne pas parler à chaque frappe.
  const [announced, setAnnounced] = useState(shown)
  useEffect(() => {
    const t = setTimeout(() => setAnnounced(shown), 250)
    return () => clearTimeout(t)
  }, [shown])

  // Mobile : repliés sous « Filtrer ». Dès 768 px la CSS les affiche toujours.
  const [open, setOpen] = useState(false)
  const active = [value.tech, value.period, value.semester].filter((x) => x !== null).length

  return (
    <div className="pg-filters">
      <button
        type="button"
        className="ap-pill-outline pg-filters-toggle"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((o) => !o)}
      >
        Filtrer{active > 0 ? ` (${active})` : ''}
      </button>
      <div id={panelId} className="pg-filter-panel" data-open={open ? '' : undefined}>
        <div className="pg-field">
          <label htmlFor={`${uid}-tech`}>Outil</label>
          <select
            id={`${uid}-tech`}
            className="pg-select"
            value={value.tech ?? ''}
            onChange={(e) => onChange({ ...value, tech: e.target.value || null })}
          >
            <option value="">Tous les outils</option>
            {TOOLS.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
        <div className="pg-field">
          <label htmlFor={`${uid}-period`}>Mois et année</label>
          <select
            id={`${uid}-period`}
            className="pg-select"
            value={value.period ?? ''}
            onChange={(e) => onChange({ ...value, period: e.target.value || null })}
          >
            <option value="">Toutes les dates</option>
            {PERIODS.map((p) => (
              <option key={p.value} value={p.value}>
                {p.label}
              </option>
            ))}
          </select>
        </div>
        <fieldset className="pg-field pg-seg-field">
          <legend>Semestre</legend>
          <div className="pg-seg">
            {SEMESTERS.map((s) => (
              <label key={s.label} className="pg-seg-opt">
                <input
                  type="radio"
                  name={`${uid}-semester`}
                  checked={value.semester === s.value}
                  onChange={() => onChange({ ...value, semester: s.value })}
                />
                <span>{s.label}</span>
              </label>
            ))}
          </div>
        </fieldset>
      </div>
      <div className="pg-filter-status">
        <p className="pg-count tnum" role="status">
          {announced === 0 ? 'Aucun projet' : `${announced} projet${announced > 1 ? 's' : ''}`} sur {total}
        </p>
        {/* Seul bouton de réinitialisation : visible même panneau replié sur mobile. */}
        {isFiltering(value) ? (
          <button type="button" className="ap-pill-outline pg-reset" onClick={onReset}>
            Réinitialiser les filtres
          </button>
        ) : null}
      </div>
    </div>
  )
}
