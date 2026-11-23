import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router'
import '@fontsource-variable/inter/opsz.css'
import '@fontsource-variable/jetbrains-mono/index.css'
import './styles/index.css'
import './styles/effects.css'
import './styles/apple-base.css'
import './styles/home.css'
import './styles/scenes.css'
import './styles/pages.css'
import { router } from './routes.tsx'

// Entrée orchestrée du hero : une seule fois par session, seulement si l'on arrive sur l'accueil.
// L'attribut est retiré après l'animation : un retour sur l'accueil ne la rejoue pas. Sans JS, état final.
try {
  const root = document.documentElement
  const base = import.meta.env.BASE_URL.replace(/\/$/, '')
  const path = location.pathname.slice(base.length) || '/'
  if (path === '/' && !sessionStorage.getItem('intro-played')) {
    sessionStorage.setItem('intro-played', '1')
    root.dataset.intro = 'play'
    window.setTimeout(() => delete root.dataset.intro, 1200)
  }
} catch {
  /* stockage indisponible : pas d'entrée orchestrée */
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
