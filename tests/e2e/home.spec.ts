import { expect, test } from '@playwright/test'
import { load } from './helpers'

test('accueil : un seul h1 « Alix Gouriet », sous-titre et statut de recherche de stage', async ({ page }) => {
  await load(page, '/')
  await expect(page.locator('h1')).toHaveCount(1)
  await expect(page.getByRole('heading', { level: 1, name: 'Alix Gouriet', exact: true })).toBeVisible()
  const hero = page.locator('section[aria-labelledby="accueil-titre"]')
  await expect(hero).toContainText(/Étudiant en 2e année de BUT Science des Données, parcours VCOD, à l[’']IUT de Niort\./)
  await expect(hero).toContainText('Je cherche un stage de 10 semaines dès avril 2027.')
})

test('accueil : pilules « Voir les projets » et « Me contacter » avec les bonnes destinations', async ({ page }) => {
  await load(page, '/')
  const main = page.locator('main')
  const projets = main.getByRole('link', { name: 'Voir les projets', exact: true })
  const contact = main.getByRole('link', { name: 'Me contacter', exact: true })
  await expect(projets).toHaveCount(1)
  await expect(contact).toHaveCount(1)
  await expect(projets).toHaveClass(/ap-pill/)
  await expect(contact).toHaveClass(/ap-pill-outline/)
  await expect(projets).toHaveAttribute('href', '/projets')
  await expect(contact).toHaveAttribute('href', '/contact')
  await projets.click()
  await expect(page).toHaveURL('/projets')
  await expect(page.locator('main h1')).toBeFocused()
  await load(page, '/')
  await main.getByRole('link', { name: 'Me contacter', exact: true }).click()
  await expect(page).toHaveURL('/contact')
  await expect(page.locator('main h1')).toHaveText('Contact')
})

test('accueil : photo avec texte alternatif, chargée, dimensions réservées', async ({ page }) => {
  await load(page, '/')
  const img = page.getByRole('img', { name: /^Portrait d[’']Alix Gouriet$/ })
  await expect(img).toHaveCount(1)
  await expect(img).toBeVisible()
  await expect(img).toHaveAttribute('width', '331')
  await expect(img).toHaveAttribute('height', '428')
  await expect.poll(() => img.evaluate((i: HTMLImageElement) => i.complete && i.naturalWidth > 0)).toBe(true)
})

test('accueil : plus de hero interactif (aucun graphique de régression, curseur ni « Ajuster automatiquement »)', async ({ page }) => {
  await load(page, '/')
  await expect(page.getByRole('button', { name: /Ajuster automatiquement/ })).toHaveCount(0)
  await expect(page.getByText(/Ajuster automatiquement/)).toHaveCount(0)
  await expect(page.getByRole('slider')).toHaveCount(0)
  await expect(page.locator('input[type="range"]')).toHaveCount(0)
  await expect(page.locator('section[aria-label="Régression interactive"]')).toHaveCount(0)
  await expect(page.getByText('Régression interactive')).toHaveCount(0)
  // Aucun contrôle de formulaire dans le hero.
  await expect(page.locator('section[aria-labelledby="accueil-titre"]').locator('input, select, button, svg')).toHaveCount(0)
  // Aucun bouton dans toute la page principale .
  await expect(page.locator('main button')).toHaveCount(0)
})

test('accueil : plus de tuiles de projets, d’« Autres réalisations », de compétences ni de lien « En savoir plus »', async ({ page }) => {
  await load(page, '/')
  await expect(page.locator('main article.home-tile')).toHaveCount(0)
  await expect(page.locator('main article.home-half')).toHaveCount(0)
  await expect(page.locator('.home-lede, .home-skills, .home-skill')).toHaveCount(0)
  await expect(page.getByRole('link', { name: /^En savoir plus sur / })).toHaveCount(0)
  await expect(page.getByRole('link', { name: /^Voir la fiche/ })).toHaveCount(0)
  for (const name of ['Projets', 'Compétences', 'Autres réalisations'])
    await expect(page.getByRole('region', { name, exact: true }), name).toHaveCount(0)
  await expect(page.getByText('Fiche en préparation')).toHaveCount(0)
  // Les 4 scènes de projets ne sont plus sur l'accueil : seule la scène « Mon parcours » y reste.
  await expect(page.locator('article.scene')).toHaveCount(1)
  await expect(page.locator('article.scene--parcours')).toHaveCount(1)
  await expect(page.getByRole('list', { name: /^Étapes : / })).toHaveCount(0)
})

test('accueil : rangée de chiffres calculés (9 réalisations, 4 fiches détaillées, 15 outils cités)', async ({ page }) => {
  await load(page, '/')
  const figures = page.getByRole('region', { name: 'Chiffres', exact: true })
  await expect(figures).toHaveCount(1)
  await expect(figures.getByRole('heading')).toHaveCount(0) // pas de titre visible
  const pairs = await figures.locator('dl > div').evaluateAll((rows) =>
    rows.map((r) => [r.querySelector('dt')?.textContent?.trim(), r.querySelector('dd')?.textContent?.trim()]),
  )
  expect(pairs).toEqual([
    ['Réalisations', '9'],
    ['Fiches détaillées', '4'],
    ['Outils cités', '15'],
  ])
})

test('accueil : plus de section « À propos » courte ni de rubrique « valeurs »', async ({ page }) => {
  await load(page, '/')
  await expect(page.getByRole('region', { name: 'À propos', exact: true })).toHaveCount(0)
  await expect(page.locator('main').getByRole('heading', { name: 'À propos' })).toHaveCount(0)
  await expect(page.locator('main').getByText(/valeurs/i)).toHaveCount(0)
})

test('accueil : bandeau « Stage de 10 semaines dès avril 2027 » juste sous la barre, lien « Me contacter › »', async ({ page }) => {
  await load(page, '/')
  const promo = page.locator('.ap-promo')
  await expect(promo).toBeVisible()
  await expect(promo.getByText('Stage de 10 semaines dès avril 2027')).toBeVisible()
  const link = promo.getByRole('link', { name: /^Me contacter/ })
  await expect(link).toHaveAttribute('href', '/contact')
  const header = (await page.locator('header.ap-nav').boundingBox())!
  const bar = (await promo.boundingBox())!
  expect(bar.y).toBeGreaterThanOrEqual(header.y + header.height - 1)
})

test('accueil : ordre des sections (hero, chiffres, parcours)', async ({ page }) => {
  await load(page, '/')
  const order = await page.locator('main > section').evaluateAll((els) => els.map((e) => e.getAttribute('aria-labelledby') ?? e.getAttribute('aria-label')))
  expect(order).toEqual(['accueil-titre', 'Chiffres', 'parcours-titre'])
})
