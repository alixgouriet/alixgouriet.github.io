import type { AvailableProject, PendingProject, Project, Semester, Skill, ToolId } from './types.ts'
import { formatPeriod } from './dates.ts'
import { projects } from './projects.ts'
import { skills } from './skills.ts'
import { TOOL_LABELS } from './tools.ts'

/** Seuil d'affichage du bloc de filtres (nombre de projets, avec ou sans fiche). */
export const FILTER_THRESHOLD = 5

export function isAvailable(p: Project): p is AvailableProject {
  return p.status === 'disponible'
}

export function availableProjects(list: Project[] = projects): AvailableProject[] {
  return list.filter(isAvailable)
}

export function pendingProjects(list: Project[] = projects): PendingProject[] {
  return list.filter((p): p is PendingProject => p.status === 'sans-fiche')
}

export function findProject(slug: string | undefined, list: Project[] = projects) {
  return availableProjects(list).find((p) => p.slug === slug)
}

/** Projets AVEC fiche qui prouvent un outil ; vide = « Mentionné dans mon CV ». Les projets sans fiche n'en font jamais partie. */
export function proofsFor(tool: ToolId, list: Project[] = projects): AvailableProject[] {
  return availableProjects(list).filter((p) => p.tools.includes(tool))
}

export function skillsWithProofs(list: Project[] = projects) {
  return skills.map((skill: Skill) => ({ skill, proofs: proofsFor(skill.id, list) }))
}

export function showFilters(list: Project[] = projects): boolean {
  return list.length >= FILTER_THRESHOLD
}

export function toolLabel(id: ToolId): string {
  return skills.find((s) => s.id === id)?.label ?? id
}

/** Clé stable d'un projet (slug ou identifiant). */
export function projectKey(p: Project): string {
  return p.status === 'disponible' ? p.slug : p.id
}

export function subtitleOf(p: Project): string {
  return p.status === 'disponible' ? p.result : p.subtitle
}

/* ---------- Tri et numérotation ---------- */

const when = (p: Project) => p.year * 12 + p.month

/** Du plus ancien au plus récent ; à date égale, ordre du tableau de données (tri stable). */
export function chronological(list: Project[] = projects): Project[] {
  return list.map((p, i) => ({ p, i })).sort((a, b) => when(a.p) - when(b.p) || a.i - b.i).map((x) => x.p)
}

/** Ordre d'affichage : exactement l'inverse de la chronologie (le numéro le plus grand en haut). */
export function recentFirst(list: Project[] = projects): Project[] {
  return chronological(list).reverse()
}

/** Numéro 1 = le plus ancien. Fixe, quel que soit le filtre appliqué. */
export function numbering(list: Project[] = projects): Map<string, number> {
  return new Map(chronological(list).map((p, i) => [projectKey(p), i + 1]))
}

/* ---------- Filtres ---------- */

export interface Filters {
  /** Libellé exact d'un outil (voir tools.ts). */
  tech: string | null
  /** « AAAA-MM ». */
  period: string | null
  semester: Semester | null
}

export const NO_FILTER: Filters = { tech: null, period: null, semester: null }

export function isFiltering(f: Filters): boolean {
  return f.tech !== null || f.period !== null || f.semester !== null
}

export function periodValue(p: Project): string {
  return `${p.year}-${String(p.month).padStart(2, '0')}`
}

/** Outils réels distincts (liste blanche de tools.ts), triés par ordre alphabétique français. */
export function usedTools(list: Project[] = projects): string[] {
  return [...new Set(list.flatMap((p) => p.technologies).filter((t) => TOOL_LABELS.has(t)))].sort((a, b) =>
    a.localeCompare(b, 'fr'),
  )
}

/** Mois/années présents, du plus récent au plus ancien. */
export function periods(list: Project[] = projects): { value: string; label: string }[] {
  const seen = new Map<string, string>()
  for (const p of recentFirst(list)) seen.set(periodValue(p), formatPeriod(p.year, p.month))
  return [...seen].map(([value, label]) => ({ value, label }))
}

/** Un projet passe s'il respecte tous les filtres posés (ET entre groupes). */
export function filterProjects(list: Project[], f: Filters): Project[] {
  return list.filter(
    (p) =>
      (f.tech === null || p.technologies.includes(f.tech)) &&
      (f.period === null || periodValue(p) === f.period) &&
      (f.semester === null || p.semester === f.semester),
  )
}

/** Lit l'URL ; toute valeur inconnue des données est ignorée. */
export function parseFilters(params: URLSearchParams, list: Project[] = projects): Filters {
  const tech = params.get('techno')
  const period = params.get('periode')
  const semester = params.get('semestre')
  return {
    tech: tech !== null && usedTools(list).includes(tech) ? tech : null,
    period: period !== null && periods(list).some((x) => x.value === period) ? period : null,
    semester: semester === '1' ? 1 : semester === '2' ? 2 : null,
  }
}

export function filtersToParams(f: Filters): URLSearchParams {
  const sp = new URLSearchParams()
  if (f.tech !== null) sp.set('techno', f.tech)
  if (f.period !== null) sp.set('periode', f.period)
  if (f.semester !== null) sp.set('semestre', String(f.semester))
  return sp
}

/* ---------- Compteurs d'en-tête et accroche ---------- */

/** Chiffres calculés sur les données : aucun nombre en dur. */
export function stats(list: Project[] = projects) {
  return {
    total: list.length,
    detailed: availableProjects(list).length,
    tools: usedTools(list).length,
  }
}

/** « SQL (MySQL) » devient « SQL » dans une phrase. */
function shortLabel(id: ToolId): string {
  return toolLabel(id).replace(/\s*\(.*\)$/, '')
}

/**
 * Outils prouvés par les fiches : `tools` des projets avec fiche, sans ceux qui ne viennent que du CV
 * (`toolsFromCv`, aucun fichier fourni). Ordre de la liste des compétences.
 */
export function provenToolLabels(list: Project[] = projects): string[] {
  const ids = new Set<ToolId>()
  for (const p of availableProjects(list)) {
    for (const t of p.tools) if (!(p.toolsFromCv ?? []).includes(t)) ids.add(t)
  }
  return skills.filter((s) => ids.has(s.id)).map((s) => shortLabel(s.id))
}

/** Trois chiffres de la page d'accueil, calculés par `stats` (aucun nombre en dur). */
export function homeFigures(list: Project[] = projects): { label: string; value: number }[] {
  const s = stats(list)
  return [
    { label: 'Réalisations', value: s.total },
    { label: 'Fiches détaillées', value: s.detailed },
    { label: 'Outils cités', value: s.tools },
  ]
}

/** Pluriel français : 0 et 1 au singulier. */
export function plural(n: number, one: string, many: string = `${one}s`): string {
  return n > 1 ? many : one
}

/** « 9 réalisations, dont 4 détaillées : SQL, R, Excel, VBA. » */
export function accroche(list: Project[] = projects): string {
  const { total, detailed } = stats(list)
  const tools = provenToolLabels(list)
  const head = `${total} ${plural(total, 'réalisation')}, dont ${detailed} ${plural(detailed, 'détaillée')}`
  return tools.length > 0 ? `${head} : ${tools.join(', ')}.` : `${head}.`
}
