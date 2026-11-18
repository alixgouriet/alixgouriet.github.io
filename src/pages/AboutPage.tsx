export function AboutPage() {
  return (
    <>
      <title>À propos · Alix Gouriet</title>
      <div className="wrap page">
        <div className="page-head">
          <h1>À propos</h1>
          <div className="prose">
            <p className="lead">
              Je suis étudiant en 2e année de BUT Science des Données, parcours VCOD (Visualisation,
              Conception d'Outils Décisionnels), à l'IUT de Niort.
            </p>
            <p className="muted">
              Je recherche un stage conventionné de 10 semaines à partir d'avril 2027, pour mettre en
              pratique mes compétences en analyse et traitement de données.
            </p>
          </div>
        </div>

        <section className="section split" aria-labelledby="formation">
          <h2 id="formation">Formation</h2>
          <ul className="plain-list">
            <li>
              <span className="when tnum">Depuis septembre 2025</span>
              BUT Science des Données, IUT de Niort
            </li>
            <li>
              <span className="when tnum">Juin 2025</span>
              Baccalauréat général, mention assez bien, avec les spécialités mathématiques et NSI
            </li>
          </ul>
        </section>

        <section className="section split" aria-labelledby="experiences">
          <h2 id="experiences">Expériences</h2>
          <ul className="plain-list">
            <li>
              Au service comptable des Finances publiques, j'ai mis en place de nouveaux fichiers
              Excel pour les prévisionnels des années futures.
            </li>
            <li>
              J'ai aidé sur des exploitations agricoles à Aubusson, l'été et l'hiver de 2018 à 2025.
            </li>
          </ul>
        </section>

        <section className="section split" aria-labelledby="interets">
          <h2 id="interets">Centres d'intérêt</h2>
          <p className="prose">
            Les courses automobiles d'endurance (les 24 Heures du Mans), les voyages, les jeux vidéo
            (simracing), le trail, la musculation et le badminton.
          </p>
        </section>
      </div>
    </>
  )
}
