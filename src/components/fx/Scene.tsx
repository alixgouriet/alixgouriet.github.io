import { useLayoutEffect, useRef, type CSSProperties, type ReactNode } from 'react'
import { registerScene } from './sceneEngine.ts'

interface SceneProps {
  /** Nombre d'étapes : fixe la hauteur de la scène (--n) et le rythme des étapes. */
  steps: number
  className?: string
  labelledBy: string
  children: ReactNode
}

/**
 * Section « histoire » épinglée au défilement (voir sceneEngine.ts et scenes.css).
 * Le contenu complet est toujours dans le DOM ; hors mode épinglé (mobile, reduced-motion),
 * la scène est une simple colonne en flux normal.
 */
export function Scene({ steps, className, labelledBy, children }: SceneProps) {
  const ref = useRef<HTMLElement>(null)
  useLayoutEffect(() => (ref.current ? registerScene(ref.current) : undefined), [])
  return (
    <article ref={ref} className={`scene ${className ?? ''}`} aria-labelledby={labelledBy} style={{ '--n': steps } as CSSProperties}>
      {children}
    </article>
  )
}
