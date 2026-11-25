import type { ToolId } from './types.ts'

/** Regroupement d’affichage des outils de `skills.ts` pour l’accueil (aucune compétence ajoutée, aucun niveau). */
export const SKILL_GROUPS: { title: string; ids: ToolId[] }[] = [
  { title: 'Langages et analyse', ids: ['python', 'sql', 'r', 'sas'] },
  { title: 'Tableur et automatisation', ids: ['excel', 'vba'] },
  { title: 'Web', ids: ['html', 'css', 'javascript'] },
]
