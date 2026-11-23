import { Ill, Ground } from './Ill.tsx'

const trays = [68, 146, 224].flatMap((x) => [168, 236].map((y) => [x, y]))

export default function Diagnostic() {
  return (
    <Ill label="Barquettes de plats frais en libre-service à côté d’un tableau d’indicateurs et de graphiques">
      <Ground />
      <rect className="ff kl" x="50" y="100" width="250" height="196" rx="18" strokeWidth="2" />
      <path className="fa" d="M51 118a17 17 0 0 1 17-17h214a17 17 0 0 1 17 17v6H51z" />
      <path className="n km" d="M62 168h226M62 236h226" strokeWidth="4" />
      {trays.map(([x, y], i) => (
        <g key={`${x}-${y}`}>
          <rect className="fc kl" x={x} y={y - 38} width="64" height="38" rx="8" strokeWidth="2" />
          <rect className="ff" x={x + 4} y={y - 34} width="56" height="9" rx="4" />
          <rect className={i % 3 === 0 ? 'fq' : 'fs'} x={x + 8} y={y - 22} width="22" height="14" rx="5" />
          <rect className={i % 2 === 0 ? 'fm' : 'fs'} x={x + 34} y={y - 22} width="22" height="14" rx="5" />
        </g>
      ))}
      <rect className="fc kl" x="344" y="50" width="246" height="240" rx="16" strokeWidth="2" />
      {[362, 436, 510].map((x, i) => (
        <g key={x}>
          <rect className="ff" x={x} y="68" width="64" height="40" rx="10" />
          <rect className={i === 0 ? 'fa' : 'fl'} x={x + 10} y="82" width={i === 0 ? 30 : 38} height="9" rx="4.5" />
        </g>
      ))}
      <path className="n ks" d="M362 266h112" strokeWidth="2" />
      {[[368, 40], [394, 62], [420, 86], [446, 56]].map(([x, h], i) => (
        <rect key={x} className={i === 2 ? 'fa' : 'fm'} x={x} y={266 - h * 1.5} width="16" height={h * 1.5} rx="5" />
      ))}
      <circle className="n ks" cx="534" cy="196" r="34" strokeWidth="16" />
      <path className="n ka" d="M534 162a34 34 0 1 1-30 49" strokeWidth="16" />
      <path className="n kl" d="M494 262c14-8 26 4 40-4s28-12 40-8" strokeWidth="4" />
    </Ill>
  )
}
