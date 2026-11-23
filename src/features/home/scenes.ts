/**
 * Textes des étapes des quatre scènes de l'accueil (voir ProjectTiles.tsx).
 * Aucun chiffre nouveau : chaque fait est repris d'une source, citée au-dessus de chaque scène.
 * Voix 1re personne ; apostrophes typographiques.
 */

export interface SceneStepText {
  /** Petit repère en tête d'étape (noms réels des tables, des segments, etc.). */
  label: string
  /** Phrase de l'étape, toujours dans le DOM. */
  text: string
}

/**
 * GREENSD. Source : ../SAE BDD Python/greensd_create.sql (CREATE TABLE, PRIMARY KEY, FOREIGN KEY).
 *  - entree : FOREIGN KEY(_id_partenaire) REFERENCES partenaire (lignes 8-15).
 *  - vehicule : FOREIGN KEY(id_type_vehicule) REFERENCES type_vehicule (23-30) ;
 *    coefficientCO2 : PRIMARY KEY(id_type_vehicule, annee), clé étrangère vers type_vehicule (39-45).
 *  - tournee_ : FOREIGN KEY vers Livreur et vehicule (55-63).
 *  - Livraison : FOREIGN KEY vers client et tournee_ (65-76).
 *  - approvisionner : PRIMARY KEY(id_entree, id_tournee), deux clés étrangères (78-84).
 * Les groupes de tables de chaque étape sont définis dans src/charts/ErDiagram.tsx (STAGE).
 */
export const GREENSD_STEPS: SceneStepText[] = [
  { label: 'partenaire, entree', text: 'Je relie entree à partenaire par _id_partenaire.' },
  {
    label: 'type_vehicule, vehicule, coefficientCO2',
    text: 'vehicule dépend de type_vehicule ; coefficientCO2 a pour clé (id_type_vehicule, annee).',
  },
  { label: 'Livreur, tournee_', text: 'tournee_ référence Livreur et vehicule.' },
  { label: 'client, Livraison', text: 'Livraison référence client et tournee_.' },
  {
    label: 'approvisionner',
    text: 'Table d’association : sa clé primaire est (id_entree, id_tournee), qui relie entree à tournee_.',
  },
]

/**
 * EDUCHECK. Source : src/content/projects/educheck.tsx (formulaires VBA décrits dans la fiche) :
 * listes liées semestre → compétence → matière ; contrôle de saisie (note numérique, positive ou nulle,
 * inférieure ou égale au barème) ; conversion sur 20 puis ajout à la feuille de données.
 */
export const EDUCHECK_STEPS: SceneStepText[] = [
  { label: 'Semestre', text: 'Je choisis d’abord le semestre dans une liste.' },
  { label: 'Compétence', text: 'La liste des compétences dépend du semestre : les listes sont liées.' },
  { label: 'Matière', text: 'La liste des matières dépend de la compétence choisie.' },
  {
    label: 'Contrôle de saisie',
    text: 'La note doit être numérique, positive ou nulle et inférieure ou égale au barème.',
  },
  { label: 'Note sur 20', text: 'La note est convertie sur 20, puis ajoutée à la feuille de données.' },
]

/**
 * PRIX IMMOBILIERS NIORTAIS. Source : ../SAE Régréssion/code_final.R
 *  - ligne 37 : modele_niort = regression(sqrt(surface), valeur foncière) ;
 *  - ligne 38 : modele_chere = regression(surface, valeur foncière) ;
 *  - ligne 39 : modele_moyenne = regression(sqrt(surface), …) ;
 *  - ligne 40 : modele_abordable = regression(surface, …) ;
 *  - ligne 41 : modele_appart = regression(log(surface), log(valeur foncière)), prédiction par exp() (ligne 59).
 * `tag` : transformation affichée sur le segment (aria-hidden : la phrase de l’étape la dit en toutes lettres).
 */
export const PRIX_STEPS: (SceneStepText & { tag: string })[] = [
  { label: 'Maisons de Niort', tag: '√ surface', text: 'Je prends la racine carrée de la surface.' },
  { label: 'Communes chères', tag: 'surface', text: 'La surface entre telle quelle : relation linéaire.' },
  { label: 'Communes moyennes', tag: '√ surface', text: 'Je prends la racine carrée de la surface.' },
  { label: 'Communes abordables', tag: 'surface', text: 'La surface entre telle quelle : relation linéaire.' },
  {
    label: 'Appartements',
    tag: 'log – log',
    text: 'Je passe au logarithme du prix et de la surface (modèle log-log) ; la prédiction repasse par l’exponentielle.',
  },
]

/**
 * VILLES NATALISTES. Source : résultat de la fiche (src/data/projects.ts : « Population +5 % contre +6 % en
 * France (2016 à 2022) ») et libellés de src/charts/GrowthBars.tsx (« Échantillon de villes natalistes »,
 * « France entière », « même base zéro »). Aucun autre chiffre.
 */
export const VILLES_STEPS: SceneStepText[] = [
  { label: 'Échantillon', text: 'Dans mon échantillon de villes natalistes, la population augmente de 5\u202F% entre 2016 et 2022.' },
  { label: 'France entière', text: 'Sur la même période, elle augmente de 6\u202F% en France entière, sur la même base zéro.' },
]

export const SCENE_STEPS: Record<string, SceneStepText[]> = {
  greensd: GREENSD_STEPS,
  educheck: EDUCHECK_STEPS,
  'prix-immobiliers-niortais': PRIX_STEPS,
  'villes-natalistes': VILLES_STEPS,
}
