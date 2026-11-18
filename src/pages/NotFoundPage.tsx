import { Link } from 'react-router'

export function NotFoundPage() {
  return (
    <>
      <title>Page introuvable · Alix Gouriet</title>
      <div className="wrap page">
        <div className="page-head">
          <h1>Page introuvable</h1>
          <p className="lead">Cette adresse ne correspond à aucune page du site.</p>
        </div>
        <div className="hero-actions">
          <Link to="/" className="btn btn-primary">
            Retour à l'accueil
          </Link>
          <Link to="/projets" className="btn btn-outline">
            Voir les projets
          </Link>
        </div>
      </div>
    </>
  )
}
