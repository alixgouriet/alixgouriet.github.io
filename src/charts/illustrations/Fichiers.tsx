import { Ill, Ground } from './Ill.tsx'

export default function Fichiers() {
  return (
    <Ill label="Un fichier JSON transformé en tableau CSV par une flèche">
      <Ground />
      <path className="fc kl" d="M106 64h98l44 44v176a12 12 0 0 1-12 12H106a12 12 0 0 1-12-12V76a12 12 0 0 1 12-12z" strokeWidth="2" />
      <path className="fs" d="M204 64l44 44h-32a12 12 0 0 1-12-12z" />
      <path className="n ki" d="M166 128c-14 0-16 6-16 18v14c0 8-4 12-10 12 6 0 10 4 10 12v14c0 12 2 18 16 18M192 128c14 0 16 6 16 18v14c0 8 4 12 10 12-6 0-10 4-10 12v14c0 12-2 18-16 18" strokeWidth="6" />
      <rect className="fs" x="124" y="238" width="96" height="8" rx="4" />
      <rect className="fs" x="124" y="256" width="60" height="8" rx="4" />
      <path className="n km" d="M268 180h10M362 180h10" strokeWidth="5" strokeDasharray="1 11" />
      <circle className="fa" cx="320" cy="180" r="34" />
      <path className="n kc" d="M304 180h32m-13-14l14 14-14 14" strokeWidth="6" />
      <rect className="fc kl" x="398" y="86" width="150" height="190" rx="14" strokeWidth="2" />
      <path className="fq" d="M399 100a13 13 0 0 1 13-13h122a13 13 0 0 1 13 13v26H399z" />
      <path className="n ks" d="M448 88v186M498 88v186M400 162h148M400 198h148M400 234h148" strokeWidth="2" />
      <path className="n kl" d="M400 126h148" strokeWidth="2" />
      {[[412, 108], [462, 108], [512, 108]].map(([x, y]) => <rect key={x} className="fa" x={x} y={y} width="24" height="7" rx="3.5" />)}
      {[[412, 140], [462, 140], [512, 140], [412, 176], [462, 176], [512, 176], [412, 212], [462, 212], [412, 248], [512, 248]].map(([x, y]) => (
        <rect key={`${x}-${y}`} className="fm" x={x} y={y} width="26" height="7" rx="3.5" />
      ))}
    </Ill>
  )
}
