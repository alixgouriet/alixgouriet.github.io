import { useRef } from 'react'
import { Link, NavLink } from 'react-router'
import { MobileSheet } from './MobileSheet.tsx'
import { NAV } from './nav.ts'

/** Barre fixe translucide : nom à gauche, 5 liens dès 768 px ; en dessous, bouton « Menu » qui ouvre le panneau plein écran. */
export function Header() {
  const sheetRef = useRef<HTMLDialogElement>(null)

  return (
    <>
      <header className="ap-nav">
        <div className="ap-nav__inner">
          <Link to="/" className="ap-nav__brand">
            Alix Gouriet
          </Link>
          <nav className="ap-nav__links" aria-label="Principal">
            {NAV.map((item) => (
              <NavLink key={item.to} to={item.to} end={item.end} className="ap-nav__link" viewTransition>
                {item.label}
              </NavLink>
            ))}
          </nav>
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
