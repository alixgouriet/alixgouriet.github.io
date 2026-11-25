import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'
import { ALL_ROUTES, FICHES, load, watchConsole } from './helpers'

for (const route of ALL_ROUTES) {
  test(`console propre : ${route}`, async ({ page }) => {
    const issues = watchConsole(page)
    await load(page, route)
    await page.waitForTimeout(800)
    expect(issues).toEqual([])
  })

  test(`pas de débordement horizontal : ${route}`, async ({ page }, info) => {
    await load(page, route)
    await page.waitForTimeout(500)
    const m = await page.evaluate(() => ({
      sw: document.documentElement.scrollWidth,
      cw: document.documentElement.clientWidth,
      bw: document.body.scrollWidth,
    }))
    expect(m.sw, `${info.project.name} ${route} ${JSON.stringify(m)}`).toBeLessThanOrEqual(m.cw)
    expect(m.bw).toBeLessThanOrEqual(m.cw)
  })

  test(`axe WCAG 2 A/AA : ${route}`, async ({ page }, info) => {
    // L'entrée des tuiles est liée au défilement (opacité < 1 hors écran) : on teste l'état final, comme avec prefers-reduced-motion.
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await load(page, route)
    await page.waitForTimeout(500)
    const res = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze()
    const summary = res.violations.map(
      (v) => `${v.id} (${v.impact}) x${v.nodes.length}: ${v.nodes.slice(0, 3).map((n) => n.target.join(' ')).join(' | ')}`,
    )
    if (summary.length) await page.screenshot({ path: `test-results/axe-${info.project.name}-${route.replace(/\W+/g, '_')}.png`, fullPage: true })
    expect(summary).toEqual([])
  })
}

test('structure : un seul h1, un seul main, lang=fr', async ({ page }) => {
  for (const route of ALL_ROUTES) {
    await load(page, route)
    await expect(page.locator('h1'), route).toHaveCount(1)
    await expect(page.locator('main'), route).toHaveCount(1)
    await expect(page.locator('html')).toHaveAttribute('lang', 'fr')
  }
})

test("clavier : indicateur de focus visible sur l'en-tête", async ({ page }, info) => {
  test.skip(info.project.name === 'mobile-375')
  await load(page, '/')
  await page.keyboard.press('Tab')
  await page.keyboard.press('Tab')
  const o = await page.evaluate(() => {
    const s = getComputedStyle(document.activeElement!)
    return { style: s.outlineStyle, shadow: s.boxShadow }
  })
  expect(o.style !== 'none' || o.shadow !== 'none').toBe(true)
})

test('repères : banner, un seul main, navigation principale (barre + menu), contentinfo, h1 unique', async ({ page }) => {
  for (const route of ALL_ROUTES) {
    await load(page, route)
    await expect(page.locator('header.ap-nav'), route).toHaveCount(1)
    await expect(page.getByRole('banner'), route).toHaveCount(1)
    await expect(page.locator('main#contenu'), route).toHaveCount(1)
    await expect(page.locator('nav[aria-label="Accès rapide"]'), route).toHaveCount(0) // supprimé
    await expect(page.locator('nav[aria-label="Principal"]'), route).toHaveCount(1) // une seule nav « Principal » (barre)
    await expect(page.locator('nav[aria-label="Menu mobile"]'), route).toHaveCount(1) // feuille mobile, nommée différemment
    await expect(page.locator('h1'), route).toHaveCount(1)
    // SiteFooter : présent partout, hors de main (réduit à la navigation sur /contact).
    await expect(page.locator('footer.ap-footer'), route).toHaveCount(1)
    await expect(page.locator('main footer'), route).toHaveCount(0)
    await expect(page.getByRole('contentinfo'), route).toHaveCount(1)
  }
})

test("accueil : le h1 « Alix Gouriet » est dans main et les sections portent un nom (hero, Chiffres, Mon parcours)", async ({ page }) => {
  await load(page, '/')
  await expect(page.locator('main h1')).toHaveText(/Alix\s*Gouriet/)
  await expect(page.locator('main section[aria-labelledby="accueil-titre"]')).toHaveCount(1)
  for (const name of ['Chiffres', 'Mon parcours'])
    await expect(page.getByRole('region', { name, exact: true }), name).toHaveCount(1)
  for (const name of ['Projets', 'Compétences', 'Autres réalisations'])
    await expect(page.getByRole('region', { name, exact: true }), `${name} n’est plus sur l’accueil`).toHaveCount(0)
})

test('fiches : la section « Le projet en images » porte un nom et un h2 « En images » entre l’en-tête et le texte', async ({ page }) => {
  for (const route of FICHES) {
    await load(page, route)
    const region = page.getByRole('region', { name: 'Le projet en images', exact: true })
    await expect(region, route).toHaveCount(1)
    await expect(region.getByRole('heading', { level: 2, name: 'En images', exact: true }), route).toBeVisible()
  }
})

test('mouvement réduit : tout le contenu est visible, sans transformation résiduelle ni animation active', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  for (const route of ['/', '/projets', '/competences', '/a-propos']) {
    await load(page, route)
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
    await page.waitForTimeout(300)
    const bad = await page.evaluate(() => {
      const out: string[] = []
      for (const el of document.querySelectorAll<HTMLElement>('.ap-reveal')) {
        const cs = getComputedStyle(el)
        if (cs.opacity !== '1' || (cs.transform !== 'none' && cs.transform !== 'matrix(1, 0, 0, 1, 0, 0)')) out.push(`${el.className} opacity=${cs.opacity} transform=${cs.transform}`)
      }
      const running = document.getAnimations().filter((a) => a.playState === 'running' && a.effect?.getTiming().iterations === Infinity)
      if (running.length) out.push(`${running.length} animation(s) infinie(s) en cours`)
      return out
    })
    expect(bad, route).toEqual([])
  }
})
