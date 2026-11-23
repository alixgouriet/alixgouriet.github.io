import { describe, expect, it } from 'vitest'
import { contact } from '../../src/data/contact.ts'
import { formatPeriod, semesterOf } from '../../src/data/dates.ts'
import {
  availableProjects,
  chronological,
  filterProjects,
  filtersToParams,
  findProject,
  isFiltering,
  NO_FILTER,
  numbering,
  parseFilters,
  pendingProjects,
  periods,
  proofsFor,
  recentFirst,
  showFilters,
  skillsWithProofs,
  stats,
  usedTools,
  accroche,
  provenToolLabels,
  plural,
} from '../../src/data/derive.ts'
import { projects } from '../../src/data/projects.ts'
import { skills } from '../../src/data/skills.ts'
import { NON_TOOL_LABELS, TOOL_LABELS } from '../../src/data/tools.ts'
import { ACCROCHE } from '../../src/data/copy.ts'
import type { AvailableProject, Project } from '../../src/data/types.ts'

const slugs = (l: Project[]) => l.map((p) => ('slug' in p ? p.slug : p.id))

describe('données', () => {
  it('9 réalisations : 4 avec fiche, 5 sans', () => {
    expect(projects).toHaveLength(9)
    expect(availableProjects()).toHaveLength(4)
    expect(pendingProjects()).toHaveLength(5)
  })

  it('slugs et identifiants uniques', () => {
    const all = slugs(projects)
    expect(new Set(all).size).toBe(all.length)
  })

  it('les outils des projets avec fiche sont connus', () => {
    const known = new Set(skills.map((s) => s.id))
    for (const p of availableProjects()) for (const t of p.tools) expect(known.has(t)).toBe(true)
  })

  it('un projet sans fiche n\'a ni slug, ni outils de preuve', () => {
    for (const p of pendingProjects()) {
      expect('slug' in p).toBe(false)
      expect('tools' in p).toBe(false)
      expect('toolsFromCv' in p).toBe(false)
    }
  })

  it('date : période, mois, année et semestre cohérents', () => {
    for (const p of projects) {
      expect(p.period).toBe(formatPeriod(p.year, p.month))
      expect(p.semester).toBe(semesterOf(p.month))
      expect(p.month).toBeGreaterThanOrEqual(1)
      expect(p.month).toBeLessThanOrEqual(12)
    }
  })

  it('dates et semestres confirmés par l\'étudiante', () => {
    const expected: Record<string, [string, 1 | 2]> = {
      'prix-immobiliers-niortais': ['Avril 2026', 2],
      greensd: ['Juin 2026', 2],
      educheck: ['Janvier 2026', 1],
      'villes-natalistes': ['Octobre 2025', 1],
      'presentation-territoire': ['Octobre 2025', 1],
      'gestion-fichiers': ['Octobre 2025', 1],
      'diagnostic-fleury-michon': ['Mai 2026', 2],
      'echantillonnage-centre-val-de-loire': ['Mai 2026', 2],
      mycotrack: ['Juin 2026', 2],
    }
    for (const p of projects) {
      const [period, sem] = expected[slugs([p])[0]]
      expect([p.period, p.semester]).toEqual([period, sem])
    }
  })

  it('aucun contenu publié ne cite « Printemps 2025 » ni « à confirmer »', () => {
    const text = JSON.stringify({ projects, skills, contact }).toLowerCase()
    expect(text).not.toContain('printemps')
    expect(text).not.toContain('à confirmer')
    expect(text).not.toContain('déployée en production')
  })

  it('le LinkedIn est fourni par Alix (https, profil /in/)', () => {
    expect(contact.linkedin).toBe('https://www.linkedin.com/in/alix-gouriet-05381b23a/')
    expect(contact.linkedin).toMatch(/^https:\/\/www\.linkedin\.com\/in\//)
    expect(contact.cvHref).toBe('/cv-alix-gouriet.pdf')
  })
})

describe('preuves de compétences (non-régression)', () => {
  it('seuls les projets avec fiche prouvent un outil', () => {
    expect(proofsFor('vba').map((p) => p.slug)).toEqual(['educheck'])
    expect(proofsFor('excel')).toHaveLength(3)
    expect(proofsFor('r').map((p) => p.slug)).toEqual(['prix-immobiliers-niortais'])
    expect(proofsFor('sql').map((p) => p.slug)).toEqual(['greensd'])
    expect(skillsWithProofs()).toHaveLength(skills.length)
  })

  it('SAS, HTML, CSS, JavaScript restent « Mentionné dans mon CV » (aucune preuve)', () => {
    for (const id of ['sas', 'html', 'css', 'javascript'] as const) expect(proofsFor(id)).toEqual([])
  })

  it('Python : aucune preuve, ni via MycoTrack ni via Gestion de fichiers (sans fiche)', () => {
    const py = proofsFor('python').map((p) => p.slug)
    expect(py).toEqual(['greensd'])
    for (const p of availableProjects()) expect(p.toolsFromCv ?? []).not.toContain('r')
  })

  it('un projet sans fiche ne change jamais une preuve, même s\'il nomme la technologie', () => {
    const before = skillsWithProofs(availableProjects()).map((x) => x.proofs.length)
    const after = skillsWithProofs(projects).map((x) => x.proofs.length)
    expect(after).toEqual(before)
  })
})

describe('tri, numérotation, recherche', () => {
  it('chronologie : 01 = le plus ancien, ordre non décroissant', () => {
    const c = chronological()
    const t = c.map((p) => p.year * 12 + p.month)
    expect([...t].sort((a, b) => a - b)).toEqual(t)
    const n = numbering()
    expect(n.size).toBe(9)
    expect(n.get('villes-natalistes')).toBe(1)
    expect(n.get('mycotrack')).toBe(9)
    expect(n.get('greensd')).toBe(8)
    expect([...n.values()].sort((a, b) => a - b)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9])
  })

  it('affichage : du plus récent au plus ancien, numéros strictement décroissants', () => {
    const n = numbering()
    const shown = recentFirst().map((p) => n.get(slugs([p])[0]) as number)
    expect(shown).toEqual([9, 8, 7, 6, 5, 4, 3, 2, 1])
    expect(slugs(recentFirst()).at(-1)).toBe('villes-natalistes')
  })

  it('la numérotation ne dépend pas du filtre', () => {
    const n = numbering(projects)
    const filtered = filterProjects(recentFirst(), { ...NO_FILTER, semester: 1 })
    expect(slugs(filtered).map((s) => n.get(s))).toEqual([4, 3, 2, 1])
  })

  it('findProject ignore les projets sans fiche et les slugs inconnus', () => {
    expect(findProject('greensd')?.title).toBe('GreenSD')
    expect(findProject('mycotrack')).toBeUndefined()
    expect(findProject('gestion-fichiers')).toBeUndefined()
    expect(findProject(undefined)).toBeUndefined()
  })
})

describe('filtres', () => {
  const all = recentFirst()

  it('les filtres s\'affichent dès 5 projets (toutes fiches confondues)', () => {
    expect(showFilters(projects)).toBe(true)
    expect(showFilters(projects.slice(0, 4))).toBe(false)
    const many: Project[] = Array.from({ length: 5 }, (_, i): AvailableProject => ({
      status: 'disponible',
      slug: `p${i}`,
      title: `P${i}`,
      period: 'x',
      year: 2026,
      month: 1,
      semester: 1,
      technologies: [],
      category: 'Statistiques',
      tools: ['r'],
      summary: 's',
      result: 'r',
    }))
    expect(showFilters(many)).toBe(true)
  })

  it('sans filtre : tout passe', () => {
    expect(filterProjects(all, NO_FILTER)).toHaveLength(9)
    expect(isFiltering(NO_FILTER)).toBe(false)
  })

  it('technologie, période et semestre se combinent (ET)', () => {
    expect(slugs(filterProjects(all, { ...NO_FILTER, tech: 'R' }))).toEqual([
      'echantillonnage-centre-val-de-loire',
      'prix-immobiliers-niortais',
    ])
    expect(filterProjects(all, { ...NO_FILTER, tech: 'Python' })).toHaveLength(3)
    expect(filterProjects(all, { ...NO_FILTER, period: '2025-10' })).toHaveLength(3)
    expect(filterProjects(all, { ...NO_FILTER, semester: 2 })).toHaveLength(5)
    expect(filterProjects(all, { tech: 'Excel', period: '2026-05', semester: 2 })).toHaveLength(2)
    expect(filterProjects(all, { tech: 'VBA', period: null, semester: 2 })).toHaveLength(0)
  })

  it('options : technologies distinctes triées, périodes récentes d\'abord', () => {
    const t = usedTools()
    expect(new Set(t).size).toBe(t.length)
    expect(t).toEqual([...t].sort((a, b) => a.localeCompare(b, 'fr')))
    expect(periods().map((p) => p.value)).toEqual(['2026-06', '2026-05', '2026-04', '2026-01', '2025-10'])
    expect(periods()[0].label).toBe('Juin 2026')
  })

  it('URL : aller-retour, valeurs inconnues ignorées', () => {
    const f = { tech: 'R', period: '2026-04', semester: 2 as const }
    expect(parseFilters(filtersToParams(f))).toEqual(f)
    expect(parseFilters(new URLSearchParams('techno=Cobol&periode=1999-01&semestre=3'))).toEqual(NO_FILTER)
    expect(filtersToParams(NO_FILTER).toString()).toBe('')
  })
})

describe('outils réels (liste blanche)', () => {
  it('chaque libellé des données est classé : outil ou non-outil, jamais les deux', () => {
    const labels = new Set(projects.flatMap((p) => p.technologies))
    for (const l of labels) expect(TOOL_LABELS.has(l) !== NON_TOOL_LABELS.has(l), l).toBe(true)
    for (const l of TOOL_LABELS) expect(NON_TOOL_LABELS.has(l), l).toBe(false)
  })

  it('15 outils : langues, formats et domaines exclus', () => {
    const t = usedTools()
    expect(t).toHaveLength(15)
    for (const x of ['R', 'Python', 'SQL', 'MySQL', 'Excel', 'VBA', 'Tkinter', 'Streamlit', 'Plotly', 'Folium', 'Spyder', 'PowerPoint', 'GitHub', 'SSH', 'AlwaysData'])
      expect(t, x).toContain(x)
    for (const x of ['Oral', 'Anglais', 'Français', 'CSV', 'JSON', 'Statistiques', 'Datavisualisation', 'Analyse financière'])
      expect(t, x).not.toContain(x)
  })

  it('le filtre d\'URL refuse un libellé qui n\'est pas un outil', () => {
    expect(parseFilters(new URLSearchParams('techno=CSV')).tech).toBeNull()
    expect(parseFilters(new URLSearchParams('techno=Streamlit')).tech).toBe('Streamlit')
  })
})

describe('compteurs d\'en-tête et accroche', () => {
  it('calculés sur les données : 9 réalisations, 4 fiches, 15 outils', () => {
    expect(stats(projects)).toEqual({ total: 9, detailed: 4, tools: 15 })
    expect(stats(projects.slice(0, 2))).toEqual({ total: 2, detailed: 2, tools: stats(projects.slice(0, 2)).tools })
  })

  it('aucune dépendance à la date du jour', () => {
    expect(stats.length).toBeLessThanOrEqual(1)
  })

  it('pluriels', () => {
    expect(plural(0, 'projet')).toBe('projet')
    expect(plural(1, 'projet')).toBe('projet')
    expect(plural(2, 'projet')).toBe('projets')
  })

  it('accroche : nombres calculés, outils prouvés seulement (Python exclu : CV seul)', () => {
    expect(provenToolLabels()).toEqual(['SQL', 'R', 'Excel', 'VBA'])
    expect(ACCROCHE).toBe('9 réalisations, dont 4 détaillées, avec SQL, R, Excel et VBA.')
    expect(accroche(projects.slice(0, 1))).toBe('1 réalisation, dont 1 détaillée : SQL.') // GreenSD seul
    expect(accroche([])).toBe('0 réalisation, dont 0 détaillée.')
  })
})
