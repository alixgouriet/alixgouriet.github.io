import type { CSSProperties } from 'react'
import { stepStart } from '../components/fx/sceneEngine.ts'
import { PRIX_STEPS } from '../features/home/scenes.ts'

/**
 * Les 5 segments modélisés de la SAÉ (libellés de la fiche) avec la transformation réellement utilisée dans
 * code_final.R (voir scenes.ts). Aucune valeur chiffrée, ni nuage de points, ni droite : visuel factuel.
 * `steps` (scène de l'accueil) : un segment par étape.
 */
export function SegmentsVisual({ steps }: { steps?: number }) {
  return (
    <ul className="segments" aria-label="Les 5 segments modélisés, un modèle de régression par segment">
      {PRIX_STEPS.map((s, i) => (
        <li
          key={s.label}
          className={steps ? 'seg-st' : undefined}
          style={steps ? ({ '--k': stepStart(i, steps) } as CSSProperties) : undefined}
        >
          <span>{s.label}</span>
          <span className="segments__tag" aria-hidden="true">
            {s.tag}
          </span>
        </li>
      ))}
    </ul>
  )
}
