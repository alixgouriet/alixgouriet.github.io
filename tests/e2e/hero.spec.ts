import { expect, test, type Page } from '@playwright/test'
import { fitLeastSquares, rSquared } from '../../src/features/hero/math'
import { points } from '../../src/features/hero/points'
import { load } from './helpers'

const nf2 = new Intl.NumberFormat('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
const expectedR2 = nf2.format(rSquared(points, fitLeastSquares(points)))
const sse = (page: Page) => page.locator('.reg-sse-value').innerText()

test('curseurs au clavier : somme des carrés et aria-valuetext changent', async ({ page }) => {
  await load(page, '/')
  const slope = page.locator('.reg-slider input').nth(0)
  const inter = page.locator('.reg-slider input').nth(1)
  const s0 = await sse(page)
  await expect(slope).toHaveAttribute('aria-valuetext', 'Pente 0,15')
  await slope.focus()
  for (let i = 0; i < 3; i++) await page.keyboard.press('ArrowRight')
  await expect(slope).toHaveAttribute('aria-valuetext', 'Pente 0,18')
  const s1 = await sse(page)
  expect(s1).not.toBe(s0)
  await inter.focus()
  await page.keyboard.press('ArrowLeft')
  await page.keyboard.press('ArrowLeft')
  await expect(inter).toHaveAttribute('aria-valuetext', /Ordonnée à l'origine 5,90/)
  expect(await sse(page)).not.toBe(s1)
  await expect(page.locator('svg.reg-svg')).toHaveAttribute('aria-label', /pente 0,18/)
  await expect(page.getByText(/R² =/)).toHaveCount(0)
})

test('Ajuster automatiquement atteint le R² attendu puis Réinitialiser', async ({ page }) => {
  await load(page, '/')
  const s0 = await sse(page)
  await page.getByRole('button', { name: 'Ajuster automatiquement' }).click()
  await expect(page.locator('.reg-r2')).toHaveText(`R² = ${expectedR2}`, { timeout: 3000 })
  await expect(page.getByRole('button', { name: 'Réinitialiser' })).toBeVisible()
  const fitted = await sse(page)
  expect(fitted).not.toBe(s0)
  console.log('R² attendu', expectedR2, '| SSE initiale', s0, '| SSE ajustée', fitted)
  await page.getByRole('button', { name: 'Réinitialiser' }).click()
  await expect(page.getByRole('button', { name: 'Ajuster automatiquement' })).toBeVisible({ timeout: 3000 })
  await expect(page.locator('.reg-r2')).toHaveCount(0)
  await expect.poll(() => sse(page)).toBe(s0)
  await expect(page.locator('.reg-slider input').nth(0)).toHaveAttribute('aria-valuetext', 'Pente 0,15')
})

test("toucher un curseur pendant l'ajustement l'interrompt", async ({ page }) => {
  await load(page, '/')
  await page.getByRole('button', { name: 'Ajuster automatiquement' }).click()
  await page.locator('.reg-slider input').nth(0).focus()
  await page.keyboard.press('ArrowRight')
  await page.waitForTimeout(900)
  await expect(page.locator('.reg-r2')).toHaveCount(0)
  await expect(page.getByRole('button', { name: 'Ajuster automatiquement' })).toBeVisible()
})

test.describe('prefers-reduced-motion', () => {
  test("droite ajustée d'emblée, bascule instantanée", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await load(page, '/')
    await expect(page.locator('.reg-r2')).toHaveText(`R² = ${expectedR2}`)
    await page.getByRole('button', { name: 'Réinitialiser' }).click()
    await expect(page.locator('.reg-slider input').nth(0)).toHaveAttribute('aria-valuetext', 'Pente 0,15')
    await expect(page.locator('.reg-r2')).toHaveCount(0)
    await page.getByRole('button', { name: 'Ajuster automatiquement' }).click()
    await expect(page.locator('.reg-r2')).toHaveText(`R² = ${expectedR2}`, { timeout: 300 })
  })

  test('aucune animation infinie active', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await load(page, '/')
    const running = await page.evaluate(
      () => document.getAnimations().filter((a) => a.playState === 'running' && a.effect?.getComputedTiming().iterations === Infinity).length,
    )
    expect(running).toBe(0)
  })
})
