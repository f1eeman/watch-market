import { expect, test, type Page } from '@playwright/test'

const cardOf = (page: Page) => page.locator('[data-bid-card]')
const nameOf = (page: Page) => page.locator('[data-bid-name]')
const phoneOf = (page: Page) => page.locator('[data-bid-phone]')
const submitOf = (page: Page) =>
  page.locator('[data-bid-form]').getByRole('button', { name: 'Отправить' })

test.describe('форма заявки', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await cardOf(page).scrollIntoViewIfNeeded()
  })

  test('пустая отправка называет оба поля и ставит фокус в первое', async ({
    page,
  }) => {
    await submitOf(page).click()

    await expect(page.locator('#bid-name-error')).toHaveText('Укажите имя')
    await expect(page.locator('#bid-phone-error')).toHaveText(
      'Укажите номер телефона',
    )
    await expect(nameOf(page)).toBeFocused()
    await expect(cardOf(page)).not.toHaveAttribute('data-bid-state')
  })

  test('цифры ложатся группами 3–3–2–2 после кода страны', async ({ page }) => {
    await phoneOf(page).click()
    await page.keyboard.type('011234567')

    await expect(phoneOf(page)).toHaveValue('+7 701 123 45 67')

    await phoneOf(page).press('Backspace')

    await expect(phoneOf(page)).toHaveValue('+7 701 123 45 6')
  })

  test('имя не принимает цифры', async ({ page }) => {
    await nameOf(page).click()
    await page.keyboard.type('Иван1234')

    await expect(nameOf(page)).toHaveValue('Иван')
  })

  test('неполный номер не проходит, полный подменяет карточку', async ({
    page,
  }) => {
    await nameOf(page).fill('Иван')
    await phoneOf(page).click()
    await page.keyboard.type('01123')

    await submitOf(page).click()

    await expect(page.locator('#bid-phone-error')).toHaveText(
      'Введите номер полностью',
    )

    await page.keyboard.type('4567')
    await submitOf(page).click()

    await expect(cardOf(page)).toHaveAttribute('data-bid-state', 'done')
    await expect(
      cardOf(page).getByRole('heading', { name: 'Заявка отправлена' }),
    ).toBeVisible()
  })

  test('«Закрыть» возвращает пустую форму', async ({ page }) => {
    await nameOf(page).fill('Иван')
    await phoneOf(page).click()
    await page.keyboard.type('011234567')
    await submitOf(page).click()

    await cardOf(page).getByRole('button', { name: 'Закрыть' }).click()

    await expect(cardOf(page)).not.toHaveAttribute('data-bid-state')
    await expect(nameOf(page)).toHaveValue('')
    await expect(phoneOf(page)).toHaveValue('')
  })
})
