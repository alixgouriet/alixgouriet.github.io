import { useEffect, type CSSProperties, type RefObject } from 'react'
import { Link, NavLink, useLocation } from 'react-router'
import { NAV } from './nav.ts'

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
      className="sheet on-ink"
      aria-label="Menu"
      onClose={() => document.documentElement.classList.remove('sheet-open')}
      onClick={(e) => {
        if (e.target === e.currentTarget) close()
      }}
    >
      <div className="sheet-bar">
        <Link to="/" className="brand" onClick={close}>
          Alix Gouriet
        </Link>
        <button type="button" className="sheet-close" onClick={close}>
          Fermer
        </button>
      </div>
      <nav className="sheet-nav" aria-label="Principal">
        {NAV.map((item, i) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className="sheet-link"
            style={{ '--i': i } as CSSProperties}
            onClick={close}
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
    </dialog>
  )
}
