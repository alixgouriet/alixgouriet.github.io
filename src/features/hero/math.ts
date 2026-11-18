export interface Point {
  x: number
  y: number
}

export interface Line {
  slope: number
  intercept: number
}

const mean = (values: number[]) => values.reduce((a, b) => a + b, 0) / values.length

/** Moindres carrés ordinaires pour y = pente × x + ordonnée. */
export function fitLeastSquares(points: Point[]): Line {
  if (points.length < 2) throw new Error('Au moins deux points sont nécessaires.')
  const mx = mean(points.map((p) => p.x))
  const my = mean(points.map((p) => p.y))
  let sxy = 0
  let sxx = 0
  for (const p of points) {
    sxy += (p.x - mx) * (p.y - my)
    sxx += (p.x - mx) ** 2
  }
  if (sxx === 0) throw new Error('Les abscisses sont toutes identiques.')
  const slope = sxy / sxx
  return { slope, intercept: my - slope * mx }
}

export function predict(line: Line, x: number): number {
  return line.slope * x + line.intercept
}

/** Écart (observé − prédit) pour chaque point. */
export function residuals(points: Point[], line: Line): number[] {
  return points.map((p) => p.y - predict(line, p.x))
}

export function sumOfSquares(points: Point[], line: Line): number {
  return residuals(points, line).reduce((acc, r) => acc + r * r, 0)
}

/** R² = 1 − somme des carrés des écarts / somme des carrés totale. */
export function rSquared(points: Point[], line: Line): number {
  const my = mean(points.map((p) => p.y))
  const total = points.reduce((acc, p) => acc + (p.y - my) ** 2, 0)
  if (total === 0) return 1
  return 1 - sumOfSquares(points, line) / total
}
