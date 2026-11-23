import { expect, test, type Page } from '@playwright/test'
import { load, watchConsole } from './helpers'

/**
 * Scènes « histoire » épinglées de l'accueil (documentation/MOUVEMENT.md, src/components/fx/sceneEngine.ts, src/styles/scenes.css).
 * Les tests qui forcent leur propre taille de fenêtre ne tournent que dans le projet « desktop-1280 » (sinon ils seraient
 * répétés trois fois à l'identique) ; ceux qui lisent la taille du projet tournent partout.
 */

const PINNED = { width: 1280, height: 800 }
const SCENES = [
  { slug: 'villes-natalistes', steps: 2 },
  { slug: 'prix-immobiliers-niortais', steps: 5 },
  { slug: 'educheck', steps: 5 },
  { slug: 'greensd', steps: 5 },
]

function onlyDesktop(testInfo: { project: { name: string } }) {
  test.skip(testInfo.project.name !== 'desktop-1280', 'Taille de fenêtre forcée dans le test : exécuté une seule fois (desktop-1280).')
}

async function settle(page: Page) {
  await expect(page.locator('html')).not.toHaveAttribute('data-intro', /.*/, { timeout: 5000 })
  await page.waitForTimeout(300)
}

async function openHome(page: Page, size?: { width: number; height: number }, reduced = false) {
  if (size) await page.setViewportSize(size)
  await page.emulateMedia({ reducedMotion: reduced ? 'reduce' : 'no-preference' })
  await load(page, '/')
  await settle(page)
}

/** Défile (instantané) puis attend deux rAF : le moteur écrit --p au rAF suivant l'évènement scroll. */
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

interface Geo {
  top: number
  height: number
  travel: number
}
/** Position absolue, hauteur et course de chaque scène. */
async function geometry(page: Page): Promise<Geo[]> {
  return page.evaluate(() =>
    [...document.querySelectorAll<HTMLElement>('article.scene')].map((s) => {
      const stage = s.querySelector<HTMLElement>('.scene-stage')!
      return { top: s.getBoundingClientRect().top + window.scrollY, height: s.offsetHeight, travel: s.offsetHeight - stage.offsetHeight }
    }),
  )
}

const readP = (page: Page, i: number) =>
  page.evaluate((k) => getComputedStyle(document.querySelectorAll('article.scene')[k]).getPropertyValue('--p').trim(), i)

async function sweep(page: Page, onStep?: (y: number) => Promise<void>, stepPx?: number) {
  const max = await page.evaluate(() => document.documentElement.scrollHeight - window.innerHeight)
  const step = stepPx ?? Math.max(200, Math.floor((page.viewportSize()?.height ?? 800) / 2))
  for (let y = 0; ; y += step) {
    const t = Math.min(y, max)
    await scrollToY(page, t)
    await page.waitForTimeout(60)
    if (onStep) await onStep(t)
    if (t >= max) break
  }
}

/* ------------------------------------------------------------------ (1) épinglage et progression */
test.describe('scènes : épinglage et progression --p (1280 × 800)', () => {
  test('4 scènes ; stage sticky top 0 ; hauteurs (150 + 18 × étapes) svh', async ({ page }, ti) => {
    onlyDesktop(ti)
    await openHome(page, PINNED)
    const info = await page.evaluate(() =>
      [...document.querySelectorAll<HTMLElement>('article.scene')].map((s) => {
        const cs = getComputedStyle(s.querySelector('.scene-stage')!)
        return { slug: [...s.classList].find((c) => c.startsWith('scene--')), pos: cs.position, top: cs.top, h: s.offsetHeight }
      }),
    )
    expect(info).toHaveLength(4)
    for (const [i, s] of info.entries()) {
      expect(s.pos, `scène ${i + 1} position`).toBe('sticky')
      expect(s.top, `scène ${i + 1} top`).toBe('0px')
      const slug = s.slug!.replace('scene--', '')
      const steps = SCENES.find((x) => x.slug === slug)!.steps
      expect(Math.abs(s.h - (1.5 + 0.18 * steps) * PINNED.height), `hauteur ${slug}`).toBeLessThanOrEqual(2)
    }
  })

  test('--p vaut ≈ 0 en haut, ≈ 0,5 à mi-parcours, ≈ 1 en bas ; stage collé en haut ; jamais hors [0, 1]', async ({ page }, ti) => {
    onlyDesktop(ti)
    await openHome(page, PINNED)
    const geo = await geometry(page)
    expect(geo).toHaveLength(4)
    for (const [i, g] of geo.entries()) {
      for (const [frac, label] of [[0, 'haut'], [0.5, 'mi-parcours'], [1, 'bas']] as const) {
        await scrollToY(page, g.top + g.travel * frac)
        const p = parseFloat(await readP(page, i))
        expect(p, `scène ${i + 1} ${label} : --p`).toBeGreaterThanOrEqual(frac - 0.05)
        expect(p, `scène ${i + 1} ${label} : --p`).toBeLessThanOrEqual(frac + 0.05)
        const stageTop = await page.evaluate((k) => document.querySelectorAll('article.scene')[k].querySelector('.scene-stage')!.getBoundingClientRect().top, i)
        expect(Math.abs(stageTop), `scène ${i + 1} ${label} : stage collé en haut`).toBeLessThanOrEqual(2)
      }
      // Juste après le bas de la section, le stage repart avec elle (il n'est plus collé).
      await scrollToY(page, g.top + g.travel + 300)
      const after = await page.evaluate((k) => document.querySelectorAll('article.scene')[k].querySelector('.scene-stage')!.getBoundingClientRect().top, i)
      expect(after, `scène ${i + 1} : stage libéré en bas de section`).toBeLessThan(-100)
    }
  })

  test('balayage complet : --p toujours dans [0, 1] et conforme à la position pour toute scène à l’écran', async ({ page }, ti) => {
    onlyDesktop(ti)
    await openHome(page, PINNED)
    const geo = await geometry(page)
    const bad: string[] = []
    await sweep(
      page,
      async (y) => {
        for (const [i, g] of geo.entries()) {
          const raw = await readP(page, i)
          const p = parseFloat(raw)
          if (!(p >= 0 && p <= 1)) bad.push(`scène ${i + 1} y=${y} --p="${raw}" hors [0,1]`)
          const onScreen = y + PINNED.height > g.top && y < g.top + g.height
          if (onScreen) {
            const exp = Math.min(1, Math.max(0, (y - g.top) / g.travel))
            if (Math.abs(p - exp) > 0.05) bad.push(`scène ${i + 1} y=${y} --p=${p} attendu ≈ ${exp.toFixed(2)}`)
          }
        }
      },
      173,
    )
    expect(bad).toEqual([])
  })
})

/* ------------------------------------------------------------------ (2) défilement jamais retenu */
test.describe('scènes : le défilement n’est jamais retenu', () => {
  test('scrollBy exact dans les scènes, molette fonctionnelle, la page se termine', async ({ page }, ti) => {
    onlyDesktop(ti)
    await openHome(page, PINNED)
    const geo = await geometry(page)
    for (const [i, g] of geo.entries()) {
      await scrollToY(page, g.top + g.travel * 0.3)
      for (const dy of [137, 250, 91]) {
        const before = await page.evaluate(() => window.scrollY)
        await page.evaluate((d) => window.scrollBy({ top: d, behavior: 'instant' }), dy)
        await expect.poll(() => page.evaluate(() => window.scrollY), { message: `scène ${i + 1} scrollBy ${dy}`, timeout: 2000 }).toBe(before + dy)
      }
    }
    // Molette : chaque cran fait avancer la page, y compris à l'intérieur d'une scène épinglée.
    await scrollToY(page, geo[1].top + 200)
    await page.mouse.move(640, 400)
    let last = await page.evaluate(() => window.scrollY)
    for (let i = 0; i < 5; i++) {
      await page.mouse.wheel(0, 300)
      await expect.poll(() => page.evaluate(() => window.scrollY), { message: `molette ${i}`, timeout: 2000 }).toBeGreaterThan(last)
      last = await page.evaluate(() => window.scrollY)
    }
    // La molette seule atteint le bas de page (jamais bloquée).
    await scrollToY(page, 0)
    for (let i = 0; i < 80; i++) {
      await page.mouse.wheel(0, 1000)
      await page.waitForTimeout(40)
      const atEnd = await page.evaluate(() => Math.ceil(window.scrollY + window.innerHeight) >= document.documentElement.scrollHeight - 1)
      if (atEnd) break
    }
    await expect.poll(() => page.evaluate(() => Math.ceil(window.scrollY + window.innerHeight) >= document.documentElement.scrollHeight - 1), { timeout: 3000 }).toBe(true)
    await expect(page.getByRole('contentinfo')).toBeInViewport()
    const sw = await page.evaluate(() => ({ sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth }))
    expect(sw.sw).toBe(sw.cw)
  })

  test('la page ne fait pas de défilement forcé : scrollY reste là où on le pose', async ({ page }, ti) => {
    onlyDesktop(ti)
    await openHome(page, PINNED)
    const geo = await geometry(page)
    await scrollToY(page, geo[0].top + 500)
    const a = await page.evaluate(() => window.scrollY)
    await page.waitForTimeout(600)
    expect(await page.evaluate(() => window.scrollY)).toBe(a)
  })
})

/* ------------------------------------------------------------------ (3) texte des étapes et faits */
test.describe('scènes : texte des étapes toujours dans le DOM, visible et lisible', () => {
  const FRACS = [0, 0.1, 0.25, 0.4, 0.5, 0.6, 0.75, 0.9, 1]

  test('chaque étape : présente, non masquée, opacité ≥ 0,64 (plancher 0,65 documenté), dans la fenêtre, à tout --p', async ({ page }, ti) => {
    onlyDesktop(ti)
    await openHome(page, PINNED)
    const geo = await geometry(page)
    const bad: string[] = []
    let minOp = 1
    for (const [i, g] of geo.entries()) {
      for (const f of FRACS) {
        await scrollToY(page, g.top + g.travel * f)
        const res = await page.evaluate(
          ({ k, vh }) => {
            const scene = document.querySelectorAll('article.scene')[k]
            const steps = [...scene.querySelectorAll<HTMLElement>('.scene-step')]
            return {
              n: steps.length,
              items: steps.map((el) => {
                let op = 1
                const why: string[] = []
                for (let n: HTMLElement | null = el; n && n !== document.documentElement; n = n.parentElement) {
                  const cs = getComputedStyle(n)
                  op *= parseFloat(cs.opacity)
                  if (cs.display === 'none') why.push(`display:none ${n.className}`)
                  if (cs.visibility === 'hidden') why.push(`visibility:hidden ${n.className}`)
                }
                const r = el.getBoundingClientRect()
                if (r.height === 0 || !el.innerText.trim()) why.push('non rendu / vide')
                if (r.top < 0 || r.bottom > vh) why.push(`hors fenêtre (${Math.round(r.top)}..${Math.round(r.bottom)})`)
                return { label: el.querySelector('.scene-step__label')?.textContent ?? '?', op, why }
              }),
            }
          },
          { k: i, vh: PINNED.height },
        )
        if (res.n === 0) bad.push(`scène ${i + 1} : aucune étape`)
        for (const it of res.items) {
          minOp = Math.min(minOp, it.op)
          if (it.op < 0.64) bad.push(`scène ${i + 1} f=${f} « ${it.label} » opacité ${it.op.toFixed(2)}`)
          for (const w of it.why) bad.push(`scène ${i + 1} f=${f} « ${it.label} » : ${w}`)
        }
      }
    }
    test.info().annotations.push({ type: 'info', description: `opacité minimale observée d'une étape : ${minOp.toFixed(3)}` })
    expect(bad).toEqual([])
  })

  test('les étapes sont des listes nommées, dans l’ordre, avec le nombre attendu (5, 5, 5, 2)', async ({ page }) => {
    await load(page, '/')
    const lists = page.getByRole('list', { name: /^Étapes : / })
    await expect(lists).toHaveCount(4)
    const counts = await lists.evaluateAll((ls) => ls.map((l) => l.querySelectorAll(':scope > li').length))
    expect(counts.sort()).toEqual([2, 5, 5, 5])
  })

  test('GreenSD : 10 tables dont partenaire, coefficientCO2 et approvisionner', async ({ page }) => {
    await load(page, '/')
    const scene = page.locator('article.scene--greensd')
    const tables = await scene.locator('svg.er-svg:visible .er-title').allTextContents()
    expect(tables).toHaveLength(10)
    for (const t of ['partenaire', 'coefficientCO2', 'approvisionner']) expect(tables, `table ${t}`).toContain(t)
    await expect(scene.getByRole('img', { name: /./ })).toHaveCount(1)
    const txt = (await scene.locator('.scene-legend').textContent()) ?? ''
    for (const t of ['partenaire', 'coefficientCO2', 'approvisionner']) expect(txt).toContain(t)
  })

  test('EduCheck : semestre, compétence, matière et note sur 20', async ({ page }) => {
    await load(page, '/')
    const scene = page.locator('article.scene--educheck')
    const chain = scene.getByRole('list', { name: /Saisie d’une note/ })
    await expect(chain).toBeVisible()
    const chainTxt = ((await chain.textContent()) ?? '').toLowerCase()
    for (const t of ['semestre', 'compétence', 'matière', 'note']) expect(chainTxt, t).toContain(t)
    await expect(scene.locator('.scene-legend')).toContainText(/note est convertie sur 20/i)
    await expect(scene.locator('.scene-legend')).toContainText(/semestre/i)
  })

  test('Prix immobiliers : 5 segments ; racine carrée, linéaire et log-log', async ({ page }) => {
    await load(page, '/')
    const scene = page.locator('article.scene--prix-immobiliers-niortais')
    await expect(scene.getByRole('list', { name: /5 segments/ }).locator('> li')).toHaveCount(5)
    const legend = (await scene.locator('.scene-legend').textContent()) ?? ''
    expect(legend).toMatch(/racine carrée/i)
    expect(legend).toMatch(/linéaire/i)
    expect(legend).toMatch(/log-log/i)
    const tags = await scene.locator('.segments__tag').allTextContents()
    expect(tags.map((t) => t.trim())).toEqual(['√ surface', 'surface', '√ surface', 'surface', 'log – log'])
  })

  test('Villes natalistes : +5 % et +6 % en texte', async ({ page }) => {
    await load(page, '/')
    const scene = page.locator('article.scene--villes-natalistes')
    const txt = ((await scene.textContent()) ?? '').replace(/[\s  ]+/g, ' ')
    expect(txt).toContain('+5 %')
    expect(txt).toContain('+6 %')
    await expect(scene.getByRole('list', { name: /Évolution de la population/ }).locator('> li')).toHaveCount(2)
  })
})

/* ------------------------------------------------------------------ (4) pas de nuage ni de droite */
test('accueil : aucune droite de régression, aucun nuage de points, aucun curseur', async ({ page }) => {
  await load(page, '/')
  await expect(page.getByRole('slider')).toHaveCount(0)
  await expect(page.locator('input[type="range"]')).toHaveCount(0)
  await expect(page.getByRole('button', { name: /Ajuster automatiquement/ })).toHaveCount(0)
  await expect(page.getByText(/Régression interactive|Ajuster automatiquement/)).toHaveCount(0)
  const found = await page.evaluate(() => {
    const out: string[] = []
    // Le moteur de dessin de la régression : cercles (points) et lignes (droite, résidus) dans un svg.
    for (const svg of document.querySelectorAll('main svg')) {
      const c = svg.querySelectorAll('circle').length
      const l = svg.querySelectorAll('line').length
      if (c > 0) out.push(`svg avec ${c} cercle(s) (nuage ?)`)
      if (l > 0) out.push(`svg avec ${l} ligne(s) (droite/grille ?)`)
    }
    if (document.querySelector('[class*="scatter"], [class*="regression-line"], [class*="nuage"]')) out.push('classe scatter/regression-line/nuage')
    return out
  })
  expect(found).toEqual([])
})

/* ------------------------------------------------------------------ (5) reduced-motion */
test.describe('scènes : prefers-reduced-motion', () => {
  test('aucun sticky, étapes à opacité 1, --p = 1 ou absent, aucune animation en cours', async ({ page }, ti) => {
    onlyDesktop(ti)
    await openHome(page, PINNED, true)
    const probe = () =>
      page.evaluate(() => {
        const out: string[] = []
        for (const s of document.querySelectorAll<HTMLElement>('article.scene')) {
          const name = [...s.classList].find((c) => c.startsWith('scene--'))
          const stage = getComputedStyle(s.querySelector('.scene-stage')!)
          if (stage.position !== 'static') out.push(`${name} : stage position ${stage.position}`)
          const p = getComputedStyle(s).getPropertyValue('--p').trim()
          if (p !== '' && p !== '1') out.push(`${name} : --p="${p}"`)
          if (s.hasAttribute('data-active')) out.push(`${name} : data-active posé`)
          if (s.offsetHeight > window.innerHeight * 2.4) out.push(`${name} : section haute (${s.offsetHeight}px)`)
          for (const st of s.querySelectorAll<HTMLElement>('.scene-step')) {
            let op = 1
            for (let n: HTMLElement | null = st; n && n !== document.documentElement; n = n.parentElement) op *= parseFloat(getComputedStyle(n).opacity)
            if (op < 0.999) out.push(`${name} : étape « ${st.textContent!.slice(0, 20)} » opacité ${op.toFixed(2)}`)
          }
        }
        const anims = document
          .getAnimations()
          .filter((a) => a.playState === 'running' || a.pending)
          .map((a) => `${(a as CSSAnimation).animationName ?? (a as CSSTransition).transitionProperty ?? a.constructor.name} sur ${(a.effect as KeyframeEffect | null)?.target?.className ?? '?'}`)
        for (const a of anims) out.push(`animation en cours : ${a}`)
        return out
      })
    expect(await probe(), 'haut de page').toEqual([])
    const bad: string[] = []
    await sweep(
      page,
      async (y) => {
        await page.waitForTimeout(250)
        for (const m of await probe()) bad.push(`y=${y} ${m}`)
      },
      700,
    )
    expect(bad).toEqual([])
  })

  test('reduced-motion : barre locale en opacité seule (aucun transform) et les 4 scènes lisibles', async ({ page }, ti) => {
    onlyDesktop(ti)
    await openHome(page, PINNED, true)
    await scrollToY(page, 1500)
    const bar = page.locator('nav.ap-local')
    await expect(bar).toBeVisible()
    await page.waitForTimeout(300)
    const tr = await bar.evaluate((e) => getComputedStyle(e).transform)
    expect(tr === 'none' || new DOMMatrixReadOnly(tr).isIdentity).toBe(true)
    await expect(page.getByRole('list', { name: /^Étapes : / })).toHaveCount(4)
  })
})

/* ------------------------------------------------------------------ (6) pas d'épinglage hors condition */
test.describe('scènes : flux normal hors épinglage', () => {
  const CASES = [
    { name: '1280 × 600 (trop bas)', width: 1280, height: 600 },
    { name: '1024 × 699 (juste sous le seuil de hauteur)', width: 1024, height: 699 },
    { name: '1023 × 900 (juste sous le seuil de largeur)', width: 1023, height: 900 },
    { name: '768 × 1024 (tablette)', width: 768, height: 1024 },
    { name: '375 × 812 (mobile)', width: 375, height: 812 },
  ]
  for (const c of CASES) {
    test(`${c.name} : pas d’épingle, contenu complet, pas de débordement horizontal`, async ({ page }, ti) => {
      onlyDesktop(ti)
      await openHome(page, { width: c.width, height: c.height })
      const res = await page.evaluate((vh) => {
        const out: string[] = []
        const scenes = [...document.querySelectorAll<HTMLElement>('article.scene')]
        if (scenes.length !== 4) out.push(`${scenes.length} scènes`)
        for (const s of scenes) {
          const name = [...s.classList].find((x) => x.startsWith('scene--'))
          const stage = s.querySelector<HTMLElement>('.scene-stage')!
          if (getComputedStyle(stage).position === 'sticky') out.push(`${name} : stage sticky`)
          if (s.offsetHeight > vh * 2.4) out.push(`${name} : section haute (${s.offsetHeight} px pour ${vh} px)`)
          if (s.hasAttribute('data-active')) out.push(`${name} : data-active`)
          const p = getComputedStyle(s).getPropertyValue('--p').trim()
          if (p !== '' && p !== '1') out.push(`${name} : --p="${p}"`)
          if (s.scrollWidth > s.clientWidth + 1) out.push(`${name} : débordement interne ${s.scrollWidth} > ${s.clientWidth}`)
          const steps = [...s.querySelectorAll<HTMLElement>('.scene-step')]
          if (steps.length === 0) out.push(`${name} : aucune étape`)
          for (const st of steps) {
            let op = 1
            for (let n: HTMLElement | null = st; n && n !== document.documentElement; n = n.parentElement) op *= parseFloat(getComputedStyle(n).opacity)
            const r = st.getBoundingClientRect()
            if (r.height === 0 || !st.innerText.trim()) out.push(`${name} : étape non rendue`)
            if (op < 0.999) out.push(`${name} : étape « ${st.textContent!.slice(0, 20)} » opacité ${op.toFixed(2)} (flux normal : 1 attendu)`)
          }
          const rs = s.getBoundingClientRect()
          if (rs.left < -1 || rs.right > window.innerWidth + 1) out.push(`${name} : hors de la largeur de la fenêtre`)
        }
        const w = document.documentElement
        if (w.scrollWidth > w.clientWidth) out.push(`page : scrollWidth ${w.scrollWidth} > clientWidth ${w.clientWidth}`)
        return out
      }, c.height)
      expect(res).toEqual([])
      // Contenu complet : toutes les étapes, le visuel et le lien de chaque scène.
      await expect(page.getByRole('list', { name: /^Étapes : / })).toHaveCount(4)
      await expect(page.getByRole('link', { name: /^En savoir plus sur / })).toHaveCount(4)
      const steps = await page.locator('.scene-step').evaluateAll((l) => l.length)
      expect(steps).toBe(17)
      // Balayage : toujours aucun débordement horizontal.
      const overflow: string[] = []
      await sweep(page, async (y) => {
        const o = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
        if (o > 0) overflow.push(`y=${y} +${o}px`)
      })
      expect(overflow).toEqual([])
    })
  }

  test('à 1024 × 700 (seuil exact) la scène est épinglée', async ({ page }, ti) => {
    onlyDesktop(ti)
    await openHome(page, { width: 1024, height: 700 })
    const pos = await page.locator('article.scene .scene-stage').first().evaluate((e) => getComputedStyle(e).position)
    expect(pos).toBe('sticky')
  })

  test('passer de 1280 × 800 à 1280 × 600 sans recharger retire l’épingle et --p', async ({ page }, ti) => {
    onlyDesktop(ti)
    await openHome(page, PINNED)
    const geo = await geometry(page)
    await scrollToY(page, geo[1].top + geo[1].travel * 0.5)
    expect(parseFloat(await readP(page, 1))).toBeGreaterThan(0.3)
    await page.setViewportSize({ width: 1280, height: 600 })
    await page.waitForTimeout(400)
    const r = await page.evaluate(() => {
      const s = document.querySelectorAll<HTMLElement>('article.scene')[1]
      return { pos: getComputedStyle(s.querySelector('.scene-stage')!).position, inline: s.style.getPropertyValue('--p'), active: s.hasAttribute('data-active') }
    })
    expect(r).toEqual({ pos: 'static', inline: '', active: false })
  })
})

/* ------------------------------------------------------------------ (7) CLS */
test.describe('scènes : CLS nul sur tout le balayage', () => {
  const VPS = [
    { name: 'desktop 1280 × 800', width: 1280, height: 800 },
    { name: 'tablette 768 × 1024', width: 768, height: 1024 },
    { name: 'mobile 375 × 812', width: 375, height: 812 },
  ]
  for (const v of VPS) {
    test(`${v.name} : CLS = 0 de haut en bas puis retour`, async ({ page }, ti) => {
      onlyDesktop(ti)
      await page.setViewportSize(v)
      await page.emulateMedia({ reducedMotion: 'no-preference' })
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
      await load(page, '/')
      await settle(page)
      await sweep(page, undefined, 150)
      await page.waitForTimeout(400)
      await sweep(page, undefined, 600)
      await scrollToY(page, 0)
      await page.waitForTimeout(500)
      const r = await page.evaluate(() => ({ cls: (window as unknown as { __cls: number }).__cls, e: (window as unknown as { __e: string[] }).__e }))
      expect(r.cls, JSON.stringify(r.e)).toBe(0)
    })
  }
})

/* ------------------------------------------------------------------ (8) barre locale */
test.describe('barre locale', () => {
  test('masquée en haut, visible après le hero ; aria-label distinct ; 44 px ; liens fonctionnels (≥ 768 px)', async ({ page }, ti) => {
    onlyDesktop(ti)
    await openHome(page, PINNED)
    const bar = page.locator('nav.ap-local')
    await expect(bar).toHaveCount(1)
    await expect(bar).toBeHidden() // visibility: hidden : ses liens ne sont pas focalisables
    await expect(page.getByRole('navigation', { name: 'Accès rapide de l’accueil' })).toHaveCount(0) // exclue de l'arbre tant que masquée
    // Encore dans le hero : toujours masquée.
    await scrollToY(page, 150)
    await page.waitForTimeout(300)
    await expect(bar).toBeHidden()
    // Hero quitté.
    const heroBottom = await page.evaluate(() => document.querySelector('.home-hero')!.getBoundingClientRect().bottom + window.scrollY)
    await scrollToY(page, heroBottom + 200)
    await expect(bar).toBeVisible()
    const local = page.getByRole('navigation', { name: 'Accès rapide de l’accueil' })
    await expect(local).toBeVisible()
    const labels = await page.evaluate(() => [...document.querySelectorAll('nav')].map((n) => n.getAttribute('aria-label') ?? n.getAttribute('aria-labelledby') ?? ''))
    expect(new Set(labels).size, `labels de navigation : ${JSON.stringify(labels)}`).toBe(labels.length)
    expect(labels.every((l) => l.length > 0)).toBe(true)
    const box = (await bar.boundingBox())!
    expect(box.height).toBeGreaterThanOrEqual(43.5)
    expect(box.height).toBeLessThanOrEqual(44.5)
    // Retour en haut : se masque de nouveau.
    await scrollToY(page, 0)
    await expect(bar).toBeHidden()
    // Liens.
    await scrollToY(page, heroBottom + 200)
    await expect(local.getByRole('link', { name: 'Alix Gouriet' })).toHaveAttribute('href', '/')
    const projets = local.getByRole('link', { name: 'Projets', exact: true })
    await expect(projets).toHaveAttribute('href', '/#projets')
    await projets.click()
    await expect(page).toHaveURL(/\/#projets$/)
    await expect.poll(() => page.evaluate(() => Math.round(document.getElementById('projets')!.getBoundingClientRect().top)), { timeout: 3000 }).toBeLessThanOrEqual(150)
    const contact = local.getByRole('link', { name: 'Me contacter', exact: true })
    await expect(contact).toHaveAttribute('href', '/contact')
    await contact.click()
    await expect(page).toHaveURL('/contact')
    await expect(page.locator('main h1')).toHaveText('Contact')
  })

  test('la barre locale est masquée sous 768 px (mobile 375 × 812)', async ({ page }, ti) => {
    onlyDesktop(ti)
    await openHome(page, { width: 375, height: 812 })
    await scrollToY(page, 2500)
    await page.waitForTimeout(400)
    await expect(page.locator('nav.ap-local')).toBeHidden()
    await expect(page.locator('nav.ap-local')).toHaveCSS('display', 'none')
    await expect(page.getByRole('navigation', { name: 'Accès rapide de l’accueil' })).toHaveCount(0)
    await page.setViewportSize({ width: 767, height: 900 })
    await page.reload()
    await settle(page)
    await scrollToY(page, 2500)
    await expect(page.locator('nav.ap-local')).toBeHidden()
    await page.setViewportSize({ width: 768, height: 1024 })
    await page.reload()
    await settle(page)
    await scrollToY(page, 2500)
    await expect(page.locator('nav.ap-local')).toBeVisible()
  })

  test('un seul backdrop-filter (barre principale) même barre locale affichée ; will-change absent au repos', async ({ page }, ti) => {
    onlyDesktop(ti)
    await openHome(page, PINNED)
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
    expect(top.wc, 'will-change au repos (haut de page)').toEqual([])
    expect(top.bf).toHaveLength(1)
    expect(top.bf[0]).toContain('ap-nav')
    const heroBottom = await page.evaluate(() => document.querySelector('.home-hero')!.getBoundingClientRect().bottom + window.scrollY)
    await scrollToY(page, heroBottom + 100)
    await expect(page.locator('nav.ap-local')).toBeVisible()
    const shown = await scan()
    expect(shown.bf, 'backdrop-filter, barre locale visible').toHaveLength(1)
    expect(shown.bf[0]).toContain('ap-nav')
    // Bas de page : plus aucune scène à l'écran, plus de will-change.
    await scrollToY(page, 1e7)
    await page.waitForTimeout(400)
    expect((await scan()).wc, 'will-change en bas de page').toEqual([])
  })

  test('will-change : posé seulement sur la scène à l’écran, retiré quand elle est sortie', async ({ page }, ti) => {
    onlyDesktop(ti)
    await openHome(page, PINNED)
    const geo = await geometry(page)
    const wcIn = (k: number) =>
      page.evaluate((i) => {
        const s = document.querySelectorAll('article.scene')[i]
        return { active: s.hasAttribute('data-active'), n: [...s.querySelectorAll('*')].filter((e) => getComputedStyle(e).willChange !== 'auto').length }
      }, k)
    await scrollToY(page, geo[0].top + geo[0].travel * 0.5)
    const on = await wcIn(0)
    expect(on.active).toBe(true)
    expect(on.n).toBeGreaterThan(0)
    // Loin de la scène 0 (scène 3 au milieu) : la scène 0 est inactive, sans will-change.
    await scrollToY(page, geo[3].top + geo[3].travel * 0.5)
    await page.waitForTimeout(200)
    expect(await wcIn(0)).toEqual({ active: false, n: 0 })
  })
})

/* ------------------------------------------------------------------ (9) focus clavier */
test('clavier : chaque lien « En savoir plus sur … » reste visible, hors des barres sticky', async ({ page }) => {
  await load(page, '/')
  await settle(page)
  await page.locator('main h1').focus()
  const seen: string[] = []
  const bad: string[] = []
  for (let i = 0; i < 140 && seen.length < 4; i++) {
    await page.keyboard.press('Tab')
    await page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))))
    const info = await page.evaluate(() => {
      const a = document.activeElement as HTMLElement | null
      if (!a || !/^En savoir plus sur /.test(a.textContent?.replace(/\s+/g, ' ').trim() ?? '')) return null
      const r = a.getBoundingClientRect()
      const barBottom = (sel: string) => {
        const b = document.querySelector<HTMLElement>(sel)
        if (!b) return 0
        const cs = getComputedStyle(b)
        return cs.display === 'none' || cs.visibility === 'hidden' ? 0 : b.getBoundingClientRect().bottom
      }
      const covering = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2)
      return {
        name: a.textContent!.replace(/\s+/g, ' ').trim(),
        top: r.top,
        bottom: r.bottom,
        vh: window.innerHeight,
        main: barBottom('.ap-nav'),
        local: barBottom('nav.ap-local'),
        ok: covering === a || a.contains(covering),
        cover: covering ? `${covering.tagName.toLowerCase()}.${covering.className}` : 'rien',
      }
    })
    if (!info) continue
    seen.push(info.name)
    const limit = Math.max(info.main, info.local)
    if (info.top < limit) bad.push(`« ${info.name} » haut ${Math.round(info.top)} < bas des barres ${Math.round(limit)}`)
    if (info.bottom > info.vh) bad.push(`« ${info.name} » bas ${Math.round(info.bottom)} > fenêtre ${info.vh}`)
    if (!info.ok) bad.push(`« ${info.name} » masqué par ${info.cover}`)
    await expect(page.getByRole('link', { name: info.name })).toBeInViewport()
  }
  expect(seen, 'liens « En savoir plus » atteints au clavier').toHaveLength(4)
  expect(bad).toEqual([])
})

/* ------------------------------------------------------------------ (10) console */
test.describe('console propre pendant le balayage de l’accueil', () => {
  for (const reduced of [false, true]) {
    test(`aucune erreur ni avertissement (reduced-motion : ${reduced})`, async ({ page }) => {
      const issues = watchConsole(page)
      await page.emulateMedia({ reducedMotion: reduced ? 'reduce' : 'no-preference' })
      await load(page, '/')
      await settle(page)
      await sweep(page, undefined, 250)
      await scrollToY(page, 0)
      await page.waitForTimeout(300)
      expect(issues).toEqual([])
    })
  }
})
