/** Ressort amorti, intégré image par image (rAF). Interruptible via la fonction retournée. */

export interface SpringOptions {
  /** Durée perçue, en secondes. */
  duration: number
  /** 0 = amorti sans rebond ; valeurs faibles = léger dépassement. */
  bounce: number
}

export interface SpringState {
  x: number
  v: number
}

export function springConstants({ duration, bounce }: SpringOptions) {
  const omega = (2 * Math.PI) / duration
  return { stiffness: omega * omega, damping: (4 * Math.PI * (1 - bounce)) / duration }
}

/** Un pas d'Euler semi-implicite (masse 1). */
export function stepSpring(
  s: SpringState,
  target: number,
  k: { stiffness: number; damping: number },
  dt: number,
): SpringState {
  const a = k.stiffness * (target - s.x) - k.damping * s.v
  const v = s.v + a * dt
  return { x: s.x + v * dt, v }
}

export function isSettled(s: SpringState, target: number): boolean {
  return Math.abs(target - s.x) < 0.0005 && Math.abs(s.v) < 0.0005
}

/**
 * Anime des valeurs de `from` vers `to`. `onFrame` reçoit les valeurs courantes ;
 * `onDone` est appelé une fois posé sur `to`. Retourne une fonction d'annulation
 * (la main reprend alors depuis la dernière valeur émise, sans saut).
 */
export function runSpring(
  from: number[],
  to: number[],
  options: SpringOptions,
  onFrame: (values: number[]) => void,
  onDone: () => void,
): () => void {
  const k = springConstants(options)
  let states: SpringState[] = from.map((x) => ({ x, v: 0 }))
  let last = performance.now()
  let started = last
  let id = 0
  let cancelled = false

  const frame = (now: number) => {
    if (cancelled) return
    let dt = Math.min((now - last) / 1000, 0.032)
    last = now
    // Sous-pas pour rester stable quel que soit le débit d'images.
    const sub = 4
    dt /= sub
    for (let i = 0; i < sub; i++) states = states.map((s, j) => stepSpring(s, to[j], k, dt))
    const settled = states.every((s, j) => isSettled(s, to[j])) || now - started > 2000
    if (settled) {
      onFrame(to)
      onDone()
      return
    }
    onFrame(states.map((s) => s.x))
    id = requestAnimationFrame(frame)
  }
  id = requestAnimationFrame((t) => {
    last = t
    started = t
    frame(t)
  })

  return () => {
    cancelled = true
    cancelAnimationFrame(id)
  }
}
