import { expect, test } from '@playwright/test'

test.beforeEach(async ({ page }) => {
  await page.goto('/')
})

test('якоря шапки ведут в существующие id', async ({ page }) => {
  const links = page.locator('header .nav-link')

  await expect(links).not.toHaveCount(0)

  for (const href of await links.evaluateAll((nodes) =>
    nodes.map((node) => node.getAttribute('href')),
  )) {
    expect(href).toMatch(/^#[a-z-]+$/)
    await expect(page.locator(String(href))).toHaveCount(1)
  }
})

test('переход по якорю доезжает до секции и показывает её', async ({
  page,
}) => {
  await page.locator('header .nav-link', { hasText: 'Раздел' }).click()

  expect(new URL(page.url()).hash).toBe('#sample')

  const section = page.locator('#sample')

  await expect(section).toBeInViewport()
  await expect(section.getByRole('heading', { level: 2 })).toBeVisible()
})

test('контакты подвала — живая цель якоря «Контакты»', async ({ page }) => {
  await page.locator('header .nav-link', { hasText: 'Контакты' }).click()

  const contacts = page.locator('#contacts')

  await expect(contacts).toBeInViewport()
  await expect(
    contacts.getByRole('link', { name: /mail@example\.invalid/ }),
  ).toBeVisible()
})
