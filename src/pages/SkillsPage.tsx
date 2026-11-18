import { Link } from 'react-router'
import { skillsWithProofs } from '../data/derive.ts'

export function SkillsPage() {
  const rows = skillsWithProofs()
  return (
    <>
      <title>Compétences · Alix Gouriet</title>
      <div className="wrap page">
        <div className="page-head">
          <h1>Compétences</h1>
          <p className="lead">
            Chaque outil renvoie aux projets où je l'ai utilisé. «&nbsp;Sur CV&nbsp;» signale un outil qui figure
            sur mon CV et qu'aucun projet de ce site ne documente encore.
          </p>
        </div>
        <ul className="plist">
          {rows.map(({ skill, proofs }) => (
            <li key={skill.id} className="srow">
              <span className="srow-name">{skill.label}</span>
              {proofs.length > 0 ? (
                <ul className="chips">
                  {proofs.map((p) => (
                    <li key={p.slug}>
                      <Link
                        to={`/projets/${p.slug}`}
                        className="chip"
                        aria-label={`${skill.label}, prouvé par ${p.title}`}
                        viewTransition
                      >
                        {p.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <span className="muted">Sur CV</span>
              )}
            </li>
          ))}
        </ul>
      </div>
    </>
  )
}
