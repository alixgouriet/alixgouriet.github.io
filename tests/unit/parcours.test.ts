import { describe, expect, it } from 'vitest'
import { INTERESTS, PARCOURS_STEPS, parcoursByColumn } from '../../src/data/parcours.ts'

describe('parcours', () => {
  it('5 étapes, identifiants uniques', () => {
    expect(PARCOURS_STEPS).toHaveLength(5)
    const ids = PARCOURS_STEPS.map((s) => s.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('formation = 3 étapes (stage, BUT, bac), expérience = 2', () => {
    expect(parcoursByColumn('formation')).toHaveLength(3)
    expect(parcoursByColumn('experience')).toHaveLength(2)
  })

  it('la formation suit l’ordre stage, BUT, bac', () => {
    expect(parcoursByColumn('formation').map((s) => s.id)).toEqual(['stage', 'but', 'bac'])
  })

  it('indices contigus par colonne, formation d’abord (le rail et l’allumage en dépendent)', () => {
    const idx = (c: 'formation' | 'experience') => parcoursByColumn(c).map((s) => PARCOURS_STEPS.indexOf(s))
    for (const c of ['formation', 'experience'] as const) {
      const ix = idx(c)
      expect(ix.length, c).toBeGreaterThan(0)
      ix.forEach((v, k) => expect(v, `${c} #${k}`).toBe(ix[0] + k))
    }
    expect(Math.max(...idx('formation'))).toBeLessThan(Math.min(...idx('experience')))
    expect(idx('formation')[0]).toBe(0)
  })

  it('chaque étape a une source, un libellé de date et un texte non vides', () => {
    for (const s of PARCOURS_STEPS) {
      expect(s.source.trim(), s.id).not.toBe('')
      expect(s.when.trim(), s.id).not.toBe('')
      expect(s.text.trim(), s.id).not.toBe('')
    }
  })

  it('aucun texte ne cite Oracle, Aubusson, « à confirmer », « \\u » ni « % »', () => {
    const text = JSON.stringify(PARCOURS_STEPS)
    expect(text).not.toContain('Oracle')
    expect(text).not.toContain('Aubusson')
    expect(text).not.toContain('à confirmer')
    expect(text).not.toContain('\\u')
    expect(text).not.toContain('%')
  })

  it('centres d’intérêt exacts', () => {
    expect(INTERESTS).toEqual(['Courses d’endurance (24 Heures du Mans)', 'Voyages', 'Simracing', 'Trail', 'Musculation', 'Badminton'])
  })
})
