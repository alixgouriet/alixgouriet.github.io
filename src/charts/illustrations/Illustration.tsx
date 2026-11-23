import { Suspense, useEffect, useRef, useState } from 'react'
import { ILLUSTRATIONS } from './index.ts'
import '../../styles/illustrations.css'

type Size = 'thumb' | 'tile' | 'cover'

/**
 * Illustration d'une réalisation. Le cadre 16:9 est toujours rendu (hauteur réservée, CLS nul) ;
 * le SVG n'est chargé que lorsque le cadre approche de l'écran. `onDark` : tuile toujours sombre (couverture).
 */
export function Illustration({ id, size, onDark = false }: { id: string; size: Size; onDark?: boolean }) {
  const ref = useRef<HTMLDivElement>(null)
  const [near, setNear] = useState(typeof IntersectionObserver === 'undefined')
  useEffect(() => {
    const el = ref.current
    if (near || !el) return
    const io = new IntersectionObserver(
      ([e]) => {
        if (e?.isIntersecting) {
          setNear(true)
          io.disconnect()
        }
      },
      { rootMargin: '300px' },
    )
    io.observe(el)
    // Filet : si l'observateur ne répond pas, charger quand même après le rendu, hors chemin critique.
    const t = window.setTimeout(() => setNear(true), 1500)
    return () => {
      io.disconnect()
      window.clearTimeout(t)
    }
  }, [near])
  const Art = ILLUSTRATIONS[id]
  if (!Art) return null
  return (
    <div ref={ref} className={`ill-frame ill-frame--${size}${onDark ? ' ill-frame--dark' : ''}`}>
      {near ? (
        <Suspense fallback={null}>
          <Art />
        </Suspense>
      ) : null}
    </div>
  )
}
