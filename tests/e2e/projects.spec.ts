import { expect, test } from '@playwright/test'
import { load } from './helpers'

test('liste /projets : 5 lignes dont 1 « À venir » non focusable sans lien', async ({ page }) => {
  await load(page, '/projets')
  const rows = page.locator('main ul.plist > li')
  await expect(rows).toHaveCount(5)
  await expect(rows.locator('a.prow')).toHaveCount(4)
  const soon = rows.filter({ hasText: 'À venir' })
  await expect(soon).toHaveCount(1)
  await expect(soon.locator('a')).toHaveCount(0)
  await expect(soon.locator('[tabindex]')).toHaveCount(0)
  await expect(soon.locator('button')).toHaveCount(0)
  await expect(rows.last()).toContainText('À venir')
  const stops: boolean[] = []
  await page.locator('main h1').focus()
  for (let i = 0; i < 12; i++) {
    await page.keyboard.press('Tab')
    stops.push(await page.evaluate(() => !!document.activeElement?.closest('.prow-soon')))
  }
  expect(stops.some(Boolean)).toBe(false)
})

test('filtres masqués (4 projets disponibles < seuil 5)', async ({ page }) => {
  await load(page, '/projets')
  await expect(page.locator('details.filters')).toHaveCount(0)
  await expect(page.getByRole('checkbox')).toHaveCount(0)
  await load(page, '/projets?techno=python')
  await expect(page.locator('main ul.plist > li')).toHaveCount(5)
})

test('accueil : liste projets (5 lignes) et lien « Tous les projets »', async ({ page }) => {
  await load(page, '/')
  await expect(page.locator('#home-projets ~ ul.plist > li')).toHaveCount(5)
  await page.getByRole('link', { name: 'Tous les projets et SAE' }).click()
  await expect(page).toHaveURL('/projets')
})

test('fiche inconnue et slug « à venir » → page 404', async ({ page }) => {
  for (const url of ['/projets/xyz', '/projets/conversion-fichiers', '/nimporte/quoi']) {
    const res = await page.goto(url)
    await page.waitForLoadState('networkidle')
    const h1 = page.locator('main h1')
    await expect(h1, url).toBeVisible()
    console.log(url, '-> HTTP', res?.status(), '| h1:', await h1.innerText(), '| title:', await page.title())
    await expect(h1, url).toHaveText(/introuvable|404|n'existe/i)
  }
})

test('compétences : preuves dérivées et « Sur CV »', async ({ page }) => {
  await load(page, '/competences')
  const rows = page.locator('li.srow')
  await expect(rows).toHaveCount(9)
  const n = await rows.count()
  let withProof = 0
  let surCv = 0
  for (let i = 0; i < n; i++) {
    const r = rows.nth(i)
    const links = await r.locator('a.chip').count()
    const cv = await r.getByText('Sur CV', { exact: true }).count()
    expect(links > 0 !== cv > 0, `ligne ${i} : preuve XOR Sur CV`).toBe(true)
    if (links > 0) withProof++
    else surCv++
  }
  console.log('compétences avec preuve:', withProof, '| Sur CV:', surCv)
  expect(withProof).toBeGreaterThan(0)
  const hrefs = await page.$$eval('a.chip', (as) => as.map((a) => a.getAttribute('href') as string))
  for (const h of new Set(hrefs)) {
    await load(page, h)
    await expect(page.locator('main h1')).not.toHaveText(/introuvable|404/i)
  }
})
