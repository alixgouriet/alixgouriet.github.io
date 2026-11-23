/** Schéma entité-association de GreenSD, dessiné à la main d'après les clés du script SQL. */

interface Box {
  name: string
  x: number
  y: number
  cols: string[]
}

type Key =
  | 'partenaire'
  | 'entree'
  | 'approvisionner'
  | 'livreur'
  | 'client'
  | 'livraison'
  | 'tournee'
  | 'coefficient'
  | 'typeVehicule'
  | 'vehicule'

const W = 196
const H = 84

/** Contenu des tables (clés lues dans le script SQL). */
const content: Record<Key, { name: string; cols: string[] }> = {
  partenaire: { name: 'partenaire', cols: ['PK _id_partenaire'] },
  entree: { name: 'entree', cols: ['PK id_entree', 'FK _id_partenaire'] },
  approvisionner: { name: 'approvisionner', cols: ['PK, FK id_entree', 'PK, FK id_tournee'] },
  livreur: { name: 'livreur', cols: ['PK id_livreur'] },
  client: { name: 'client', cols: ['PK id_client'] },
  livraison: { name: 'livraison', cols: ['PK id_livraison', 'FK id_client', 'FK id_tournee'] },
  tournee: { name: 'tournee_', cols: ['PK id_tournee', 'FK id_livreur', 'FK id_vehicule'] },
  coefficient: { name: 'coefficientCO2', cols: ['PK, FK id_type_vehicule', 'PK annee'] },
  typeVehicule: { name: 'type_vehicule', cols: ['PK id_type_vehicule'] },
  vehicule: { name: 'vehicule', cols: ['PK id_vehicule', 'FK id_type_vehicule'] },
}

/** [table qui porte la clé étrangère, table référencée] */
const links: [Key, Key][] = [
  ['entree', 'partenaire'],
  ['approvisionner', 'entree'],
  ['approvisionner', 'tournee'],
  ['tournee', 'livreur'],
  ['tournee', 'vehicule'],
  ['livraison', 'client'],
  ['livraison', 'tournee'],
  ['coefficient', 'typeVehicule'],
  ['vehicule', 'typeVehicule'],
]

/** Positions [colonne, ligne] : large (3 colonnes) quand la place le permet, haute (2 colonnes) sinon. */
const GRID_WIDE: Record<Key, [number, number]> = {
  partenaire: [0, 0],
  entree: [1, 0],
  approvisionner: [2, 0],
  client: [0, 1],
  livraison: [1, 1],
  tournee: [2, 1],
  livreur: [1, 2],
  vehicule: [2, 2],
  coefficient: [1, 3],
  typeVehicule: [2, 3],
}
const GRID_TALL: Record<Key, [number, number]> = {
  client: [0, 0],
  partenaire: [1, 0],
  livraison: [0, 1],
  entree: [1, 1],
  tournee: [0, 2],
  approvisionner: [1, 2],
  livreur: [0, 3],
  vehicule: [1, 3],
  coefficient: [0, 4],
  typeVehicule: [1, 4],
}

interface Layout {
  id: string
  className: string
  grid: Record<Key, [number, number]>
  pitchX: number
  pitchY: number
}
const WIDE: Layout = { id: 'wide', className: 'er-svg er-wide', grid: GRID_WIDE, pitchX: 224, pitchY: 124 }
const TALL: Layout = { id: 'tall', className: 'er-svg er-tall', grid: GRID_TALL, pitchX: 224, pitchY: 124 }

function boxesOf(l: Layout): Record<Key, Box> {
  const out = {} as Record<Key, Box>
  for (const k of Object.keys(content) as Key[]) {
    const [c, r] = l.grid[k]
    out[k] = { ...content[k], x: 10 + c * l.pitchX, y: 10 + r * l.pitchY }
  }
  return out
}

/** Même rangée : trait horizontal entre bords. Même colonne : trait vertical. Sinon : coude. */
function path(from: Box, to: Box): string {
  if (from.y === to.y) {
    const right = to.x > from.x
    const x1 = right ? from.x + W : from.x
    const x2 = right ? to.x : to.x + W
    const y = from.y + 24
    return `M${x1} ${y}H${x2}`
  }
  if (from.x === to.x) {
    const down = to.y > from.y
    const x = from.x + W / 2
    return `M${x} ${down ? from.y + H : from.y}V${down ? to.y : to.y + H}`
  }
  const down = to.y > from.y
  // Départ côté du but, pour ne pas croiser le trait vertical qui part du centre.
  const x1 = to.x > from.x ? from.x + W * 0.8 : from.x + W * 0.2
  const y1 = down ? from.y + H : from.y
  const y2 = down ? to.y : to.y + H
  const mid = (y1 + y2) / 2
  return `M${x1} ${y1}V${mid}H${to.x + W / 2}V${y2}`
}

const LABEL =
  "Schéma de la base GreenSD : 10 tables reliées par clés étrangères. entree dépend de partenaire ; approvisionner relie entree et tournee_ ; tournee_ dépend de livreur et de vehicule ; livraison dépend de client et de tournee_ ; vehicule et coefficientCO2 dépendent de type_vehicule."

function Diagram({ layout }: { layout: Layout }) {
  const boxes = boxesOf(layout)
  const list = Object.values(boxes)
  const width = Math.max(...list.map((b) => b.x)) + W + 10
  const height = Math.max(...list.map((b) => b.y)) + H + 10
  const arrow = `er-arrow-${layout.id}`
  return (
    <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label={LABEL} className={layout.className}>
      <defs>
        <marker id={arrow} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" orient="auto">
          <path className="er-arrow" d="M0 1L9 5L0 9z" fill="var(--ap-link-c)" />
        </marker>
      </defs>
      {links.map(([a, b]) => (
        <path key={`${a}-${b}`} className="er-link" d={path(boxes[a], boxes[b])} markerEnd={`url(#${arrow})`} />
      ))}
      {list.map((b) => (
        <g key={b.name} aria-hidden="true">
          <rect className="er-box" x={b.x} y={b.y} width={W} height={H} />
          <rect className="er-head" x={b.x} y={b.y} width={W} height="24" />
          <text className="er-title" x={b.x + 8} y={b.y + 17}>
            {b.name}
          </text>
          {b.cols.map((c, i) => (
            <text key={c} className="er-col" x={b.x + 8} y={b.y + 42 + i * 17}>
              {c}
            </text>
          ))}
        </g>
      ))}
    </svg>
  )
}

/**
 * Deux mises en page du même schéma, une seule visible (requête de conteneur CSS) : large si le cadre
 * fait au moins 520 px, haute en dessous, pour que toutes les tables restent lisibles sans défilement.
 */
export function ErDiagram({ caption = true }: { caption?: boolean }) {
  return (
    <figure className="er">
      <div className="er-frame">
        <Diagram layout={WIDE} />
        <Diagram layout={TALL} />
      </div>
      {caption && (
        <figcaption>
          Schéma refait à la main d'après les clés primaires (PK) et étrangères (FK) du script SQL ;
          la flèche va de la table qui porte la clé étrangère vers la table référencée.
        </figcaption>
      )}
    </figure>
  )
}
