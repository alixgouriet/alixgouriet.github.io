import { Link } from 'react-router'
import { skillsWithProofs } from '../data/derive.ts'

export function SkillsPage() {
  const rows = skillsWithProofs()
  return (
    <>
      <title>Compétences · Alix Gouriet</title>
      <section className="ap-section ap-section--white pg-head">
        <div className="ap-container ap-center">
          <h1 className="ap-title-xl">Compétences</h1>
          <p className="pg-lead ap-muted">Chaque outil renvoie aux projets qui le prouvent.</p>
        </div>
      </section>
      <section className="ap-section ap-section--white pg-list" aria-label="Outils">
        <div className="ap-container ap-container--wide">
          <ul className="pg-skill-grid">
            {rows.map(({ skill, proofs }) => (
              <li key={skill.id} className="ap-tile ap-tile--gray pg-skill ap-reveal">
                <h2 className="ap-title-md">{skill.label}</h2>
                {proofs.length > 0 ? (
                  <ul className="pg-chips">
                    {proofs.map((p) => (
                      <li key={p.slug}>
                        <Link
                          to={`/projets/${p.slug}`}
                          className="pg-chip"
                          aria-label={
                            p.toolsFromCv?.includes(skill.id)
                              ? `${skill.label}, utilisé dans ${p.title}, d’après mon CV`
                              : `${skill.label}, prouvé par ${p.title}`
                          }
                          viewTransition
                        >
                          {p.title}
                        </Link>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="pg-cv">Mentionné dans mon CV</p>
                )}
              </li>
            ))}
          </ul>
          <p className="pg-legend">
            «&nbsp;Mentionné dans mon CV&nbsp;» : outil indiqué sur mon CV, qu’aucun projet de ce site ne documente encore. Pour Python, la source est mon CV : aucun fichier Python n’est montré ici.
          </p>
        </div>
      </section>
    </>
  )
}
