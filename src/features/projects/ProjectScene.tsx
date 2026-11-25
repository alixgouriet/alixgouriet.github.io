import type { CSSProperties } from 'react'
import { ProjectVisual } from '../../charts/ProjectVisual.tsx'
import { Scene } from '../../components/fx/Scene.tsx'
import type { AvailableProject } from '../../data/types.ts'
import { SCENE_STEPS } from '../home/scenes.ts'

/**
 * Scène « histoire » d'une fiche : titre h2, résultat vérifié en texte statique, visuel qui se construit étape par étape
 * et légende (liste d'étapes). Écran ≥ 1024 × 700 sans reduced-motion : la scène est épinglée (sticky) et le défilement
 * natif la fait avancer. Sinon : colonne en flux normal, toutes les étapes visibles en liste.
 * Mouvement : voir scenes.css et MOUVEMENT.md.
 */
export function ProjectScene({ project: p, tone = 'dark' }: { project: AvailableProject; tone?: 'dark' | 'gray' }) {
  const id = `tuile-${p.slug}`
  const steps = SCENE_STEPS[p.slug] ?? []
  const n = steps.length
  return (
    <Scene steps={n} labelledBy={id} className={`ap-tile ap-tile--${tone} home-tile scene--${p.slug}`}>
      <div className="scene-stage">
        <div className="scene-head">
          <p className="ap-eyebrow">
            {p.category}, {p.period.toLowerCase()}
          </p>
          <h2 id={id} className="ap-title-lg scene-title" data-fx="rise">
            En images
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
          </div>
        </div>
      </div>
    </Scene>
  )
}
