/**
 * Classement des libellés de `technologies` (données des projets).
 * Un outil = logiciel, langage de programmation ou bibliothèque. Tout libellé doit figurer dans l'une des deux
 * listes (un test le vérifie) : ajouter un projet avec un libellé inconnu oblige donc à décider.
 */
export const TOOL_LABELS: ReadonlySet<string> = new Set([
  'AlwaysData',
  'Excel',
  'Folium',
  'GitHub',
  'MySQL',
  'Plotly',
  'PowerPoint',
  'Python',
  'R',
  'SQL',
  'Spyder',
  'SSH',
  'Streamlit',
  'Tkinter',
  'VBA',
])

/** Langues, formats de fichiers et domaines : affichés sur les lignes mais ni comptés ni filtrables comme outils. */
export const NON_TOOL_LABELS: ReadonlySet<string> = new Set([
  'Analyse financière',
  'Anglais',
  'CSV',
  'Datavisualisation',
  'Français',
  'JSON',
  'Oral',
  'Statistiques',
])
