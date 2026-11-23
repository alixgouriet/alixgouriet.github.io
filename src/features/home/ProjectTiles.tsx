import type { CSSProperties } from 'react'
import { Link } from 'react-router'
import { ProjectVisual } from '../../charts/ProjectVisual.tsx'
import { Scene } from '../../components/fx/Scene.tsx'
import { availableProjects, recentFirst } from '../../data/derive.ts'
import type { AvailableProject } from '../../data/types.ts'
import { SCENE_STEPS } from './scenes.ts'

/** Alternance noir / gris, comme les tuiles d'apple.fr. */
const TONES = ['dark', 'gray', 'dark', 'gray'] as const

/**
 * Quatre scènes « histoire » : titre h2, résultat vérifié en texte statique, visuel qui se construit étape par étape,
 * légende (liste d'étapes) et un seul lien « En savoir plus sur … ».
 * Écran ≥ 1024 × 700 sans reduced-motion : la scène est épinglée (sticky) et le défilement natif la fait avancer.
 * Sinon : colonne en flux normal, toutes les étapes visibles en liste. Mouvement : voir scenes.css et MOUVEMENT.md.
 */
export function ProjectTiles() {
  const items = recentFirst(availableProjects()) as AvailableProject[]
  return (
    <div className="home-stack">
      {items.map((p, i) => {
        const tone = TONES[i % TONES.length]
        const id = `tuile-${p.slug}`
        const steps = SCENE_STEPS[p.slug] ?? []
        const n = steps.length
        return (
          <Scene key={p.slug} steps={n} labelledBy={id} className={`ap-tile ap-tile--${tone} home-tile scene--${p.slug}`}>
            <div className="scene-stage">
              <div className="scene-head">
                <p className="ap-eyebrow">
                  {p.category}, {p.period.toLowerCase()}
                </p>
                <h2 id={id} className="ap-title-lg scene-title" data-fx="rise">
                  {p.title}
                </h2>
                <p className="ap-subtitle scene-result" data-fx="rise-late">
                  {p.result}
                </p>
              </div>
              <div className="scene-body">
                <div className="scene-media">
                  <div className={`scene-reveal home-visual--${p.slug}`} data-fx="tile">
                    <ProjectVisual slug={p.slug} plain steps={n} />
                  </div>
                </div>
                <div className="scene-side">
                  <ol className="scene-legend" aria-label={`Étapes : ${p.title}`}>
                    {steps.map((s, k) => (
                      <li key={s.label} className="scene-step" style={{ '--i': k } as CSSProperties}>
                        <span className="scene-step__label">{s.label}</span>
                        <span className="scene-step__text">{s.text}</span>
                      </li>
                    ))}
                  </ol>
                  <p className="scene-more">
                    <Link to={`/projets/${p.slug}`} className="ap-link-more home-more-link" viewTransition>
                      En savoir plus<span className="sr-only"> sur {p.title}</span>
                    </Link>
                  </p>
                </div>
              </div>
            </div>
          </Scene>
        )
      })}
    </div>
  )
}
