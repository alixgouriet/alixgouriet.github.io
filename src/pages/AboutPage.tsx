import { LitSentence } from '../components/fx/LitSentence.tsx'
import { ABOUT_SENTENCE } from '../data/copy.ts'

export function AboutPage() {
  return (
    <>
      <title>À propos · Alix Gouriet</title>
      <section className="ap-section ap-section--white pg-head pg-about-head">
        <div className="ap-container ap-container--wide ap-center">
          <h1 className="pg-kicker">À propos</h1>
          <div className="pg-lit">
            {/* À VALIDER PAR ALIX : phrase géante (src/data/copy.ts), faits du CV uniquement. */}
            <LitSentence text={ABOUT_SENTENCE} xl />
          </div>
          <p className="ap-subtitle ap-muted pg-sub">
            Parcours VCOD&nbsp;: Visualisation, Conception d’Outils Décisionnels.
          </p>
          <figure className="ap-tile ap-tile--gray pg-portrait ap-reveal ap-reveal--soft">
            <img
              src={`${import.meta.env.BASE_URL}portrait.jpg`}
              width={331}
              height={428}
              alt="Portrait d’Alix Gouriet"
              decoding="async"
            />
          </figure>
        </div>
      </section>

      <section className="ap-section ap-section--white pg-about-cards">
        <div className="ap-container ap-container--wide">
          <div className="ap-tile-grid">
            <section className="ap-tile ap-tile--gray pg-card ap-reveal" aria-labelledby="formation">
              <h2 id="formation" className="ap-title-md">
                Formation
              </h2>
              <ul className="pg-rows">
                <li>
                  <span className="pg-when tnum">Depuis septembre 2025</span>
                  <span>BUT Science des Données, IUT de Niort</span>
                </li>
                <li>
                  <span className="pg-when tnum">Juin 2025</span>
                  <span>Baccalauréat général, mention assez bien, avec les spécialités mathématiques et NSI</span>
                </li>
              </ul>
            </section>

            <section className="ap-tile ap-tile--gray pg-card ap-reveal" aria-labelledby="experiences">
              <h2 id="experiences" className="ap-title-md">
                Expériences
              </h2>
              <ul className="pg-rows">
                <li>
                  <span className="pg-when tnum">Été 2026</span>
                  <span>
                    Au service comptable des Finances publiques, j’ai mis en place de nouveaux fichiers Excel pour
                    les prévisionnels des années futures.
                  </span>
                </li>
                <li>
                  <span className="pg-when tnum">2018 à 2025</span>
                  <span>J’ai aidé sur des exploitations agricoles à Aubusson, l’été et l’hiver de 2018 à 2025.</span>
                </li>
              </ul>
            </section>

            <section className="ap-tile ap-tile--gray ap-tile--span pg-card ap-reveal" aria-labelledby="interets">
              <h2 id="interets" className="ap-title-md">
                Centres d’intérêt
              </h2>
              <ul className="pg-rows">
                <li>
                  <span className="pg-when">Loisirs</span>
                  <span>
                    Les courses automobiles d’endurance (les 24 Heures du Mans), les voyages, les jeux vidéo
                    (simracing), le trail, la musculation et le badminton.
                  </span>
                </li>
              </ul>
            </section>
          </div>
        </div>
      </section>
    </>
  )
}
