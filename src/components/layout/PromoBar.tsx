import { Link } from 'react-router'

/** Bandeau sous la barre fixe (non fixe lui-même), visible sur toutes les pages. */
export function PromoBar() {
  return (
    <div className="ap-promo">
      <p>Stage de 10 semaines dès avril 2027</p>
      <Link to="/contact" className="ap-link-more" viewTransition>
        Me contacter
      </Link>
    </div>
  )
}
