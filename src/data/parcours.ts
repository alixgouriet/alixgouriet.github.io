export type ParcoursColumn = 'formation' | 'experience'

export interface ParcoursStep {
  id: string
  column: ParcoursColumn
  /** Libellé de date affiché, ex. « Depuis septembre 2025 ». */
  when: string
  /** Date lisible par la machine, « AAAA-MM » ou « AAAA ». */
  dateTime: string
  title: string
  text: string
  /** Document d'où vient l'information (CV, ancien portfolio). */
  source: string
}

/** Ordre d'affichage : dans chaque colonne, du plus récent au plus ancien ; formation d'abord. */
export const PARCOURS_STEPS: readonly ParcoursStep[] = [
  {
    id: 'stage',
    column: 'formation',
    when: 'À partir d’avril 2027',
    dateTime: '2027-04',
    title: 'Stage de 10 semaines',
    text: 'Je cherche un stage conventionné de 10 semaines pour mettre en pratique mes compétences en analyse et traitement de données.',
    source: 'CV',
  },
  {
    id: 'but',
    column: 'formation',
    when: 'Depuis septembre 2025',
    dateTime: '2025-09',
    title: 'BUT Science des Données, IUT de Niort',
    text: 'Parcours VCOD. Modules : R, Python, SQL, statistiques et SAÉ.',
    source: 'CV ; ancien portfolio (modules)',
  },
  {
    id: 'bac',
    column: 'formation',
    when: 'Juin 2025',
    dateTime: '2025-06',
    title: 'Baccalauréat général',
    text: 'Mention assez bien, spécialités mathématiques et NSI, option maths expertes.',
    source: 'CV ; ancien portfolio (option)',
  },
  {
    id: 'finances',
    column: 'experience',
    when: 'Été 2026',
    dateTime: '2026-07',
    title: 'Service comptable des Finances publiques',
    text: 'Mise en place de nouveaux fichiers Excel pour les prévisionnels des années futures.',
    source: 'CV',
  },
  {
    id: 'agricole',
    column: 'experience',
    when: '2018 à 2025',
    dateTime: '2018',
    title: 'Aide en exploitations agricoles',
    text: 'Fauche, moisson, ramassage et entretien des animaux, l’été et l’hiver.',
    source: 'CV',
  },
]

export const INTERESTS: readonly string[] = [
  'Courses d’endurance (24 Heures du Mans)',
  'Voyages',
  'Simracing',
  'Trail',
  'Musculation',
  'Badminton',
]

export function parcoursByColumn(column: ParcoursColumn): ParcoursStep[] {
  return PARCOURS_STEPS.filter((s) => s.column === column)
}
