export type ToolId =
  | 'python'
  | 'sql'
  | 'r'
  | 'excel'
  | 'vba'
  | 'sas'
  | 'html'
  | 'css'
  | 'javascript'

export type Category = 'Statistiques' | 'Bases de données' | 'Outils Excel'

/** Semestre universitaire : 1 de septembre à janvier, 2 de février à août. */
export type Semester = 1 | 2

interface ProjectBase {
  title: string
  /** Libellé affiché (« Juin 2026 »), dérivé de month et year par `when()`. */
  period: string
  /** Date triable. */
  year: number
  /** 1 à 12. */
  month: number
  semester: Semester
  /** Technologies affichées et filtrables (libellés libres, ex. « Tkinter »). */
  technologies: string[]
}

/** Projet avec fiche : slug, résumé et résultat vérifié. */
export interface AvailableProject extends ProjectBase {
  status: 'disponible'
  slug: string
  category: Category
  /** Outils du CV qui servent de preuves à la page Compétences (jamais alimentés par un projet sans fiche). */
  tools: ToolId[]
  /** Une phrase affichée sous le titre sur l'accueil et la fiche. */
  summary: string
  /** Outils connus par le CV seulement : aucun fichier fourni qui les prouve. */
  toolsFromCv?: ToolId[]
  /** Résultat affiché comme sous-titre dans la liste. */
  result: string
}

/** Projet réalisé mais sans fiche : ni slug ni lien, ni route, ni preuve de compétence. */
export interface PendingProject extends ProjectBase {
  status: 'sans-fiche'
  id: string
  subtitle: string
}

export type Project = AvailableProject | PendingProject

export interface Skill {
  id: ToolId
  label: string
}

export interface Contact {
  email: string
  phone: string
  phoneHref: string
  city: string
  /** Non affiché tant que null. */
  linkedin: string | null
  cvHref: string
}
