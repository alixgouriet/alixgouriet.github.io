import { Link } from 'react-router'
import type { skillsWithProofs } from '../../data/derive.ts'

type Row = ReturnType<typeof skillsWithProofs>[number]

/**
 * Preuves d’un outil : puces-liens vers les projets, ou « Mentionné dans mon CV ». Aucun niveau.
 * Quand l’outil vient seulement du CV (`toolsFromCv`, aucun fichier montré), la puce le dit à l’écran : « d’après mon CV ».
 */
export function SkillProofs({ skill, proofs }: Row) {
  if (proofs.length === 0) return <p className="pg-cv">Mentionné dans mon CV</p>
  return (
    <ul className="pg-chips">
      {proofs.map((p) => {
        const fromCv = p.toolsFromCv?.includes(skill.id) ?? false
        return (
          <li key={p.slug}>
            <Link
              to={`/projets/${p.slug}`}
              className="pg-chip"
              aria-label={fromCv ? `${skill.label}, utilisé dans ${p.title}, d’après mon CV` : `${skill.label}, prouvé par ${p.title}`}
              viewTransition
            >
              {p.title}
              {fromCv && <span className="pg-chip__src">, d’après mon CV</span>}
            </Link>
          </li>
        )
      })}
    </ul>
  )
}
