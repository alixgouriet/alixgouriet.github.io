import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  fitLeastSquares,
  predict,
  residuals,
  rSquared,
  sumOfSquares,
  type Point,
} from '../../src/features/hero/math.ts'
import { points } from '../../src/features/hero/points.ts'
import { isSettled, runSpring, stepSpring, springConstants } from '../../src/features/hero/spring.ts'

describe('moindres carrés', () => {
  it('retrouve exactement une droite sans bruit', () => {
    const pts: Point[] = [0, 1, 2, 3, 4].map((x) => ({ x, y: 2 * x + 1 }))
    const line = fitLeastSquares(pts)
    expect(line.slope).toBeCloseTo(2, 10)
    expect(line.intercept).toBeCloseTo(1, 10)
    expect(sumOfSquares(pts, line)).toBeCloseTo(0, 10)
    expect(rSquared(pts, line)).toBeCloseTo(1, 10)
  })

  it('calcule un cas à la main', () => {
    // points (0,0) (1,1) (2,1) : pente 0,5 ; ordonnée 1/6 ; écarts -1/6, 1/3, -1/6
    const pts: Point[] = [
      { x: 0, y: 0 },
      { x: 1, y: 1 },
      { x: 2, y: 1 },
    ]
    const line = fitLeastSquares(pts)
    expect(line.slope).toBeCloseTo(0.5, 10)
    expect(line.intercept).toBeCloseTo(1 / 6, 10)
    expect(sumOfSquares(pts, line)).toBeCloseTo(1 / 6, 10)
    expect(rSquared(pts, line)).toBeCloseTo(1 - 1 / 6 / (2 / 3), 10)
  })

  it('refuse les entrées dégénérées', () => {
    expect(() => fitLeastSquares([{ x: 1, y: 1 }])).toThrow()
    expect(() =>
      fitLeastSquares([
        { x: 1, y: 1 },
        { x: 1, y: 2 },
      ]),
    ).toThrow()
  })

  it('la droite ajustée minimise la somme des carrés sur le nuage du hero', () => {
    const best = fitLeastSquares(points)
    const sse = sumOfSquares(points, best)
    for (const d of [-0.05, 0.05]) {
      expect(sumOfSquares(points, { ...best, slope: best.slope + d })).toBeGreaterThan(sse)
      expect(sumOfSquares(points, { ...best, intercept: best.intercept + d })).toBeGreaterThan(sse)
    }
    expect(points).toHaveLength(30)
    expect(rSquared(points, best)).toBeGreaterThan(0)
    expect(rSquared(points, best)).toBeLessThan(1)
  })

  it('les écarts de la droite ajustée somment à zéro', () => {
    const line = fitLeastSquares(points)
    const total = residuals(points, line).reduce((a, b) => a + b, 0)
    expect(total).toBeCloseTo(0, 8)
    expect(predict(line, 0)).toBeCloseTo(line.intercept, 10)
  })
})

describe('ressort', () => {
  it('converge vers la cible', () => {
    const k = springConstants({ duration: 0.6, bounce: 0.1 })
    let s = { x: 0, v: 0 }
    for (let i = 0; i < 2000; i++) s = stepSpring(s, 1, k, 0.002)
    expect(isSettled(s, 1)).toBe(true)
  })
})

describe('runSpring', () => {
  const frames: FrameRequestCallback[] = []
  let clock = 0
  const advance = (n: number) => {
    for (let i = 0; i < n; i++) {
      clock += 16
      const cb = frames.shift()
      if (cb) cb(clock)
    }
  }
  beforeEach(() => {
    frames.length = 0
    clock = 0
    vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) => frames.push(cb))
    vi.stubGlobal('cancelAnimationFrame', () => {
      frames.length = 0
    })
    vi.spyOn(performance, 'now').mockImplementation(() => clock)
  })
  afterEach(() => {
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })

  it('atteint exactement la cible puis appelle onDone une seule fois', () => {
    const last: number[][] = []
    const done = vi.fn()
    runSpring([0, 10], [1, 2], { duration: 0.6, bounce: 0.1 }, (v) => last.push(v), done)
    advance(120)
    expect(done).toHaveBeenCalledTimes(1)
    expect(last.at(-1)).toEqual([1, 2])
  })

  it("s'annule sans plus d'image ni onDone (la main reprend sans saut)", () => {
    const onFrame = vi.fn()
    const done = vi.fn()
    const cancel = runSpring([0], [1], { duration: 0.6, bounce: 0.1 }, onFrame, done)
    advance(5)
    const calls = onFrame.mock.calls.length
    cancel()
    advance(60)
    expect(onFrame.mock.calls.length).toBe(calls)
    expect(done).not.toHaveBeenCalled()
  })
})
