import type { CSSProperties } from 'react'
import { splitWords } from '../../data/copy.ts'

/**
 * Phrase dont les mots s'éclairent au défilement (effet CSS, voir effects.css).
 * La phrase complète est un seul nœud lu par les lecteurs d'écran ; les mots découpés sont aria-hidden.
 */
export function LitSentence({ text, xl = false, as: Tag = 'p' }: { text: string; xl?: boolean; as?: 'p' | 'div' }) {
  const words = splitWords(text)
  return (
    <Tag className={xl ? 'lit lit-xl' : 'lit'} data-fx="lit">
      <span className="sr-only">{text}</span>
      <span aria-hidden="true">
        {words.map((w, i) => (
          <span key={i} className="w" style={{ '--i': i } as CSSProperties}>
            {w}{' '}
          </span>
        ))}
      </span>
    </Tag>
  )
}
