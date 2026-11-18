import { createBrowserRouter } from 'react-router'
import { Layout } from './components/layout/Layout.tsx'
import { HomePage } from './pages/HomePage.tsx'
import { AboutPage } from './pages/AboutPage.tsx'
import { SkillsPage } from './pages/SkillsPage.tsx'
import { ProjectsPage } from './pages/ProjectsPage.tsx'
import { ContactPage } from './pages/ContactPage.tsx'
import { NotFoundPage } from './pages/NotFoundPage.tsx'

export const router = createBrowserRouter(
  [
    {
      element: <Layout />,
      // Affiché pendant le chargement initial d'une route en `lazy` (évite l'avertissement React Router).
      HydrateFallback: () => <p className="sr-only" role="status">Chargement…</p>,
      children: [
        { index: true, element: <HomePage /> },
        { path: 'a-propos', element: <AboutPage /> },
        { path: 'competences', element: <SkillsPage /> },
        { path: 'projets', element: <ProjectsPage /> },
        {
          path: 'projets/:slug',
          lazy: async () => ({ Component: (await import('./pages/ProjectPage.tsx')).ProjectPage }),
        },
        { path: 'contact', element: <ContactPage /> },
        { path: '*', element: <NotFoundPage /> },
      ],
    },
  ],
  { basename: import.meta.env.BASE_URL.replace(/\/$/, '') || undefined },
)
