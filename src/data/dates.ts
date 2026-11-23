import type { Semester } from './types.ts'

export const MONTHS = [
  'Janvier',
  'Février',
  'Mars',
  'Avril',
  'Mai',
  'Juin',
  'Juillet',
  'Août',
  'Septembre',
  'Octobre',
  'Novembre',
  'Décembre',
] as const

export function formatPeriod(year: number, month: number): string {
  return `${MONTHS[month - 1]} ${year}`
}

/** Semestre 1 : septembre à janvier. Semestre 2 : février à août. */
export function semesterOf(month: number): Semester {
  return month >= 9 || month === 1 ? 1 : 2
}

/** Champs de date d'un projet, cohérents entre eux. */
export function when(year: number, month: number) {
  return { year, month, period: formatPeriod(year, month), semester: semesterOf(month) }
}
