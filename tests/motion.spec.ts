import { expect, test, type Page } from '@playwright/test'

const PAGES = ['/', '/catalog/', '/product/']

const stuck = (page: Page) =>
  page.evaluate(() => {
    const shift = (node: Element): number => {
      const raw = getComputedStyle(node).transform

      if (raw === 'none') return 0

      const parts = /matrix\(([^)]+)\)/.exec(raw)

      return parts === null
        ? 0
        : Number.parseFloat(String(parts[1]).split(',')[5] ?? '0')
    }

    const stretch = (node: Element): number => {
      const raw = getComputedStyle(node).transform

      if (raw === 'none') return 1

      const parts = /matrix\(([^)]+)\)/.exec(raw)

      return parts === null
        ? 1
        : Number.parseFloat(String(parts[1]).split(',')[0] ?? '1')
    }

    const named = (node: Element): string =>
      node.className === '' ? node.tagName : String(node.className)

    const faded = Array.from(
      document.querySelectorAll('[data-reveal], [data-enter]'),
    )
      .flatMap((block) => [block, ...Array.from(block.children)])
      .filter((node) => getComputedStyle(node).opacity !== '1')

    const words = Array.from(
      document.querySelectorAll('[data-sweep] .sweep-word'),
    ).filter((node) => Math.abs(shift(node)) > 0.5)

    const undrawn = Array.from(
      document.querySelectorAll<SVGGeometryElement>('[data-stroke]'),
    ).filter((node) => {
      const dash = node.style.strokeDasharray

      if (dash === '') return false

      return Number.parseFloat(dash) < node.getTotalLength() * 0.99
    })

    const undrawnLines = Array.from(
      document.querySelectorAll('[data-sweep-line]'),
    ).filter((node) => stretch(node) < 0.99)

    return [...faded, ...words, ...undrawn, ...undrawnLines].map(named)
  })

const scrollThrough = async (page: Page) => {
  await page.evaluate(async () => {
    const step = window.innerHeight / 2

    for (let y = 0; y < document.body.scrollHeight; y += step) {
      window.scrollTo(0, y)
      await new Promise((resolve) => {
        setTimeout(resolve, 90)
      })
    }

    window.scrollTo(0, document.body.scrollHeight)
  })
}

for (const path of PAGES) {
  test(`после полной прокрутки ничего не осталось спрятанным: ${path}`, async ({
    page,
  }) => {
    await page.goto(path)
    await scrollThrough(page)
    await expect
      .poll(async () => stuck(page), { timeout: 15_000 })
      .toStrictEqual([])
  })
}

test.describe('под уменьшением анимации', () => {
  for (const path of PAGES) {
    test(`движения нет, всё видно сразу: ${path}`, async ({
      browser,
      baseURL,
    }) => {
      const context = await browser.newContext({ reducedMotion: 'reduce' })
      const page = await context.newPage()

      await page.goto(new URL(path, String(baseURL)).href)

      expect(await stuck(page)).toStrictEqual([])
      await expect(page.locator('.sweep-word')).toHaveCount(0)

      const running = await page.evaluate(() => [
        ...new Set(
          Array.from(document.querySelectorAll('[data-enter]')).map(
            (node) => getComputedStyle(node).animationName,
          ),
        ),
      ])

      expect(running).toStrictEqual(['none'])

      const tilted = await page.evaluate(
        () =>
          Array.from(document.querySelectorAll('[data-tilt]')).filter(
            (node) => getComputedStyle(node).transform !== 'none',
          ).length,
      )

      expect(tilted).toBe(0)

      await context.close()
    })
  }
})

test('вход стоит выше сгиба, появление — ниже', async ({ page }) => {
  await page.goto('/')

  await expect(page.locator('#promo [data-enter]')).not.toHaveCount(0)
  await expect(page.locator('#promo [data-reveal]')).toHaveCount(0)
  await expect(page.locator('[data-reveal]')).toHaveCount(2)
})

test('заголовки разделов разбиты на слова и подписаны для скринридера', async ({
  page,
}) => {
  await page.goto('/')

  const heading = page.locator('.popular h2')

  await expect(heading).toHaveAttribute('aria-label', 'Популярные модели')
  await expect(heading.locator('.sweep-word')).toHaveCount(2)
})

test('дрейф декораций живой и привязан к прокрутке', async ({ page }) => {
  await page.goto('/')

  const angleOf = async (y: number) => {
    await page.evaluate((to) => {
      window.scrollTo(0, to)
    }, y)
    await page.waitForTimeout(400)

    return page
      .locator('.popular .ring')
      .first()
      .evaluate((node) => {
        const parts = /matrix\(([^)]+)\)/.exec(getComputedStyle(node).transform)

        return parts === null
          ? 0
          : Number.parseFloat(String(parts[1]).split(',')[1] ?? '0')
      })
  }

  const near = await angleOf(700)
  const far = await angleOf(1500)

  expect(Math.abs(far - near)).toBeGreaterThan(0.05)
})

test('плитка наклоняется под курсором и возвращается в покой', async ({
  page,
}) => {
  await page.goto('/')
  await page.evaluate(() => {
    window.scrollTo(0, 950)
  })
  await page.waitForTimeout(500)

  const card = page.locator('.popular .card').first()
  const box = await card.boundingBox()

  if (box === null) throw new Error('нет бокса у плитки')

  const angles = async () => card.evaluate((node) => node.style.transform)

  await page.mouse.move(box.x + box.width * 0.15, box.y + box.height * 0.2)
  await expect.poll(angles).toMatch(/rotateY\(-\d/)

  await page.mouse.move(box.x + box.width * 0.85, box.y + box.height * 0.8)
  await expect.poll(angles).toMatch(/rotateY\(\d/)

  await page.mouse.move(4, 4)
  await expect.poll(angles).not.toMatch(/rotate/)
})

test('миниатюра галереи прилетает в кадр и не оставляет трансформа', async ({
  page,
}) => {
  await page.goto('/product/')

  const current = page.locator('[data-gallery-slide][data-gallery-current]')

  await page.evaluate(() => {
    const frames: { flip: boolean; transform: string }[] = []

    Object.defineProperty(window, 'flipFrames', { value: frames })

    const tick = () => {
      const root = document.querySelector('[data-gallery]')
      const slide = document.querySelector<HTMLElement>(
        '[data-gallery-slide][data-gallery-current]',
      )

      frames.push({
        flip: root?.hasAttribute('data-gallery-flip') ?? false,
        transform: slide?.style.transform ?? '',
      })

      if (frames.length < 150) requestAnimationFrame(tick)
    }

    requestAnimationFrame(tick)
  })

  await page.locator('[data-gallery-thumb]').nth(2).click()

  const frames = await page.evaluate(async () => {
    const taken = (window as unknown as { flipFrames: unknown[] }).flipFrames

    while (taken.length < 150)
      await new Promise((done) => {
        requestAnimationFrame(done)
      })

    return taken as { flip: boolean; transform: string }[]
  })

  expect(frames.some((frame) => frame.flip)).toBe(true)
  expect(frames.some((frame) => /scale/u.test(frame.transform))).toBe(true)

  await expect(page.locator('[data-gallery]')).not.toHaveAttribute(
    'data-gallery-flip',
    '',
  )
  await expect
    .poll(async () => current.evaluate((node) => node.style.transform))
    .toBe('')
})
