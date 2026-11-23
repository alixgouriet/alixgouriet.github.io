import { useEffect, type CSSProperties, type RefObject } from 'react'
import { Link, NavLink, useLocation } from 'react-router'
import { NAV } from './nav.ts'
import { ThemeToggle } from './ThemeToggle.tsx'

export function MobileSheet({ dialogRef }: { dialogRef: RefObject<HTMLDialogElement | null> }) {
  const { pathname } = useLocation()

  // La feuille se ferme à chaque changement de route et si l'écran devient large.
  useEffect(() => {
    dialogRef.current?.close()
  }, [pathname, dialogRef])

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 768px)')
    const onChange = () => {
      if (mq.matches) dialogRef.current?.close()
    }
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [dialogRef])

  const close = () => dialogRef.current?.close()

  return (
    <dialog
      ref={dialogRef}
      className="ap-sheet"
      aria-label="Menu"
      onClose={() => document.documentElement.classList.remove('sheet-open')}
      onClick={(e) => {
        if (e.target === e.currentTarget) close()
      }}
    >
      <div className="ap-sheet__bar">
        <Link to="/" className="ap-nav__brand" onClick={close}>
          Alix Gouriet
        </Link>
        <button type="button" className="ap-sheet__close" aria-label="Fermer" onClick={close}>
          <span className="ap-sheet__close-icon" aria-hidden="true" />
        </button>
      </div>
      <nav className="ap-sheet__nav" aria-label="Menu mobile">
        {NAV.map((item, i) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className="ap-sheet__link"
            style={{ '--i': i } as CSSProperties}
            viewTransition
            onClick={close}
          >
            {item.label}
          </NavLink>
        ))}
        <ThemeToggle variant="row" />
      </nav>
    </dialog>
  )
}
