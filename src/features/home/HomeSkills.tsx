import { skillsWithProofs } from '../../data/derive.ts'
import { SKILL_GROUPS } from '../../data/skillGroups.ts'
import { SkillProofs } from '../skills/SkillProofs.tsx'

/** Section « Compétences » de l’accueil : outils groupés, chacun avec ses preuves (projets) ou « Mentionné dans mon CV ». */
export function HomeSkills() {
  const rows = skillsWithProofs()
  return (
    <section className="ap-section ap-section--gray home-skills" aria-labelledby="competences-titre">
      <div className="ap-container ap-container--wide">
        <h2 id="competences-titre" className="ap-title-lg ap-center">
          Compétences
        </h2>
        <div className="home-skills__groups">
          {SKILL_GROUPS.map((g) => (
            <div key={g.title} className="home-skills__group">
              <h3 className="ap-eyebrow">{g.title}</h3>
              <ul className="home-skills__list">
                {rows
                  .filter((r) => g.ids.includes(r.skill.id))
                  .map((r) => (
                    <li key={r.skill.id} className="home-skill ap-tile ap-tile--white">
                      <p className="home-skill__name ap-title-md">{r.skill.label}</p>
                      <SkillProofs {...r} />
                    </li>
                  ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
