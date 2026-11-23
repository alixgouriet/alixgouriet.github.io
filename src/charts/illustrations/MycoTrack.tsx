import { Ill, Ground } from './Ill.tsx'

export default function MycoTrack() {
  return (
    <Ill label="Chèvre, éprouvette de laboratoire et tableau de bord de suivi">
      <Ground cx={250} rx={210} />
      {[104, 128, 172, 196].map((x) => <rect key={x} className="fm" x={x} y="244" width="11" height="52" rx="5" />)}
      <path className="n ki" d="M84 208q-14-4-16-20" strokeWidth="5" />
      <path className="fc kl" d="M84 214Q84 186 116 186H190L220 134Q234 124 252 132L278 152Q284 166 268 172L248 178L234 208Q226 224 214 232V252Q214 258 206 258H112Q84 258 84 230z" strokeWidth="2" />
      <path className="n ki" d="M236 128q-8-26 12-38M248 130q4-24 24-28" strokeWidth="5" />
      <path className="fs kl" d="M238 140l-28-6 14 22z" strokeWidth="2" />
      <path className="fl" d="M258 174l5 20 9-18z" />
      <path className="fc kl" d="M312 70v150a24 24 0 0 0 48 0V70z" strokeWidth="2" />
      <path className="fq" d="M312 164v56a24 24 0 0 0 48 0v-56z" />
      <path className="n km" d="M312 100h10M312 120h14M312 140h10" strokeWidth="3" />
      <circle className="fa" cx="334" cy="212" r="7" />
      <circle className="fa" cx="348" cy="186" r="4" />
      <rect className="fl" x="304" y="62" width="64" height="12" rx="6" />
      <rect className="fc kl" x="400" y="76" width="190" height="198" rx="16" strokeWidth="2" />
      {[418, 440, 462].map((x, i) => <circle key={x} className={i === 0 ? 'fa' : 'fm'} cx={x} cy="98" r="6" />)}
      <rect className="ff" x="418" y="118" width="154" height="84" rx="10" />
      <path className="n ka" d="M430 186l30-30 28 14 34-44 28 20 12-18" strokeWidth="4" />
      {[[424, 20], [452, 34], [480, 26], [508, 46], [536, 38]].map(([x, h], i) => (
        <rect key={x} className={i === 3 ? 'fa' : 'fm'} x={x} y={258 - h} width="20" height={h} rx="5" />
      ))}
    </Ill>
  )
}
