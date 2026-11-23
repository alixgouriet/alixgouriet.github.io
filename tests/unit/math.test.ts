import { describe, expect, it } from 'vitest'
import {
  fitLeastSquares,
  predict,
  residuals,
  rSquared,
  sumOfSquares,
  type Point,
} from '../../src/features/hero/math.ts'
import { points } from '../../src/features/hero/points.ts'

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
