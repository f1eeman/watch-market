import { expect, test, type Page } from '@playwright/test'

const ENTRY = ['/', '/catalog/', '/product/']

const SECTIONS = [
  '/shops/',
  '/certificates/',
  '/sale/',
  '/delivery/',
  '/vacancies/',
  '/reviews/',
  '/how-to-order/',
  '/faq/',
  '/corporate/',
  '/payment/',
  '/warranty/',
  '/returns/',
]

const internalOf = (page: Page) =>
  page.evaluate(() =>
    [
      ...new Set(
        Array.from(document.querySelectorAll<HTMLAnchorElement>('a[href]'))
          .map((link) => link.getAttribute('href') ?? '')
          .filter((href) => href.startsWith('/')),
      ),
    ].sort(),
  )

test('ни одна внутренняя ссылка не ведёт в 404', async ({ page, request }) => {
  const seen = new Set<string>()

  for (const path of [...ENTRY, ...SECTIONS]) {
    await page.goto(path)

    for (const href of await internalOf(page)) seen.add(href)
  }

  expect(seen.size).toBeGreaterThan(12)

  for (const href of seen) {
    const answer = await request.get(href)

    expect(answer.status(), `ссылка ${href}`).toBe(200)
  }
})

test('каждый раздел подвала — существующая страница', async ({
  page,
  request,
}) => {
  await page.goto('/')

  const links = await page.evaluate(() =>
    Array.from(
      document.querySelectorAll<HTMLAnchorElement>('footer nav a[href]'),
    ).map((link) => link.getAttribute('href') ?? ''),
  )

  expect(links).toHaveLength(12)

  for (const href of links) {
    const answer = await request.get(href)

    expect(answer.status(), `подвал: ${href}`).toBe(200)
  }
})

for (const path of SECTIONS) {
  test(`страница раздела собрана: ${path}`, async ({ page }) => {
    await page.goto(path)

    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
    await expect(page.locator('.breadcrumbs')).toBeVisible()
    await expect(page.locator('#help-title')).toBeVisible()
    await expect(page.locator('header')).toBeVisible()
    await expect(page.locator('footer')).toBeVisible()
  })
}

test('разделы, которые макет наполнил, идут со своим текстом', async ({
  page,
}) => {
  await page.goto('/certificates/')
  await expect(page.locator('.lead')).toContainText('сертификаты качества')
  await expect(page.locator('.pending')).toHaveCount(0)

  await page.goto('/delivery/')
  await expect(page.locator('.lead')).toContainText('по всему миру')

  await page.goto('/sale/')
  await expect(page.getByText('-20%')).toBeVisible()
  await expect(page.locator('.pending')).toHaveCount(0)
})

test('у каждого раздела есть содержание, а не заглушка', async ({ page }) => {
  for (const path of SECTIONS) {
    await page.goto(path)

    await expect(page.locator('.pending')).toHaveCount(0)

    const blocks = await page.locator('.prose .block').count()
    const lead = await page.locator('.lead').count()
    const own = await page.locator('.proof, .offer').count()

    expect(blocks + lead + own, `раздел ${path}`).toBeGreaterThan(0)
  }
})

test('написанный текст держит факты макета', async ({ page }) => {
  await page.goto('/faq/')
  await expect(
    page.getByText('Techne, Rado, Bvlgari, Tissot, Omega'),
  ).toBeVisible()
  await expect(page.getByText(/производятся в\s*Швейцарии/)).toBeVisible()

  await page.goto('/how-to-order/')
  await expect(page.locator('.prose .step')).toHaveCount(4)

  await page.goto('/returns/')
  await expect(page.getByText(/14\s*дней/).first()).toBeVisible()
})

test('отзывы не сочинены: страница объясняет, как их оставить', async ({
  page,
}) => {
  await page.goto('/reviews/')

  await expect(
    page.getByRole('heading', { name: 'Как оставить отзыв' }),
  ).toBeVisible()
  await expect(page.locator('.prose .item')).toHaveCount(3)
})

test('«Акции» и «Доставка» помечаются в шапке текущими', async ({ page }) => {
  await page.goto('/sale/')
  await expect(
    page.locator('header .nav-link', { hasText: 'Акции' }),
  ).toHaveAttribute('aria-current', 'page')

  await page.goto('/delivery/')
  await expect(
    page.locator('header .nav-link', { hasText: 'Доставка' }),
  ).toHaveAttribute('aria-current', 'page')
})

test('двойных id на страницах нет', async ({ page }) => {
  for (const path of ['/', '/catalog/', '/product/', '/faq/']) {
    await page.goto(path)

    const dupes = await page.evaluate(() => {
      const seen = new Map<string, number>()

      for (const el of document.querySelectorAll('[id]'))
        seen.set(el.id, (seen.get(el.id) ?? 0) + 1)

      return [...seen].filter(([, count]) => count > 1).map(([id]) => id)
    })

    expect(dupes, path).toStrictEqual([])
  }
})
