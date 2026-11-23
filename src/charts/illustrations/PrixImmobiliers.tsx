import { Ill, Ground } from './Ill.tsx'

const win = (x: number, y: number) => <rect key={`${x}-${y}`} className="fs" x={x} y={y} width="16" height="18" rx="4" />

export default function PrixImmobiliers() {
  return (
    <Ill label="Maisons de ville, pavillon et petit immeuble sous une courbe de prix">
      <Ground />
      <path className="n ka" d="M56 128C140 128 170 98 250 104S370 66 430 72S540 38 590 46" strokeWidth="5" />
      {[[56, 128], [250, 104], [430, 72], [590, 46]].map(([x, y]) => (
        <circle key={x} className="fa" cx={x} cy={y} r="8" />
      ))}
      <path className="fl" d="M84 206l46-40 46 40z" />
      <rect className="fc kl" x="92" y="204" width="76" height="96" rx="6" strokeWidth="2" />
      {win(104, 222)}{win(140, 222)}
      <rect className="fm" x="118" y="258" width="24" height="42" rx="5" />
      <path className="fl" d="M188 246l82-52 82 52z" />
      <rect className="fc kl" x="200" y="244" width="140" height="56" rx="6" strokeWidth="2" />
      {win(214, 258)}{win(298, 258)}
      <rect className="fa" x="252" y="256" width="30" height="44" rx="6" />
      <rect className="fc kl" x="372" y="168" width="90" height="132" rx="6" strokeWidth="2" />
      <rect className="fm" x="366" y="160" width="102" height="12" rx="6" />
      {[184, 214, 244].flatMap((y) => [win(384, y), win(426, y)])}
      <rect className="fm" x="402" y="272" width="30" height="28" rx="5" />
      <path className="fl" d="M478 216l44-38 44 38z" />
      <rect className="fc kl" x="486" y="214" width="72" height="86" rx="6" strokeWidth="2" />
      {win(498, 230)}{win(534, 230)}
      <rect className="fm" x="512" y="264" width="24" height="36" rx="5" />
    </Ill>
  )
}
