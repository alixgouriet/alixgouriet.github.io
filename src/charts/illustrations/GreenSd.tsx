import { Ill, Ground } from './Ill.tsx'

export default function GreenSd() {
  return (
    <Ill label="Camionnette électrique chargée de colis, avec une feuille et des tables de base de données reliées">
      <Ground />
      {[150, 270, 390].map((x, i) => (
        <g key={x}>
          <rect className="fc kl" x={x} y="40" width="100" height="66" rx="12" strokeWidth="2" />
          <path className={i === 1 ? 'fq' : 'ff'} d={`M${x + 1} 52a11 11 0 0 1 11-11h78a11 11 0 0 1 11 11v10H${x + 1}z`} />
          <rect className="fs" x={x + 12} y="72" width="56" height="7" rx="3.5" />
          <rect className="fs" x={x + 12} y="87" width="38" height="7" rx="3.5" />
        </g>
      ))}
      <path className="n km" d="M250 73h20M370 73h20" strokeWidth="4" />
      <path className="n ka" d="M320 108v92" strokeWidth="3" strokeDasharray="2 9" />
      <rect className="fs kl" x="190" y="258" width="48" height="40" rx="7" strokeWidth="2" />
      <rect className="fm kl" x="204" y="224" width="34" height="34" rx="6" strokeWidth="2" />
      <path className="n kl" d="M214 258v14M221 224v12" strokeWidth="2" />
      <rect className="fc kl" x="250" y="192" width="142" height="102" rx="14" strokeWidth="2" />
      <path className="fa" d="M392 214h42q12 0 19 10l17 30q4 7 4 15v25h-82z" />
      <path className="fc" d="M406 228h27q6 0 9 5l9 17h-45z" />
      <circle className="fq" cx="321" cy="243" r="28" />
      <path className="fa" d="M305 258c0-19 10-31 32-33 2 21-9 33-32 33z" />
      <path className="n kc" d="M308 255l18-18" strokeWidth="2.5" />
      {[302, 432].map((x) => (
        <g key={x}>
          <circle className="fi" cx={x} cy="294" r="21" />
          <circle className="fc" cx={x} cy="294" r="8" />
        </g>
      ))}
    </Ill>
  )
}
