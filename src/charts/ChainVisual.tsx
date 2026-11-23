import type { CSSProperties } from 'react'
import { stepStart } from '../components/fx/sceneEngine.ts'

const STEPS = ['Semestre', 'Compétence', 'Matière'] as const

const at = (i: number, steps?: number) => (steps ? ({ '--k': stepStart(i, steps) } as CSSProperties) : undefined)

/**
 * Chaîne de saisie d'EduCheck : listes liées, puis note convertie sur 20.
 * `steps` (scène de l'accueil) : nœuds 0 à 2 = les trois listes, nœud 3 = contrôle de saisie (étape 3),
 * puis remplissage « converti sur 20 » (étape 4). Sans `steps`, tout est visible.
 */
export function ChainVisual({ caption = true, steps }: { caption?: boolean; steps?: number }) {
  return (
    <figure className="m-0">
      <ol className="chain" aria-label="Saisie d’une note : semestre, compétence, matière, puis note sur 20">
        {STEPS.map((s, i) => (
          <li key={s} className={steps ? 'chain-st' : undefined} style={at(i, steps)}>
            {s}
          </li>
        ))}
        <li className={steps ? 'chain-st' : undefined} style={at(3, steps)}>
          Note sur 20
          {steps ? <span className="chain-fill" aria-hidden="true" style={at(4, steps)} /> : null}
        </li>
      </ol>
      {caption && (
        <figcaption className="visual-cap">
          Schéma de la saisie : chaque liste dépend de la précédente, puis la note est convertie sur 20.
        </figcaption>
      )}
    </figure>
  )
}
