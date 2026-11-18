import { Link } from 'react-router'
import type { Project } from '../../data/types.ts'
import { toolLabel } from '../../data/derive.ts'

export function ProjectList({ items }: { items: Project[] }) {
  return (
    <ul className="plist">
      {items.map((p) =>
        p.status === 'disponible' ? (
          <li key={p.slug}>
            <Link to={`/projets/${p.slug}`} className="prow" viewTransition>
              <span>
                <span className="prow-title">{p.title}</span>
                <span className="prow-summary">
                  {p.result}
                </span>
              </span>
              <span className="prow-meta">
                <span className="tnum">{p.period}</span>
                <br />
                {p.tools.map(toolLabel).join(' · ')}
              </span>
              <span className="prow-arrow" aria-hidden="true">
                →
              </span>
            </Link>
          </li>
        ) : (
          <li key={p.id}>
            <div className="prow prow-soon">
              <span>
                <span className="prow-title">{p.title}</span>{' '}
                <span className="badge">À venir</span>
                <span className="prow-summary">
                  Fiche en préparation
                </span>
              </span>
              <span className="prow-meta">
                <span className="tnum">{p.period}</span>
              </span>
            </div>
          </li>
        ),
      )}
    </ul>
  )
}
