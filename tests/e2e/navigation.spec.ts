import { expect, test } from '@playwright/test'
import { FICHES, PAGES, load, navTo } from './helpers'

test('navigation entre les 5 pages : focus sur le h1 et scrollY 0', async ({ page }) => {
  await load(page, '/')
  const order = ['Accueil', 'À propos', 'Compétences', 'Projets', 'Contact']
  for (const label of ['À propos', 'Compétences', 'Projets', 'Contact', 'Accueil']) {
    await page.evaluate(() => window.scrollTo(0, 400))
    await navTo(page, label)
    const target = PAGES[order.indexOf(label)]
    await expect(page).toHaveURL(new RegExp(target.path === '/' ? '/$' : target.path + '$'))
    await expect(page.locator('main h1')).toHaveText(target.h1)
    await expect(page.locator('main h1')).toBeFocused()
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0)
  }
})

test('fiches projet depuis la liste : focus h1, scrollY 0, retour', async ({ page }) => {
  await load(page, '/projets')
  for (const slug of FICHES) {
    await page.evaluate(() => window.scrollTo(0, 300))
    await page.locator(`a[href="${slug}"]`).first().click()
    await expect(page).toHaveURL(slug)
    await expect(page.locator('main h1')).toBeFocused()
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0)
    await page.getByRole('link', { name: /Tous les projets/ }).click()
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

test("lien d'évitement et lien actif aria-current", async ({ page }) => {
  await load(page, '/competences')
  await page.keyboard.press('Tab')
  await expect(page.getByRole('link', { name: 'Aller au contenu' })).toBeFocused()
  await page.keyboard.press('Enter')
  await expect(page.locator('#contenu')).toBeFocused()
  const nav = page.locator('nav.nav-desktop')
  if (await nav.isVisible()) {
    await expect(nav.locator('a[aria-current="page"]')).toHaveText('Compétences')
  }
})
