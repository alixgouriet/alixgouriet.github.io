import { useSearchParams } from 'react-router'
import { Filters } from '../features/projects/Filters.tsx'
import { ProjectList } from '../features/projects/ProjectList.tsx'
import {
  filterProjects,
  filtersToParams,
  isAvailable,
  NO_FILTER,
  numbering,
  parseFilters,
  recentFirst,
  showFilters,
  stats,
  type Filters as FilterState,
} from '../data/derive.ts'
import { projects } from '../data/projects.ts'

// Données statiques : tri, numéros et compteurs calculés une seule fois.
const sorted = recentFirst(projects)
const numbers = numbering(projects)
const counts = stats(projects)

export function ProjectsPage() {
  const [params, setParams] = useSearchParams()
  const filtersVisible = showFilters(projects)

  const value = filtersVisible ? parseFilters(params, projects) : NO_FILTER
  // Fiches détaillées d'abord, puis « en préparation » ; chaque groupe reste du plus récent au plus ancien.
  const filtered = filterProjects(sorted, value)
  const shown = [...filtered.filter(isAvailable), ...filtered.filter((p) => !isAvailable(p))]

  const onChange = (next: FilterState) =>
    setParams(filtersToParams(next), { replace: true, preventScrollReset: true })
  const reset = () => onChange(NO_FILTER)

  return (
    <>
      <title>Projets et SAE · Alix Gouriet</title>
      <section className="ap-section ap-section--white pg-head">
        <div className="ap-container ap-center">
          <h1 className="ap-title-xl">Projets et SAE</h1>
          <p className="ap-subtitle ap-muted pg-sub">
            Les travaux réalisés pendant mon BUT, avec leurs outils et leurs résultats.
          </p>
          <dl className="pg-stats">
            <div>
              <dt>Réalisations</dt>
              <dd className="tnum">{counts.total}</dd>
            </div>
            <div>
              <dt>Fiches détaillées</dt>
              <dd className="tnum">{counts.detailed}</dd>
            </div>
            <div>
              <dt>Outils cités</dt>
              <dd className="tnum">{counts.tools}</dd>
            </div>
          </dl>
        </div>
      </section>
      <section className="ap-section ap-section--white pg-list" aria-label="Liste des projets">
        <div className="ap-container ap-container--wide">
          {filtersVisible ? (
            <Filters value={value} onChange={onChange} onReset={reset} shown={shown.length} total={projects.length} />
          ) : null}
          {shown.length > 0 ? (
            <ProjectList items={shown} numbers={numbers} fadeKey={filtersToParams(value).toString()} />
          ) : (
            <div className="ap-tile ap-tile--gray pg-empty">
              <p className="ap-title-md">Aucun projet ne correspond à ces filtres.</p>
            </div>
          )}
        </div>
      </section>
    </>
  )
}
