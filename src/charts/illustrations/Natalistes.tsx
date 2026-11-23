import { Ill, Ground } from './Ill.tsx'

const rows = [[22, 22], [36, 34], [50, 48], [62, 60], [72, 70], [66, 64], [54, 56]]
const dots = (x: number, y: number, c = 2, r = 3) =>
  Array.from({ length: c * r }, (_, i) => (
    <rect key={`${x}-${y}-${i}`} className="fs" x={x + (i % c) * 18} y={y + Math.floor(i / c) * 26} width="10" height="14" rx="3" />
  ))

export default function Natalistes() {
  return (
    <Ill label="Poussette devant des immeubles et des maisons, à côté d’une pyramide des âges stylisée">
      <Ground />
      {rows.map(([l, r], i) => (
        <g key={i}>
          <rect className={i > 4 ? 'fa' : 'fm'} x={130 - l} y={86 + i * 28} width={l} height="22" rx="8" />
          <rect className={i > 4 ? 'fq' : 'fs'} x="134" y={86 + i * 28} width={r} height="22" rx="8" />
        </g>
      ))}
      <rect className="fc kl" x="232" y="186" width="48" height="114" rx="6" strokeWidth="2" />
      {dots(242, 198, 2, 3)}
      <rect className="fc kl" x="288" y="136" width="62" height="164" rx="6" strokeWidth="2" />
      {dots(300, 150, 2, 4)}
      <rect className="fc kl" x="358" y="200" width="46" height="100" rx="6" strokeWidth="2" />
      {dots(368, 212, 2, 3)}
      <path className="fl" d="M406 258l30-26 30 26z" />
      <rect className="fc kl" x="410" y="256" width="52" height="44" rx="5" strokeWidth="2" />
      <rect className="fm" x="428" y="272" width="16" height="28" rx="4" />
      <path className="fa" d="M488 246a36 36 0 0 1 72 0z" />
      <rect className="fc kl" x="488" y="246" width="72" height="24" rx="11" strokeWidth="2" />
      <path className="n kl" d="M498 270l-8 18M550 270l8 18M560 246l26-34h14" strokeWidth="5" />
      {[490, 558].map((x) => (
        <g key={x}>
          <circle className="fi" cx={x} cy="292" r="14" />
          <circle className="fc" cx={x} cy="292" r="5" />
        </g>
      ))}
    </Ill>
  )
}
