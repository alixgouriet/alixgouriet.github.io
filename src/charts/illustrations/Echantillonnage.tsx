import { Ill, Ground } from './Ill.tsx'

const pts = [[130, 140], [168, 120], [210, 132], [250, 160], [118, 190], [160, 200], [205, 188], [262, 214], [140, 246], [190, 256], [232, 262], [236, 108]]
const sel = [[188, 160], [150, 226], [248, 238], [108, 160]]

export default function Echantillonnage() {
  return (
    <Ill label="Carte stylisée d’une région avec des points d’échantillon et un graphique de test statistique">
      <Ground cx={200} rx={170} />
      <path className="fs kl" d="M106 126Q146 74 220 82Q290 90 298 156Q306 224 268 270Q220 310 152 290Q90 270 80 204Q70 152 106 126z" strokeWidth="2" />
      <path className="n kc" d="M92 168Q190 150 292 176M94 236Q190 220 282 250" strokeWidth="3" strokeDasharray="2 8" />
      {pts.map(([x, y]) => <circle key={`${x}-${y}`} className="fm" cx={x} cy={y} r="5" />)}
      {sel.map(([x, y]) => (
        <g key={`${x}-${y}`}>
          <circle className="fq" cx={x} cy={y} r="13" />
          <circle className="fa" cx={x} cy={y} r="7" />
        </g>
      ))}
      <rect className="fc kl" x="346" y="62" width="244" height="228" rx="16" strokeWidth="2" />
      <path className="fq" d="M512 262V219C528 242 546 252 568 256V262z" />
      <path className="n ka" d="M370 262C380 130 412 98 446 132S520 244 568 254" strokeWidth="5" />
      <path className="n kl" d="M368 262h202M368 262V92" strokeWidth="3" />
      <path className="n ki" d="M512 262V204" strokeWidth="3" strokeDasharray="1 8" />
      <circle className="fi" cx="512" cy="204" r="5" />
    </Ill>
  )
}
