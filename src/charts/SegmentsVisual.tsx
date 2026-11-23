/** Les 5 segments modélisés de la SAÉ (libellés de la fiche). Aucune valeur chiffrée : visuel factuel, sans droite ni nuage. */
const SEGMENTS = [
  'Maisons de Niort',
  'Communes chères',
  'Communes moyennes',
  'Communes abordables',
  'Appartements',
] as const

export function SegmentsVisual() {
  return (
    <ul className="segments" aria-label="Les 5 segments modélisés, un modèle de régression par segment">
      {SEGMENTS.map((s) => (
        <li key={s}>{s}</li>
      ))}
    </ul>
  )
}
