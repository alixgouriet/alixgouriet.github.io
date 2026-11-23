import { fitLeastSquares } from '../features/hero/math.ts'
import { points } from '../features/hero/points.ts'

const W = 640
const H = 420
const M = 24
const DOMAIN = 10
const sx = (x: number) => M + (x / DOMAIN) * (W - 2 * M)
const sy = (y: number) => H - M - (y / DOMAIN) * (H - 2 * M)
const fit = fitLeastSquares(points)
const GRID = [0, 2.5, 5, 7.5, 10]
const f = (n: number) => n.toFixed(1)

/** Nuage illustratif et droite des moindres carrés (points déterministes, pas de données réelles). */
export function RegressionVisual() {
  const y = (x: number) => fit.intercept + fit.slope * x
  return (
    <figure className="m-0">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="rv"
        role="img"
        aria-label={`Nuage de ${points.length} points illustratifs et droite des moindres carrés, avec les écarts verticaux en rouge.`}
      >
        <g className="rv-grid" aria-hidden="true">
          {GRID.map((g) => (
            <g key={g}>
              <line x1={f(sx(g))} x2={f(sx(g))} y1={M} y2={H - M} />
              <line x1={M} x2={W - M} y1={f(sy(g))} y2={f(sy(g))} />
            </g>
          ))}
        </g>
        <g className="rv-res" aria-hidden="true">
          {points.map((p, i) => (
            <line key={i} x1={f(sx(p.x))} x2={f(sx(p.x))} y1={f(sy(p.y))} y2={f(sy(y(p.x)))} />
          ))}
        </g>
        <g className="rv-fit" aria-hidden="true">
          <line x1={f(sx(0))} y1={f(sy(y(0)))} x2={f(sx(DOMAIN))} y2={f(sy(y(DOMAIN)))} />
        </g>
        <g className="rv-pts" aria-hidden="true">
          {points.map((p, i) => (
            <circle key={i} cx={f(sx(p.x))} cy={f(sy(p.y))} r="5" />
          ))}
        </g>
      </svg>
      <figcaption className="visual-cap is-dup">Nuage illustratif, pas des données réelles.</figcaption>
    </figure>
  )
}
