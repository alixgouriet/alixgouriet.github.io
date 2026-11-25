import { expect, test, type Page } from '@playwright/test'
import { FICHES, isNarrow, load } from './helpers'
import { skills } from '../../src/data/skills'

const rowsOf = (page: Page) => page.locator('main ul.pg-grid > li')
const numsOf = (page: Page) => rowsOf(page).locator('.pg-num').allInnerTexts()
/** Sur mobile, les filtres sont repliés sous « Filtrer » : on les ouvre avant d'agir dessus. */
async function openFilters(page: Page) {
  const toggle = page.locator('.pg-filters-toggle')
  if (await toggle.isVisible()) {
    if ((await toggle.getAttribute('aria-expanded')) !== 'true') await toggle.click()
    await expect(toggle).toHaveAttribute('aria-expanded', 'true')
  }
}
const techSelect = (page: Page) => page.getByLabel('Outil', { exact: true })
const periodSelect = (page: Page) => page.getByLabel('Mois et année', { exact: true })
const count = (page: Page) => page.locator('.pg-count[role="status"]')

test('grille /projets : 9 tuiles, 4 fiches cliquables, 5 « sans fiche » non focusables', async ({ page }) => {
  await load(page, '/projets')
  const rows = rowsOf(page)
  await expect(rows).toHaveCount(9)
  await expect(rows.locator('a.pg-tile')).toHaveCount(4)
  const links = await rows.locator('a.pg-tile').evaluateAll((as) => as.map((a) => a.getAttribute('href')))
  expect([...links].sort()).toEqual([...FICHES].sort())
  const soon = rows.filter({ has: page.locator('.pg-tile--soon') })
  await expect(soon).toHaveCount(5)
  await expect(soon.locator('a')).toHaveCount(0)
  await expect(soon.locator('[tabindex]')).toHaveCount(0)
  await expect(soon.locator('button')).toHaveCount(0)
  for (let i = 0; i < 5; i++) {
    const row = soon.nth(i)
    await expect(row.locator('.pg-tile--soon')).toHaveAttribute('aria-disabled', 'true')
    await expect(row.locator('.pg-tile--soon')).not.toHaveAttribute('href', /.*/)
    // la raison est dite en texte, pas seulement par la couleur
    await expect(row.locator('.pg-badge')).toHaveText('Fiche en préparation')
  }
  await expect(page.getByText('Fiche à venir')).toHaveCount(0)
  // Navigation clavier : seuls les liens des 4 fiches, jamais une ligne « sans fiche » (filtres inclus dans les arrêts).
  const stops: boolean[] = []
  await page.locator('main h1').focus()
  for (let i = 0; i < 20; i++) {
    await page.keyboard.press('Tab')
    stops.push(await page.evaluate(() => !!document.activeElement?.closest('.pg-tile--soon')))
  }
  expect(stops.some(Boolean)).toBe(false)
})

test('liste /projets : tuiles avec fiche d’abord (récentes en haut), puis en préparation ; numéros fixes 09 → 01, régression datée Avril 2026', async ({ page }) => {
  await load(page, '/projets')
  expect(await numsOf(page)).toEqual(['08', '05', '04', '01', '09', '07', '06', '03', '02'])
  const prix = rowsOf(page).filter({ hasText: 'Prix immobiliers niortais' })
  await expect(prix).toHaveCount(1)
  await expect(prix).toContainText('Avril 2026')
  await expect(prix.locator('.pg-num')).toHaveText('05')
})

test('compteurs calculés : 9 réalisations, 4 fiches détaillées, 15 outils', async ({ page }) => {
  await load(page, '/projets')
  const stat = (label: string) => page.locator('dl.pg-stats > div').filter({ has: page.getByText(label, { exact: true }) }).locator('dd')
  await expect(stat('Réalisations')).toHaveText('9')
  await expect(stat('Fiches détaillées')).toHaveText('4')
  await expect(stat('Outils cités')).toHaveText('15')
  await expect(page.getByText('Terminées', { exact: true })).toHaveCount(0)
  // « 15 » = options distinctes du sélecteur Outil (hors « Toutes ») ; ni langues, ni formats, ni domaines
  await openFilters(page)
  await expect(techSelect(page).locator('option')).toHaveCount(16)
  const opts = await techSelect(page).locator('option').allInnerTexts()
  for (const x of ['Oral', 'Anglais', 'Français', 'CSV', 'JSON', 'Statistiques', 'Datavisualisation', 'Analyse financière'])
    expect(opts, x).not.toContain(x)
})

test('grille : tuiles-liens sans aria-labelledby (nom = contenu visible), « En savoir plus › » seulement sur les fiches, badge sinon', async ({ page }) => {
  await load(page, '/projets')
  const links = rowsOf(page).locator('a.pg-tile')
  await expect(links).toHaveCount(4)
  for (let i = 0; i < 4; i++) {
    await expect(links.nth(i)).not.toHaveAttribute('aria-labelledby', /.*/)
    await expect(links.nth(i)).not.toHaveAttribute('aria-describedby', /.*/)
    await expect(links.nth(i).locator('.pg-more')).toHaveText('En savoir plus')
    await expect(links.nth(i).locator('.pg-badge')).toHaveCount(0)
    // Le numéro est décoratif (aria-hidden) : il ne fait pas partie du nom du lien.
    await expect(links.nth(i).locator('.pg-num')).toHaveAttribute('aria-hidden', 'true')
  }
  // Les tuiles « en préparation » ne sont pas des liens et n'ont pas d'invitation.
  await expect(rowsOf(page).locator('.pg-tile--soon .pg-more')).toHaveCount(0)
  await expect(rowsOf(page).locator('.pg-tile--soon')).toHaveCount(5)
  await expect(page.getByRole('link', { name: /Fiche en préparation/ })).toHaveCount(0)
})

test('filtres visibles : techno, mois/année, semestre, compteur « 9 projets sur 9 », pas de bouton Réinitialiser', async ({ page }) => {
  await load(page, '/projets')
  await expect(page.locator('.pg-filters')).toBeVisible()
  await openFilters(page)
  await expect(techSelect(page)).toBeVisible()
  await expect(periodSelect(page)).toBeVisible()
  await expect(page.getByRole('radio')).toHaveCount(3)
  await expect(page.getByRole('radio', { name: 'Tous', exact: true })).toBeChecked()
  await expect(count(page)).toHaveText('9 projets sur 9')
  await expect(page.getByRole('button', { name: 'Réinitialiser les filtres' })).toHaveCount(0)
})

test('filtre R + semestre 2 : 2 résultats (n°05 puis n°07), compteur, URL, numéros inchangés', async ({ page }) => {
  await load(page, '/projets')
  await openFilters(page)
  await techSelect(page).selectOption('R')
  // clic sur le libellé (radio contrôlé : .check() vérifie l'état avant la fin de la transition du routeur)
  await page.locator('.pg-seg label', { hasText: 'Semestre 2' }).click()
  await expect(page.getByRole('radio', { name: 'Semestre 2' })).toBeChecked()
  await expect(rowsOf(page)).toHaveCount(2)
  expect(await numsOf(page)).toEqual(['05', '07'])
  await expect(count(page)).toHaveText('2 projets sur 9', { timeout: 2000 })
  await expect(page).toHaveURL(/techno=R/)
  await expect(page).toHaveURL(/semestre=2/)
  // le bouton Réinitialiser apparaît dans la barre (visible même panneau replié) ; sur mobile le libellé « Filtrer (2) » compte les filtres actifs
  await expect(page.getByRole('button', { name: 'Réinitialiser les filtres' })).toHaveCount(1)
  await expect(page.locator('.pg-filter-status').getByRole('button', { name: 'Réinitialiser les filtres' })).toBeVisible()
  if (isNarrow(page)) await expect(page.locator('.pg-filters-toggle')).toHaveText('Filtrer (2)')
})

test('VBA + semestre 2 : état vide, compteur « Aucun projet sur 9 », un seul bouton de réinitialisation (dans la barre)', async ({ page }) => {
  await load(page, '/projets?techno=VBA&semestre=2')
  await expect(rowsOf(page)).toHaveCount(0)
  await expect(page.locator('.pg-empty')).toContainText('Aucun projet ne correspond à ces filtres.')
  await expect(count(page)).toHaveText('Aucun projet sur 9', { timeout: 2000 })
  await expect(page.getByRole('button', { name: 'Réinitialiser les filtres' })).toHaveCount(1)
  await expect(page.locator('.pg-empty').getByRole('button')).toHaveCount(0)
  await page.locator('.pg-filter-status').getByRole('button', { name: 'Réinitialiser les filtres' }).click()
  await expect(rowsOf(page)).toHaveCount(9)
  await expect(page.locator('.pg-empty')).toHaveCount(0)
  await expect(page).not.toHaveURL(/techno|semestre|periode/)
})

test('réinitialisation : retour à 9 projets, URL propre, contrôles remis à zéro', async ({ page }) => {
  await load(page, '/projets?techno=R&semestre=2')
  await expect(rowsOf(page)).toHaveCount(2)
  // panneau replié sur mobile : le bouton est dans la barre, sans ouvrir « Filtrer »
  await page.locator('.pg-filter-status').getByRole('button', { name: 'Réinitialiser les filtres' }).click()
  await openFilters(page)
  await expect(rowsOf(page)).toHaveCount(9)
  await expect(page).not.toHaveURL(/\?/)
  await expect(techSelect(page)).toHaveValue('')
  await expect(page.getByRole('radio', { name: 'Tous', exact: true })).toBeChecked()
  await expect(count(page)).toHaveText('9 projets sur 9', { timeout: 2000 })
})

test('URL partageable : rechargement et valeurs inconnues ignorées', async ({ page }) => {
  await load(page, '/projets?techno=R&semestre=2')
  await expect(rowsOf(page)).toHaveCount(2)
  await openFilters(page)
  await expect(techSelect(page)).toHaveValue('R')
  await expect(page.getByRole('radio', { name: 'Semestre 2' })).toBeChecked()
  await page.reload()
  await expect(rowsOf(page)).toHaveCount(2)
  // mois/année : la période de la régression
  await load(page, '/projets?periode=2026-04')
  await expect(rowsOf(page)).toHaveCount(1)
  await expect(rowsOf(page)).toContainText('Prix immobiliers niortais')
  // valeurs invalides : ignorées, aucun filtre
  await load(page, '/projets?techno=Nimporte&periode=1999-01&semestre=7')
  await expect(rowsOf(page)).toHaveCount(9)
})

test('filtre mois/année via le sélecteur : mise à jour de la liste et de l\'URL', async ({ page }) => {
  await load(page, '/projets')
  await openFilters(page)
  await periodSelect(page).selectOption({ label: 'Mai 2026' })
  await expect(rowsOf(page)).toHaveCount(2)
  expect(await numsOf(page)).toEqual(['07', '06'])
  await expect(page).toHaveURL(/periode=2026-05/)
})

test('compteur : role=status, annonce différée (pas à chaque changement instantané)', async ({ page }) => {
  await load(page, '/projets')
  await expect(count(page)).toHaveCount(1)
  await expect(count(page)).toHaveText('9 projets sur 9')
  await openFilters(page)
  await techSelect(page).selectOption('R')
  // immédiatement : l'ancienne valeur est encore annoncée (débouncé 250 ms), la liste, elle, est à jour
  await expect(rowsOf(page)).toHaveCount(2)
  await expect(count(page)).toHaveText('2 projets sur 9', { timeout: 2000 })
  await techSelect(page).selectOption('VBA')
  await expect(count(page)).toHaveText('1 projet sur 9', { timeout: 2000 })
})

test('mobile : filtres repliés sous « Filtrer », aria-expanded, ouverts dès 768 px', async ({ page }) => {
  await load(page, '/projets')
  const toggle = page.locator('.pg-filters-toggle')
  const panel = page.locator('.pg-filter-panel')
  if (isNarrow(page)) {
    await expect(toggle).toBeVisible()
    await expect(toggle).toHaveText('Filtrer')
    await expect(toggle).toHaveAttribute('aria-expanded', 'false')
    await expect(panel).toBeHidden()
    await expect(count(page)).toBeVisible() // le compteur reste visible replié
    await toggle.click()
    await expect(toggle).toHaveAttribute('aria-expanded', 'true')
    await expect(panel).toBeVisible()
    expect(await toggle.getAttribute('aria-controls')).toBe(await panel.getAttribute('id'))
    await toggle.click()
    await expect(toggle).toHaveAttribute('aria-expanded', 'false')
    await expect(panel).toBeHidden()
  } else {
    await expect(toggle).toBeHidden()
    await expect(panel).toBeVisible()
  }
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true)
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

test('compétences : preuves dérivées et « Mentionné dans mon CV »', async ({ page }) => {
  await load(page, '/competences')
  const rows = page.locator('li.pg-skill')
  await expect(rows).toHaveCount(9)
  const n = await rows.count()
  let withProof = 0
  let surCv = 0
  for (let i = 0; i < n; i++) {
    const r = rows.nth(i)
    await expect(r.getByRole('heading', { level: 2 })).toBeVisible()
    const links = await r.locator('a.pg-chip').count()
    const cv = await r.getByText('Mentionné dans mon CV', { exact: true }).count()
    expect(links > 0 !== cv > 0, `tuile ${i} : preuve XOR Mentionné dans mon CV`).toBe(true)
    if (links > 0) withProof++
    else surCv++
  }
  console.log('compétences avec preuve:', withProof, '| Mentionné dans mon CV:', surCv)
  expect(withProof).toBeGreaterThan(0)
  await expect(page.getByText('Sur CV', { exact: true })).toHaveCount(0)
  const hrefs = await page.$$eval('a.pg-chip', (as) => as.map((a) => a.getAttribute('href') as string))
  for (const h of new Set(hrefs)) {
    await load(page, h)
    await expect(page.locator('main h1')).not.toHaveText(/introuvable|404/i)
  }
})

test('compétences : SAS, HTML, CSS, JavaScript « Mentionné dans mon CV » ; Python seulement via GreenSD', async ({ page }) => {
  await load(page, '/competences')
  const row = (name: string) => page.locator('li.pg-skill').filter({ has: page.getByRole('heading', { level: 2, name, exact: true }) })
  for (const name of ['SAS', 'HTML', 'CSS', 'JavaScript']) {
    await expect(row(name), name).toHaveCount(1)
    await expect(row(name).getByText('Mentionné dans mon CV', { exact: true }), name).toHaveCount(1)
    await expect(row(name).locator('a.pg-chip'), name).toHaveCount(0)
  }
  const py = row('Python')
  await expect(py.locator('a.pg-chip')).toHaveCount(1)
  await expect(py.locator('a.pg-chip')).toHaveAttribute('href', '/projets/greensd')
  // Le nom accessible dit la source : « d'après mon CV » pour Python.
  await expect(py.getByRole('link', { name: /d[’']après mon CV/ })).toHaveCount(1)
  await expect(py.getByText('Mentionné dans mon CV')).toHaveCount(0)
})

test('compétences : tous les outils de skills.ts, aucun niveau ni pourcentage, « d’après mon CV » visible sur Python', async ({ page }) => {
  await load(page, '/competences')
  const names = await page.locator('li.pg-skill h2').allTextContents()
  expect(names.map((n) => n.trim()).sort()).toEqual(skills.map((s) => s.label).sort())
  const section = page.getByRole('region', { name: 'Outils', exact: true })
  await expect(section.locator('progress, meter, [role="progressbar"], [role="meter"]')).toHaveCount(0)
  expect((await section.textContent()) ?? '').not.toMatch(/%/)
  // Python : la source (CV) est dite à l'écran, pas seulement dans le nom accessible ; aucun autre outil ne porte la mention.
  const py = page.locator('li.pg-skill').filter({ has: page.getByRole('heading', { level: 2, name: 'Python', exact: true }) })
  await expect(py.locator('a.pg-chip .pg-chip__src')).toBeVisible()
  await expect(py.locator('a.pg-chip')).toContainText('d’après mon CV')
  await expect(page.locator('li.pg-skill .pg-chip__src')).toHaveCount(1)
  // Les outils prouvés renvoient vers leurs fiches.
  const sql = page.locator('li.pg-skill').filter({ has: page.getByRole('heading', { level: 2, name: 'SQL (MySQL)', exact: true }) })
  expect(await sql.getByRole('link').count()).toBeGreaterThan(0)
})

test('contrôle segmenté : l\'option cochée est mise en évidence (poids, fond) après un clic', async ({ page }) => {
  await load(page, '/projets')
  await openFilters(page)
  const on = page.locator('.pg-seg label', { hasText: 'Semestre 1' }).locator('span')
  const off = page.locator('.pg-seg label', { hasText: 'Semestre 2' }).locator('span')
  const bg = (l: typeof on) => l.evaluate((e) => getComputedStyle(e).backgroundColor)
  const weight = (l: typeof on) => l.evaluate((e) => Number(getComputedStyle(e).fontWeight))
  await page.locator('.pg-seg label', { hasText: 'Semestre 1' }).click()
  await expect(page.getByRole('radio', { name: 'Semestre 1' })).toBeChecked()
  await expect.poll(() => weight(on)).toBeGreaterThanOrEqual(600)
  expect(await weight(off)).toBeLessThan(600)
  // le fond est animé (150 ms) : on attend la fin de la transition au lieu de lire une valeur intermédiaire
  await expect.poll(async () => (await bg(on)) !== (await bg(off))).toBe(true)
})

test('/projets : en-tête centré (h1 + sous-titre), tuiles en 2 colonnes dès 768 px, 1 colonne sur mobile', async ({ page }) => {
  await load(page, '/projets')
  const boxes = await rowsOf(page).evaluateAll((els) => els.slice(0, 2).map((e) => ({ x: (e as HTMLElement).offsetLeft, y: (e as HTMLElement).offsetTop })))
  if (isNarrow(page)) expect(Math.abs(boxes[0].x - boxes[1].x)).toBeLessThan(2)
  else expect(boxes[1].x).toBeGreaterThan(boxes[0].x + 100)
  const h1 = (await page.locator('main h1').boundingBox())!
  const vw = page.viewportSize()!.width
  expect(Math.abs(h1.x + h1.width / 2 - vw / 2)).toBeLessThanOrEqual(20)
})
