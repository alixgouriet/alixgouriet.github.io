import { useEffect, useRef, useState } from 'react'

export function CopyEmail({ email }: { email: string }) {
  const [copied, setCopied] = useState(false)
  const [failed, setFailed] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  useEffect(() => () => clearTimeout(timer.current), [])

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(email)
      setFailed(false)
      setCopied(true)
      clearTimeout(timer.current)
      timer.current = setTimeout(() => setCopied(false), 2500)
    } catch {
      // Presse-papiers indisponible : l’adresse reste affichée et sélectionnable.
      setCopied(false)
      setFailed(true)
    }
  }

  return (
    <>
      <button type="button" className="btn btn-outline" onClick={copy}>
        Copier
        <span className="sr-only">&nbsp;l’e-mail</span>
      </button>
      <span className="copy-status" role="status">
        {copied ? 'E-mail copié' : failed ? 'Copie impossible : sélectionnez l’adresse.' : ''}
      </span>
    </>
  )
}
