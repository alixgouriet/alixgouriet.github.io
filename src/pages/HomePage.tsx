import { Link } from 'react-router'
import { HomeFigures } from '../features/home/HomeFigures.tsx'
import { HomeSkills } from '../features/home/HomeSkills.tsx'
import { ParcoursScene } from '../features/home/ParcoursScene.tsx'
import { ProjectTiles } from '../features/home/ProjectTiles.tsx'
import { PendingTiles } from '../features/home/PendingTiles.tsx'
import { ACCROCHE } from '../data/copy.ts'

export function HomePage() {
  return (
    <>
      <title>Alix Gouriet · Étudiant en BUT Science des Données</title>

      <section className="ap-section ap-section--gray home-hero" aria-labelledby="accueil-titre">
        <div className="ap-container ap-center">
          <div className="home-hero__text">
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
          </div>
          <div className="home-portrait-wrap">
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
        </div>
      </section>

      <HomeFigures />
      <ParcoursScene />
      <HomeSkills />

      <section id="projets" className="ap-section ap-section--white home-projects" aria-label="Projets">
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
    </>
  )
}
