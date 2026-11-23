import { useSyncExternalStore } from 'react'

/**
 * Thème sombre / clair. Le script en ligne d'index.html pose `data-theme` sur <html> avant le premier rendu
 * (préférence mémorisée, sinon prefers-color-scheme). Ce module ne fait que lire et changer cet attribut.
 * Le stockage est toujours protégé par try/catch : sans localStorage, le choix vaut pour la page en cours.
 */
export type Theme = 'light' | 'dark'

const KEY = 'theme'
const META_COLOR: Record<Theme, string> = { light: '#f5f5f7', dark: '#161617' }

function stored(): Theme | null {
  try {
    const v = localStorage.getItem(KEY)
    return v === 'light' || v === 'dark' ? v : null
  } catch {
    return null
  }
}

function system(): Theme {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function read(): Theme {
  return document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light'
}

/** Écrit l'attribut, color-scheme et <meta name="theme-color">. Aucune transition pendant la bascule (classe retirée au cadre suivant). */
function apply(theme: Theme) {
  const root = document.documentElement
  if (root.dataset.theme === theme) return
  root.classList.add('theme-switching')
  root.dataset.theme = theme
  root.style.colorScheme = theme
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', META_COLOR[theme])
  void root.offsetHeight // les styles sont recalculés sans transition
  requestAnimationFrame(() => requestAnimationFrame(() => root.classList.remove('theme-switching')))
}

export function setTheme(theme: Theme) {
  apply(theme)
  try {
    localStorage.setItem(KEY, theme)
  } catch {
    /* stockage indisponible : choix valable pour cette page seulement */
  }
}

let listening = false
const listeners = new Set<() => void>()

function subscribe(cb: () => void) {
  listeners.add(cb)
  if (!listening) {
    listening = true
    // Sans préférence mémorisée, le thème suit le réglage du système en direct.
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
      if (!stored()) apply(system())
      listeners.forEach((l) => l())
    })
  }
  return () => {
    listeners.delete(cb)
  }
}

export function useTheme(): [Theme, (t: Theme) => void] {
  const theme = useSyncExternalStore(subscribe, read, () => 'light' as Theme)
  return [
    theme,
    (t) => {
      setTheme(t)
      listeners.forEach((l) => l())
    },
  ]
}
