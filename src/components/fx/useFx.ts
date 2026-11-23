import { useLayoutEffect } from 'react'

/**
 * Repli des effets de défilement pour les navigateurs sans `animation-timeline: view()`.
 * Pose data-state="pending" sur chaque [data-fx] (avant la peinture : un MutationObserver
 * s'exécute en microtâche) puis "in" quand 20 % de l'élément est visible, une seule fois.
 * Sans JS, ou avec reduced-motion, rien n'est masqué : l'état par défaut est l'état final.
 */
export function useFx() {
  useLayoutEffect(() => {
    if (typeof CSS !== 'undefined' && CSS.supports('animation-timeline: view()')) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          const el = e.target as HTMLElement
          const enough = e.intersectionRect.height >= Math.min(e.boundingClientRect.height * 0.2, window.innerHeight * 0.2)
          // Un élément déjà dépassé (restauration du défilement) doit rester visible.
          if ((e.isIntersecting && enough) || e.boundingClientRect.bottom < 0) {
            el.dataset.state = 'in'
            io.unobserve(el)
          }
        }
      },
      { threshold: [0, 0.2] },
    )
    const prime = () => {
      document.querySelectorAll<HTMLElement>('[data-fx]:not([data-state])').forEach((el) => {
        el.dataset.state = 'pending'
        io.observe(el)
      })
    }
    prime()
    const mo = new MutationObserver(prime)
    mo.observe(document.body, { childList: true, subtree: true })
    return () => {
      io.disconnect()
      mo.disconnect()
    }
  }, [])
}
