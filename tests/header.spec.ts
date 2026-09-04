import { expect, test } from '@playwright/test'

test.beforeEach(async ({ page }) => {
  await page.goto('/')
})

test('пункты шапки ведут либо на страницу, либо в существующий id', async ({
  page,
}) => {
  const links = page.locator('header .nav-link')

  await expect(links).toHaveCount(4)

  for (const href of await links.evaluateAll((nodes) =>
    nodes.map((node) => node.getAttribute('href')),
  )) {
    expect(href).toMatch(/^(\/[a-z-]+\/|#[a-z-]+)$/)

    if (href !== null && href.startsWith('#'))
      await expect(page.locator(href)).toHaveCount(1)
  }
})

test('«Каталог» открывает каталог и помечается текущим', async ({ page }) => {
  await page.locator('header .nav-link', { hasText: 'Каталог' }).click()

  await expect(page).toHaveURL(/\/catalog\/$/)
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(
    'Мужские часы',
  )
  await expect(
    page.locator('header .nav-link', { hasText: 'Каталог' }),
  ).toHaveAttribute('aria-current', 'page')
})

test('контакты подвала — живая цель якоря «Контакты»', async ({ page }) => {
  await page.locator('header .nav-link', { hasText: 'Контакты' }).click()

  const contacts = page.locator('#contacts')

  await expect(contacts).toBeInViewport()
  await expect(
    contacts.getByRole('link', { name: '8 (499) 450-47-97' }),
  ).toBeVisible()
  await expect(
    contacts.getByRole('link', { name: 'info@conquest.watch.ru' }),
  ).toBeVisible()
})

test('иконки шапки открывают панели и подписаны', async ({ page }) => {
  const drops = page.locator('header .drop')

  await expect(drops).toHaveCount(3)

  const names = ['Поиск по каталогу', 'Избранное', 'Корзина']

  for (const [at, name] of names.entries())
    await expect(drops.nth(at).locator('summary')).toHaveAccessibleName(name)

  await page.locator('[data-bag-panel="cart"] .icon-button').click()

  await expect(page.locator('[data-bag-empty="cart"]')).toBeVisible()
})

test('логотип ведёт на главную с каталога', async ({ page }) => {
  await page.goto('/catalog/')
  await page.locator('header .logo').click()

  await expect(page).toHaveURL(/\/$/)
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(
    'Весна/Лето 2019',
  )
})
