import { skillsWithProofs } from '../data/derive.ts'
import { SkillProofs } from '../features/skills/SkillProofs.tsx'

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
                <SkillProofs skill={skill} proofs={proofs} />
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
