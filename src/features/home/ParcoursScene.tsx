import type { CSSProperties } from 'react'
import { Scene } from '../../components/fx/Scene.tsx'
import { INTERESTS, PARCOURS_STEPS, parcoursByColumn, type ParcoursColumn } from '../../data/parcours.ts'
import '../../styles/parcours.css'

const COLUMNS: { column: ParcoursColumn; label: string }[] = [
  { column: 'formation', label: 'Formation' },
  { column: 'experience', label: 'Expériences' },
]

const N = PARCOURS_STEPS.length

/**
 * Scène « Mon parcours » : formation et expériences en deux colonnes, chaque étape s’allumant l’une après l’autre
 * pendant que la scène est épinglée (≥ 1024 × 700, sans reduced-motion). Sinon : colonne normale, tout est visible.
 * La frise ne contient ni lien ni bouton. Les centres d’intérêt sont sous la scène, hors épinglage.
 */
export function ParcoursScene() {
  return (
    <section className="parcours" aria-labelledby="parcours-titre">
      <Scene steps={N} className="ap-tile ap-tile--gray scene--parcours">
        <div className="scene-stage">
          <div className="scene-head">
            <h2 id="parcours-titre" className="ap-title-lg scene-title" data-fx="rise">
              Mon parcours
            </h2>
          </div>
          <div className="scene-body parcours-body">
            {COLUMNS.map(({ column, label }) => {
              const steps = parcoursByColumn(column)
              if (steps.length === 0) return null // colonne vide : aucun rail (--from vaudrait -1)
              // Rang global : formation d’abord, puis expériences (ordre de PARCOURS_STEPS).
              const from = PARCOURS_STEPS.indexOf(steps[0])
              const items = steps.map((s) => {
                const i = PARCOURS_STEPS.indexOf(s)
                return (
                  <li
                    key={s.id}
                    className="scene-step parcours-step"
                    style={{ '--i': i, '--k': (i - 0.6) / N, '--w': 0.6 / N } as CSSProperties}
                  >
                    <time className="parcours-step__when" dateTime={s.dateTime}>
                      {s.when}
                    </time>
                    <h4 className="parcours-step__title">{s.title}</h4>
                    <p className="parcours-step__text">{s.text}</p>
                  </li>
                )
              })
              return (
                <div key={column} className="parcours-col">
                  <h3 id={`parcours-${column}`} className="ap-eyebrow parcours-col__title">
                    {label}
                  </h3>
                  <ol
                    className="parcours-rail"
                    aria-labelledby={`parcours-${column}`}
                    style={{ '--from': from, '--count': steps.length } as CSSProperties}
                  >
                    {items}
                  </ol>
                </div>
              )
            })}
          </div>
        </div>
      </Scene>
      <div className="ap-container parcours-interests">
        <h3 id="parcours-interets" className="ap-eyebrow">
          Centres d’intérêt
        </h3>
        <ul className="parcours-interests__list" aria-labelledby="parcours-interets">
          {INTERESTS.map((label) => (
            <li key={label}>{label}</li>
          ))}
        </ul>
      </div>
    </section>
  )
}
