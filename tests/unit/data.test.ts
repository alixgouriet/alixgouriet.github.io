import { describe, expect, it } from 'vitest'
import { contact } from '../../src/data/contact.ts'
import {
  availableProjects,
  filterProjects,
  findProject,
  orderProjects,
  proofsFor,
  showFilters,
  skillsWithProofs,
  upcomingProjects,
} from '../../src/data/derive.ts'
import { projects } from '../../src/data/projects.ts'
import { skills } from '../../src/data/skills.ts'
import type { AvailableProject, Project } from '../../src/data/types.ts'

describe('données', () => {
  it('slugs uniques et identifiants à venir uniques', () => {
    const slugs = availableProjects().map((p) => p.slug)
    expect(new Set(slugs).size).toBe(slugs.length)
    const ids = upcomingProjects().map((p) => p.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('tous les outils des projets sont connus', () => {
    const known = new Set(skills.map((s) => s.id))
    for (const p of projects) for (const t of p.tools) expect(known.has(t)).toBe(true)
  })

  it('un projet à venir n\'a ni slug ni lien', () => {
    for (const p of upcomingProjects()) expect('slug' in p).toBe(false)
  })

  it('aucune mention « à confirmer » dans le contenu publié', () => {
    const text = JSON.stringify({ projects, skills, contact }).toLowerCase()
    expect(text).not.toContain('à confirmer')
  })

  it('le LinkedIn est absent tant que non fourni', () => {
    expect(contact.linkedin).toBeNull()
    expect(contact.cvHref).toBe('/cv-alix-gouriet.pdf')
  })
})

describe('dérivés', () => {
  it('preuves : outil documenté → projets, sinon vide (« Sur CV »)', () => {
    expect(proofsFor('vba').map((p) => p.slug)).toEqual(['educheck'])
    expect(proofsFor('excel').length).toBe(3)
    for (const id of ['sas', 'html', 'css', 'javascript'] as const) {
      expect(proofsFor(id)).toEqual([])
    }
    expect(skillsWithProofs()).toHaveLength(skills.length)
  })

  it('les projets disponibles précèdent les projets à venir', () => {
    const order = orderProjects().map((p) => p.status)
    expect(order.lastIndexOf('disponible')).toBeLessThan(order.indexOf('a-venir'))
  })

  it('findProject ignore les projets à venir et les slugs inconnus', () => {
    expect(findProject('greensd')?.title).toBe('GreenSD')
    expect(findProject('conversion-fichiers')).toBeUndefined()
    expect(findProject(undefined)).toBeUndefined()
  })

  it('les filtres sont masqués sous 5 projets disponibles', () => {
    expect(showFilters(projects)).toBe(false)
    const many: Project[] = Array.from({ length: 5 }, (_, i): AvailableProject => ({
      status: 'disponible',
      slug: `p${i}`,
      title: `P${i}`,
      period: 'x',
      category: 'Statistiques',
      tools: ['r'],
      summary: 's',
      result: 'r',
    }))
    expect(showFilters(many)).toBe(true)
  })

  it('filterProjects combine les groupes (ET) et les valeurs (OU)', () => {
    const list = availableProjects()
    expect(filterProjects(list, { categories: [], tools: [] })).toHaveLength(list.length)
    expect(filterProjects(list, { categories: ['Statistiques'], tools: [] })).toHaveLength(2)
    expect(filterProjects(list, { categories: ['Statistiques'], tools: ['r'] }).map((p) => p.slug)).toEqual([
      'prix-immobiliers-niortais',
    ])
    expect(filterProjects(list, { categories: [], tools: ['sql', 'vba'] })).toHaveLength(2)
  })
})
