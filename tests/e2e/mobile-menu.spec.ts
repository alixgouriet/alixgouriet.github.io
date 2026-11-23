import { expect, test } from '@playwright/test'
import { MENU_BUTTON, NAV_LABELS, load } from './helpers'

const SHEET = 'dialog.ap-sheet'

test.describe('menu mobile (dialog plein écran)', () => {
  test.skip(({ viewport }) => viewport?.width !== 375, 'menu visible uniquement à 375 px')

  test('ouverture : dialog modal nommé « Menu », 5 liens + nom, focus dans le panneau, Échap rend le focus au bouton', async ({ page }) => {
    await load(page, '/')
    const btn = page.getByRole('button', MENU_BUTTON)
    await expect(btn).toBeVisible()
    await expect(page.locator(SHEET)).toBeHidden()
    await btn.click()
    const dlg = page.locator(SHEET)
    await expect(dlg).toBeVisible()
    await expect(dlg).toHaveAttribute('aria-label', 'Menu')
    expect(await dlg.evaluate((d: HTMLDialogElement) => d.open && d.matches(':modal'))).toBe(true)
    await expect(dlg.getByRole('link')).toHaveCount(6) // nom + 5 pages
    await expect(dlg.locator('nav[aria-label="Menu mobile"] a')).toHaveText(NAV_LABELS)
    // Plein écran : le panneau couvre tout le viewport.
    const box = (await dlg.boundingBox())!
    expect(Math.round(box.width)).toBe(375)
    expect(box.height).toBeGreaterThanOrEqual(800)
    // Le focus initial est sur « Accueil », dans la feuille.
    await expect(dlg.getByRole('link', { name: 'Accueil', exact: true })).toBeFocused()
    await page.keyboard.press('Escape')
    await expect(dlg).toBeHidden()
    await expect(btn).toBeFocused()
  })

  test('bouton Fermer ferme et rend le focus', async ({ page }) => {
    await load(page, '/')
    const btn = page.getByRole('button', MENU_BUTTON)
    await btn.click()
    await page.getByRole('button', { name: 'Fermer', exact: true }).click()
    await expect(page.locator(SHEET)).toBeHidden()
    await expect(btn).toBeFocused()
  })

  test('clic sur un lien ferme le menu et navigue (focus h1)', async ({ page }) => {
    await load(page, '/')
    await page.getByRole('button', MENU_BUTTON).click()
    await page.locator(SHEET).getByRole('link', { name: 'Projets', exact: true }).click()
    await expect(page).toHaveURL('/projets')
    await expect(page.locator(SHEET)).toBeHidden()
    await expect(page.locator('main h1')).toBeFocused()
  })

  test('le lien de la page courante est marqué aria-current dans le menu', async ({ page }) => {
    await load(page, '/competences')
    await page.getByRole('button', MENU_BUTTON).click()
    await expect(page.locator(`${SHEET} a[aria-current="page"]`)).toHaveText('Compétences')
  })

  test('le focus ne passe jamais derrière le menu (Tab)', async ({ page }) => {
    await load(page, '/')
    await page.getByRole('button', MENU_BUTTON).click()
    for (let i = 0; i < 10; i++) {
      await page.keyboard.press('Tab')
      // Un Tab peut sortir vers l'interface du navigateur (activeElement = body) : normal pour un dialog modal.
      expect(
        await page.evaluate(
          () => !!document.activeElement?.closest('header.ap-nav, main, footer.ap-footer, .ap-skip, .ap-promo') && !document.activeElement?.closest('dialog.ap-sheet'),
        ),
      ).toBe(false)
    }
  })

  test('passer à 1024 px ferme le menu ouvert', async ({ page }) => {
    await load(page, '/')
    await page.getByRole('button', MENU_BUTTON).click()
    await expect(page.locator(SHEET)).toBeVisible()
    await page.setViewportSize({ width: 1024, height: 800 })
    await expect(page.locator(SHEET)).toBeHidden()
  })
})

test("à ≥ 768 px la barre affiche les 5 liens et masque le bouton Menu", async ({ page }, info) => {
  test.skip(info.project.name === 'mobile-375')
  await load(page, '/')
  await expect(page.locator('nav.ap-nav__links')).toBeVisible()
  await expect(page.getByRole('button', MENU_BUTTON)).toBeHidden()
})
