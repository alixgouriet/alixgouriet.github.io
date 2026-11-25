import { useEffect, useState } from 'react'
import { Link } from 'react-router'

/**
 * Barre locale de l'accueil (comme celle des pages produit d'apple.fr) : apparaît quand le hero a quitté l'écran.
 * Fond opaque (aucun backdrop-filter), 44 px, sous la barre principale ; masquée sous 768 px (le bouton « Menu » suffit).
 * Un seul IntersectionObserver, aucun écouteur de défilement. `visibility: hidden` tant qu'elle est masquée :
 * ses liens ne sont alors pas focalisables.
 */
export function LocalBar() {
  const [shown, setShown] = useState(false)

  useEffect(() => {
    const root = document.documentElement
    root.setAttribute('data-local', '') // scroll-padding-top tient compte de la barre (focus clavier, ancres)
    const hero = document.querySelector('.home-hero')
    let io: IntersectionObserver | undefined
    if (hero) {
      io = new IntersectionObserver(([e]) => setShown(!e.isIntersecting && e.boundingClientRect.bottom < 0), {
        rootMargin: '-44px 0px 0px 0px',
      })
      io.observe(hero)
    }
    return () => {
      io?.disconnect()
      root.removeAttribute('data-local')
    }
  }, [])

  return (
    <nav className="ap-local" aria-label="Accès rapide de l’accueil" data-shown={shown ? '' : undefined}>
      <div className="ap-local__inner">
        <Link to="/" className="ap-local__name">
          Alix Gouriet
        </Link>
        <div className="ap-local__links">
          <Link to="/projets" className="ap-local__link" viewTransition>
            Projets
          </Link>
          <Link to="/contact" className="ap-local__pill" viewTransition>
            Me contacter
          </Link>
        </div>
      </div>
    </nav>
  )
}
