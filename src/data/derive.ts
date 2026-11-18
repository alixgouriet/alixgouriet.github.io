import type {
  AvailableProject,
  Category,
  Project,
  Skill,
  ToolId,
  UpcomingProject,
} from './types.ts'
import { projects } from './projects.ts'
import { skills } from './skills.ts'

/** Seuil d'affichage du bloc de filtres. */
export const FILTER_THRESHOLD = 5

export function isAvailable(p: Project): p is AvailableProject {
  return p.status === 'disponible'
}

export function availableProjects(list: Project[] = projects): AvailableProject[] {
  return list.filter(isAvailable)
}

export function upcomingProjects(list: Project[] = projects): UpcomingProject[] {
  return list.filter((p): p is UpcomingProject => p.status === 'a-venir')
}

export function findProject(slug: string | undefined, list: Project[] = projects) {
  return availableProjects(list).find((p) => p.slug === slug)
}

/** Projets disponibles qui prouvent un outil ; vide = « Sur CV ». */
export function proofsFor(tool: ToolId, list: Project[] = projects): AvailableProject[] {
  return availableProjects(list).filter((p) => p.tools.includes(tool))
}

export function skillsWithProofs(list: Project[] = projects) {
  return skills.map((skill: Skill) => ({ skill, proofs: proofsFor(skill.id, list) }))
}

export function showFilters(list: Project[] = projects): boolean {
  return availableProjects(list).length >= FILTER_THRESHOLD
}

export interface Filters {
  categories: Category[]
  tools: ToolId[]
}

/** Un projet passe s'il correspond à au moins une valeur de chaque groupe non vide. */
export function filterProjects(list: AvailableProject[], f: Filters): AvailableProject[] {
  return list.filter(
    (p) =>
      (f.categories.length === 0 || f.categories.includes(p.category)) &&
      (f.tools.length === 0 || f.tools.some((t) => p.tools.includes(t))),
  )
}

export function toolLabel(id: ToolId): string {
  return skills.find((s) => s.id === id)?.label ?? id
}

/** Projets disponibles d'abord, puis projets à venir. */
export function orderProjects(list: Project[] = projects): Project[] {
  return [...availableProjects(list), ...upcomingProjects(list)]
}
