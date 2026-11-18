import { expect, type Page } from '@playwright/test'

export const PAGES = [
  { path: '/', h1: /Alix\s*Gouriet/ },
  { path: '/a-propos', h1: /propos/i },
  { path: '/competences', h1: 'Compétences' },
  { path: '/projets', h1: 'Projets et SAE' },
  { path: '/contact', h1: 'Contact' },
]
export const FICHES = [
  '/projets/prix-immobiliers-niortais',
  '/projets/villes-natalistes',
  '/projets/greensd',
  '/projets/educheck',
]
export const ALL_ROUTES = [...PAGES.map((p) => p.path), ...FICHES, '/projets/xyz']

/** Écoute console (erreurs + avertissements), erreurs de page et requêtes en échec. */
export function watchConsole(page: Page) {
  const issues: string[] = []
  page.on('console', (m) => {
    if (m.type() === 'error' || m.type() === 'warning') issues.push(`[${m.type()}] ${m.text()}`)
  })
  page.on('pageerror', (e) => issues.push(`[pageerror] ${e.message}`))
  page.on('requestfailed', (r) => issues.push(`[requestfailed] ${r.url()} ${r.failure()?.errorText}`))
  page.on('response', (r) => {
    if (r.status() >= 400) issues.push(`[http ${r.status()}] ${r.url()}`)
  })
  return issues
}

export async function load(page: Page, path: string) {
  await page.goto(path)
  await page.waitForLoadState('networkidle')
  await expect(page.locator('main h1')).toBeVisible()
}

/** Navigue par l'interface (menu mobile si le bouton Menu est visible, sinon en-tête). */
export async function navTo(page: Page, label: string) {
  const menu = page.getByRole('button', { name: 'Menu', exact: true })
  if (await menu.isVisible()) {
    await menu.click()
    await page.locator('dialog.sheet').getByRole('link', { name: label, exact: true }).click()
  } else {
    await page.locator('nav.nav-desktop').getByRole('link', { name: label, exact: true }).click()
  }
}
