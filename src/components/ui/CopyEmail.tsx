import { useEffect, useRef, useState } from 'react'

export function CopyEmail({ email }: { email: string }) {
  const [copied, setCopied] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  useEffect(() => () => clearTimeout(timer.current), [])

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(email)
      setCopied(true)
      clearTimeout(timer.current)
      timer.current = setTimeout(() => setCopied(false), 2000)
    } catch {
      /* presse-papiers indisponible : l'adresse reste affichée et cliquable */
    }
  }

  return (
    <>
      <button type="button" className="btn btn-outline" onClick={copy}>
        Copier l'e-mail
      </button>
      <span className="sr-only" aria-live="polite">
        {copied ? 'E-mail copié.' : ''}
      </span>
      {copied ? (
        <span className="small muted" aria-hidden="true">
          {' '}
          E-mail copié
        </span>
      ) : null}
    </>
  )
}
