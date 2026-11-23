import { expect, test } from '@playwright/test'
import { FICHES, load } from './helpers'

const ACCROCHE = '9 réalisations, dont 4 détaillées, avec SQL, R, Excel et VBA.'

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
  // Aucun bouton dans toute la page principale (les tuiles ne contiennent que des liens).
  await expect(page.locator('main button')).toHaveCount(0)
})

test('accueil : accroche calculée « 9 réalisations, dont 4 détaillées, avec SQL, R, Excel et VBA. » (Python exclu)', async ({ page }) => {
  await load(page, '/')
  const lede = page.locator('section[aria-label="Projets"] .home-lede')
  await expect(lede).toBeVisible()
  await expect(lede).toHaveText(ACCROCHE)
  await expect(lede).not.toContainText('Python')
})

test('accueil : 4 tuiles de projets, chacune avec titre h2 et un seul lien « En savoir plus sur … »', async ({ page }) => {
  await load(page, '/')
  const tiles = page.locator('main article.home-tile')
  await expect(tiles).toHaveCount(4)
  const hrefs: string[] = []
  for (let i = 0; i < 4; i++) {
    const tile = tiles.nth(i)
    await expect(tile.getByRole('heading', { level: 2 })).toBeVisible()
    const more = tile.getByRole('link', { name: /^En savoir plus sur / })
    await expect(more).toHaveCount(1)
    await expect(tile.getByRole('link')).toHaveCount(1) // un SEUL lien par tuile
    await expect(tile.getByRole('link', { name: /^Voir la fiche/ })).toHaveCount(0)
    const href = (await more.getAttribute('href')) as string
    hrefs.push(href)
  }
  expect([...hrefs].sort()).toEqual([...FICHES].sort())
  // Pas d'élément masqué en attendant une révélation : tout le texte est dans le DOM et lisible.
  await expect(page.getByText('À venir')).toHaveCount(0)
})

test("accueil : une fiche s'ouvre depuis une tuile (focus h1, scrollY 0)", async ({ page }) => {
  await load(page, '/')
  const first = page.locator('main article.home-tile').first().getByRole('link', { name: /^En savoir plus sur / })
  const href = (await first.getAttribute('href')) as string
  await first.scrollIntoViewIfNeeded()
  await first.click()
  await expect(page).toHaveURL(href)
  await expect(page.locator('main h1')).toBeFocused()
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0)
})

test('accueil : « Autres réalisations », 5 demi-tuiles aria-disabled sans lien ni focus', async ({ page }) => {
  await load(page, '/')
  const section = page.getByRole('region', { name: 'Autres réalisations', exact: true })
  await expect(section.getByRole('heading', { level: 2, name: 'Autres réalisations' })).toBeVisible()
  const halves = section.locator('article.home-half')
  await expect(halves).toHaveCount(5)
  for (let i = 0; i < 5; i++) {
    const h = halves.nth(i)
    await expect(h).toHaveAttribute('aria-disabled', 'true')
    await expect(h.locator('a')).toHaveCount(0)
    await expect(h.locator('button')).toHaveCount(0)
    await expect(h.locator('[tabindex]')).toHaveCount(0)
    await expect(h.getByRole('heading', { level: 3 })).toBeVisible()
    await expect(h.getByText('Fiche en préparation', { exact: true })).toBeVisible() // dit en texte, pas seulement en couleur
  }
  await expect(section.getByRole('link')).toHaveCount(0)
  // Navigation clavier : aucun arrêt de Tab dans ces tuiles.
  await page.locator('main h1').focus()
  for (let i = 0; i < 40; i++) {
    await page.keyboard.press('Tab')
    expect(await page.evaluate(() => !!document.activeElement?.closest('.home-half')), `Tab ${i + 1}`).toBe(false)
  }
})

test('accueil : sections Compétences (9 outils, lien) et À propos (phrase, lien)', async ({ page }) => {
  await load(page, '/')
  const skills = page.getByRole('region', { name: 'Compétences', exact: true })
  await expect(skills.getByRole('heading', { level: 2, name: 'Compétences' })).toBeVisible()
  await expect(skills.getByRole('list', { name: 'Outils' }).getByRole('listitem')).toHaveCount(9)
  await expect(skills.getByRole('link', { name: 'Voir les compétences' })).toHaveAttribute('href', '/competences')
  const about = page.getByRole('region', { name: 'À propos', exact: true })
  await expect(about.getByRole('heading', { level: 2, name: 'À propos' })).toBeVisible()
  await expect(about).toContainText('BUT Science des Données')
  await expect(about.getByRole('link', { name: 'En savoir plus' })).toHaveAttribute('href', '/a-propos')
  await about.getByRole('link', { name: 'En savoir plus' }).click()
  await expect(page).toHaveURL('/a-propos')
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

test('accueil : ordre des sections (hero, accroche et projets, autres réalisations, compétences, à propos)', async ({ page }) => {
  await load(page, '/')
  const order = await page.locator('main > section').evaluateAll((els) => els.map((e) => e.getAttribute('aria-labelledby') ?? e.getAttribute('aria-label')))
  expect(order).toEqual(['accueil-titre', 'Projets', 'autres-titre', 'competences-titre', 'apropos-titre'])
})
