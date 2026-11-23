import { lazy, type ComponentType, type LazyExoticComponent } from 'react'

/** Correspondance slug (fiches) ou id (réalisations sans fiche) → illustration, chargée à la demande. */
export const ILLUSTRATIONS: Record<string, LazyExoticComponent<ComponentType>> = {
  greensd: lazy(() => import('./GreenSd.tsx')),
  'prix-immobiliers-niortais': lazy(() => import('./PrixImmobiliers.tsx')),
  educheck: lazy(() => import('./EduCheck.tsx')),
  'villes-natalistes': lazy(() => import('./Natalistes.tsx')),
  'presentation-territoire': lazy(() => import('./Territoire.tsx')),
  'gestion-fichiers': lazy(() => import('./Fichiers.tsx')),
  'diagnostic-fleury-michon': lazy(() => import('./Diagnostic.tsx')),
  'echantillonnage-centre-val-de-loire': lazy(() => import('./Echantillonnage.tsx')),
  mycotrack: lazy(() => import('./MycoTrack.tsx')),
}
