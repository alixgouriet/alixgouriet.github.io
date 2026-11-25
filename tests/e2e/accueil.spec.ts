import AxeBuilder from '@axe-core/playwright'
import { expect, test, type Page } from '@playwright/test'
import { PARCOURS_STEPS } from '../../src/data/parcours'
import { load, watchConsole } from './helpers'

/**
 * Accueil réorganisé : hero → chiffres → parcours → compétences → projets → autres réalisations.
 * Qualité de la frise « Mon parcours » (état final avec mouvement réduit émulé, comme theme.spec.ts), aux 3 viewports
 * et dans les deux thèmes : axe WCAG A/AA, ordre du DOM = ordre visuel, aucun niveau de compétence,
 * console propre, CLS = 0, un seul backdrop-filter, aucun will-change au repos, contraste des étapes en mouvement normal.
 */

const THEMES = ['light', 'dark'] as const
const AXE_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']
const FRISE = '.scene--parcours'

async function open(page: Page, theme: (typeof THEMES)[number], reduced = true) {
  await page.emulateMedia({ colorScheme: theme, reducedMotion: reduced ? 'reduce' : 'no-preference' })
  await load(page, '/')
  await expect(page.locator('html')).not.toHaveAttribute('data-intro', /.*/, { timeout: 5000 })
  await page.waitForTimeout(700)
}

for (const th of THEMES) {
  test.describe(`accueil, thème ${th}, mouvement réduit`, () => {
    test('ordre des sections : hero, chiffres, parcours, compétences, projets, autres réalisations', async ({ page }) => {
      await open(page, th)
      const names = ['Chiffres', 'Mon parcours', 'Compétences', 'Projets', 'Autres réalisations']
      const ys: number[] = []
      for (const name of names) {
        const region = page.getByRole('region', { name, exact: true })
        await expect(region, name).toHaveCount(1)
        ys.push(await region.evaluate((e) => e.getBoundingClientRect().top + window.scrollY))
      }
      const hero = await page.locator('.home-hero').evaluate((e) => e.getBoundingClientRect().top + window.scrollY)
      expect([hero, ...ys]).toEqual([hero, ...ys].slice().sort((a, b) => a - b))
      expect(new Set(ys).size).toBe(ys.length)
    })

    test('frise : 5 étapes, toutes visibles et à l’opacité 1, ordre du DOM = ordre visuel', async ({ page }) => {
      await open(page, th)
      const items = page.locator(`${FRISE} li.parcours-step`)
      await expect(items).toHaveCount(PARCOURS_STEPS.length)
      for (let i = 0; i < PARCOURS_STEPS.length; i++) {
        await items.nth(i).scrollIntoViewIfNeeded()
        await expect(items.nth(i)).toBeVisible()
        await expect(items.nth(i)).toHaveCSS('opacity', '1')
      }
      const geo = await page.evaluate((sel) => {
        const lists = [...document.querySelectorAll(`${sel} ol.parcours-rail`)]
        return lists.map((ol) => {
          const r = ol.getBoundingClientRect()
          return {
            x: r.left,
            top: r.top + window.scrollY,
            bottom: r.bottom + window.scrollY,
            ys: [...ol.querySelectorAll(':scope > li')].map((li) => li.getBoundingClientRect().top + window.scrollY),
          }
        })
      }, FRISE)
      expect(geo).toHaveLength(2)
      for (const col of geo) {
        for (let i = 1; i < col.ys.length; i++) expect(col.ys[i], 'y croissant dans la colonne').toBeGreaterThan(col.ys[i - 1])
      }
      // Formation puis expériences : soit empilées (y), soit côte à côte (x), jamais à l’envers.
      const [a, b] = geo
      if (Math.abs(a.x - b.x) < 4) expect(b.ys[0], 'colonnes empilées').toBeGreaterThan(a.ys[a.ys.length - 1])
      else expect(b.x, 'colonnes côte à côte').toBeGreaterThan(a.x)
      // Ordre du DOM, sans tri : formation d'abord, puis expériences, chacune dans l'ordre des données.
      const when = await items.locator('time').evaluateAll((els) => els.map((e) => e.getAttribute('datetime')))
      const fromData = [
        ...PARCOURS_STEPS.filter((s) => s.column === 'formation'),
        ...PARCOURS_STEPS.filter((s) => s.column !== 'formation'),
      ].map((s) => s.dateTime)
      expect(when).toEqual(fromData)
      await expect(page.locator(`${FRISE} ol.parcours-rail`).first().locator('li')).toHaveCount(PARCOURS_STEPS.filter((s) => s.column === 'formation').length)
    })

    test('aucun niveau de compétence : ni progressbar, ni meter, ni pourcentage de maîtrise', async ({ page }) => {
      await open(page, th)
      await expect(page.locator('[role="progressbar"], [role="meter"], meter, progress')).toHaveCount(0)
      const skills = page.getByRole('region', { name: 'Compétences', exact: true })
      await expect(skills).toHaveCount(1)
      expect(await skills.innerText()).not.toMatch(/\d\s*%/)
    })

    test('axe WCAG A/AA sur la page entière et sur la frise', async ({ page }, info) => {
      await open(page, th)
      for (const scope of [null, FRISE]) {
        let b = new AxeBuilder({ page }).withTags(AXE_TAGS)
        if (scope) b = b.include(scope)
        const res = await b.analyze()
        const summary = res.violations.map((v) => `${v.id} (${v.impact}) x${v.nodes.length}: ${v.nodes.slice(0, 4).map((n) => n.target.join(' ')).join(' | ')}`)
        if (summary.length) await page.screenshot({ path: `test-results/accueil-axe-${th}-${info.project.name}.png`, fullPage: true })
        expect(summary, scope ?? 'page').toEqual([])
      }
    })

    test('console propre en balayant la page', async ({ page }) => {
      const issues = watchConsole(page)
      await open(page, th)
      const max = await page.evaluate(() => document.documentElement.scrollHeight - window.innerHeight)
      for (let y = 0; y <= max; y += 300) {
        await page.evaluate((t) => window.scrollTo({ top: t, behavior: 'instant' }), y)
        await page.waitForTimeout(30)
      }
      await page.waitForTimeout(1800)
      expect(issues).toEqual([])
    })

    test('CLS = 0 en balayant l’accueil du haut en bas', async ({ page }) => {
      await page.addInitScript(() => {
        const w = window as unknown as { __cls: number; __e: string[] }
        w.__cls = 0
        w.__e = []
        new PerformanceObserver((list) => {
          for (const e of list.getEntries() as unknown as { value: number; hadRecentInput: boolean; sources?: { node?: Node }[] }[]) {
            if (e.hadRecentInput) continue
            w.__cls += e.value
            w.__e.push(`${e.value.toFixed(4)} ${(e.sources ?? []).map((s) => (s.node as Element | undefined)?.className ?? '?').join(',')}`)
          }
        }).observe({ type: 'layout-shift', buffered: true })
      })
      await open(page, th)
      const max = await page.evaluate(() => document.documentElement.scrollHeight - window.innerHeight)
      for (let y = 0; y <= max; y += 200) {
        await page.evaluate((t) => window.scrollTo({ top: t, behavior: 'instant' }), y)
        await page.waitForTimeout(30)
      }
      await page.waitForTimeout(1800)
      const r = await page.evaluate(() => ({ cls: (window as unknown as { __cls: number }).__cls, e: (window as unknown as { __e: string[] }).__e }))
      expect(r.cls, JSON.stringify(r.e)).toBe(0)
    })

    test('un seul backdrop-filter et aucun will-change au repos (haut et bas de page)', async ({ page }) => {
      await open(page, th)
      const scan = () =>
        page.evaluate(() => {
          const bf: string[] = []
          const wc: string[] = []
          for (const el of document.querySelectorAll<HTMLElement>('*')) {
            for (const pseudo of [null, '::before', '::after']) {
              const cs = getComputedStyle(el, pseudo)
              const b = cs.backdropFilter || (cs as unknown as { webkitBackdropFilter?: string }).webkitBackdropFilter || 'none'
              const tag = `${el.tagName.toLowerCase()}.${el.className}${pseudo ?? ''}`
              if (b !== 'none') bf.push(tag)
              if (cs.willChange !== 'auto') wc.push(`${tag}=${cs.willChange}`)
            }
          }
          return { bf, wc }
        })
      const top = await scan()
      expect(top.bf).toHaveLength(1)
      expect(top.bf[0]).toContain('ap-nav')
      expect(top.wc).toEqual([])
      await page.evaluate(() => window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'instant' }))
      await page.waitForTimeout(300)
      const bottom = await scan()
      expect(bottom.bf).toHaveLength(1)
      expect(bottom.wc).toEqual([])
    })
  })
}

/* ---- Contraste des étapes en mouvement normal (frise épinglée : plancher d’opacité 0,75) ---- */
test.describe('contraste des étapes inactives de la frise, mouvement normal', () => {
  test.beforeEach(({ browserName }, testInfo) => {
    test.skip(browserName !== 'chromium' || testInfo.project.name !== 'desktop-1280', 'Fenêtre forcée : exécuté une seule fois.')
  })
  for (const th of THEMES) {
    test(`thème ${th} : texte ≥ 4,5:1 même à l’opacité plancher`, async ({ page }) => {
      await page.setViewportSize({ width: 1280, height: 800 })
      await open(page, th, false)
      const top = await page.locator(FRISE).evaluate((e) => e.getBoundingClientRect().top + window.scrollY)
      await page.evaluate((t) => window.scrollTo({ top: t + 2, behavior: 'instant' }), top)
      await page.waitForTimeout(300)
      const ratios = await page.evaluate((sel) => {
        const parse = (c: string) => (c.match(/[\d.]+/g) ?? []).map(Number)
        const lin = (v: number) => ((v /= 255) <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4)
        const lum = (r: number, g: number, b: number) => 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b)
        const bgOf = (el: Element) => {
          for (let e: Element | null = el; e; e = e.parentElement) {
            const [r, g, b, a = 1] = parse(getComputedStyle(e).backgroundColor)
            if (a > 0.99) return [r, g, b]
          }
          return [255, 255, 255]
        }
        const out: { n: string; ratio: number; op: number }[] = []
        document.querySelectorAll(`${sel} li.parcours-step`).forEach((li, i) => {
          const op = parseFloat(getComputedStyle(li).opacity)
          const bg = bgOf(li)
          for (const q of ['.parcours-step__when', '.parcours-step__title', '.parcours-step__text']) {
            const el = li.querySelector(q) as HTMLElement
            const [r, g, b] = parse(getComputedStyle(el).color)
            const m = [r, g, b].map((v, k) => v * op + bg[k] * (1 - op))
            const l1 = lum(m[0], m[1], m[2])
            const l2 = lum(bg[0], bg[1], bg[2])
            out.push({ n: `${i}${q}`, ratio: (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05), op })
          }
        })
        return out
      }, FRISE)
      expect(ratios.length).toBe(PARCOURS_STEPS.length * 3)
      // Garde : l'épinglage est bien actif (p ≈ 0) : étape 0 active à 1, les 4 autres à l'opacité plancher 0,75.
      const ops = [...new Map(ratios.map((r) => [r.n.split('.')[0].replace(/^(\d+).*/, '$1'), r.op])).values()]
      expect(ops[0], 'étape 0 active').toBeCloseTo(1, 1)
      for (const op of ops.slice(1)) expect(op, 'étape inactive').toBeCloseTo(0.75, 1)
      for (const r of ratios) expect(r.ratio, `${r.n} (opacité ${r.op})`).toBeGreaterThanOrEqual(4.5)
    })
  }
})

/* ---- will-change : posé seulement pendant que la frise est à l'écran (épinglage actif), retiré à la sortie ---- */
test.describe('will-change de la frise, mouvement normal', () => {
  test.beforeEach(({ browserName }, testInfo) => {
    test.skip(browserName !== 'chromium' || testInfo.project.name !== 'desktop-1280', 'Fenêtre forcée : exécuté une seule fois.')
  })
  for (const th of THEMES) {
    test(`thème ${th} : absent au repos, posé à l'écran, retiré à la sortie`, async ({ page }) => {
      await page.setViewportSize({ width: 1280, height: 800 })
      await open(page, th, false)
      const scan = () =>
        page.evaluate((sel) => {
          const wc: string[] = []
          for (const el of document.querySelectorAll<HTMLElement>(`${sel}, ${sel} *`)) {
            for (const pseudo of [null, '::before', '::after']) {
              const v = getComputedStyle(el, pseudo).willChange
              if (v !== 'auto') wc.push(`${el.tagName.toLowerCase()}.${el.className}${pseudo ?? ''}=${v}`)
            }
          }
          const sc = document.querySelector(sel) as HTMLElement
          return { wc, active: sc.hasAttribute('data-active') }
        }, FRISE)
      const geo = await page.locator(FRISE).evaluate((e) => ({ top: e.getBoundingClientRect().top + window.scrollY, h: (e as HTMLElement).offsetHeight }))
      const goTo = async (y: number) => {
        await page.evaluate((t) => window.scrollTo({ top: t, behavior: 'instant' }), y)
        await page.waitForTimeout(400)
      }
      await goTo(0)
      const before = await scan()
      expect(before.active).toBe(false)
      expect(before.wc, 'haut de page').toEqual([])
      await goTo(geo.top + geo.h / 2)
      const during = await scan()
      expect(during.active, 'data-active à l\'écran').toBe(true)
      expect(during.wc.length, 'will-change posé à l\'écran').toBeGreaterThan(0)
      await goTo(await page.evaluate(() => document.documentElement.scrollHeight))
      const after = await scan()
      expect(after.active).toBe(false)
      expect(after.wc, 'bas de page').toEqual([])
    })
  }
})

/* ---- Relecture finale : repère visible, espacements, retrait de la tuile, chiffres à 320 px ---- */
for (const th of THEMES) {
  test.describe(`accueil, relecture finale, thème ${th}`, () => {
    test('Python : la puce GreenSD dit à l’écran « d’après mon CV » ; les autres outils sans cette mention', async ({ page }) => {
      await open(page, th)
      const tiles = page.locator('.home-skills .home-skill')
      const python = tiles.filter({ has: page.getByText('Python', { exact: true }) })
      await expect(python).toHaveCount(1)
      await python.scrollIntoViewIfNeeded()
      await expect(python.locator('a.pg-chip')).toContainText('d’après mon CV')
      await expect(python.locator('a.pg-chip .pg-chip__src')).toBeVisible()
      // Le nom accessible contient le texte visible (label in name).
      await expect(python.getByRole('link', { name: /GreenSD, d’après mon CV/ })).toHaveCount(1)
      // Aucun autre outil ne porte cette mention.
      await expect(page.locator('.home-skills .pg-chip__src')).toHaveCount(1)
    })

    test('centres d’intérêt : écart vertical > 0 avec la section Compétences (au moins 32 px)', async ({ page }) => {
      await open(page, th)
      const gap = await page.evaluate(() => {
        const lis = document.querySelectorAll('.parcours-interests__list li')
        const last = lis[lis.length - 1].getBoundingClientRect().bottom
        const next = (document.querySelector('.home-skills') as HTMLElement).getBoundingClientRect().top
        return next - last
      })
      expect(gap).toBeGreaterThan(0)
      expect(gap).toBeGreaterThanOrEqual(32)
    })

    test('tuile du parcours : retrait latéral ≥ 12 px de chaque côté, comme les tuiles de projets', async ({ page }) => {
      await open(page, th)
      const m = await page.evaluate((sel) => {
        const r = (document.querySelector(sel) as HTMLElement).getBoundingClientRect()
        return { left: r.left, right: document.documentElement.clientWidth - r.right }
      }, FRISE)
      expect(m.left).toBeGreaterThanOrEqual(12)
      expect(m.right).toBeGreaterThanOrEqual(12)
    })
  })
}

test.describe('chiffres à 320 px, police à 200 %', () => {
  test.beforeEach(({ browserName }, testInfo) => {
    test.skip(browserName !== 'chromium' || testInfo.project.name !== 'desktop-1280', 'Fenêtre forcée : exécuté une seule fois.')
  })
  test('aucun chiffre ni libellé ne déborde de la liste ni de l’écran', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 640 })
    await open(page, 'light')
    await page.addStyleTag({ content: 'html { font-size: 200% !important; }' })
    await page.waitForTimeout(200)
    const o = await page.evaluate(() => {
      const list = document.querySelector('.home-figures__list') as HTMLElement
      const vw = document.documentElement.clientWidth
      const over = [...list.querySelectorAll('dt, dd')].filter((e) => e.getBoundingClientRect().right > vw + 0.5 || e.scrollWidth > e.clientWidth + 0.5).map((e) => e.textContent)
      return { listScroll: list.scrollWidth, listClient: list.clientWidth, over, vw }
    })
    expect(o.over).toEqual([])
    expect(o.listScroll).toBeLessThanOrEqual(o.listClient)
    // Le bandeau « Stage de 10 semaines » (nowrap voulu sous 768 px) déborde seul à 200 % : hors de cette liste, non traité ici.
  })
})
