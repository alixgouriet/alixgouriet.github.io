import { describe, expect, it } from 'vitest'
import { SKILL_GROUPS } from '../../src/data/skillGroups.ts'
import { skills } from '../../src/data/skills.ts'

describe('groupes de compétences de l’accueil', () => {
  it('chaque outil de skills.ts est dans un groupe, exactement une fois (aucun ne disparaît en silence)', () => {
    const grouped = SKILL_GROUPS.flatMap((g) => g.ids)
    expect(new Set(grouped).size, 'doublon entre groupes').toBe(grouped.length)
    expect([...grouped].sort()).toEqual(skills.map((s) => s.id).sort())
  })
})
