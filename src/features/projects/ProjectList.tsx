import { Link } from 'react-router'
import type { Project } from '../../data/types.ts'
import { projectKey, subtitleOf } from '../../data/derive.ts'
import { Illustration } from '../../charts/illustrations/Illustration.tsx'

interface Props {
  items: Project[]
  /** Numéro chronologique de chaque projet (1 = le plus ancien), fixe quel que soit le filtre. */
  numbers: Map<string, number>
  /** Change à chaque filtre : relance le fondu de 120 ms. */
  fadeKey: string
}

export function ProjectList({ items, numbers, fadeKey }: Props) {
  return (
    <ul className="ap-tile-grid pg-grid" key={fadeKey}>
      {items.map((p) => (
        <ProjectTile key={projectKey(p)} p={p} n={numbers.get(projectKey(p)) ?? 0} />
      ))}
    </ul>
  )
}

function ProjectTile({ p, n }: { p: Project; n: number }) {
  const link = p.status === 'disponible'
  const body = (
    <>
      <span className="pg-thumb" aria-hidden="true">
        <Illustration id={p.status === 'disponible' ? p.slug : p.id} size="thumb" />
      </span>
      <span className="pg-num tnum" aria-hidden="true">
        {String(n).padStart(2, '0')}
      </span>
      <span className="pg-tile-title ap-title-md">{p.title}</span>
      <span className="pg-tile-sub">{subtitleOf(p)}</span>
      <ul className="pg-tags" aria-label="Outils">
        {p.technologies.map((t) => (
          <li key={t}>{t}</li>
        ))}
      </ul>
      <span className="pg-meta">
        <span className="tnum">{p.period}</span>
        <span>Semestre {p.semester}</span>
      </span>
      {link ? (
        <span className="pg-more" aria-hidden="true">
          En savoir plus
        </span>
      ) : (
        <span className="pg-badge">Fiche en préparation</span>
      )}
    </>
  )
  return (
    <li className="pg-cell ap-reveal">
      {link ? (
        // Pas d'aria-labelledby : le nom accessible est le contenu visible (WCAG 2.5.3).
        <Link to={`/projets/${p.slug}`} className="ap-tile ap-tile--gray pg-tile" viewTransition>
          {body}
        </Link>
      ) : (
        // Non cliquable : bloc simple sans rôle (jamais annoncé comme lien), aria-disabled, raison dite en texte (badge).
        <div className="ap-tile ap-tile--white pg-tile pg-tile--soon" aria-disabled="true">
          {body}
        </div>
      )}
    </li>
  )
}
