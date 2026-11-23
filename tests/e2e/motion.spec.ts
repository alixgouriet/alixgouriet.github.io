import { expect, test, type Page } from '@playwright/test'
import { FICHES, MENU_BUTTON, load, watchConsole } from './helpers'

/**
 * Tests du mouvement (voir documentation/MOUVEMENT.md) : repli reduced-motion, état final lisible,
 * CLS nul, absence de scroll-jacking, entrée du hero unique par session, menu mobile animé,
 * un seul backdrop-filter, aucun will-change, console propre.
 */

const FICHE = FICHES[0]
const ROUTES_RM = ['/', '/projets', FICHE, '/a-propos']
const SHEET = 'dialog.ap-sheet'

/** Attend la fin de l'entrée du hero (html[data-intro] retiré après 1,2 s) et un tick de plus. */
async function settle(page: Page) {
  await expect(page.locator('html')).not.toHaveAttribute('data-intro', /.*/, { timeout: 5000 })
  await page.waitForTimeout(300)
}

/** Parcourt toute la page par pas d'une demi-fenêtre ; appelle `onStep` à chaque position. */
async function sweep(page: Page, onStep?: () => Promise<void>) {
  const max = await page.evaluate(() => document.documentElement.scrollHeight - window.innerHeight)
  const step = Math.max(200, Math.floor((page.viewportSize()?.height ?? 800) / 2))
  for (let y = 0; ; y += step) {
    const target = Math.min(y, max)
    await page.evaluate((t) => window.scrollTo(0, t), target)
    await page.waitForTimeout(120)
    if (onStep) await onStep()
    if (target >= max) break
  }
}

/** Éléments visibles qui portent du texte propre (nœud texte direct), hors trait de la barre. */
const VISIBLE_STATE = () => {
  const out: string[] = []
  const identity = (t: string) => {
    if (t === 'none') return true
    const m = new DOMMatrixReadOnly(t)
    return m.isIdentity
  }
  for (const el of document.querySelectorAll<HTMLElement>('body *')) {
    if (el.closest('.ap-nav__ind')) continue // trait glissant : positionné par transform, pas animé en entrée
    if (el.matches('a.ap-skip:not(:focus)')) continue // lien d'évitement : hors écran par transform tant qu'il n'a pas le focus
    if (el.matches('input[type="radio"], input[type="checkbox"]')) continue // contrôle natif masqué visuellement, remplacé par un libellé stylé
    if (el.closest('dialog:not([open])')) continue
    const cs = getComputedStyle(el)
    const r = el.getBoundingClientRect()
    if (cs.display === 'none' || cs.visibility === 'hidden' || r.width === 0 || r.height === 0) continue
    if (cs.opacity !== '1') out.push(`${el.tagName.toLowerCase()}.${el.className} opacity=${cs.opacity}`)
    if (!identity(cs.transform)) out.push(`${el.tagName.toLowerCase()}.${el.className} transform=${cs.transform}`)
  }
  return out
}

test.describe('reduced-motion : aucun mouvement, état final immédiat', () => {
  for (const route of ROUTES_RM) {
    test(`${route} : opacité 1, transform nul, aucune animation, texte présent`, async ({ page }) => {
      await page.emulateMedia({ reducedMotion: 'reduce' })
      await load(page, route)
      await page.waitForTimeout(300)
      // Haut de page, puis bas de page : l'état doit être final partout, sans attendre le défilement.
      const top = await page.evaluate(VISIBLE_STATE)
      expect(top, `${route} haut de page`).toEqual([])
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
      await page.waitForTimeout(300)
      const bottom = await page.evaluate(VISIBLE_STATE)
      expect(bottom, `${route} bas de page`).toEqual([])
      const anims = await page.evaluate(() =>
        document
          .getAnimations()
          .filter((a) => a.playState === 'running' || a.playState === 'paused' || a.pending)
          .map((a) => `${a.constructor.name} ${(a as CSSAnimation).animationName ?? (a as CSSTransition).transitionProperty ?? ''} sur ${(a.effect as KeyframeEffect | null)?.target?.className ?? '?'}`),
      )
      expect(anims, `${route} animations actives`).toEqual([])
      // Tout le texte est présent : chaque titre est visible et rien n'est tronqué par un masque.
      const headings = page.locator('main h1, main h2, main h3')
      const n = await headings.count()
      expect(n).toBeGreaterThan(0)
      for (let i = 0; i < n; i++) await expect(headings.nth(i)).toBeVisible()
      const missing = await page.evaluate(() =>
        [...document.querySelectorAll('main h1, main h2, main h3, main p')].filter((e) => !(e as HTMLElement).innerText.trim() && (e.textContent ?? '').trim()).map((e) => e.textContent!.slice(0, 40)),
      )
      expect(missing, 'texte présent dans le DOM mais non rendu').toEqual([])
    })
  }
})

test.describe('mouvement actif : état final lisible', () => {
  for (const route of ['/', '/projets', FICHE, '/a-propos']) {
    test(`${route} : le texte est à opacité 1 et sans transform quand il est au centre du viewport`, async ({ page }) => {
      await page.emulateMedia({ reducedMotion: 'no-preference' })
      await load(page, route)
      await settle(page)
      const bad: string[] = []
      await sweep(page, async () => {
        const found = await page.evaluate(() => {
          const out: string[] = []
          const vh = window.innerHeight
          const identity = (t: string) => t === 'none' || new DOMMatrixReadOnly(t).isIdentity
          const sel = 'main h1, main h2, main h3, main p, main li, main a, main figcaption, main dt, main dd'
          for (const el of document.querySelectorAll<HTMLElement>(sel)) {
            if (!(el.textContent ?? '').trim()) continue
            const r = el.getBoundingClientRect()
            const c = r.top + r.height / 2
            if (r.height === 0 || c < vh * 0.4 || c > vh * 0.6) continue
            // Le texte du hero s'estompe volontairement à 0,4 avec le défilement (MOUVEMENT.md) : on ne le teste qu'en haut de page.
            if (window.scrollY > 4 && el.closest('.home-hero__text')) continue
            let eff = 1
            const bads: string[] = []
            for (let n: HTMLElement | null = el; n && n !== document.documentElement; n = n.parentElement) {
              const cs = getComputedStyle(n)
              eff *= parseFloat(cs.opacity)
              if (!identity(cs.transform)) bads.push(`transform ${n.tagName.toLowerCase()}.${n.className}=${cs.transform}`)
            }
            if (eff < 0.999) bads.push(`opacité effective ${eff.toFixed(2)}`)
            if (bads.length) out.push(`<${el.tagName.toLowerCase()}> « ${(el.textContent ?? '').trim().slice(0, 30)} » y=${Math.round(window.scrollY)} : ${bads.join(', ')}`)
          }
          return out
        })
        bad.push(...found)
      })
      expect(bad).toEqual([])
    })
  }

  test('accueil : le titre de chaque tuile est dans le DOM et visible quand il est au centre (recouvrement sortant toléré)', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'no-preference' })
    await load(page, '/')
    await settle(page)
    const titles = page.locator('main article.home-tile').getByRole('heading', { level: 2 })
    const n = await titles.count()
    expect(n).toBe(4)
    for (let i = 0; i < n; i++) {
      const h = titles.nth(i)
      await expect(h).toHaveText(/\S/)
      await h.evaluate((e) => e.scrollIntoView({ block: 'center' }))
      await page.waitForTimeout(250)
      await expect(h).toBeVisible()
      await expect(h).toBeInViewport({ ratio: 1 })
      const eff = await h.evaluate((e) => {
        let o = 1
        for (let n: HTMLElement | null = e as HTMLElement; n; n = n.parentElement) o *= parseFloat(getComputedStyle(n).opacity)
        return o
      })
      expect(eff, `titre de tuile ${i + 1} au centre`).toBeGreaterThanOrEqual(0.99)
    }
  })

  test('projets : chaque titre de tuile est visible à opacité 1 au centre du viewport', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'no-preference' })
    await load(page, '/projets')
    await settle(page)
    const titles = page.locator('main .pg-tile-title')
    const n = await titles.count()
    expect(n).toBeGreaterThanOrEqual(9)
    for (let i = 0; i < n; i++) {
      const h = titles.nth(i)
      await h.evaluate((e) => e.scrollIntoView({ block: 'center' }))
      await page.waitForTimeout(150)
      await expect(h).toBeVisible()
      const eff = await h.evaluate((e) => {
        let o = 1
        for (let k: HTMLElement | null = e as HTMLElement; k; k = k.parentElement) o *= parseFloat(getComputedStyle(k).opacity)
        return o
      })
      expect(eff, `tuile ${i + 1} « ${await h.textContent()} »`).toBeGreaterThanOrEqual(0.99)
    }
  })
})

test.describe('CLS cumulé nul', () => {
  for (const route of ['/', '/projets', FICHE]) {
    test(`${route} : aucun décalage de mise en page (hors entrée utilisateur)`, async ({ page }) => {
      await page.addInitScript(() => {
        ;(window as unknown as { __cls: number; __clsEntries: string[] }).__cls = 0
        ;(window as unknown as { __clsEntries: string[] }).__clsEntries = []
        new PerformanceObserver((list) => {
          for (const e of list.getEntries() as unknown as { value: number; hadRecentInput: boolean; sources?: { node?: Node }[] }[]) {
            if (e.hadRecentInput) continue
            ;(window as unknown as { __cls: number }).__cls += e.value
            ;(window as unknown as { __clsEntries: string[] }).__clsEntries.push(`${e.value.toFixed(4)} ${(e.sources ?? []).map((s) => (s.node as Element | undefined)?.className ?? '?').join(',')}`)
          }
        }).observe({ type: 'layout-shift', buffered: true })
      })
      await load(page, route)
      await settle(page)
      await sweep(page)
      await page.evaluate(() => window.scrollTo(0, 0))
      await page.waitForTimeout(500)
      const res = await page.evaluate(() => ({ cls: (window as unknown as { __cls: number }).__cls, e: (window as unknown as { __clsEntries: string[] }).__clsEntries }))
      expect(res.cls, JSON.stringify(res.e)).toBe(0)
    })
  }
})

test.describe('aucun scroll-jacking', () => {
  test('scrollBy avance exactement, le défilement n\'est jamais bloqué, pas d\'écouteur wheel/touch non passif', async ({ page }) => {
    await page.addInitScript(() => {
      const bad: string[] = []
      ;(window as unknown as { __nonPassive: string[] }).__nonPassive = bad
      const orig = EventTarget.prototype.addEventListener
      EventTarget.prototype.addEventListener = function (this: EventTarget, type: string, fn: EventListenerOrEventListenerObject, opts?: boolean | AddEventListenerOptions) {
        if (['wheel', 'mousewheel', 'touchstart', 'touchmove'].includes(type)) {
          const passive = typeof opts === 'object' && opts !== null ? opts.passive : false
          if (passive !== true) bad.push(type)
        }
        return orig.call(this, type, fn, opts)
      } as typeof orig
    })
    for (const route of ['/', '/projets', FICHE]) {
      await load(page, route)
      await settle(page)
      await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }))
      for (const dy of [137, 250, 91]) {
        const before = await page.evaluate(() => window.scrollY)
        await page.evaluate((d) => window.scrollBy(0, d), dy)
        await expect.poll(() => page.evaluate(() => window.scrollY), { message: `${route} scrollBy ${dy}`, timeout: 2000 }).toBe(before + dy)
      }
      // Molette : le défilement progresse à chaque cran, jusqu'en bas.
      await page.mouse.move(200, 300)
      let last = await page.evaluate(() => window.scrollY)
      for (let i = 0; i < 4; i++) {
        await page.mouse.wheel(0, 300)
        await page.waitForTimeout(150)
        const y = await page.evaluate(() => window.scrollY)
        expect(y, `${route} molette ${i}`).toBeGreaterThan(last)
        last = y
      }
      await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight))
      await expect.poll(() => page.evaluate(() => Math.round(window.scrollY + window.innerHeight - document.documentElement.scrollHeight)), { timeout: 2000 }).toBeGreaterThanOrEqual(-1)
      const w = await page.evaluate(() => ({ sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth }))
      expect(w.sw, `${route} scrollWidth`).toBe(w.cw)
      const sd = await page.evaluate(() => getComputedStyle(document.documentElement).scrollSnapType)
      expect(sd, 'pas de scroll-snap').toBe('none')
    }
    const np = await page.evaluate(() => (window as unknown as { __nonPassive: string[] }).__nonPassive)
    expect(np, 'écouteurs non passifs sur wheel/touch').toEqual([])
  })

  test('après navigation par lien, scrollY = 0 et pas de débordement horizontal', async ({ page }) => {
    await load(page, '/')
    await settle(page)
    await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight))
    await page.waitForTimeout(200)
    expect(await page.evaluate(() => window.scrollY)).toBeGreaterThan(300)
    // Lien de page (pas de la barre), puis lien de la barre fixe.
    const toProjets = page.locator('main').getByRole('link', { name: /Voir les projets|En savoir plus sur/ }).first()
    await toProjets.scrollIntoViewIfNeeded()
    await toProjets.click()
    await expect(page.locator('main h1')).toBeFocused()
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0)
    await page.evaluate(() => window.scrollTo(0, 600))
    await page.waitForTimeout(200)
    const brand = page.locator('header.ap-nav').getByRole('link', { name: 'Alix Gouriet' })
    await brand.click()
    await expect(page).toHaveURL('/')
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0)
    const w = await page.evaluate(() => ({ sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth }))
    expect(w.sw).toBe(w.cw)
  })
})

test.describe("entrée du hero : une fois par session", () => {
  test("html[data-intro] posé au 1er chargement, retiré en < 2 s, absent au retour sur l'accueil et au rechargement", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'no-preference' })
    await page.goto('/', { waitUntil: 'domcontentloaded' })
    await expect(page.locator('html')).toHaveAttribute('data-intro', 'play')
    await expect(page.locator('html')).not.toHaveAttribute('data-intro', /.*/, { timeout: 2500 })
    // Aller sur Projets puis revenir à l'accueil par la navigation interne.
    const narrow = (page.viewportSize()?.width ?? 1280) < 768
    const go = async (label: string) => {
      if (narrow) {
        await page.getByRole('button', MENU_BUTTON).click()
        await page.locator(SHEET).getByRole('link', { name: label, exact: true }).click()
        await expect(page.locator(SHEET)).toBeHidden()
      } else {
        await page.locator('nav.ap-nav__links').getByRole('link', { name: label, exact: true }).click()
      }
    }
    await go('Projets')
    await expect(page).toHaveURL('/projets')
    await go('Accueil')
    await expect(page).toHaveURL('/')
    await expect(page.getByRole('heading', { level: 1, name: 'Alix Gouriet', exact: true })).toBeVisible()
    await expect(page.locator('html')).not.toHaveAttribute('data-intro', /.*/)
    const anims = await page.evaluate(() => document.querySelector('.home-hero h1')!.getAnimations().length)
    expect(anims, 'aucune animation sur le h1 au 2e passage').toBe(0)
    // Rechargement dans la même session : pas de rejeu.
    await page.reload({ waitUntil: 'domcontentloaded' })
    await expect(page.locator('html')).not.toHaveAttribute('data-intro', /.*/)
  })

  test("arrivée directe sur une autre page : pas d'entrée orchestrée en revenant à l'accueil", async ({ page }) => {
    await page.goto(FICHE, { waitUntil: 'domcontentloaded' })
    await expect(page.locator('html')).not.toHaveAttribute('data-intro', /.*/)
    await load(page, FICHE)
    const narrow = (page.viewportSize()?.width ?? 1280) < 768
    if (narrow) {
      await page.getByRole('button', MENU_BUTTON).click()
      await page.locator(SHEET).getByRole('link', { name: 'Accueil', exact: true }).click()
    } else {
      await page.locator('nav.ap-nav__links').getByRole('link', { name: 'Accueil', exact: true }).click()
    }
    await expect(page).toHaveURL('/')
    await expect(page.locator('html')).not.toHaveAttribute('data-intro', /.*/)
  })

  test('reduced-motion : aucune animation sur le hero même au premier chargement', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.goto('/', { waitUntil: 'domcontentloaded' })
    await page.waitForTimeout(100)
    const info = await page.evaluate(() => ({
      anims: document.getAnimations().filter((a) => a.playState === 'running').length,
      op: getComputedStyle(document.querySelector('.home-hero h1') ?? document.body).opacity,
    }))
    expect(info.anims).toBe(0)
    expect(info.op).toBe('1')
  })
})

test.describe('menu mobile : ouverture animée', () => {
  test.skip(({ viewport }) => viewport?.width !== 375, 'menu visible uniquement à 375 px')

  test('ouverture, cascade des liens, focus, fermeture (Fermer et Échap)', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'no-preference' })
    await load(page, '/')
    await settle(page)
    const btn = page.getByRole('button', MENU_BUTTON)
    const dlg = page.locator(SHEET)
    await expect(dlg).toBeHidden()

    // Cascade : 30 ms de décalage entre liens, mesurée sur les transitions réelles juste après l'ouverture.
    const delays = await page.evaluate(async () => {
      const b = document.querySelector<HTMLButtonElement>('button.ap-nav__menu')!
      b.focus()
      b.click()
      await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)))
      const links = [...document.querySelectorAll<HTMLElement>('dialog.ap-sheet nav a')]
      return links.map((l) => {
        const t = l.getAnimations().find((a) => (a as CSSTransition).transitionProperty === 'opacity') as CSSTransition | undefined
        return t ? (t.effect!.getComputedTiming().delay as number) : null
      })
    })
    expect(delays.length).toBe(5)
    expect(delays.every((d) => d !== null), `transitions de lien introuvables : ${JSON.stringify(delays)}`).toBe(true)
    for (let i = 1; i < delays.length; i++) expect(delays[i]! - delays[i - 1]!).toBeCloseTo(30, 0)

    // On attend la visibilité, puis la fin réelle des animations (pas de délai fixe).
    await expect(dlg).toBeVisible()
    await expect.poll(() => dlg.evaluate((d) => d.getAnimations({ subtree: true }).filter((a) => a.playState === 'running').length), { timeout: 3000 }).toBe(0)
    const states = await dlg.locator('nav a').evaluateAll((as) => as.map((a) => ({ o: getComputedStyle(a).opacity, t: getComputedStyle(a).transform })))
    for (const s of states) {
      expect(s.o).toBe('1')
      expect(s.t === 'none' || s.t === 'matrix(1, 0, 0, 1, 0, 0)').toBe(true)
    }
    const sheet = await dlg.evaluate((d) => ({ o: getComputedStyle(d).opacity, t: getComputedStyle(d).transform }))
    expect(sheet.o).toBe('1')
    expect(sheet.t === 'none' || sheet.t === 'matrix(1, 0, 0, 1, 0, 0)').toBe(true)
    await expect(dlg.getByRole('link', { name: 'Accueil', exact: true })).toBeFocused()
    // Défilement de la page derrière le menu : bloqué par le dialogue modal (pas de fuite du scroll).
    expect(await dlg.evaluate((d: HTMLDialogElement) => d.matches(':modal'))).toBe(true)

    // Fermeture par « Fermer » : le dialogue sort du rendu et le focus revient au bouton.
    await page.getByRole('button', { name: 'Fermer', exact: true }).click()
    await expect(dlg).toBeHidden()
    await expect(btn).toBeFocused()

    // Réouverture puis Échap (aussi pendant l'animation d'ouverture).
    await btn.click()
    await page.keyboard.press('Escape')
    await expect(dlg).toBeHidden()
    await expect(btn).toBeFocused()
    await btn.click()
    await expect(dlg).toBeVisible()
    await page.keyboard.press('Escape')
    await expect(dlg).toBeHidden()
    await expect(btn).toBeFocused()
    // La classe html.sheet-open ne doit pas rester après fermeture.
    await expect(page.locator('html')).not.toHaveClass(/sheet-open/)
  })

  test('reduced-motion : ouverture sans cascade ni décalage, liens visibles et focalisés', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await load(page, '/')
    await page.getByRole('button', MENU_BUTTON).click()
    const dlg = page.locator(SHEET)
    await expect(dlg).toBeVisible()
    await expect.poll(() => dlg.evaluate((d) => d.getAnimations({ subtree: true }).filter((a) => a.playState === 'running').length), { timeout: 2000 }).toBe(0)
    const delays = await dlg.locator('nav a').evaluateAll((as) => as.flatMap((a) => a.getAnimations().map((x) => x.effect!.getComputedTiming().delay as number)))
    expect(delays.filter((d) => d > 0), 'aucun délai de cascade').toEqual([])
    await expect(dlg.getByRole('link', { name: 'Accueil', exact: true })).toBeFocused()
  })
})

test.describe('performance du mouvement', () => {
  for (const route of ['/', '/projets', FICHE]) {
    test(`${route} : un seul backdrop-filter actif et aucun will-change permanent`, async ({ page }) => {
      await load(page, route)
      await settle(page)
      const check = async (label: string) => {
        const r = await page.evaluate(() => {
          const bf: string[] = []
          const wc: string[] = []
          for (const el of document.querySelectorAll<HTMLElement>('*')) {
            const cs = getComputedStyle(el)
            const b = cs.backdropFilter || (cs as unknown as { webkitBackdropFilter?: string }).webkitBackdropFilter || 'none'
            if (b && b !== 'none') bf.push(`${el.tagName.toLowerCase()}.${el.className}`)
            if (cs.willChange !== 'auto') wc.push(`${el.tagName.toLowerCase()}.${el.className}=${cs.willChange}`)
            for (const pseudo of ['::before', '::after']) {
              const p = getComputedStyle(el, pseudo)
              if (p.backdropFilter && p.backdropFilter !== 'none') bf.push(`${el.tagName.toLowerCase()}.${el.className}${pseudo}`)
              if (p.willChange !== 'auto') wc.push(`${el.tagName.toLowerCase()}.${el.className}${pseudo}=${p.willChange}`)
            }
          }
          return { bf, wc }
        })
        expect(r.bf, `${label} : backdrop-filter`).toHaveLength(1)
        expect(r.bf[0]).toContain('ap-nav')
        expect(r.wc, `${label} : will-change`).toEqual([])
      }
      await check('haut de page')
      await sweep(page, async () => {})
      await check('après défilement')
      if ((page.viewportSize()?.width ?? 1280) === 375) {
        await page.evaluate(() => window.scrollTo(0, 0))
        await page.getByRole('button', MENU_BUTTON).click()
        await expect(page.locator(SHEET)).toBeVisible()
        await check('menu ouvert')
      }
    })
  }
})

test.describe('console propre pendant le mouvement', () => {
  test('aucune erreur ni avertissement en parcourant le site (défilement, liens, transitions de vue, menu)', async ({ page }) => {
    const issues = watchConsole(page)
    const narrow = (page.viewportSize()?.width ?? 1280) < 768
    await load(page, '/')
    await settle(page)
    await sweep(page)
    for (const label of ['Projets', 'À propos', 'Compétences', 'Contact', 'Accueil']) {
      if (narrow) {
        await page.getByRole('button', MENU_BUTTON).click()
        await expect(page.locator(SHEET)).toBeVisible()
        await page.locator(SHEET).getByRole('link', { name: label, exact: true }).click()
        await expect(page.locator(SHEET)).toBeHidden()
      } else {
        await page.locator('nav.ap-nav__links').getByRole('link', { name: label, exact: true }).click()
      }
      await expect(page.locator('main h1')).toBeVisible()
      await sweep(page)
    }
    await load(page, FICHE)
    await sweep(page)
    await page.setViewportSize({ width: 1024, height: 800 })
    await page.waitForTimeout(300)
    expect(issues).toEqual([])
  })
})
