import { Link } from 'react-router'
import { ProjectTiles } from '../features/home/ProjectTiles.tsx'
import { PendingTiles } from '../features/home/PendingTiles.tsx'
import { ACCROCHE, ABOUT_SHORT } from '../data/copy.ts'
import { skills } from '../data/skills.ts'

export function HomePage() {
  return (
    <>
      <title>Alix Gouriet · Étudiant en BUT Science des Données</title>

      <section className="ap-section ap-section--gray home-hero" aria-labelledby="accueil-titre">
        <div className="ap-container ap-center">
          <h1 id="accueil-titre" className="ap-title-xl">
            Alix Gouriet
          </h1>
          <p className="ap-subtitle home-hero__sub">
            Étudiant en 2e année de BUT Science des Données, parcours VCOD, à l’IUT de Niort.
          </p>
          <p className="ap-muted home-hero__status">Je cherche un stage de 10 semaines dès avril 2027.</p>
          <div className="home-links">
            <Link to="/projets" className="ap-pill" viewTransition>
              Voir les projets
            </Link>
            <Link to="/contact" className="ap-pill-outline" viewTransition>
              Me contacter
            </Link>
          </div>
          <img
            className="home-portrait"
            src={`${import.meta.env.BASE_URL}portrait.jpg`}
            width={331}
            height={428}
            alt="Portrait d’Alix Gouriet"
            decoding="async"
            fetchPriority="high"
          />
        </div>
      </section>

      <section className="ap-section ap-section--white home-projects" aria-label="Projets">
        <div className="ap-container ap-container--wide ap-center">
          {/* À VALIDER PAR ALIX : accroche de l'accueil (src/data/copy.ts). */}
          <p className="ap-title-lg home-lede">{ACCROCHE}</p>
        </div>
        <ProjectTiles />
      </section>

      <section className="ap-section ap-section--white home-more" aria-labelledby="autres-titre">
        <div className="ap-container ap-container--wide">
          <h2 id="autres-titre" className="ap-title-lg ap-center home-more__title">
            Autres réalisations
          </h2>
          <PendingTiles />
        </div>
      </section>

      <section className="ap-section ap-section--gray" aria-labelledby="competences-titre">
        <div className="ap-container ap-center">
          <h2 id="competences-titre" className="ap-title-lg">
            Compétences
          </h2>
          <p className="ap-subtitle home-block__sub">
            Chaque outil renvoie aux projets qui le prouvent, ou indique qu’il vient de mon CV.
          </p>
          <ul className="home-chips" aria-label="Outils">
            {skills.map((s) => (
              <li key={s.id}>{s.label}</li>
            ))}
          </ul>
          <Link to="/competences" className="ap-link-more" viewTransition>
            Voir les compétences
          </Link>
        </div>
      </section>

      <section className="ap-section ap-section--white" aria-labelledby="apropos-titre">
        <div className="ap-container ap-container--narrow ap-center">
          <h2 id="apropos-titre" className="ap-title-lg">
            À propos
          </h2>
          {/* À VALIDER PAR ALIX : phrase courte de l'accueil (src/data/copy.ts). */}
          <p className="ap-subtitle home-block__sub">{ABOUT_SHORT}</p>
          <Link to="/a-propos" className="ap-link-more" viewTransition>
            En savoir plus
          </Link>
        </div>
      </section>
    </>
  )
}
