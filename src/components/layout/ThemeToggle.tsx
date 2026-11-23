import { useTheme } from './theme.ts'

/**
 * Bascule sombre / clair. Le nom accessible indique le mode que le bouton active (« Mode sombre » en thème clair),
 * `aria-pressed` vaut true quand le thème sombre est actif. `row` : ligne avec texte visible (menu mobile) ; sinon icône seule (barre).
 */
export function ThemeToggle({ variant = 'bar' }: { variant?: 'bar' | 'row' }) {
  const [theme, set] = useTheme()
  const dark = theme === 'dark'
  const label = dark ? 'Mode clair' : 'Mode sombre'
  return (
    <button
      type="button"
      className={`ap-theme ap-theme--${variant}`}
      aria-pressed={dark}
      aria-label={variant === 'bar' ? label : undefined}
      onClick={() => set(dark ? 'light' : 'dark')}
    >
      {dark ? (
        <svg viewBox="0 0 20 20" aria-hidden="true">
          <circle cx="10" cy="10" r="3.6" />
          <path d="M10 2.2v1.6M10 16.2v1.6M2.2 10h1.6M16.2 10h1.6M4.5 4.5l1.1 1.1M14.4 14.4l1.1 1.1M15.5 4.5l-1.1 1.1M5.6 14.4l-1.1 1.1" />
        </svg>
      ) : (
        <svg viewBox="0 0 20 20" aria-hidden="true">
          <path d="M16.6 12.3A6.9 6.9 0 0 1 7.7 3.4a7 7 0 1 0 8.9 8.9z" />
        </svg>
      )}
      {variant === 'row' ? <span>{label}</span> : null}
    </button>
  )
}
