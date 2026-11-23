import { Ill, Ground } from './Ill.tsx'

export default function Territoire() {
  return (
    <Ill label="Carte stylisée avec un repère de lieu, écran de présentation et deux bulles de langue">
      <Ground />
      <path className="fs" d="M36 156l44-20v122l-44 20z" />
      <path className="ff" d="M80 136l44 20v122l-44-20z" />
      <path className="fs" d="M124 156l44-20v122l-44 20z" />
      <path className="n km" d="M80 136v122M124 156v122" strokeWidth="2" />
      <path className="fa" d="M102 100a20 20 0 0 1 20 20c0 15-20 38-20 38s-20-23-20-38a20 20 0 0 1 20-20z" />
      <circle className="fc" cx="102" cy="120" r="7" />
      <rect className="fc kl" x="204" y="60" width="284" height="172" rx="16" strokeWidth="2" />
      <path className="fq" d="M232 150q4-34 40-42t58 10q22-20 52-6t18 44q-4 28-36 34t-60-6q-34 14-60-4t-12-30z" />
      <path className="n ka" d="M262 176q34-26 68-8t70-12" strokeWidth="3" strokeDasharray="1 8" />
      <path className="fa" d="M326 96a13 13 0 0 1 13 13c0 10-13 26-13 26s-13-16-13-26a13 13 0 0 1 13-13z" />
      <circle className="fc" cx="326" cy="109" r="4.5" />
      <rect className="fs" x="232" y="204" width="110" height="8" rx="4" />
      <rect className="fm" x="352" y="232" width="24" height="30" />
      <rect className="fl" x="318" y="260" width="92" height="10" rx="5" />
      <path className="fa" d="M544 70h42a18 18 0 0 1 18 18v12a18 18 0 0 1-18 18h-16l-14 14v-14h-12a18 18 0 0 1-18-18V88a18 18 0 0 1 18-18z" />
      <rect className="fc" x="534" y="84" width="40" height="7" rx="3.5" />
      <rect className="fc" x="534" y="98" width="24" height="7" rx="3.5" />
      <rect className="fc kl" x="526" y="150" width="76" height="48" rx="18" strokeWidth="2" />
      <path className="fc kl" d="M552 198l14 14v-14" strokeWidth="2" />
      <rect className="fs" x="540" y="164" width="44" height="7" rx="3.5" />
      <rect className="fs" x="540" y="178" width="28" height="7" rx="3.5" />
    </Ill>
  )
}
