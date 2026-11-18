import { expect, test } from '@playwright/test'
import { ALL_ROUTES, load } from './helpers'

test('liens internes valides, externes en https, mailto/tel présents', async ({ page, request }) => {
  test.setTimeout(120_000)
  const internal = new Set<string>()
  const external = new Set<string>()
  const special = new Set<string>()
  for (const route of ALL_ROUTES.filter((r) => r !== '/projets/xyz')) {
    await load(page, route)
    const hrefs = await page.$$eval('a[href]', (as) => as.map((a) => a.getAttribute('href') as string))
    for (const h of hrefs) {
      if (h.startsWith('mailto:') || h.startsWith('tel:')) special.add(h)
      else if (/^https?:/.test(h)) external.add(h)
      else if (h.startsWith('#')) continue
      else internal.add(h)
    }
  }
  expect([...special].sort()).toEqual(['mailto:alixgouriet@gmail.com', 'tel:+33649516657'])
  for (const h of external) expect(h, 'lien externe doit être https').toMatch(/^https:/)
  for (const h of internal) {
    if (h.endsWith('.pdf')) {
      const res = await request.get(h)
      expect(res.status(), h).toBe(200)
      expect(res.headers()['content-type'], h).toContain('pdf')
      continue
    }
    await load(page, h)
    await expect(page.locator('main h1'), h).not.toHaveText(/introuvable|404/i)
  }
  console.log('internes:', [...internal].join(' '), '| externes:', [...external].join(' ') || '(aucun)')
})

test('CV : PDF répond 200, signature %PDF, lien présent', async ({ page, request }) => {
  await load(page, '/contact')
  await expect(page.getByRole('link', { name: /Télécharger mon CV/ })).toHaveAttribute('href', '/cv-alix-gouriet.pdf')
  const res = await request.get('/cv-alix-gouriet.pdf')
  expect(res.status()).toBe(200)
  expect((await res.body()).subarray(0, 4).toString()).toBe('%PDF')
})

test('contact : mailto, tel, ville, aucun formulaire', async ({ page }) => {
  await load(page, '/contact')
  await expect(page.locator('a[href^="mailto:"]').first()).toHaveAttribute('href', 'mailto:alixgouriet@gmail.com')
  await expect(page.locator('a[href^="tel:"]').first()).toHaveAttribute('href', 'tel:+33649516657')
  await expect(page.getByText('Niort').first()).toBeVisible()
  expect(await page.locator('form').count()).toBe(0)
  expect(await page.locator('input[type=text],input[type=email],textarea').count()).toBe(0)
})

test("copie de l'e-mail dans le presse-papiers", async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write'])
  await load(page, '/contact')
  await page.getByRole('button', { name: "Copier l'e-mail" }).click()
  await expect(page.getByText('E-mail copié').first()).toBeVisible()
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe('alixgouriet@gmail.com')
  await expect(page.locator('[aria-live=polite]', { hasText: 'E-mail copié.' })).toHaveCount(1)
  await page.waitForTimeout(2300)
  await expect(page.locator('span[aria-hidden=true]', { hasText: 'E-mail copié' })).toHaveCount(0)
})

test("copie de l'e-mail : presse-papiers refusé, pas d'erreur", async ({ page }) => {
  await load(page, '/contact')
  await page.evaluate(() => {
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: () => Promise.reject(new Error('denied')) },
      configurable: true,
    })
  })
  const errs: string[] = []
  page.on('pageerror', (e) => errs.push(e.message))
  await page.getByRole('button', { name: "Copier l'e-mail" }).click()
  await page.waitForTimeout(300)
  expect(errs).toEqual([])
})
