/** Phrases d'accroche mises en avant. Chaque phrase : 25 mots au plus, faits du CV seulement. */

import { plural, provenToolLabels, stats } from './derive.ts'

// À VALIDER PAR ALIX : phrase d'accroche de l'accueil. Nombres et outils calculés depuis les données
// (Python écarté tant que ses fichiers ne sont pas fournis : voir `toolsFromCv`).
export const ACCROCHE = (() => {
  const { total, detailed } = stats()
  const tools = provenToolLabels()
  const list = tools.length > 1 ? `${tools.slice(0, -1).join(', ')} et ${tools[tools.length - 1]}` : tools.join('')
  const head = `${total} ${plural(total, 'réalisation')}, dont ${detailed} ${plural(detailed, 'détaillée')}`
  return list ? `${head}, avec ${list}.` : `${head}.`
})()

// À VALIDER PAR ALIX : phrase géante de la page À propos.
export const ABOUT_SENTENCE =
  'Étudiant en 2e année de BUT Science des Données à l’IUT de Niort, je cherche un stage de 10 semaines dès avril 2027.'

/** Découpe en mots (espaces ordinaires seulement : les espaces insécables restent collés au mot). */
export function splitWords(text: string): string[] {
  return text.split(' ').filter(Boolean)
}
