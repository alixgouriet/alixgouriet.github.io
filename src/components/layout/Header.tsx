import { useEffect, useLayoutEffect, useRef } from 'react'
import { Link, NavLink, useLocation } from 'react-router'
import { MobileSheet } from './MobileSheet.tsx'
import { NAV } from './nav.ts'
import { ThemeToggle } from './ThemeToggle.tsx'

/** Place le trait sous le lien actif (translateX + scaleX). Lecture de mise en page : une fois par changement de page ou de taille. */
function placeIndicator(nav: HTMLElement, ind: HTMLElement) {
  const cur = nav.querySelector<HTMLElement>('a[aria-current="page"]')
  if (!cur || nav.offsetParent === null) {
    delete nav.dataset.ind
    return
  }
  const pad = parseFloat(getComputedStyle(cur).paddingLeft) || 0
  ind.style.transform = `translateX(${cur.offsetLeft + pad}px) scaleX(${Math.max(cur.offsetWidth - 2 * pad, 1)})`
  nav.dataset.ind = ''
}

/** Barre fixe translucide : nom à gauche, 5 liens dès 768 px ; en dessous, bouton « Menu » qui ouvre le panneau plein écran. */
export function Header() {
  const sheetRef = useRef<HTMLDialogElement>(null)
  const linksRef = useRef<HTMLElement>(null)
  const indRef = useRef<HTMLSpanElement>(null)
  const { pathname } = useLocation()

  // Le trait glisse d'un lien à l'autre ; le premier placement se fait sans transition.
  useLayoutEffect(() => {
    if (linksRef.current && indRef.current) placeIndicator(linksRef.current, indRef.current)
  }, [pathname])
  useEffect(() => {
    const nav = linksRef.current
    const ind = indRef.current
    if (!nav || !ind) return
    const raf = requestAnimationFrame(() => requestAnimationFrame(() => (ind.dataset.ready = '')))
    const ro = new ResizeObserver(() => placeIndicator(nav, ind))
    ro.observe(nav)
    nav.querySelectorAll('a').forEach((a) => ro.observe(a))
    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
    }
  }, [])

  return (
    <>
      <header className="ap-nav">
        <div className="ap-nav__inner">
          <Link to="/" className="ap-nav__brand">
            Alix Gouriet
          </Link>
          <nav className="ap-nav__links" aria-label="Principal" ref={linksRef}>
            <span className="ap-nav__ind" aria-hidden="true" ref={indRef} />
            {NAV.map((item) => (
              <NavLink key={item.to} to={item.to} end={item.end} className="ap-nav__link" viewTransition>
                {item.label}
              </NavLink>
            ))}
          </nav>
          <ThemeToggle />
          <button
            type="button"
            className="ap-nav__menu"
            aria-label="Menu"
            aria-haspopup="dialog"
            onClick={() => {
              sheetRef.current?.showModal()
              document.documentElement.classList.add('sheet-open')
              // showModal() cible le premier élément focusable (la marque) : on place le focus sur « Accueil ».
              sheetRef.current?.querySelector<HTMLElement>('.ap-sheet__link')?.focus()
            }}
          >
            <span className="ap-nav__menu-icon" aria-hidden="true" />
          </button>
        </div>
      </header>
      {/* Hors de la barre : le panneau (couche supérieure) ne dépend pas du backdrop-filter de l'en-tête. */}
      <MobileSheet dialogRef={sheetRef} />
    </>
  )
}
