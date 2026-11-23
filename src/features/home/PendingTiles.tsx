import { pendingProjects, recentFirst } from '../../data/derive.ts'
import type { PendingProject } from '../../data/types.ts'
import { TOOL_LABELS } from '../../data/tools.ts'

/** Réalisations sans fiche : demi-tuiles non cliquables (aucun lien, aucun focus). */
export function PendingTiles() {
  const items = recentFirst(pendingProjects()) as PendingProject[]
  return (
    <div className="ap-tile-grid">
      {items.map((p) => {
        const id = `en-attente-${p.id}`
        const tools = p.technologies.filter((t) => TOOL_LABELS.has(t))
        return (
          <article
            key={p.id}
            className="ap-tile ap-tile--gray home-half"
            aria-labelledby={id}
            aria-disabled="true"
          >
            <p className="ap-eyebrow">{p.period}</p>
            <h3 id={id} className="ap-title-md">
              {p.title}
            </h3>
            <p className="home-half__sub">{p.subtitle}</p>
            {tools.length > 0 && (
              <p className="ap-muted home-half__tools">
                <span className="sr-only">Outils : </span>
                {tools.join(', ')}
              </p>
            )}
            <p className="home-badge">Fiche en préparation</p>
          </article>
        )
      })}
    </div>
  )
}
