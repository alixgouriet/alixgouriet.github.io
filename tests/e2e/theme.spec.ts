import AxeBuilder from '@axe-core/playwright'
import { expect, test, type Page } from '@playwright/test'
import { ALL_ROUTES, FICHES, isNarrow, load, watchConsole } from './helpers'

/**
 * Thème sombre / clair + illustrations + espaces insécables.
 * Script inline d'index.html (data-theme avant le premier rendu), ThemeToggle (barre ≥ 768 px, menu mobile),
 * localStorage clé « theme », <meta name="theme-color"> (#f5f5f7 / #161617).
 */

const THEMES = ['light', 'dark'] as const
const COLORS = { light: '#f5f5f7', dark: '#161617' }
const FICHE = FICHES[0]
const AXE_ROUTES = ['/', '/projets', FICHE, '/a-propos', '/competences', '/contact', '/projets/xyz']
const SHEET = 'dialog.ap-sheet'

const theme = (page: Page) => page.locator('html').getAttribute('data-theme')
const stored = (page: Page) => page.evaluate(() => localStorage.getItem('theme'))
const metaColor = (page: Page) => page.locator('meta[name="theme-color"]').getAttribute('content')

/** Bouton de bascule accessible à ce viewport : barre (≥ 768 px) ou ligne du menu mobile (ouvert au besoin). */
async function toggle(page: Page, name: 'Mode sombre' | 'Mode clair') {
  if (isNarrow(page)) {
    if (!(await page.locator(SHEET).evaluate((d: HTMLDialogElement) => d.open))) await page.getByRole('button', { name: 'Menu', exact: true }).click()
    return page.locator(SHEET).getByRole('button', { name, exact: true })
  }
  return page.getByRole('button', { name, exact: true })
}

/* ------------------------------------------------------------------ (a) premier rendu */
test.describe('(a) thème initial = prefers-color-scheme, avant le premier rendu', () => {
  for (const scheme of THEMES) {
    test(`colorScheme ${scheme}, rien de mémorisé : data-theme="${scheme}" dès le premier rendu`, async ({ page }) => {
      await page.emulateMedia({ colorScheme: scheme })
      await page.addInitScript(() => {
        const w = window as unknown as { __first?: { theme: string | null; scheme: string; rendered: boolean } }
        const snap = (rendered: boolean) => ({ theme: document.documentElement.getAttribute('data-theme'), scheme: document.documentElement.style.colorScheme, rendered })
        document.addEventListener('readystatechange', () => {
          if (!w.__first) w.__first = snap(false)
        })
        new MutationObserver((_m, mo) => {
          const root = document.getElementById('root')
          if (root && root.childElementCount > 0) {
            w.__first = snap(true)
            mo.disconnect()
          }
        }).observe(document, { childList: true, subtree: true })
      })
      await page.goto('/', { waitUntil: 'domcontentloaded' })
      expect(await theme(page)).toBe(scheme)
      const first = await page.evaluate(() => (window as unknown as { __first?: { theme: string; scheme: string; rendered: boolean } }).__first)
      expect(first, 'instantané au premier rendu React').toBeTruthy()
      expect(first!.rendered).toBe(true)
      expect(first!.theme).toBe(scheme)
      expect(first!.scheme).toBe(scheme)
      expect(await metaColor(page)).toBe(COLORS[scheme])
      expect(await stored(page), 'aucune préférence écrite sans action').toBeNull()
    })
  }

  test('préférence mémorisée prioritaire sur prefers-color-scheme (avant le premier rendu)', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'dark' })
    await page.addInitScript(() => localStorage.setItem('theme', 'light'))
    await page.goto('/', { waitUntil: 'domcontentloaded' })
    expect(await theme(page)).toBe('light')
    expect(await metaColor(page)).toBe(COLORS.light)
  })

  test('valeur mémorisée invalide ignorée : retour à prefers-color-scheme', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'dark' })
    await page.addInitScript(() => localStorage.setItem('theme', 'violet'))
    await page.goto('/', { waitUntil: 'domcontentloaded' })
    expect(await theme(page)).toBe('dark')
  })
})

/* ------------------------------------------------------------------ (b) bascule */
test.describe('(b) bouton de bascule', () => {
  test('clic : data-theme, aria-pressed, nom accessible, localStorage ; survit au rechargement et à la navigation', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'light' })
    await load(page, '/')
    expect(await theme(page)).toBe('light')

    let btn = await toggle(page, 'Mode sombre')
    await expect(btn).toBeVisible()
    await expect(btn).toHaveAttribute('aria-pressed', 'false')
    await btn.click()

    expect(await theme(page)).toBe('dark')
    expect(await stored(page)).toBe('dark')
    expect(await page.locator('html').evaluate((e) => e.style.colorScheme)).toBe('dark')
    btn = await toggle(page, 'Mode clair')
    await expect(btn).toHaveAttribute('aria-pressed', 'true')
    await expect(await toggle(page, 'Mode clair')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Mode sombre', exact: true })).toHaveCount(0)

    // Rechargement : le choix survit (même si le système est en clair).
    await page.reload({ waitUntil: 'domcontentloaded' })
    expect(await theme(page)).toBe('dark')
    await expect(page.locator('main h1')).toBeVisible()

    // Navigation par l'interface (menu mobile ou barre) : le choix reste.
    for (const label of ['Projets', 'Contact', 'À propos']) {
      if (isNarrow(page)) {
        await page.getByRole('button', { name: 'Menu', exact: true }).click()
        await page.locator(SHEET).getByRole('link', { name: label, exact: true }).click()
      } else {
        await page.locator('nav.ap-nav__links').getByRole('link', { name: label, exact: true }).click()
      }
      await expect(page.locator('main h1')).toBeVisible()
      expect(await theme(page), `après navigation vers ${label}`).toBe('dark')
    }

    // Retour en clair, mémorisé aussi.
    btn = await toggle(page, 'Mode clair')
    await btn.click()
    expect(await theme(page)).toBe('light')
    expect(await stored(page)).toBe('light')
    await page.reload({ waitUntil: 'domcontentloaded' })
    expect(await theme(page)).toBe('light')
  })

  test('barre : bouton visible ≥ 768 px (cible ≥ 44 px), absent de la barre en dessous ; jamais de focus perdu', async ({ page }) => {
    await load(page, '/')
    const bar = page.locator('.ap-theme--bar')
    if (isNarrow(page)) {
      await expect(bar).toBeHidden()
      await expect(page.getByRole('button', { name: /^Mode (sombre|clair)$/ })).toHaveCount(0)
    } else {
      await expect(bar).toBeVisible()
      const b = await bar.boundingBox()
      expect(b!.width, 'largeur de la cible').toBeGreaterThanOrEqual(44)
      expect(b!.height, 'hauteur de la cible').toBeGreaterThanOrEqual(44)
      await bar.focus()
      await page.keyboard.press('Enter')
      expect(await theme(page)).toBe('dark')
      await expect(page.locator('.ap-theme--bar')).toBeFocused()
      await page.keyboard.press('Space')
      expect(await theme(page)).toBe('light')
    }
  })

  test('cible ≥ 44 px dans le menu mobile', async ({ page }) => {
    test.skip(!isNarrow(page), 'menu mobile : < 768 px seulement')
    await load(page, '/')
    const btn = await toggle(page, 'Mode sombre')
    const b = await btn.boundingBox()
    expect(b!.height).toBeGreaterThanOrEqual(44)
    expect(b!.width).toBeGreaterThanOrEqual(44)
  })
})

/* ------------------------------------------------------------------ (c) localStorage indisponible */
test.describe('(c) localStorage bloqué', () => {
  for (const scheme of THEMES) {
    test(`suit prefers-color-scheme ${scheme}, aucune erreur, bascule valable pour la page`, async ({ page }) => {
      await page.emulateMedia({ colorScheme: scheme })
      await page.addInitScript(() => {
        Object.defineProperty(window, 'localStorage', {
          configurable: true,
          get() {
            throw new DOMException('Accès refusé', 'SecurityError')
          },
        })
      })
      const issues = watchConsole(page)
      await load(page, '/')
      expect(await theme(page)).toBe(scheme)
      expect(await metaColor(page)).toBe(COLORS[scheme])
      const other = scheme === 'dark' ? 'light' : 'dark'
      const btn = await toggle(page, scheme === 'dark' ? 'Mode clair' : 'Mode sombre')
      await btn.click()
      expect(await theme(page), 'la bascule fonctionne malgré le stockage bloqué').toBe(other)
      // La navigation interne (SPA) conserve le choix en mémoire de page.
      if (isNarrow(page)) {
        await page.locator(SHEET).getByRole('link', { name: 'Projets', exact: true }).click()
      } else {
        await page.locator('nav.ap-nav__links').getByRole('link', { name: 'Projets', exact: true }).click()
      }
      await expect(page.locator('main h1')).toHaveText('Projets et SAE')
      expect(await theme(page)).toBe(other)
      await page.waitForTimeout(300)
      expect(issues).toEqual([])
    })
  }
})

/* ------------------------------------------------------------------ (d) menu mobile */
test('(d) menu mobile : la bascule fonctionne et le menu reste ouvert', async ({ page }) => {
  test.skip(!isNarrow(page), 'menu mobile : < 768 px seulement')
  await page.emulateMedia({ colorScheme: 'light' })
  await load(page, '/')
  await page.getByRole('button', { name: 'Menu', exact: true }).click()
  const sheet = page.locator(SHEET)
  await expect(sheet).toHaveAttribute('open', '')
  await sheet.getByRole('button', { name: 'Mode sombre', exact: true }).click()
  expect(await theme(page)).toBe('dark')
  await expect(sheet, 'le menu reste ouvert').toHaveAttribute('open', '')
  const btn = sheet.getByRole('button', { name: 'Mode clair', exact: true })
  await expect(btn).toHaveAttribute('aria-pressed', 'true')
  await expect(btn).toBeFocused()
  expect(await stored(page)).toBe('dark')
  await btn.click()
  expect(await theme(page)).toBe('light')
  await expect(sheet).toHaveAttribute('open', '')
  // Le menu se ferme toujours normalement.
  await sheet.getByRole('button', { name: 'Fermer' }).click()
  await expect(sheet).not.toHaveAttribute('open', '')
})

/* ------------------------------------------------------------------ (e) theme-color */
test('(e) <meta name="theme-color"> suit le thème', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'light' })
  await load(page, '/')
  expect(await metaColor(page)).toBe('#f5f5f7')
  await (await toggle(page, 'Mode sombre')).click()
  expect(await metaColor(page)).toBe('#161617')
  await page.reload({ waitUntil: 'domcontentloaded' })
  expect(await metaColor(page)).toBe('#161617')
  await (await toggle(page, 'Mode clair')).click()
  expect(await metaColor(page)).toBe('#f5f5f7')
  await expect(page.locator('meta[name="theme-color"]')).toHaveCount(1)
})

test('classe theme-switching : posée pendant la bascule, retirée ensuite', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'light' })
  await load(page, '/')
  await page.evaluate(() => {
    const w = window as unknown as { __seen: boolean }
    w.__seen = false
    new MutationObserver(() => {
      if (document.documentElement.classList.contains('theme-switching')) w.__seen = true
    }).observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
  })
  await (await toggle(page, 'Mode sombre')).click()
  await expect(page.locator('html')).not.toHaveClass(/theme-switching/)
  expect(await page.evaluate(() => (window as unknown as { __seen: boolean }).__seen)).toBe(true)
})

/* ------------------------------------------------------------------ (f) axe dans les deux thèmes */
for (const th of THEMES) {
  for (const route of AXE_ROUTES) {
    test(`(f) axe WCAG 2 A/AA, thème ${th} : ${route}`, async ({ page }, info) => {
      await page.emulateMedia({ colorScheme: th, reducedMotion: 'reduce' })
      await load(page, route)
      expect(await theme(page)).toBe(th)
      await page.waitForTimeout(700) // illustrations différées chargées (repli à 1,5 s si hors écran)
      const res = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze()
      const summary = res.violations.map(
        (v) => `${v.id} (${v.impact}) x${v.nodes.length}: ${v.nodes.slice(0, 4).map((n) => n.target.join(' ')).join(' | ')}`,
      )
      if (summary.length) await page.screenshot({ path: `test-results/axe-${th}-${info.project.name}-${route.replace(/\W+/g, '_')}.png`, fullPage: true })
      expect(summary).toEqual([])
    })
  }
}

test('(f) axe : menu mobile ouvert, dans les deux thèmes', async ({ page }) => {
  test.skip(!isNarrow(page), 'menu mobile : < 768 px seulement')
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await load(page, '/')
  await page.getByRole('button', { name: 'Menu', exact: true }).click()
  for (const name of ['Mode sombre', 'Mode clair'] as const) {
    await page.waitForTimeout(400)
    const res = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze()
    expect(res.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(' | ')}`), name).toEqual([])
    await page.locator(SHEET).getByRole('button', { name, exact: true }).click()
  }
})

/* ------------------------------------------------------------------ (g) débordement et console, deux thèmes */
for (const th of THEMES) {
  for (const route of ALL_ROUTES) {
    test(`(g) thème ${th} : pas de débordement horizontal et console propre : ${route}`, async ({ page }, info) => {
      await page.emulateMedia({ colorScheme: th })
      const issues = watchConsole(page)
      await load(page, route)
      expect(await theme(page)).toBe(th)
      await page.waitForTimeout(1800) // laisse passer le repli de chargement des illustrations
      const m = await page.evaluate(() => ({ sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth, bw: document.body.scrollWidth }))
      expect(m.sw, `${info.project.name} ${route} ${JSON.stringify(m)}`).toBeLessThanOrEqual(m.cw)
      expect(m.bw).toBeLessThanOrEqual(m.cw)
      expect(issues).toEqual([])
    })
  }
}

/* ------------------------------------------------------------------ (h) illustrations */
const ILL_SRC = /illustrations\/|\/(GreenSd|PrixImmobiliers|EduCheck|Natalistes|Territoire|Fichiers|Diagnostic|Echantillonnage|MycoTrack)(-[\w-]+)?\.(tsx|js)/

test.describe('(h) illustrations', () => {
  test('/projets : 9 vignettes dans des conteneurs aria-hidden, aucune exposée au lecteur d’écran', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await load(page, '/projets')
    await page.locator('ul.pg-grid').scrollIntoViewIfNeeded()
    await expect(page.locator('.pg-grid .pg-thumb')).toHaveCount(9)
    await expect(page.locator('.pg-grid .pg-thumb[aria-hidden="true"]')).toHaveCount(9)
    await expect(page.locator('.pg-grid .pg-thumb svg'), 'SVG chargés (repli différé inclus)').toHaveCount(9, { timeout: 6000 })
    // Aucune ne figure dans l'arbre d'accessibilité.
    await expect(page.locator('main').getByRole('img')).toHaveCount(0)
    // Dans la tuile, la vignette précède le numéro.
    const order = await page.locator('.pg-grid > li').first().locator('.pg-tile, a, article, div').first().evaluate((t) => [...t.children].slice(0, 2).map((c) => c.className.split(' ')[0]))
    expect(order[0]).toBe('pg-thumb')
  })

  test('accueil : 5 illustrations dans « Autres réalisations », une par demi-tuile, avec nom accessible', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await load(page, '/')
    const region = page.getByRole('region', { name: 'Autres réalisations', exact: true })
    await region.scrollIntoViewIfNeeded()
    const tiles = region.locator('.ap-tile.home-half')
    await expect(tiles).toHaveCount(5)
    for (let i = 0; i < 5; i++) {
      const t = tiles.nth(i)
      await expect(t.locator('.ill-frame'), `demi-tuile ${i + 1}`).toHaveCount(1)
      // L'illustration est le premier enfant de la tuile.
      expect(await t.evaluate((e) => e.firstElementChild?.classList.contains('ill-frame'))).toBe(true)
      await expect(t.locator('svg[role="img"]')).toHaveCount(1, { timeout: 6000 })
      expect(((await t.locator('svg[role="img"]').getAttribute('aria-label')) ?? '').trim().length).toBeGreaterThan(8)
    }
    // Les demi-tuiles restent non cliquables et non focusables.
    await expect(tiles.locator('a, button, [tabindex]')).toHaveCount(0)
  })

  for (const slug of FICHES) {
    test(`fiche ${slug} : 1 illustration de couverture avec role=img et aria-label non vide`, async ({ page }) => {
      await page.emulateMedia({ reducedMotion: 'reduce' })
      await load(page, slug)
      const cover = page.locator('.ill-frame--cover')
      await expect(cover).toHaveCount(1)
      const svg = cover.locator('svg')
      await expect(svg).toHaveCount(1, { timeout: 6000 })
      await expect(svg).toHaveAttribute('role', 'img')
      const label = (await svg.getAttribute('aria-label')) ?? ''
      expect(label.trim().length).toBeGreaterThan(8)
      await expect(page.locator('main').getByRole('img', { name: label })).toHaveCount(1)
      // Une seule illustration dans la fiche.
      await expect(page.locator('main .ill-frame')).toHaveCount(1)
    })
  }

  test('immobilier : ni droite de régression ni nuage de points dans l’illustration', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await load(page, FICHES[0])
    const svg = page.locator('.ill-frame--cover svg')
    await expect(svg).toHaveCount(1, { timeout: 6000 })
    const info = await svg.evaluate((s) => ({
      lines: s.querySelectorAll('line').length,
      circles: s.querySelectorAll('circle').length,
      label: s.getAttribute('aria-label') ?? '',
    }))
    // Un nuage de points = nombreux petits cercles ; une droite de régression = <line> isolée sur nuage.
    expect(info.circles, `cercles (nuage de points) : ${info.label}`).toBeLessThan(6)
    expect(info.label).not.toMatch(/r[ée]gression|nuage|droite/i)
  })

  test('cadre 16:9 à hauteur réservée avant le chargement du SVG, hauteur inchangée après', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await load(page, '/projets')
    const frames = page.locator('.pg-grid .ill-frame--thumb')
    await expect(frames).toHaveCount(9)
    const sizes = await frames.evaluateAll((els) => els.map((e) => ({ w: e.getBoundingClientRect().width, h: e.getBoundingClientRect().height, hasSvg: !!e.querySelector('svg') })))
    for (const [i, s] of sizes.entries()) {
      expect(s.h, `vignette ${i + 1} : hauteur réservée`).toBeGreaterThan(20)
      expect(Math.abs(s.w / s.h - 16 / 9), `vignette ${i + 1} : ratio 16:9`).toBeLessThan(0.03)
    }
    await expect(page.locator('.pg-grid .pg-thumb svg')).toHaveCount(9, { timeout: 6000 })
    const after = await frames.evaluateAll((els) => els.map((e) => e.getBoundingClientRect().height))
    for (const [i, h] of after.entries()) expect(Math.abs(h - sizes[i].h), `vignette ${i + 1} : hauteur stable`).toBeLessThanOrEqual(0.5)
  })

  test('chargement différé : l’accueil ne charge pas tout de suite les 5 modules ; une fiche ne charge que la sienne', async ({ page }) => {
    const loaded: string[] = []
    page.on('request', (r) => {
      if (ILL_SRC.test(r.url()) && !/\/(Ill|Illustration|index)\.(tsx|ts|js)/.test(r.url()) && !/\.css/.test(r.url())) loaded.push(r.url().split('/').pop()!.split('?')[0])
    })
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.goto('/', { waitUntil: 'domcontentloaded' })
    await expect(page.locator('main h1')).toBeVisible()
    await page.waitForTimeout(500)
    const early = new Set(loaded)
    expect(early.size, `chargés avant 0,5 s sur l’accueil (hors écran) : ${[...early]}`).toBeLessThan(5)
    // Le contenu hors écran finit par charger (défilement ou repli).
    await page.getByRole('region', { name: 'Autres réalisations', exact: true }).scrollIntoViewIfNeeded()
    await expect(page.locator('.home-half svg[role="img"]')).toHaveCount(5, { timeout: 6000 })

    loaded.length = 0
    await page.goto(FICHE, { waitUntil: 'domcontentloaded' })
    await expect(page.locator('.ill-frame--cover svg')).toHaveCount(1, { timeout: 6000 })
    await page.waitForTimeout(2000)
    const names = [...new Set(loaded)]
    expect(names.length, `modules d’illustration chargés par la fiche : ${names}`).toBeLessThanOrEqual(1)
  })

  const CLS_ROUTES = ['/projets', '/', FICHE]
  for (const route of CLS_ROUTES) {
    for (const th of THEMES) {
      test(`CLS = 0 en balayant ${route} (thème ${th})`, async ({ page }) => {
        await page.emulateMedia({ reducedMotion: 'no-preference', colorScheme: th })
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
        await load(page, route)
        await expect(page.locator('html')).not.toHaveAttribute('data-intro', /.*/, { timeout: 5000 })
        const max = await page.evaluate(() => document.documentElement.scrollHeight - window.innerHeight)
        for (let y = 0; y <= max; y += 200) {
          await page.evaluate((t) => window.scrollTo({ top: t, behavior: 'instant' }), y)
          await page.waitForTimeout(40)
        }
        await page.waitForTimeout(1800) // repli de chargement différé à 1,5 s
        await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }))
        await page.waitForTimeout(400)
        const r = await page.evaluate(() => ({ cls: (window as unknown as { __cls: number }).__cls, e: (window as unknown as { __e: string[] }).__e }))
        expect(r.cls, JSON.stringify(r.e)).toBe(0)
      })
    }
  }
})

/* ------------------------------------------------------------------ (i) texte : « +5 % » et « +6 % » */
test.describe('(i) espaces insécables fines et absence de séquences d’échappement littérales', () => {
  const bodyText = (page: Page) => page.evaluate(() => document.body.textContent ?? '')

  for (const route of ['/', FICHES[1], '/projets']) {
    test(`« +5 % » et « +6 % » avec espace insécable fine : ${route}`, async ({ page }) => {
      await page.emulateMedia({ reducedMotion: 'reduce' })
      await load(page, route)
      await page.waitForTimeout(300)
      const t = await bodyText(page)
      for (const n of ['+5', '+6']) {
        // Espace insécable (fine U+202F attendue ; U+00A0 tolérée, signalée en rapport) entre le nombre et « % ».
        expect(t, `${n} % présent sur ${route}`).toMatch(new RegExp(`\\${n[0]}${n[1]}[\u202f\u00a0]%`))
        // Aucune forme dégradée : espace ordinaire ou collé.
        expect(t, `${n} avec espace ordinaire`).not.toMatch(new RegExp(`\\${n[0]}${n[1]} %`))
        expect(t, `${n} collé à %`).not.toMatch(new RegExp(`\\${n[0]}${n[1]}%`))
      }
    })
  }

  test('GrowthBars (fiche Villes natalistes) : « +5 % » et « +6 % » en espace insécable fine U+202F', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await load(page, FICHES[1])
    const bars = page.locator('ul.bars[aria-label="Évolution de la population, 2016 à 2022"]')
    await expect(bars).toHaveCount(1)
    const txt = await bars.evaluate((f) => f.textContent ?? '')
    expect(txt).toContain('+5\u202f%')
    expect(txt).toContain('+6\u202f%')
  })

  test('« % » : jamais précédé d’un chiffre sans espace insécable, sur le sous-titre et les légendes de Villes natalistes', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await load(page, FICHES[1])
    const t = await bodyText(page)
    const bad = [...t.matchAll(/\d ?%/g)].map((m) => m.index)
    // Tout « nombre % » doit utiliser U+202F ou U+00A0 ; on rapporte le contexte des cas fautifs.
    const ctx = [...t.matchAll(/.{0,25}\d %.{0,5}/g)].map((m) => JSON.stringify(m[0]))
    expect(ctx, `espaces ordinaires avant « % » (${bad.length})`).toEqual([])
  })

  for (const route of ALL_ROUTES) {
    test(`aucune séquence d’échappement littérale (\\u…, antislash) dans le texte : ${route}`, async ({ page }) => {
      await page.emulateMedia({ reducedMotion: 'reduce' })
      await load(page, route)
      await page.waitForTimeout(1800)
      // Texte des attributs lus à l'écran inclus : aria-label, title, alt.
      const all = await page.evaluate(() => {
        const attrs = [...document.querySelectorAll('[aria-label],[title],[alt]')].map((e) => `${e.getAttribute('aria-label') ?? ''} ${e.getAttribute('title') ?? ''} ${e.getAttribute('alt') ?? ''}`)
        return (document.body.textContent ?? '') + '\n' + attrs.join('\n')
      })
      expect(all.match(/\\u[0-9a-fA-F]{4}/g) ?? [], 'séquence \\uXXXX littérale').toEqual([])
      expect(all.match(/u202f|u00a0|&nbsp;|&#8239;/gi) ?? [], 'résidu d’échappement (u202f, nbsp…)').toEqual([])
      expect(all.includes('\\'), 'antislash dans le texte').toBe(false)
    })
  }
})
