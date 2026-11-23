import { useId, type ReactNode } from 'react'
import '../../styles/illustrations.css'

/** Cadre commun : viewBox 640×360, nom accessible, halo doux derrière le sujet. Aucun texte dans l'image. */
export function Ill({ label, children }: { label: string; children: ReactNode }) {
  const id = `ill${useId().replace(/\W/g, '')}`
  return (
    <svg className="ill" viewBox="0 0 640 360" role="img" aria-label={label} focusable="false">
      <defs>
        <radialGradient id={id} cx=".5" cy=".55" r=".55">
          <stop offset="0" style={{ stopColor: 'var(--ill-soft)', stopOpacity: 0.4 }} />
          <stop offset="1" style={{ stopColor: 'var(--ill-soft)', stopOpacity: 0 }} />
        </radialGradient>
      </defs>
      <rect width="640" height="360" fill={`url(#${id})`} />
      {children}
    </svg>
  )
}

/** Ombre au sol, pour le léger relief. */
export function Ground({ cx = 320, cy = 306, rx = 250 }: { cx?: number; cy?: number; rx?: number }) {
  return <ellipse className="ff" cx={cx} cy={cy} rx={rx} ry="10" />
}
