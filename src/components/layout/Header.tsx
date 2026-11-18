import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router'
import { MobileSheet } from './MobileSheet.tsx'
import { NAV } from './nav.ts'

export function Header() {
  const { pathname } = useLocation()
  const navRef = useRef<HTMLElement>(null)
  const indicatorRef = useRef<HTMLSpanElement>(null)
  const sheetRef = useRef<HTMLDialogElement>(null)
  const [scrolled, setScrolled] = useState(false)

  // Soulignement unique : translateX/scaleX vers le lien de la route active.
  useLayoutEffect(() => {
    const nav = navRef.current
    const bar = indicatorRef.current
    if (!nav || !bar) return
    const place = () => {
      const active = nav.querySelector<HTMLElement>('a[aria-current="page"]')
      if (!active) {
        bar.style.opacity = '0'
        return
      }
      bar.style.opacity = '1'
      bar.style.transform = `translateX(${active.offsetLeft}px) scaleX(${active.offsetWidth})`
    }
    place()
    const raf = requestAnimationFrame(() => bar.classList.add('is-ready'))
    window.addEventListener('resize', place)
    void document.fonts?.ready.then(place)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', place)
    }
  }, [pathname])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 0)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header className={scrolled ? 'header is-scrolled' : 'header'}>
      <div className="wrap header-inner">
        <Link to="/" className="brand">
          Alix Gouriet
        </Link>
        <nav className="nav-desktop" aria-label="Principal" ref={navRef}>
          {NAV.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.end} viewTransition>
              {item.label}
            </NavLink>
          ))}
          <span className="nav-indicator" ref={indicatorRef} aria-hidden="true" />
        </nav>
        <button
          type="button"
          className="menu-btn"
          aria-haspopup="dialog"
          onClick={() => {
            sheetRef.current?.showModal()
            document.documentElement.classList.add('sheet-open')
            // showModal() met le focus sur le premier élément focusable (la marque) : on le place sur « Accueil ».
            sheetRef.current?.querySelector<HTMLElement>('.sheet-link')?.focus()
          }}
        >
          Menu
        </button>
      </div>
      <MobileSheet dialogRef={sheetRef} />
    </header>
  )
}
