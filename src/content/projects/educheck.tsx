export default function EduCheck() {
  return (
    <>
      <h2>Contexte</h2>
      <p>
        Projet de janvier 2026 : un outil Excel pour saisir et suivre des notes par semestre, par
        compétence et par matière.
      </p>

      <h2>Ce que j’ai fait</h2>
      <ul>
        <li>
          Un formulaire de saisie en VBA : on choisit le semestre, puis la compétence, puis la matière,
          dans des listes liées.
        </li>
        <li>
          Un contrôle de saisie : la note doit être numérique, positive ou nulle et inférieure ou égale au
          barème.
        </li>
        <li>La note est convertie sur 20, puis ajoutée à la feuille de données.</li>
        <li>
          Un formulaire de modification par identifiant : la ligne est supprimée, puis la saisie se
          rouvre pour corriger la note.
        </li>
      </ul>
      <p>
        D’après mon CV, un tableau de bord Excel dynamique complète la base. Il n’est pas détaillé
        ici.
      </p>

      <h2>Outils</h2>
      <p>Excel et VBA (formulaires UserForm).</p>
    </>
  )
}
