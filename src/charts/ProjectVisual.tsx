import type { ComponentType } from 'react'
import { ChainVisual } from './ChainVisual.tsx'
import { ErDiagram } from './ErDiagram.tsx'
import { GrowthBars } from './GrowthBars.tsx'
import { RegressionVisual } from './RegressionVisual.tsx'
import { SegmentsVisual } from './SegmentsVisual.tsx'

/** Un visuel par projet disponible, indexé par slug. Les faits affichés sont déjà dans les fiches. */
const VISUALS: Record<string, ComponentType> = {
  'prix-immobiliers-niortais': RegressionVisual,
  greensd: ErDiagram,
  educheck: ChainVisual,
  'villes-natalistes': GrowthBars,
}

/**
 * Le visuel est toujours dans le DOM. Par défaut (fiche), il se dessine au défilement (data-fx).
 * Avec `plain` (accueil), aucun effet : l'entrée est gérée par la classe .ap-reveal du conteneur.
 */
export function ProjectVisual({ slug, plain = false }: { slug: string; plain?: boolean }) {
  const Visual = VISUALS[slug]
  if (!Visual) return null
  if (plain) {
    // Accueil : pas de légende (elle reste sur la fiche) ; le nom accessible est porté par le visuel lui-même.
    if (slug === 'prix-immobiliers-niortais') return <SegmentsVisual />
    if (slug === 'villes-natalistes') return <GrowthBars animate={false} caption={false} />
    if (slug === 'greensd') return <ErDiagram caption={false} />
    if (slug === 'educheck') return <ChainVisual caption={false} />
    return <Visual />
  }
  const bars = slug === 'villes-natalistes'
  return (
    <div data-fx={bars ? undefined : 'draw'}>
      <Visual />
    </div>
  )
}
