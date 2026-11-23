import { Link } from 'react-router'
import { ProjectVisual } from '../../charts/ProjectVisual.tsx'
import { availableProjects, recentFirst } from '../../data/derive.ts'
import type { AvailableProject } from '../../data/types.ts'

/** Alternance noir / gris, comme les tuiles d'apple.fr. */
const TONES = ['dark', 'gray', 'dark', 'gray'] as const

/** Quatre tuiles plein écran : titre, une ligne vérifiée, un seul lien, visuel statique. Mouvement : voir effects.css. Aucun texte n'est masqué avant révélation. */
export function ProjectTiles() {
  const items = recentFirst(availableProjects()) as AvailableProject[]
  return (
    <div className="home-stack">
      {items.map((p, i) => {
        const tone = TONES[i % TONES.length]
        const id = `tuile-${p.slug}`
        return (
          <article key={p.slug} className={`ap-tile ap-tile--${tone} ap-tile--tall home-tile`} aria-labelledby={id}>
            <div className="home-tile__body">
              <p className="ap-eyebrow">
                {p.category}, {p.period.toLowerCase()}
              </p>
              <h2 id={id} className="ap-title-lg home-tile__title" data-fx="rise">
                {p.title}
              </h2>
              <p className="ap-subtitle home-tile__line" data-fx="rise-late">
                {p.result}
              </p>
              <div className="home-links">
                <Link to={`/projets/${p.slug}`} className="ap-link-more home-more-link" viewTransition>
                  En savoir plus<span className="sr-only"> sur {p.title}</span>
                </Link>
              </div>
              <div className={`home-visual home-visual--${p.slug}`} data-fx="tile">
                <ProjectVisual slug={p.slug} plain />
              </div>
            </div>
          </article>
        )
      })}
    </div>
  )
}
