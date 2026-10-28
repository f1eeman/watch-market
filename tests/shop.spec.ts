import { expect, test, type Page } from '@playwright/test'

const amounts = (page: Page) =>
  page
    .locator('#catalog-grid > li[data-sort-amount]')
    .evaluateAll((items) =>
      items.map((item) =>
        Number.parseFloat(
          item instanceof HTMLElement
            ? (item.dataset['sortAmount'] ?? '0')
            : '0',
        ),
      ),
    )

const bags = (page: Page) =>
  page.evaluate(() => ({
    favourites: localStorage.getItem('conquest:favourites'),
    cart: localStorage.getItem('conquest:cart'),
  }))

test.describe('сортировка каталога', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/catalog/')
  })

  test('список открывается и содержит четыре правила', async ({ page }) => {
    await expect(page.locator('.sort-menu')).toBeHidden()

    await page.locator('.sort-toggle').click()

    await expect(page.locator('.sort-menu')).toBeVisible()
    await expect(page.locator('.sort-option')).toHaveCount(4)
  })

  test('сначала дешёвые и сначала дорогие', async ({ page }) => {
    await page.locator('.sort-toggle').click()
    await page.locator('[data-sort-rule="cheap"]').click()

    const cheap = await amounts(page)

    expect(cheap).toStrictEqual([...cheap].sort((a, b) => a - b))
    await expect(page.locator('[data-sort-value]')).toHaveText(
      'цене: сначала дешёвые',
    )

    await page.locator('.sort-toggle').click()
    await page.locator('[data-sort-rule="costly"]').click()

    const costly = await amounts(page)

    expect(costly).toStrictEqual([...costly].sort((a, b) => b - a))
  })

  test('баннер −20% остаётся на своём месте', async ({ page }) => {
    await page.locator('.sort-toggle').click()
    await page.locator('[data-sort-rule="costly"]').click()

    const pinned = page.locator('#catalog-grid > li').nth(5)

    await expect(pinned).toHaveAttribute('data-sort-pin', '')
    await expect(pinned.getByText('-20%')).toBeVisible()
  })

  test('популярности возвращает исходный порядок', async ({ page }) => {
    const first = await amounts(page)

    await page.locator('.sort-toggle').click()
    await page.locator('[data-sort-rule="cheap"]').click()
    await page.locator('.sort-toggle').click()
    await page.locator('[data-sort-rule="popular"]').click()

    expect(await amounts(page)).toStrictEqual(first)
  })
})

test.describe('избранное и корзина', () => {
  test('кладутся в localStorage и переживают перезагрузку', async ({
    page,
  }) => {
    await page.goto('/catalog/')

    const cell = page.locator('.cell').first()

    await cell.hover()
    await cell.locator('[data-bag="favourites"]').click()
    await cell.locator('[data-bag="cart"]').click()

    await expect(page.locator('[data-bag-count="favourites"]')).toHaveText('1')
    await expect(page.locator('[data-bag-count="cart"]')).toHaveText('1')
    expect(await bags(page)).toStrictEqual({
      favourites: '["catalog-1"]',
      cart: '["catalog-1"]',
    })

    await page.reload()

    await expect(page.locator('[data-bag-count="favourites"]')).toHaveText('1')
    await expect(
      page.locator('.cell').first().locator('[data-bag="favourites"]'),
    ).toHaveAttribute('aria-pressed', 'true')
  })

  test('повторное нажатие убирает', async ({ page }) => {
    await page.goto('/catalog/')

    const button = page.locator('.cell').first().locator('[data-bag="cart"]')

    await page.locator('.cell').first().hover()
    await button.click()
    await expect(button).toHaveAttribute('aria-pressed', 'true')

    await button.click()

    await expect(button).toHaveAttribute('aria-pressed', 'false')
    await expect(page.locator('[data-bag-count="cart"]')).toBeHidden()
  })

  test('панель шапки показывает отложенное и даёт убрать', async ({ page }) => {
    await page.goto('/catalog/')

    const cell = page.locator('.cell').first()

    await cell.hover()
    await cell.locator('[data-bag="favourites"]').click()

    await page.locator('[data-bag-panel="favourites"] .icon-button').click()

    const rows = page.locator('[data-bag-list="favourites"] .shop-row')

    await expect(rows).toHaveCount(1)
    await expect(rows.first()).toContainText('TECHNE')

    await rows.first().locator('.shop-drop').click()

    await expect(rows).toHaveCount(0)
    await expect(page.locator('[data-bag-empty="favourites"]')).toBeVisible()
  })

  test('плитка показывает, что товар отложен', async ({ page }) => {
    await page.goto('/catalog/')

    const cell = page.locator('.cell').first()
    const heart = cell.locator('[data-bag="favourites"]')

    await cell.hover()

    await expect(heart.locator('.glyph-off')).toBeVisible()
    await expect(heart.locator('.glyph-on')).toBeHidden()

    await heart.click()

    await expect(heart.locator('.glyph-off')).toBeHidden()
    await expect(heart.locator('.glyph-on')).toBeVisible()
  })

  test('иконка в корзине выворачивается на тёмном', async ({ page }) => {
    await page.goto('/catalog/')

    const cell = page.locator('.cell').first()
    const basket = cell.locator('[data-bag="cart"]')
    const fill = async () =>
      basket.locator('path').evaluate((node) => getComputedStyle(node).fill)

    await cell.hover()

    expect(await fill()).not.toBe('rgb(255, 255, 255)')

    await basket.click()

    expect(await fill()).toBe('rgb(255, 255, 255)')
  })

  test('карточка товара показывает оба состояния', async ({ page }) => {
    await page.goto('/product/')

    const heart = page.locator('.info [data-bag="favourites"]')
    const cart = page.locator('.info [data-bag="cart"]')

    await expect(heart.locator('.glyph-on')).toBeHidden()
    await expect(cart.locator('.glyph-off')).toHaveText('В корзину')
    await expect(cart.locator('.glyph-on')).toBeHidden()

    await heart.click()
    await cart.click()

    await expect(heart.locator('.glyph-on')).toBeVisible()
    await expect(heart.locator('.glyph-off')).toBeHidden()
    await expect(cart.locator('.glyph-on')).toHaveText('Убрать из корзины')
    await expect(cart.locator('.glyph-off')).toBeHidden()
  })

  test('кнопки карточки товара кладут её же', async ({ page }) => {
    await page.goto('/product/')

    await page.locator('.info [data-bag="favourites"]').click()
    await page.locator('.info [data-bag="cart"]').click()

    expect(await bags(page)).toStrictEqual({
      favourites: '["kulte-26"]',
      cart: '["kulte-26"]',
    })
  })

  test('состояние видно на любой странице', async ({ page }) => {
    await page.goto('/product/')
    await page.locator('.info [data-bag="cart"]').click()

    await page.goto('/')

    await expect(page.locator('[data-bag-count="cart"]')).toHaveText('1')
  })
})

test.describe('поиск', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.locator('[data-search] .icon-button').click()
  })

  test('ищет по бренду и по цене, пробелы не мешают', async ({ page }) => {
    const field = page.locator('[data-search-field]')
    const hits = page.locator('[data-search-results] .search-hit')

    await field.fill('rado')
    await expect(hits).toHaveCount(2)

    await field.fill('12700')
    await expect(hits).toHaveCount(2)

    await field.fill('12 700')
    await expect(hits).toHaveCount(2)
  })

  test('на пустой запрос ничего не показывает', async ({ page }) => {
    await expect(page.locator('[data-search-results] li')).toHaveCount(0)
    await expect(page.locator('[data-search-empty]')).toBeHidden()
  })

  test('говорит, когда не нашёл', async ({ page }) => {
    await page.locator('[data-search-field]').fill('щщщ')

    await expect(page.locator('[data-search-empty]')).toBeVisible()
    await expect(page.locator('[data-search-results] li')).toHaveCount(0)
  })

  test('находка ведёт в карточку товара', async ({ page }) => {
    await page.locator('[data-search-field]').fill('rado')
    await page.locator('[data-search-results] .search-hit').first().click()

    await expect(page).toHaveURL(/\/product\/$/)
  })

  test('Esc закрывает панель', async ({ page }) => {
    await expect(page.locator('[data-search-field]')).toBeVisible()

    await page.keyboard.press('Escape')

    await expect(page.locator('[data-search]')).not.toHaveAttribute('open', '')
  })
})

test.describe('панели шапки закрываются', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.locator('[data-bag-panel="cart"] .icon-button').click()
  })

  test('по Esc, и фокус возвращается на кнопку', async ({ page }) => {
    await page.keyboard.press('Escape')

    await expect(page.locator('[data-bag-panel="cart"]')).not.toHaveAttribute(
      'open',
      '',
    )
    await expect(
      page.locator('[data-bag-panel="cart"] .icon-button'),
    ).toBeFocused()
  })

  test('по нажатию мимо', async ({ page }) => {
    await page.mouse.click(20, 700)

    await expect(page.locator('[data-bag-panel="cart"]')).not.toHaveAttribute(
      'open',
      '',
    )
  })

  test('открытая панель закрывает соседнюю', async ({ page }) => {
    await page.locator('[data-search] .icon-button').click()

    await expect(page.locator('[data-search]')).toHaveAttribute('open', '')
    await expect(page.locator('[data-bag-panel="cart"]')).not.toHaveAttribute(
      'open',
      '',
    )
  })

  test('ниже порога панель — ящик во всю шапку', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 800 })

    const box = await page
      .locator('[data-bag-panel="cart"] .panel')
      .boundingBox()

    expect(box?.x).toBe(0)
    expect(box?.width).toBe(375)
  })
})
