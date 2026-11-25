import { homeFigures } from '../../data/derive.ts'

/** Trois chiffres de l’accueil, calculés depuis les données (jamais en dur). Pas de titre visible. */
export function HomeFigures() {
  return (
    <section className="ap-section ap-section--white home-figures" aria-label="Chiffres">
      <div className="ap-container ap-container--wide">
        <dl className="home-figures__list">
          {homeFigures().map(({ label, value }) => (
            <div key={label} className="home-figure">
              <dt className="home-figure__label">{label}</dt>
              <dd className="home-figure__value">{value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  )
}
