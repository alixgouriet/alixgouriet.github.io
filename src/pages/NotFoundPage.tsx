import { Link } from 'react-router'

export function NotFoundPage() {
  return (
    <>
      <title>Page introuvable · Alix Gouriet</title>
      <section className="ap-section ap-section--gray pg-head pg-notfound">
        <div className="ap-container ap-center">
          <h1 className="ap-title-xl">Page introuvable</h1>
          <p className="ap-subtitle ap-muted pg-sub">Cette adresse ne correspond à aucune page du site.</p>
          <div className="pg-actions">
            <Link to="/" className="ap-pill">
              Retour à l’accueil
            </Link>
            <Link to="/projets" className="ap-pill-outline">
              Voir les projets
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
