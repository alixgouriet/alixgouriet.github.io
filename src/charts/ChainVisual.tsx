const STEPS = ['Semestre', 'Compétence', 'Matière'] as const

/** Chaîne de saisie d'EduCheck : listes liées, puis note convertie sur 20. */
export function ChainVisual({ caption = true }: { caption?: boolean }) {
  return (
    <figure className="m-0">
      <ol className="chain" aria-label="Saisie d’une note : semestre, compétence, matière, puis note sur 20">
        {STEPS.map((s) => (
          <li key={s}>{s}</li>
        ))}
        <li>
          Note sur 20
        </li>
      </ol>
      {caption && (
        <figcaption className="visual-cap">
          Schéma de la saisie : chaque liste dépend de la précédente, puis la note est convertie sur 20.
        </figcaption>
      )}
    </figure>
  )
}
