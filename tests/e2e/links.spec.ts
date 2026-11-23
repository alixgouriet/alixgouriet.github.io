import { expect, test } from '@playwright/test'
import { ALL_ROUTES, COPY_BUTTON_NAME, COPY_STATUS, load } from './helpers'

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

test('contact : section sombre centrée, h1 « Contact », e-mail en grand, téléphone, CV', async ({ page }) => {
  await load(page, '/contact')
  const section = page.locator('main section.ap-contact')
  await expect(section).toHaveCount(1)
  await expect(section.getByRole('heading', { level: 1, name: 'Contact' })).toBeVisible()
  await expect(section.getByRole('link', { name: 'alixgouriet@gmail.com' })).toHaveAttribute('href', 'mailto:alixgouriet@gmail.com')
  await expect(section.getByRole('link', { name: '06 49 51 66 57' })).toHaveAttribute('href', 'tel:+33649516657')
  await expect(section).toContainText('stage de 10 semaines')
  // Surface sombre : le titre est en texte clair (le fond dépend de la classe .ap-dark).
  const color = await section.getByRole('heading', { level: 1 }).evaluate((el) => getComputedStyle(el).color)
  const [r, g, b] = (color.match(/\d+/g) ?? ['0', '0', '0']).map(Number)
  expect(r + g + b, color).toBeGreaterThan(600)
})

test('contact : mailto, tel, ville, aucun formulaire', async ({ page }) => {
  await load(page, '/contact')
  await expect(page.locator('a[href^="mailto:"]').first()).toHaveAttribute('href', 'mailto:alixgouriet@gmail.com')
  await expect(page.locator('a[href^="tel:"]').first()).toHaveAttribute('href', 'tel:+33649516657')
  await expect(page.locator('.ap-contact__list').getByText('Niort', { exact: true })).toBeVisible()
  await expect(page.locator('main h1')).toHaveText('Contact')
  await expect(page.locator('section.ap-contact')).toHaveClass(/ap-dark/)
  expect(await page.locator('form').count()).toBe(0)
  expect(await page.locator('input[type=text],input[type=email],textarea').count()).toBe(0)
})

test("copie de l'e-mail dans le presse-papiers", async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write'])
  await load(page, '/contact')
  const status = page.locator(COPY_STATUS)
  await expect(status).toHaveText('')
  await page.getByRole('button', { name: COPY_BUTTON_NAME }).click()
  // La confirmation est annoncée par un role=status (pas seulement affichée).
  await expect(page.getByRole('status').filter({ hasText: 'E-mail copié' })).toHaveCount(1)
  await expect(status).toHaveText('E-mail copié')
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe('alixgouriet@gmail.com')
  // Le message disparaît seul (2,5 s côté composant).
  await expect(status).toHaveText('', { timeout: 4000 })
})

test("bouton de copie : libellé visible « Copier », nom accessible « Copier l'e-mail », zone role=status vide au départ (/contact)", async ({ page }) => {
  await load(page, '/contact')
  const btn = page.getByRole('button', { name: COPY_BUTTON_NAME })
  await expect(btn).toHaveCount(1)
  await expect(btn).toContainText('Copier')
  // Libellé visible = « Copier » seul ; « l'e-mail » est un complément sr-only (innerText l'inclut, d'où le test par nœud texte).
  expect((await btn.evaluate((el) => el.firstChild?.textContent ?? '')).trim()).toBe('Copier')
  await expect(btn.locator('.sr-only')).toHaveCount(1)
  expect(await btn.locator('.sr-only').evaluate((el) => { const r = el.getBoundingClientRect(); return r.width <= 1 && r.height <= 1 })).toBe(true)
  await expect(page.getByRole('status')).toHaveCount(1)
  await expect(page.locator(COPY_STATUS)).toBeEmpty()
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
  await page.getByRole('button', { name: COPY_BUTTON_NAME }).click()
  await page.waitForTimeout(300)
  expect(errs).toEqual([])
  // Échec de la copie : aucune fausse confirmation, un message d'échec annoncé à la place.
  await expect(page.locator(COPY_STATUS)).not.toHaveText('E-mail copié')
  await expect(page.locator(COPY_STATUS)).toHaveText(/Copie impossible/)
})
