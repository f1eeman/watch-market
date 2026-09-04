import { expect, test, type Page } from '@playwright/test'

const groupOf = (page: Page, index: number) =>
  page.locator('.panel-body > details').nth(index)

const fromOf = (page: Page) => page.locator('[data-range-from]')
const toOf = (page: Page) => page.locator('[data-range-to]')

const setRange = async (page: Page, side: 'from' | 'to', value: string) => {
  const input = side === 'from' ? fromOf(page) : toOf(page)

  await input.evaluate((el, next) => {
    const field = el as HTMLInputElement

    field.value = next
    field.dispatchEvent(new Event('input', { bubbles: true }))
  }, value)
}

test.beforeEach(async ({ page }) => {
  await page.goto('/catalog/')
})

test('сетка держит восемь товаров и один баннер', async ({ page }) => {
  await expect(page.locator('.wrap .grid > li')).toHaveCount(9)
  await expect(page.locator('.wrap .grid a[href="/product/"]')).toHaveCount(8)
  await expect(page.getByText('-20%')).toBeVisible()
})

test('плитка ведёт в карточку товара', async ({ page }) => {
  await page.locator('.wrap .grid > li').first().locator('a').click()

  await expect(page).toHaveURL(/\/product\/$/)
})

test.describe('слайдер стоимости', () => {
  test('края — измеренные границы макета', async ({ page }) => {
    await expect(fromOf(page)).toHaveValue('12000')
    await expect(toOf(page)).toHaveValue('90000')
    await expect(page.locator('[data-range-from-out]')).toHaveText('12 000')
    await expect(page.locator('[data-range-to-out]')).toHaveText('90 000')
  })

  test('сдвиг ручки меняет подпись и активный отрезок', async ({ page }) => {
    await setRange(page, 'from', '50000')

    await expect(page.locator('[data-range-from-out]')).toHaveText('50 000')

    const share = await page
      .locator('[data-range]')
      .evaluate((el) => el.style.getPropertyValue('--range-from'))

    expect(Number.parseFloat(share)).toBeGreaterThan(40)
  })

  test('край ручки не срезан гармошкой', async ({ page }) => {
    await expect
      .poll(async () =>
        page.evaluate(() => {
          const track = document.querySelector('[data-range-track]')

          if (track === null) return false

          const box = track.getBoundingClientRect()
          const el = document.elementFromPoint(box.x - 3, box.y + 5)

          return (
            el instanceof HTMLElement && el.closest('[data-range]') !== null
          )
        }),
      )
      .toBe(true)
  })

  test('ручки не перехлёстываются', async ({ page }) => {
    await setRange(page, 'to', '30000')
    await setRange(page, 'from', '80000')

    await expect(fromOf(page)).toHaveValue('30000')
  })
})

test.describe('гармошки фильтра', () => {
  test('стоимость и бренд раскрыты, остальные три свёрнуты', async ({
    page,
  }) => {
    await expect(groupOf(page, 0)).toHaveAttribute('open', '')
    await expect(groupOf(page, 1)).toHaveAttribute('open', '')

    for (const index of [2, 3, 4])
      await expect(groupOf(page, index)).not.toHaveAttribute('open')
  })

  test('свёрнутая группа раскрывается и показывает значения', async ({
    page,
  }) => {
    const group = groupOf(page, 2)

    await group.locator('summary').click()

    await expect(group).toHaveAttribute('open', '')
    await expect(group.locator('.option')).not.toHaveCount(0)
  })

  test('отмеченные бренды перенесены из макета', async ({ page }) => {
    const checked = page.locator('input[name="brand"]:checked')

    await expect(checked).toHaveCount(3)

    for (const brand of ['Techne', 'Rado', 'Bvlgari'])
      await expect(page.locator(`input[value="${brand}"]`)).toBeChecked()
  })

  test('сброс снимает отметки', async ({ page }) => {
    await page.getByRole('button', { name: 'сбросить фильтр' }).click()

    await expect(page.locator('input[name="brand"]:checked')).toHaveCount(3)
  })
})

test('ниже порога фильтр складывается в одну гармошку', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 800 })

  const toggle = page.locator('.panel-toggle')

  await expect(toggle).toBeVisible()

  await toggle.click()

  await expect(page.locator('.body > .panel')).not.toHaveAttribute('open')
})
