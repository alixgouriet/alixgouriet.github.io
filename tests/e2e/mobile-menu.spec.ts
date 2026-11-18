import { expect, test } from '@playwright/test'
import { load } from './helpers'

test.describe('menu mobile', () => {
  test.skip(({ viewport }) => viewport?.width !== 375, 'menu visible uniquement à 375 px')

  test('ouverture, focus initial, Échap, retour du focus au bouton', async ({ page }) => {
    await load(page, '/')
    const btn = page.getByRole('button', { name: 'Menu', exact: true })
    await expect(btn).toBeVisible()
    await btn.click()
    const dlg = page.locator('dialog.sheet')
    await expect(dlg).toBeVisible()
    await expect(dlg.getByRole('link')).toHaveCount(6)
    // Le focus doit être dans la feuille (showModal le place sur le premier élément focusable).
    await expect.poll(() => page.evaluate(() => !!document.activeElement?.closest('dialog.sheet'))).toBe(true)
    await page.keyboard.press('Escape')
    await expect(dlg).toBeHidden()
    await expect(btn).toBeFocused()
  })

  test('bouton Fermer ferme et rend le focus', async ({ page }) => {
    await load(page, '/')
    const btn = page.getByRole('button', { name: 'Menu', exact: true })
    await btn.click()
    await page.getByRole('button', { name: 'Fermer' }).click()
    await expect(page.locator('dialog.sheet')).toBeHidden()
    await expect(btn).toBeFocused()
  })

  test('clic sur un lien ferme le menu et navigue (focus h1)', async ({ page }) => {
    await load(page, '/')
    await page.getByRole('button', { name: 'Menu', exact: true }).click()
    await page.locator('dialog.sheet').getByRole('link', { name: 'Projets', exact: true }).click()
    await expect(page).toHaveURL('/projets')
    await expect(page.locator('dialog.sheet')).toBeHidden()
    await expect(page.locator('main h1')).toBeFocused()
  })

  test('le focus ne passe jamais derrière le menu (Tab)', async ({ page }) => {
    await load(page, '/')
    await page.getByRole('button', { name: 'Menu', exact: true }).click()
    for (let i = 0; i < 10; i++) {
      await page.keyboard.press('Tab')
      // Un Tab peut sortir vers l'interface du navigateur (activeElement = body) : normal pour un dialog modal.
      expect(await page.evaluate(() => !!document.activeElement?.closest('header, main, footer .wrap, .skip') && !document.activeElement?.closest('dialog.sheet'))).toBe(false)
    }
  })

  test('passer à 1024 px ferme le menu ouvert', async ({ page }) => {
    await load(page, '/')
    await page.getByRole('button', { name: 'Menu', exact: true }).click()
    await page.setViewportSize({ width: 1024, height: 800 })
    await expect(page.locator('dialog.sheet')).toBeHidden()
  })
})

test("à ≥768 px l'en-tête affiche la navigation et masque le bouton Menu", async ({ page }, info) => {
  test.skip(info.project.name === 'mobile-375')
  await load(page, '/')
  await expect(page.locator('nav.nav-desktop')).toBeVisible()
  await expect(page.getByRole('button', { name: 'Menu', exact: true })).toBeHidden()
})
