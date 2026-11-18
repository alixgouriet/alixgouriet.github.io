import { Link } from 'react-router'
import { Regression } from '../features/hero/Regression.tsx'
import { ProjectList } from '../features/projects/ProjectList.tsx'
import { orderProjects } from '../data/derive.ts'

export function HomePage() {
  return (
    <>
      <title>Alix Gouriet · Étudiant en BUT Science des Données</title>
      <div className="wrap">
        <section className="hero" aria-label="Présentation">
          <div>
            <h1 className="hero-name">
              Alix
              <br />
              Gouriet
            </h1>
            <p className="hero-status">
              Étudiant en 2e année de BUT Science des Données (parcours VCOD) à l'IUT de Niort. Je
              cherche un stage de 10 semaines dès avril 2027.
            </p>
            <div className="hero-actions">
              <Link to="/projets" className="btn btn-primary" viewTransition>
                Voir les projets
              </Link>
              <Link to="/contact" className="btn btn-outline" viewTransition>
                Me contacter
              </Link>
            </div>
          </div>
          <Regression />
        </section>

        <section className="section" aria-labelledby="home-projets" style={{ paddingBottom: 80 }}>
          <h2 id="home-projets">Projets</h2>
          <ProjectList items={orderProjects()} />
          <p style={{ marginTop: 16 }}>
            <Link to="/projets" className="link more">
              Tous les projets et SAE
            </Link>
          </p>
        </section>
      </div>
    </>
  )
}
