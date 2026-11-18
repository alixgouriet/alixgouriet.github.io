/** Schéma entité-association de GreenSD, dessiné à la main d'après les clés du script SQL. */

interface Box {
  name: string
  x: number
  y: number
  cols: string[]
}

const W = 160
const H = 84

const boxes: Record<string, Box> = {
  partenaire: { name: 'partenaire', x: 10, y: 10, cols: ['PK _id_partenaire'] },
  entree: { name: 'entree', x: 210, y: 10, cols: ['PK id_entree', 'FK _id_partenaire'] },
  approvisionner: {
    name: 'approvisionner',
    x: 410,
    y: 10,
    cols: ['PK, FK id_entree', 'PK, FK id_tournee'],
  },
  livreur: { name: 'livreur', x: 610, y: 150, cols: ['PK id_livreur'] },
  client: { name: 'client', x: 10, y: 150, cols: ['PK id_client'] },
  livraison: {
    name: 'livraison',
    x: 210,
    y: 150,
    cols: ['PK id_livraison', 'FK id_client', 'FK id_tournee'],
  },
  tournee: {
    name: 'tournee_',
    x: 410,
    y: 150,
    cols: ['PK id_tournee', 'FK id_livreur', 'FK id_vehicule'],
  },
  coefficient: { name: 'coefficientCO2', x: 10, y: 290, cols: ['PK, FK id_type_vehicule', 'PK annee'] },
  typeVehicule: { name: 'type_vehicule', x: 210, y: 290, cols: ['PK id_type_vehicule'] },
  vehicule: { name: 'vehicule', x: 410, y: 290, cols: ['PK id_vehicule', 'FK id_type_vehicule'] },
}

/** [table qui porte la clé étrangère, table référencée] */
const links: [keyof typeof boxes, keyof typeof boxes][] = [
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

function path(from: Box, to: Box): string {
  if (from.y === to.y) {
    const right = to.x > from.x
    const x1 = right ? from.x + W : from.x
    const x2 = right ? to.x : to.x + W
    const y = from.y + 24
    return `M${x1} ${y}H${x2}`
  }
  const down = to.y > from.y
  const x = from.x + W / 2
  return `M${x} ${down ? from.y + H : from.y}V${down ? to.y : to.y + H}`
}

const LABEL =
  "Schéma de la base GreenSD : 10 tables reliées par clés étrangères. entree dépend de partenaire ; approvisionner relie entree et tournee_ ; tournee_ dépend de livreur et de vehicule ; livraison dépend de client et de tournee_ ; vehicule et coefficientCO2 dépendent de type_vehicule."

export function ErDiagram() {
  return (
    <figure className="er">
      <div
        className="er-frame"
        role="region"
        aria-label="Schéma de la base, défilable horizontalement"
        tabIndex={0}
      >
        <svg viewBox="0 0 780 390" role="img" aria-label={LABEL} className="er-svg">
          <defs>
            <marker
              id="er-arrow"
              viewBox="0 0 10 10"
              refX="9"
              refY="5"
              markerWidth="8"
              markerHeight="8"
              orient="auto"
            >
              <path d="M0 1L9 5L0 9z" fill="var(--color-ardoise)" />
            </marker>
          </defs>
          {links.map(([a, b]) => (
            <path key={`${a}-${b}`} className="er-link" d={path(boxes[a], boxes[b])} />
          ))}
          {Object.values(boxes).map((b) => (
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
      </div>
      <figcaption>
        Schéma refait à la main d'après les clés primaires (PK) et étrangères (FK) du script SQL ;
        la flèche va de la table qui porte la clé étrangère vers la table référencée.
      </figcaption>
    </figure>
  )
}
