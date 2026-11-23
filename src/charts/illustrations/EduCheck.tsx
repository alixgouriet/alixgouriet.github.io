import { Ill, Ground } from './Ill.tsx'

export default function EduCheck() {
  return (
    <Ill label="Carnet de notes, tableur, bonnet de diplômé et barres par semestre">
      <Ground />
      <g transform="rotate(-6 124 210)">
        <rect className="fc kl" x="70" y="124" width="112" height="154" rx="12" strokeWidth="2" />
        <rect className="fa" x="70" y="124" width="22" height="154" rx="11" />
        {[150, 176, 202].map((y) => (
          <rect key={y} className="fs" x="106" y={y} width={y === 202 ? 44 : 62} height="8" rx="4" />
        ))}
        <rect className="fq" x="106" y="228" width="50" height="26" rx="8" />
      </g>
      <rect className="fc kl" x="196" y="112" width="262" height="178" rx="14" strokeWidth="2" />
      <path className="ff" d="M197 126a13 13 0 0 1 13-13h234a13 13 0 0 1 13 13v14H197z" />
      <rect className="fq" x="328" y="168" width="64" height="28" />
      <path className="n ks" d="M262 114v174M328 114v174M394 114v174M198 168h258M198 196h258M198 224h258M198 252h258" strokeWidth="2" />
      <rect className="n ka" x="328" y="168" width="64" height="28" rx="3" strokeWidth="3" />
      {[[210, 154], [276, 154], [342, 154], [210, 182], [276, 182], [210, 210], [342, 210], [276, 238]].map(([x, y]) => (
        <rect key={`${x}-${y}`} className="fm" x={x} y={y + 6} width="38" height="7" rx="3.5" />
      ))}
      <rect className="fc kl" x="474" y="174" width="112" height="116" rx="14" strokeWidth="2" />
      <rect className="fm" x="494" y="224" width="22" height="48" rx="6" />
      <rect className="fl" x="526" y="206" width="22" height="66" rx="6" />
      <rect className="fa" x="558" y="184" width="14" height="88" rx="6" />
      <path className="fi" d="M326 26l66 26-66 26-66-26z" />
      <path className="fl" d="M290 68v22q36 18 72 0V68l-36 14z" />
      <path className="n ka" d="M392 52v32" strokeWidth="4" />
      <circle className="fa" cx="392" cy="90" r="6" />
    </Ill>
  )
}
