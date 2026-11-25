import { expect, test, type Page } from '@playwright/test'
import { INTERESTS, PARCOURS_STEPS } from '../../src/data/parcours'

/**
 * Scène « Mon parcours » (src/features/home/ParcoursScene.tsx, src/styles/parcours.css).
 * Les tailles de fenêtre sont forcées dans les tests : exécution unique dans le projet « desktop-1280 ».
 */

/** La scène est insérée dans l'accueil (tâche 3). */
const URL = '/'

test.beforeEach(({ browserName }, testInfo) => {
  test.skip(browserName !== 'chromium' || testInfo.project.name !== 'desktop-1280', 'Taille de fenêtre forcée dans le test : exécuté une seule fois.')
})

async function open(page: Page, size = { width: 1280, height: 800 }, reduced = false) {
  await page.setViewportSize(size)
  await page.emulateMedia({ reducedMotion: reduced ? 'reduce' : 'no-preference' })
  await page.goto(URL)
  await page.waitForLoadState('networkidle')
  await expect(page.locator('html')).not.toHaveAttribute('data-intro', /.*/, { timeout: 5000 })
  await page.waitForTimeout(300)
}

const scene = (page: Page) => page.locator('.scene--parcours')

async function scrollToY(page: Page, y: number) {
  await page.evaluate(
    (t) =>
      new Promise<void>((res) => {
        window.scrollTo({ top: t, behavior: 'instant' })
        requestAnimationFrame(() => requestAnimationFrame(() => res()))
      }),
    y,
  )
}

test.describe('Mon parcours, épinglé (1280 × 800)', () => {
  test('section nommée, 5 étapes, dates et textes', async ({ page }) => {
    await open(page)
    const region = page.getByRole('region', { name: 'Mon parcours' })
    await expect(region).toHaveCount(1)
    const items = region.locator('.scene--parcours li.parcours-step')
    await expect(items).toHaveCount(PARCOURS_STEPS.length)
    expect(PARCOURS_STEPS.length).toBe(5)
    await scrollToY(page, (await scene(page).evaluate((el) => el.getBoundingClientRect().top + window.scrollY)) + 1)
    for (const s of PARCOURS_STEPS) {
      await expect(region.getByText(s.title, { exact: true })).toBeVisible()
      await expect(region.getByText(s.when, { exact: true })).toBeVisible()
    }
    for (let i = 0; i < PARCOURS_STEPS.length; i++) {
      await expect(items.nth(i).locator('time[datetime]')).toHaveAttribute('datetime', PARCOURS_STEPS[i].dateTime)
    }
  })

  test('aucun lien ni bouton dans la frise', async ({ page }) => {
    await open(page)
    await expect(scene(page).locator('a, button, [tabindex]')).toHaveCount(0)
  })

  test('épinglage sticky, --p ≈ 0 / 0,5 / 1, hauteur (1,5 + 0,18 × 5) × fenêtre', async ({ page }) => {
    await open(page)
    await expect(scene(page).locator('.scene-stage')).toHaveCSS('position', 'sticky')
    const geo = await scene(page).evaluate((node) => {
      const el = node as HTMLElement
      const stage = el.querySelector('.scene-stage') as HTMLElement
      return { top: el.getBoundingClientRect().top + window.scrollY, height: el.offsetHeight, stage: stage.offsetHeight, vh: window.innerHeight }
    })
    expect(Math.abs(geo.height - (1.5 + 0.18 * 5) * geo.vh)).toBeLessThanOrEqual(2)
    const travel = geo.height - geo.stage
    const readP = () => scene(page).evaluate((el) => parseFloat(getComputedStyle(el).getPropertyValue('--p')))
    for (const [f, expected] of [[0, 0], [0.5, 0.5], [1, 1]] as const) {
      await scrollToY(page, geo.top + travel * f)
      expect(Math.abs((await readP()) - expected)).toBeLessThanOrEqual(0.05)
    }
  })

  test('ligne des centres d’intérêt', async ({ page }) => {
    await open(page)
    const list = page.getByRole('list', { name: 'Centres d’intérêt' })
    await expect(list.getByRole('listitem')).toHaveCount(INTERESTS.length)
    expect(INTERESTS.length).toBe(6)
    for (const label of INTERESTS) await expect(list.getByText(label, { exact: true })).toHaveCount(1)
  })
})

test.describe('Mon parcours, relecture finale (1280 × 800)', () => {
  async function toProgress(page: Page, f: number) {
    const geo = await scene(page).evaluate((node) => {
      const el = node as HTMLElement
      const stage = el.querySelector('.scene-stage') as HTMLElement
      return { top: el.getBoundingClientRect().top + window.scrollY, travel: el.offsetHeight - stage.offsetHeight }
    })
    await scrollToY(page, geo.top + geo.travel * f + (f === 0 ? 1 : 0))
    await page.waitForTimeout(100)
  }
  const op = (page: Page, i: number) => scene(page).locator('li.parcours-step').nth(i).evaluate((e) => parseFloat(getComputedStyle(e).opacity))

  test('le point de l’étape 0 est allumé au début de la scène (étape active à 1)', async ({ page }) => {
    await open(page)
    await toProgress(page, 0)
    const dot = await scene(page).locator('li.parcours-step').first().evaluate((e) => parseFloat(getComputedStyle(e, '::after').opacity))
    expect(dot).toBeGreaterThan(0.9)
    expect(await op(page, 0)).toBeCloseTo(1, 1)
    const dot4 = await scene(page).locator('li.parcours-step').nth(4).evaluate((e) => parseFloat(getComputedStyle(e, '::after').opacity))
    expect(dot4, 'dernière étape encore éteinte').toBeLessThan(0.1)
  })

  test('fin de frise : seule la dernière étape globale reste à 1, Baccalauréat redescend au plancher', async ({ page }) => {
    await open(page)
    await toProgress(page, 1)
    expect(await op(page, 4)).toBeCloseTo(1, 1)
    expect(await op(page, 2), 'Baccalauréat (dernière de la formation)').toBeCloseTo(0.75, 1)
    expect(await op(page, 3)).toBeCloseTo(0.75, 1)
  })

  test('un seul nom « Mon parcours » annoncé : la région, pas l’article', async ({ page }) => {
    await open(page)
    await expect(page.getByRole('region', { name: 'Mon parcours' })).toHaveCount(1)
    await expect(page.getByRole('article', { name: 'Mon parcours' })).toHaveCount(0)
  })
})

test.describe('Mon parcours, contenu non coupé (1024 × 700)', () => {
  test('le stage ne coupe rien (scrollHeight ≤ clientHeight) pendant l’épinglage', async ({ page }) => {
    await open(page, { width: 1024, height: 700 })
    await expect(scene(page).locator('.scene-stage')).toHaveCSS('position', 'sticky')
    const geo = await scene(page).evaluate((node) => {
      const el = node as HTMLElement
      const stage = el.querySelector('.scene-stage') as HTMLElement
      return { top: el.getBoundingClientRect().top + window.scrollY, travel: el.offsetHeight - stage.offsetHeight }
    })
    for (const f of [0, 0.5, 1]) {
      await scrollToY(page, geo.top + geo.travel * f)
      const m = await scene(page).locator('.scene-stage').evaluate((e) => ({ s: e.scrollHeight, c: e.clientHeight }))
      expect(m.s, `f=${f}`).toBeLessThanOrEqual(m.c)
    }
  })
})

test.describe('Mon parcours, repli', () => {
  for (const size of [
    { width: 1280, height: 600 },
    { width: 1024, height: 699 },
    { width: 1023, height: 900 },
  ]) {
    test(`non épinglé à ${size.width} × ${size.height}`, async ({ page }) => {
      await open(page, size)
      await expect(scene(page).locator('.scene-stage')).toHaveCSS('position', 'static')
      const items = scene(page).locator('li.parcours-step')
      await expect(items).toHaveCount(5)
      for (let i = 0; i < 5; i++) {
        await items.nth(i).scrollIntoViewIfNeeded()
        await expect(items.nth(i)).toBeVisible()
        await expect(items.nth(i)).toHaveCSS('opacity', '1')
      }
    })
  }

  test('reduced-motion : rien d’épinglé, opacité 1', async ({ page }) => {
    await open(page, { width: 1280, height: 800 }, true)
    await expect(scene(page).locator('.scene-stage')).toHaveCSS('position', 'static')
    const items = scene(page).locator('li.parcours-step')
    await expect(items).toHaveCount(5)
    for (let i = 0; i < 5; i++) await expect(items.nth(i)).toHaveCSS('opacity', '1')
  })

  test('320 × 640 : aucun débordement horizontal', async ({ page }) => {
    await open(page, { width: 320, height: 640 })
    const o = await page.evaluate(() => ({ s: document.documentElement.scrollWidth, c: document.documentElement.clientWidth }))
    expect(o.s).toBe(o.c)
  })
})
