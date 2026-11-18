import type { Project } from './types.ts'

/** Projets disponibles du plus récent au plus ancien, puis les projets à venir. */
export const projects: Project[] = [
  {
    status: 'disponible',
    slug: 'greensd',
    title: 'GreenSD',
    period: 'Juin 2026',
    category: 'Bases de données',
    tools: ['sql', 'python'],
    summary:
      'Concevoir une base MySQL pour la logistique de livraison, avec le suivi des émissions de CO₂.',
    result: 'Base MySQL de 10 tables',
  },
  {
    status: 'disponible',
    slug: 'educheck',
    title: 'EduCheck',
    period: 'Janvier 2026',
    category: 'Outils Excel',
    tools: ['excel', 'vba'],
    summary:
      'Saisir et suivre des notes par semestre, compétence et matière dans Excel, avec VBA.',
    result: 'Saisie contrôlée, notes converties sur 20',
  },
  {
    status: 'disponible',
    slug: 'villes-natalistes',
    title: 'Villes les plus natalistes',
    period: 'Octobre 2025',
    category: 'Statistiques',
    tools: ['excel'],
    summary:
      'Comparer un échantillon des villes les plus natalistes à la France entière, en binôme.',
    result: 'Population +5 % contre +6 % en France (2016 à 2022)',
  },
  {
    status: 'disponible',
    slug: 'prix-immobiliers-niortais',
    title: 'Prix immobiliers niortais',
    period: 'Printemps 2025',
    category: 'Statistiques',
    tools: ['r', 'excel'],
    summary:
      "Prédire la valeur foncière de biens de l'agglomération niortaise, avec une régression écrite à la main en R.",
    result: '5 modèles, 1 277 biens prédits',
  },
  {
    status: 'a-venir',
    id: 'conversion-fichiers',
    title: 'Gestion et conversion de fichiers',
    period: 'Octobre 2025',
    tools: [],
  },
]
