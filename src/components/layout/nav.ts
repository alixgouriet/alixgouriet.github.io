/** Liens de navigation, partagés par la barre, le menu mobile et le pied de page. */
export const NAV = [
  { to: '/', label: 'Accueil', end: true },
  { to: '/a-propos', label: 'À propos', end: false },
  { to: '/competences', label: 'Compétences', end: false },
  { to: '/projets', label: 'Projets', end: false },
  { to: '/contact', label: 'Contact', end: false },
] as const
