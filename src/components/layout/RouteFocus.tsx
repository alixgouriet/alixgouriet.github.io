import { useEffect, useLayoutEffect, useRef } from 'react'
import { useLocation, useNavigationType } from 'react-router'

const STORE_KEY = 'scroll-positions'

function readPositions(): Record<string, number> {
  try {
    return JSON.parse(sessionStorage.getItem(STORE_KEY) ?? '{}') as Record<string, number>
  } catch {
    return {}
  }
}

function writePositions(p: Record<string, number>) {
  try {
    sessionStorage.setItem(STORE_KEY, JSON.stringify(p))
  } catch {
    /* stockage indisponible : pas de restauration */
  }
}

function loadType(): string {
  const entry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined
  return entry?.type ?? 'navigate'
}

/**
 * Défilement et focus à chaque changement de route.
 * - Chargement frais (saisie d'URL, lien externe) : toujours en haut. Seuls un rechargement
 *   ou un retour d'historique restaurent la position (c'est ce que `ScrollRestoration`
 *   de React Router ne distinguait pas : il restaurait aussi après une simple navigation).
 * - Navigation vers l'avant : en haut (ou vers l'ancre du hash).
 * - Retour/avance (POP) : position mémorisée de l'entrée d'historique.
 * Le focus va ensuite sur le h1, sans défilement.
 */
export function RouteFocus() {
  const location = useLocation()
  const navType = useNavigationType()
  const handled = useRef<string | null>(null)
  const focused = useRef<string | null>(null)

  useEffect(() => {
    window.history.scrollRestoration = 'manual'
    let raf = 0
    const save = () => {
      raf = 0
      const p = readPositions()
      p[window.history.state?.key ?? 'default'] = window.scrollY
      writePositions(p)
    }
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(save)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('pagehide', save)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('pagehide', save)
      cancelAnimationFrame(raf)
    }
  }, [])

  useLayoutEffect(() => {
    const id = `${location.key}${location.hash}`
    if (handled.current === id) return // rejeu StrictMode
    const isFirst = handled.current === null
    handled.current = id
    const restore = isFirst
      ? loadType() === 'reload' || loadType() === 'back_forward'
      : navType === 'POP'
    const saved = readPositions()[location.key] ?? 0
    const anchor = location.hash ? document.getElementById(decodeURIComponent(location.hash.slice(1))) : null
    if (restore) {
      window.scrollTo(0, saved)
    } else if (anchor) {
      anchor.scrollIntoView()
    } else {
      window.scrollTo(0, 0)
    }
  }, [location.key, location.hash, navType])

  // Le chargement initial ne vole pas le focus ; seul un changement de page le déplace.
  useEffect(() => {
    const previous = focused.current
    focused.current = location.pathname
    if (previous === null || previous === location.pathname) return
    const h1 = document.querySelector<HTMLElement>('main h1')
    if (h1) {
      h1.tabIndex = -1
      h1.focus({ preventScroll: true })
    }
  }, [location.pathname])

  return null
}
