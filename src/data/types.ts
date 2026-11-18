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

interface ProjectBase {
  title: string
  period: string
  tools: ToolId[]
}

/** Projet avec fiche : slug, résumé et résultat vérifié. */
export interface AvailableProject extends ProjectBase {
  status: 'disponible'
  slug: string
  category: Category
  /** Une phrase affichée sous le titre. */
  summary: string
  /** Résultat affiché dans la liste. */
  result: string
}

/** Projet annoncé sans fiche : ni slug ni lien. */
export interface UpcomingProject extends ProjectBase {
  status: 'a-venir'
  id: string
}

export type Project = AvailableProject | UpcomingProject

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
