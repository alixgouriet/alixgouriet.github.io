import type { ComponentType } from 'react'
import { Link, useParams } from 'react-router'
import { ProjectVisual } from '../charts/ProjectVisual.tsx'
import { availableProjects, findProject, toolLabel } from '../data/derive.ts'
import { NotFoundPage } from './NotFoundPage.tsx'
import PrixImmobiliers from '../content/projects/prix-immobiliers-niortais.tsx'
import VillesNatalistes from '../content/projects/villes-natalistes.tsx'
import GreenSD from '../content/projects/greensd.tsx'
import EduCheck from '../content/projects/educheck.tsx'

// Corps des fiches chargés avec la page (déjà chargée à la demande par le routeur) :
// pas de « Chargement… » qui se remplace ensuite, donc pas de décalage de mise en page.
const bodies: Record<string, ComponentType> = {
  'prix-immobiliers-niortais': PrixImmobiliers,
  'villes-natalistes': VillesNatalistes,
  greensd: GreenSD,
  educheck: EduCheck,
}

/** Titre du visuel de chaque fiche : il dit ce que l’on voit, sans promettre un résultat de plus. */
const VISUAL_TITLES: Record<string, string> = {
  'prix-immobiliers-niortais': 'Illustration de la méthode',
  greensd: 'Schéma de la base',
  educheck: 'Schéma de la saisie',
  'villes-natalistes': 'Population, 2016 à 2022 : +5 % et +6 %',
}

export function ProjectPage() {
  const { slug } = useParams()
  const project = findProject(slug)
  const Body = slug ? bodies[slug] : undefined
  if (!project || !Body) return <NotFoundPage />

  const list = availableProjects()
  const next = list.length > 1 ? list[(list.findIndex((p) => p.slug === project.slug) + 1) % list.length] : undefined

  return (
    <>
      <title>{`${project.title} · Alix Gouriet`}</title>
      <section className="ap-section ap-section--white pg-cover-wrap">
        <div className="ap-container ap-container--wide">
          <p className="pg-backrow">
            <Link to="/projets" className="pg-back" viewTransition>
              Tous les projets
            </Link>
          </p>
          <header className="ap-tile ap-tile--dark pg-cover">
            <h1 className="pg-cover-title">{project.title}</h1>
            <p className="ap-subtitle pg-cover-sub">{project.summary}</p>
            <p className="pg-cover-result">
              <span className="sr-only">Résultat : </span>
              {project.result}
            </p>
            <dl className="pg-cover-meta">
              <div>
                <dt>Période</dt>
                <dd className="tnum">{project.period}</dd>
              </div>
              <div>
                <dt>Outils</dt>
                <dd>
                  {project.tools
                    .map((t) => (project.toolsFromCv?.includes(t) ? `${toolLabel(t)} (d’après mon CV)` : toolLabel(t)))
                    .join(', ')}
                </dd>
              </div>
              <div>
                <dt>Catégorie</dt>
                <dd>{project.category}</dd>
              </div>
            </dl>
          </header>
        </div>
      </section>

      <section className="ap-section ap-section--white pg-read">
        <div className="ap-container ap-container--narrow">
          <article className="pg-prose">
            <Body />
          </article>
        </div>
      </section>

      <section className="ap-section ap-section--gray pg-visual" aria-labelledby="visuel">
        <div className="ap-container ap-container--wide">
          <h2 id="visuel" className="ap-title-lg ap-center">
            {VISUAL_TITLES[project.slug] ?? 'Illustration'}
          </h2>
          {project.slug === 'prix-immobiliers-niortais' ? (
            <p className="ap-muted ap-center pg-visual-note">Nuage illustratif, pas des données réelles.</p>
          ) : null}
          <div className="ap-tile ap-tile--white pg-visual-tile ap-reveal ap-reveal--soft">
            <ProjectVisual slug={project.slug} />
          </div>
        </div>
      </section>

      {next ? (
        <nav className="ap-section ap-section--white pg-nextwrap" aria-label="Fiche suivante">
          <div className="ap-container ap-container--wide">
            <Link to={`/projets/${next.slug}`} className="ap-tile ap-tile--gray pg-next" viewTransition>
              <span className="pg-next-label">Fiche suivante</span>
              <span className="ap-title-lg">{next.title}</span>
              <span className="pg-more" aria-hidden="true">
                En savoir plus
              </span>
            </Link>
          </div>
        </nav>
      ) : null}
    </>
  )
}
