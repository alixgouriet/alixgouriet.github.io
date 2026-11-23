/**
 * Moteur des scènes épinglées de l'accueil.
 *
 * Une scène est une section haute (`.scene`) qui contient un `.scene-stage` en `position: sticky`
 * de 100svh. Le défilement reste NATIF : on ne retient, ne détourne ni ne lisse jamais la molette.
 * Ce module ne fait qu'une chose : écrire la progression 0 → 1 de la scène dans `--p` sur la section ;
 * le CSS en déduit opacité et transform par `calc()` (voir scenes.css).
 *
 * Coût :
 *  - UN seul écouteur `scroll` passif et UN seul rAF pour toutes les scènes ;
 *  - seules les scènes visibles (IntersectionObserver) sont mises à jour ;
 *  - aucune lecture de mise en page dans la boucle : positions mises en cache, rafraîchies par
 *    ResizeObserver (scène, corps de page) et au changement de mode ;
 *  - écriture de `--p` seulement quand la valeur (arrondie au millième) change.
 *
 * Mode épinglé : écran ≥ 1024 px de large ET ≥ 700 px de haut, sans reduced-motion. Hors de ce mode,
 * le moteur est inerte : aucune propriété posée, le CSS montre l'état final en flux normal.
 * Fonctionne partout (aucune dépendance à `animation-timeline`).
 */

interface SceneEntry {
  el: HTMLElement
  top: number
  travel: number
  p: number
  visible: boolean
}

export const PINNED_QUERY = '(min-width: 1024px) and (min-height: 700px) and (prefers-reduced-motion: no-preference)'

const entries = new Map<HTMLElement, SceneEntry>()
let io: IntersectionObserver | null = null
let ro: ResizeObserver | null = null
let mq: MediaQueryList | null = null
let pinned = false
let raf = 0
let measureRaf = 0

const clamp01 = (n: number) => (n < 0 ? 0 : n > 1 ? 1 : n)

/** Seule lecture de mise en page : appelée à l'inscription, au redimensionnement et au changement de mode. */
function measure(e: SceneEntry) {
  const stage = e.el.querySelector<HTMLElement>('.scene-stage')
  e.top = e.el.getBoundingClientRect().top + window.scrollY
  e.travel = Math.max(1, e.el.offsetHeight - (stage?.offsetHeight ?? window.innerHeight))
}

function write(e: SceneEntry, y: number) {
  const p = Math.round(clamp01((y - e.top) / e.travel) * 1000) / 1000
  if (p === e.p) return
  e.p = p
  e.el.style.setProperty('--p', String(p))
}

function frame() {
  raf = 0
  const y = window.scrollY
  for (const e of entries.values()) if (e.visible) write(e, y)
}

function onScroll() {
  if (!raf) raf = requestAnimationFrame(frame)
}

function measureAll() {
  measureRaf = 0
  if (!pinned) return
  const y = window.scrollY
  for (const e of entries.values()) {
    measure(e)
    write(e, y)
  }
}

function scheduleMeasure() {
  if (!measureRaf) measureRaf = requestAnimationFrame(measureAll)
}

function onIntersect(list: IntersectionObserverEntry[]) {
  const y = window.scrollY
  for (const it of list) {
    const e = entries.get(it.target as HTMLElement)
    if (!e) continue
    e.visible = it.isIntersecting
    // `data-active` : le CSS ne pose will-change que pendant que la scène est à l'écran.
    if (pinned && e.visible) e.el.setAttribute('data-active', '')
    else e.el.removeAttribute('data-active')
    // À la sortie, on fige la valeur finale (0 ou 1) pour que l'état soit juste quand on revient.
    if (pinned) write(e, y)
  }
}

function setMode(on: boolean) {
  pinned = on
  if (on) {
    window.addEventListener('scroll', onScroll, { passive: true })
    for (const e of entries.values()) e.p = -1
    measureAll()
  } else {
    window.removeEventListener('scroll', onScroll)
    for (const e of entries.values()) {
      e.p = -1
      e.el.style.removeProperty('--p')
      e.el.removeAttribute('data-active')
    }
  }
}

function boot() {
  if (io) return
  io = new IntersectionObserver(onIntersect, { rootMargin: '120px 0px' })
  ro = new ResizeObserver(scheduleMeasure)
  ro.observe(document.body)
  mq = window.matchMedia(PINNED_QUERY)
  mq.addEventListener('change', (ev) => setMode(ev.matches))
  pinned = mq.matches
  if (pinned) window.addEventListener('scroll', onScroll, { passive: true })
}

function shutdown() {
  if (entries.size > 0) return
  window.removeEventListener('scroll', onScroll)
  cancelAnimationFrame(raf)
  cancelAnimationFrame(measureRaf)
  raf = measureRaf = 0
  io?.disconnect()
  ro?.disconnect()
  io = ro = null
  mq = null
}

/** Inscrit une scène ; renvoie la fonction de désinscription. */
export function registerScene(el: HTMLElement): () => void {
  boot()
  const e: SceneEntry = { el, top: 0, travel: 1, p: -1, visible: true }
  entries.set(el, e)
  io!.observe(el)
  ro!.observe(el)
  if (pinned) {
    measure(e)
    write(e, window.scrollY) // avant la première peinture (appelé depuis un useLayoutEffect)
  }
  return () => {
    entries.delete(el)
    io?.unobserve(el)
    ro?.unobserve(el)
    el.style.removeProperty('--p')
    el.removeAttribute('data-active')
    shutdown()
  }
}

/** Début (en progression 0 → 1) de l'apparition de l'étape `i` sur `n`. L'étape 0 est visible dès le départ. */
export function stepStart(i: number, n: number): number {
  return i === 0 ? -1 : Math.round((i / n - 0.05) * 1000) / 1000
}
