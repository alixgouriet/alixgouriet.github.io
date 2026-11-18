import { lazy, Suspense, type ComponentType } from 'react'
import { Link, useParams } from 'react-router'
import { findProject, toolLabel } from '../data/derive.ts'
import { NotFoundPage } from './NotFoundPage.tsx'

const bodies: Record<string, ComponentType> = {
  'prix-immobiliers-niortais': lazy(() => import('../content/projects/prix-immobiliers-niortais.tsx')),
  'villes-natalistes': lazy(() => import('../content/projects/villes-natalistes.tsx')),
  greensd: lazy(() => import('../content/projects/greensd.tsx')),
  educheck: lazy(() => import('../content/projects/educheck.tsx')),
}

export function ProjectPage() {
  const { slug } = useParams()
  const project = findProject(slug)
  const Body = slug ? bodies[slug] : undefined
  if (!project || !Body) return <NotFoundPage />

  return (
    <>
      <title>{`${project.title} · Alix Gouriet`}</title>
      <div className="wrap page">
        <Link to="/projets" className="link back" viewTransition>
          ← Tous les projets
        </Link>
        <div className="page-head">
          <h1>{project.title}</h1>
          <p className="lead">{project.summary}</p>
        </div>
        <div className="fiche">
          <article className="prose">
            <Suspense fallback={<p className="muted">Chargement…</p>}>
              <Body />
            </Suspense>
          </article>
          <aside className="fiche-aside" aria-label="En bref">
            <dl>
              <div>
                <dt>Période</dt>
                <dd className="tnum">{project.period}</dd>
              </div>
              <div>
                <dt>Outils</dt>
                <dd>{project.tools.map(toolLabel).join(', ')}</dd>
              </div>
              <div>
                <dt>Catégorie</dt>
                <dd>{project.category}</dd>
              </div>
            </dl>
          </aside>
        </div>
      </div>
    </>
  )
}
