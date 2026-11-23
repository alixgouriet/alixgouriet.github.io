import type { CSSProperties } from 'react'

const ROWS = [
  { label: 'Échantillon de villes natalistes', value: 5, main: true },
  { label: 'France entière', value: 6, main: false },
] as const

/** Deux barres sur une même base zéro : population 2016 à 2022 (+5 % et +6 %). */
export function GrowthBars({ animate = true, caption = true }: { animate?: boolean; caption?: boolean }) {
  return (
    <figure className="m-0">
      <ul className="bars" aria-label="Évolution de la population, 2016 à 2022">
        {ROWS.map((r) => (
          <li key={r.label} className="bar-row">
            <span className="bar-label">
              <span>{r.label}</span>
              <span className="mono">+{r.value}\u202F%</span>
            </span>
            <span className="bar-track" aria-hidden="true">
              <span
                className={r.main ? 'bar-fill is-main' : 'bar-fill'}
                data-fx={animate ? 'bar' : undefined}
                style={{ display: 'block', '--v': r.value } as CSSProperties}
              />
            </span>
          </li>
        ))}
      </ul>
      {caption && <figcaption className="visual-cap is-dup">Évolution de la population, 2016 à 2022.</figcaption>}
    </figure>
  )
}
