import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router'
import { fitLeastSquares, rSquared, sumOfSquares, type Line } from './math.ts'
import { points } from './points.ts'
import { runSpring } from './spring.ts'

const W = 640
const H = 440
const M = { left: 36, right: 12, top: 12, bottom: 32 }
const DOMAIN = 10
const sx = (x: number) => M.left + (x / DOMAIN) * (W - M.left - M.right)
const sy = (y: number) => H - M.bottom - (y / DOMAIN) * (H - M.top - M.bottom)

const fit = fitLeastSquares(points)
const INITIAL: Line = { slope: 0.15, intercept: 6 }
const SLOPE_RANGE = { min: -0.5, max: 1.5, step: 0.01 }
const INTERCEPT_RANGE = { min: -2, max: 8, step: 0.05 }
const SESSION_KEY = 'hero-intro-done'
const RESIDUAL_DELAYS = [0, 40, 90]
const GRID = [0, 2, 4, 6, 8, 10]

const nf1 = new Intl.NumberFormat('fr-FR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })
const nf2 = new Intl.NumberFormat('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

type Mode = 'idle' | 'fitting' | 'fitted'

function prefersReducedMotion(): boolean {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

function introAlreadyPlayed(): boolean {
  try {
    return sessionStorage.getItem(SESSION_KEY) === '1'
  } catch {
    return false
  }
}

export function Regression() {
  const [reduced] = useState(prefersReducedMotion)
  const [line, setLine] = useState<Line>(() => (reduced ? fit : INITIAL))
  const [mode, setMode] = useState<Mode>(() => (reduced ? 'fitted' : 'idle'))
  const [intro, setIntro] = useState(() => !reduced && !introAlreadyPlayed())
  const [labelLine, setLabelLine] = useState<Line>(line)
  const lineRef = useRef<Line>(line)
  const cancelRef = useRef<(() => void) | null>(null)

  const apply = (next: Line) => {
    lineRef.current = next
    setLine(next)
  }

  const stopSpring = () => {
    cancelRef.current?.()
    cancelRef.current = null
  }

  useEffect(() => {
    if (!intro) return
    try {
      sessionStorage.setItem(SESSION_KEY, '1')
    } catch {
      /* stockage indisponible : le dessin se rejouera */
    }
  }, [intro])

  useEffect(() => stopSpring, [])

  // L'étiquette lue par les lecteurs d'écran n'est mise à jour qu'en fin de geste.
  useEffect(() => {
    const t = setTimeout(() => setLabelLine(line), 400)
    return () => clearTimeout(t)
  }, [line])

  // Le toucher d'un curseur interrompt le dessin initial et un ajustement en cours.
  const interrupt = () => {
    if (cancelRef.current) setMode('idle')
    stopSpring()
    setIntro(false)
  }

  const onSlider = (patch: Partial<Line>) => {
    stopSpring()
    setIntro(false)
    setMode('idle')
    apply({ ...lineRef.current, ...patch })
  }

  const springTo = (target: Line, finalMode: Mode) => {
    stopSpring()
    setIntro(false)
    if (reduced) {
      apply(target)
      setMode(finalMode)
      return
    }
    const from = lineRef.current
    cancelRef.current = runSpring(
      [from.slope, from.intercept],
      [target.slope, target.intercept],
      { duration: 0.6, bounce: 0.1 },
      ([slope, intercept]) => apply({ slope, intercept }),
      () => {
        cancelRef.current = null
        setMode(finalMode)
      },
    )
  }

  const onButton = () => {
    if (mode === 'idle') {
      setMode('fitting')
      springTo(fit, 'fitted')
    } else {
      setMode('idle')
      springTo(INITIAL, 'idle')
    }
  }

  const sse = sumOfSquares(points, line)
  const r2 = rSquared(points, fit)
  const label = `Nuage de ${points.length} points illustratifs et droite de pente ${nf2.format(labelLine.slope)}, d'ordonnée à l'origine ${nf2.format(labelLine.intercept)}. Somme des carrés des écarts : ${nf1.format(sumOfSquares(points, labelLine))}.`

  const y0 = line.intercept
  const y1 = line.intercept + line.slope * DOMAIN

  return (
    <figure className="reg">
      <div className="reg-frame">
        <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={label} className="reg-svg">
          <defs>
            <clipPath id="reg-plot">
              <rect x={M.left} y={M.top} width={W - M.left - M.right} height={H - M.top - M.bottom} />
            </clipPath>
          </defs>
          <g aria-hidden="true" className="reg-grid">
            {GRID.map((g) => (
              <g key={g}>
                <line x1={sx(g)} x2={sx(g)} y1={M.top} y2={H - M.bottom} />
                <line x1={M.left} x2={W - M.right} y1={sy(g)} y2={sy(g)} />
              </g>
            ))}
          </g>
          <g clipPath="url(#reg-plot)">
            <g className={intro ? 'reg-residuals reg-intro-residuals' : 'reg-residuals'}>
              {points.map((p, i) => {
                const yl = line.intercept + line.slope * p.x
                return (
                  <line
                    key={i}
                    x1={sx(p.x)}
                    x2={sx(p.x)}
                    y1={sy(p.y)}
                    y2={sy(yl)}
                    style={intro ? { animationDelay: `${700 + RESIDUAL_DELAYS[i % 3]}ms` } : undefined}
                  />
                )
              })}
            </g>
            <g className={intro ? 'reg-line reg-intro-line' : 'reg-line'}>
              <line x1={sx(0)} y1={sy(y0)} x2={sx(DOMAIN)} y2={sy(y1)} />
            </g>
          </g>
          <g className="reg-points" aria-hidden="true">
            {points.map((p, i) => (
              <circle key={i} cx={sx(p.x)} cy={sy(p.y)} r="4.5" />
            ))}
          </g>
        </svg>
      </div>

      <div className="reg-controls">
        <label className="reg-slider">
          <span className="reg-slider-label">
            Pente <span className="tnum">{nf2.format(line.slope)}</span>
          </span>
          <input
            type="range"
            {...SLOPE_RANGE}
            value={line.slope}
            aria-valuetext={`Pente ${nf2.format(line.slope)}`}
            onPointerDown={interrupt}
            onKeyDown={interrupt}
            onChange={(e) => onSlider({ slope: Number(e.target.value) })}
          />
        </label>
        <label className="reg-slider">
          <span className="reg-slider-label">
            Ordonnée à l'origine <span className="tnum">{nf2.format(line.intercept)}</span>
          </span>
          <input
            type="range"
            {...INTERCEPT_RANGE}
            value={line.intercept}
            aria-valuetext={`Ordonnée à l'origine ${nf2.format(line.intercept)}`}
            onPointerDown={interrupt}
            onKeyDown={interrupt}
            onChange={(e) => onSlider({ intercept: Number(e.target.value) })}
          />
        </label>
      </div>

      <div className="reg-readout">
        <p className="reg-sse">
          <span className="reg-sse-label">Somme des carrés des écarts</span>
          <span className="reg-sse-value tnum">{nf1.format(sse)}</span>
        </p>
        {mode === 'fitted' ? (
          <p className="reg-r2 tnum">R² = {nf2.format(r2)}</p>
        ) : null}
        <button type="button" className="btn btn-outline" onClick={onButton}>
          {mode === 'idle' ? 'Ajuster automatiquement' : 'Réinitialiser'}
        </button>
      </div>
      <p className="sr-only" aria-live="polite">
        {mode === 'fitted' ? `Droite ajustée, R² égal à ${nf2.format(r2)}.` : ''}
      </p>

      <figcaption className="reg-caption">
        <strong>Nuage illustratif, pas des données réelles.</strong> Ajustez la droite : la somme des
        carrés des écarts change. C'est ce que minimise la régression sur les{' '}
        <Link to="/projets/prix-immobiliers-niortais" className="link">
          prix immobiliers niortais
        </Link>
        .
      </figcaption>
    </figure>
  )
}
