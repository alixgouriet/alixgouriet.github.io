import { useDeferredValue } from 'react'
import { useSearchParams } from 'react-router'
import { Filters } from '../features/projects/Filters.tsx'
import { ProjectList } from '../features/projects/ProjectList.tsx'
import {
  availableProjects,
  filterProjects,
  showFilters,
  upcomingProjects,
  type Filters as FilterState,
} from '../data/derive.ts'
import { projects } from '../data/projects.ts'
import type { Category, ToolId } from '../data/types.ts'

const available = availableProjects(projects)
const upcoming = upcomingProjects(projects)

export function ProjectsPage() {
  const [params, setParams] = useSearchParams()
  const filtersVisible = showFilters(projects)

  const value: FilterState = {
    categories: filtersVisible ? (params.getAll('categorie') as Category[]) : [],
    tools: filtersVisible ? (params.getAll('techno') as ToolId[]) : [],
  }
  const deferred = useDeferredValue(value)
  const shown = filterProjects(available, deferred)
  const noFilter = deferred.categories.length + deferred.tools.length === 0

  const onChange = (next: FilterState) => {
    const sp = new URLSearchParams()
    next.categories.forEach((c) => sp.append('categorie', c))
    next.tools.forEach((t) => sp.append('techno', t))
    setParams(sp, { replace: true, preventScrollReset: true })
  }

  return (
    <>
      <title>Projets et SAE · Alix Gouriet</title>
      <div className="wrap page">
        <div className="page-head">
          <h1>Projets et SAE</h1>
          <p className="lead">Les travaux réalisés pendant mon BUT, avec leurs outils et leurs résultats.</p>
        </div>
        {filtersVisible ? (
          <Filters value={value} onChange={onChange} shown={shown.length} total={available.length} />
        ) : null}
        {shown.length > 0 ? (
          <ProjectList items={noFilter ? [...shown, ...upcoming] : shown} />
        ) : (
          <p>Aucun projet ne correspond à ces filtres.</p>
        )}
      </div>
    </>
  )
}
