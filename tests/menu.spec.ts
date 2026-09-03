import { expect, test, type Page } from '@playwright/test'

import { settledBox } from './settled'

const MOBILE = { width: 320, height: 640 }
const DESKTOP = { width: 1440, height: 900 }

const menuOf = (page: Page) => page.locator('[data-menu]')
const toggleOf = (page: Page) => page.locator('[data-menu-toggle]')
const panelOf = (page: Page) => page.locator('[data-menu] nav')
const linkOf = (page: Page) =>
  menuOf(page).getByRole('link', { name: 'Заявка' })

test.describe('мобильное меню', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize(MOBILE)
    await page.goto('/')
  })

  test('закрыто при загрузке', async ({ page }) => {
    await expect(menuOf(page)).not.toHaveAttribute('open')
    await expect(linkOf(page)).toBeHidden()
    await expect(toggleOf(page)).toHaveAccessibleName('Открыть меню')
  })

  test('бургер раскрывает гармошку и меняет доступное имя', async ({
    page,
  }) => {
    await toggleOf(page).click()

    await expect(menuOf(page)).toHaveAttribute('open', '')
    await expect(linkOf(page)).toBeVisible()
    await expect(toggleOf(page)).toHaveAccessibleName('Закрыть меню')
  })

  test('гармошка не двигает первый экран', async ({ page }) => {
    const before = await settledBox(page, 'h1')

    await toggleOf(page).click()
    await expect(panelOf(page)).toBeVisible()

    expect(await page.locator('h1').boundingBox()).toStrictEqual(before)
  })

  test('повторный клик по бургеру складывает гармошку', async ({ page }) => {
    await toggleOf(page).click()
    await expect(linkOf(page)).toBeVisible()

    await toggleOf(page).click()

    await expect(menuOf(page)).not.toHaveAttribute('open')
    await expect(linkOf(page)).toBeHidden()
    await expect(toggleOf(page)).toHaveAccessibleName('Открыть меню')
  })

  test('Esc закрывает меню и возвращает фокус на бургер', async ({ page }) => {
    await toggleOf(page).click()
    await page.keyboard.press('Escape')

    await expect(menuOf(page)).not.toHaveAttribute('open')
    await expect(toggleOf(page)).toBeFocused()
  })

  test('клик по якорю закрывает меню', async ({ page }) => {
    await toggleOf(page).click()
    await linkOf(page).click()

    await expect(menuOf(page)).not.toHaveAttribute('open')
    expect(new URL(page.url()).hash).toBe('#request')
  })

  test('клик мимо панели закрывает меню', async ({ page }) => {
    await toggleOf(page).click()

    const panel = await panelOf(page).boundingBox()

    if (panel === null) throw new Error('нет бокса у панели меню')

    await page.mouse.click(MOBILE.width / 2, panel.y + panel.height + 40)

    await expect(menuOf(page)).not.toHaveAttribute('open')
  })

  test('выше порога гармошка не нужна: список виден, бургера нет', async ({
    page,
  }) => {
    await page.setViewportSize(DESKTOP)

    await expect(toggleOf(page)).toBeHidden()
    await expect(linkOf(page)).toBeVisible()
  })
})
