import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'
import { ALL_ROUTES, load, watchConsole } from './helpers'

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
    await load(page, route)
    await page.waitForTimeout(1500)
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
