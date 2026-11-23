import { expect, test } from '@playwright/test'
import { FICHES, MENU_BUTTON, NAV_LABELS, PAGES, isNarrow, load, navTo } from './helpers'

test('navigation entre les 5 pages : focus sur le h1 et scrollY 0', async ({ page }) => {
  await load(page, '/')
  for (const label of ['À propos', 'Compétences', 'Projets', 'Contact', 'Accueil']) {
    await page.evaluate(() => window.scrollTo(0, 400))
    await navTo(page, label)
    const target = PAGES[NAV_LABELS.indexOf(label)]
    await expect(page).toHaveURL(new RegExp(target.path === '/' ? '/$' : target.path + '$'))
    await expect(page.locator('main h1')).toHaveText(target.h1)
    await expect(page.locator('main h1')).toBeFocused()
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0)
  }
})

test('fiches projet depuis la liste : focus h1, scrollY 0, retour par « Tous les projets »', async ({ page }) => {
  await load(page, '/projets')
  for (const slug of FICHES) {
    await page.evaluate(() => window.scrollTo(0, 300))
    await page.locator(`main a.pg-tile[href="${slug}"]`).click()
    await expect(page).toHaveURL(slug)
    await expect(page.locator('main h1')).toBeFocused()
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0)
    // Lien de retour : texte seul, sans flèche « ← » (le chevron éventuel vient du CSS).
    const back = page.getByRole('link', { name: 'Tous les projets', exact: true })
    await expect(back).toHaveCount(1)
    await expect(back).not.toContainText('←')
    await back.click()
    await expect(page).toHaveURL('/projets')
    await expect(page.locator('main h1')).toHaveText('Projets et SAE')
  }
})

test('titre de document distinct par page', async ({ page }) => {
  const titles = new Set<string>()
  for (const p of PAGES) {
    await load(page, p.path)
    titles.add(await page.title())
  }
  expect(titles.size).toBe(PAGES.length)
})

test("lien d'évitement : Tab, Entrée, focus sur #contenu", async ({ page }) => {
  await load(page, '/competences')
  await page.keyboard.press('Tab')
  await expect(page.getByRole('link', { name: 'Aller au contenu' })).toBeFocused()
  await page.keyboard.press('Enter')
  await expect(page.locator('#contenu')).toBeFocused()
})

test("barre fixe : lien actif aria-current (≥ 768 px) et nom « Alix Gouriet » renvoyant à l'accueil", async ({ page }) => {
  await load(page, '/competences')
  const links = page.locator('nav.ap-nav__links')
  if (isNarrow(page)) {
    await expect(links).toBeHidden()
  } else {
    await expect(links.getByRole('link')).toHaveText(NAV_LABELS)
    await expect(links.locator('a[aria-current="page"]')).toHaveText('Compétences')
  }
  await page.locator('header.ap-nav').getByRole('link', { name: 'Alix Gouriet', exact: true }).click()
  await expect(page).toHaveURL('/')
  await expect(page.locator('main h1')).toBeFocused()
})

test('barre fixe : reste collée en haut au défilement, hauteur 44 px (≥ 768 px) ou 48 px (mobile)', async ({ page }) => {
  await load(page, '/projets')
  await page.evaluate(() => window.scrollTo(0, 600))
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(0)
  const header = page.locator('header.ap-nav')
  await expect(header).toHaveCSS('position', 'fixed')
  const box = (await header.boundingBox())!
  expect(Math.round(box.y)).toBe(0)
  expect(Math.abs(box.height - (isNarrow(page) ? 48 : 44))).toBeLessThanOrEqual(1)
})

test("barre : au-dessus de 768 px 5 liens et pas de bouton Menu ; en dessous, un bouton « Menu » à icône sans liens rapides", async ({ page }) => {
  await load(page, '/')
  const menu = page.getByRole('button', MENU_BUTTON)
  // Les anciens liens d'accès rapide ont disparu.
  await expect(page.locator('nav[aria-label="Accès rapide"]')).toHaveCount(0)
  if (isNarrow(page)) {
    await expect(menu).toBeVisible()
    await expect(menu).toHaveAttribute('aria-haspopup', 'dialog')
    await expect(menu).toHaveText('') // icône seule : le nom vient de aria-label
    const box = (await menu.boundingBox())!
    expect(box.width).toBeGreaterThanOrEqual(44)
    expect(box.height).toBeGreaterThanOrEqual(44)
    const brand = (await page.locator('header.ap-nav').getByRole('link', { name: 'Alix Gouriet', exact: true }).boundingBox())!
    expect(brand.height).toBeGreaterThanOrEqual(44)
  } else {
    await expect(menu).toBeHidden()
    await expect(page.locator('nav.ap-nav__links')).toBeVisible()
  }
})

test('bandeau « Stage de 10 semaines dès avril 2027 » sur toutes les pages, lien « Me contacter » vers /contact', async ({ page }) => {
  for (const p of PAGES) {
    await load(page, p.path)
    const promo = page.locator('.ap-promo')
    await expect(promo, p.path).toHaveCount(1)
    await expect(promo, p.path).toContainText('Stage de 10 semaines dès avril 2027')
    await expect(promo.getByRole('link', { name: /^Me contacter/ }), p.path).toHaveAttribute('href', '/contact')
  }
  await load(page, '/')
  await page.locator('.ap-promo').getByRole('link', { name: /^Me contacter/ }).click()
  await expect(page).toHaveURL('/contact')
  await expect(page.locator('main h1')).toBeFocused()
})

test('pied de page : navigation vers les 5 pages (SiteFooter), « Me joindre » hors /contact seulement', async ({ page }) => {
  await load(page, '/projets')
  const footer = page.locator('footer.ap-footer')
  await expect(footer).toHaveCount(1)
  await expect(footer.getByRole('link', { name: 'Accueil', exact: true })).toHaveAttribute('href', '/')
  for (const [label, href] of [['À propos', '/a-propos'], ['Compétences', '/competences'], ['Projets', '/projets'], ['Contact', '/contact']])
    await expect(footer.getByRole('link', { name: label, exact: true }), label).toHaveAttribute('href', href)
  await expect(footer.getByRole('heading', { name: 'Me joindre' })).toHaveCount(1)
  await expect(footer.locator('a[href^="mailto:"]')).toHaveCount(1)
  // Sur /contact la page porte déjà les coordonnées : pied de page réduit à la navigation.
  await load(page, '/contact')
  await expect(page.locator('footer.ap-footer')).toHaveCount(1)
  await expect(page.locator('footer.ap-footer').getByRole('heading', { name: 'Me joindre' })).toHaveCount(0)
  await expect(page.locator('footer.ap-footer').getByRole('link', { name: 'Accueil', exact: true })).toHaveCount(1)
})

test('fiche : lien « Fiche suivante » vers une autre fiche', async ({ page }) => {
  await load(page, FICHES[0])
  const next = page.locator('nav[aria-label="Fiche suivante"] a')
  await expect(next).toHaveCount(1)
  const href = (await next.getAttribute('href')) as string
  expect(FICHES).toContain(href)
  expect(href).not.toBe(FICHES[0])
  await next.click()
  await expect(page).toHaveURL(href)
  await expect(page.locator('main h1')).toBeFocused()
})

test('fiche : couverture sombre pleine largeur et texte en colonne étroite', async ({ page }) => {
  await load(page, FICHES[0])
  await expect(page.locator('main h1')).toHaveClass(/pg-cover-title/)
  const prose = (await page.locator('article.pg-prose').boundingBox())!
  const cover = (await page.locator('header.pg-cover').boundingBox())!
  expect(prose.width).toBeLessThanOrEqual(720)
  if ((page.viewportSize()?.width ?? 0) >= 1000) expect(cover.width).toBeGreaterThan(prose.width + 100)
  // La couverture est centrée dans la page ; la colonne de texte aussi.
  const vw = page.viewportSize()!.width
  expect(Math.abs(prose.x + prose.width / 2 - vw / 2)).toBeLessThanOrEqual(20)
})
