import { when } from './dates.ts'
import type { Project } from './types.ts'

/**
 * Les 9 réalisations. Les projets avec fiche (status « disponible ») gardent `tools` et
 * `toolsFromCv` : seuls eux alimentent les preuves de la page Compétences.
 * L'ordre du tableau sert de départage à date égale ; le tri d'affichage est dans derive.ts.
 */
export const projects: Project[] = [
  {
    status: 'disponible',
    slug: 'greensd',
    title: 'GreenSD',
    ...when(2026, 6),
    category: 'Bases de données',
    tools: ['sql', 'python'],
    toolsFromCv: ['python'],
    technologies: ['Python', 'Tkinter', 'SQL', 'MySQL'],
    summary:
      'Concevoir une base MySQL pour la logistique de livraison, avec le suivi des émissions de CO₂.',
    result: 'Base MySQL de 10 tables',
  },
  {
    status: 'disponible',
    slug: 'educheck',
    title: 'EduCheck',
    ...when(2026, 1),
    category: 'Outils Excel',
    tools: ['excel', 'vba'],
    technologies: ['Excel', 'VBA', 'SQL'],
    summary:
      'Saisir et suivre des notes par semestre, compétence et matière dans Excel, avec VBA.',
    result: 'Saisie contrôlée, notes converties sur 20',
  },
  {
    status: 'disponible',
    slug: 'villes-natalistes',
    title: 'Villes les plus natalistes',
    ...when(2025, 10),
    category: 'Statistiques',
    tools: ['excel'],
    technologies: ['Excel', 'Statistiques'],
    summary:
      'Comparer un échantillon des villes les plus natalistes à la France entière, en binôme.',
    result: 'Population +5\u202F% contre +6\u202F% en France (2016 à 2022)',
  },
  {
    status: 'disponible',
    slug: 'prix-immobiliers-niortais',
    title: 'Prix immobiliers niortais',
    // Correction : « Printemps 2025 » était incompatible avec le CV (bac en juin 2025, BUT dès septembre 2025).
    ...when(2026, 4),
    category: 'Statistiques',
    tools: ['r', 'excel'],
    technologies: ['R', 'Excel', 'CSV', 'Statistiques'],
    summary:
      'Prédire la valeur foncière de biens de l’agglomération niortaise, avec une régression écrite à la main en R.',
    result: '5 modèles, 1 277 biens prédits',
  },
  // Projets sans fiche : seuls faits connus, aucun résultat ni rôle ni chiffre.
  {
    status: 'sans-fiche',
    id: 'presentation-territoire',
    title: 'Présentation d’un territoire',
    subtitle: 'Oral en anglais et en français',
    ...when(2025, 10),
    technologies: ['PowerPoint', 'Oral', 'Anglais', 'Français'],
  },
  {
    status: 'sans-fiche',
    id: 'gestion-fichiers',
    title: 'Gestion de fichiers',
    subtitle: 'Conversion de JSON en CSV',
    ...when(2025, 10),
    technologies: ['Python', 'JSON', 'CSV', 'Spyder'],
  },
  {
    status: 'sans-fiche',
    id: 'diagnostic-fleury-michon',
    title: 'Diagnostic financier, Fleury Michon Libre-Service',
    subtitle: 'Construction d’indicateurs de performance et présentation structurée',
    ...when(2026, 5),
    technologies: ['Excel', 'Analyse financière', 'Datavisualisation'],
  },
  {
    status: 'sans-fiche',
    id: 'echantillonnage-centre-val-de-loire',
    title: 'Échantillonnage et estimation, Centre-Val de Loire',
    subtitle: 'Sondage aléatoire simple et stratifié sous R, tests du khi-deux sur données d’enquête',
    ...when(2026, 5),
    technologies: ['R', 'Statistiques', 'Excel'],
  },
  {
    status: 'sans-fiche',
    id: 'mycotrack',
    title: 'MycoTrack, suivi PCR mycoplasmes en élevages caprins',
    subtitle: 'Application web Streamlit connectée à une base MySQL',
    ...when(2026, 6),
    technologies: [
      'Python',
      'Streamlit',
      'MySQL',
      'Plotly',
      'Folium',
      'GitHub',
      'SSH',
      'AlwaysData',
      'Oral',
      'Anglais',
    ],
  },
]
