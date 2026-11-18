export function SkipLink() {
  return (
    <a
      className="skip"
      href="#contenu"
      onClick={(e) => {
        e.preventDefault()
        document.getElementById('contenu')?.focus()
      }}
    >
      Aller au contenu
    </a>
  )
}
