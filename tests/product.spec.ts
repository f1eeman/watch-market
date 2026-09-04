import { expect, test, type Page } from '@playwright/test'

const tabOf = (page: Page, name: string) => page.getByRole('tab', { name })
const panelOf = (page: Page, id: string) => page.locator(`#${id}`)
const thumbOf = (page: Page, index: number) =>
  page.locator('[data-gallery-thumb]').nth(index)
const currentSlide = (page: Page) =>
  page.locator('[data-gallery-slide][data-gallery-current]')

const under = () => {
  const marker = document.querySelector('[data-tabs-marker]')
  const tab = document.querySelector('[data-tabs-tab][aria-selected="true"]')

  if (marker === null || tab === null) return false

  const line = marker.getBoundingClientRect()
  const seat = tab.getBoundingClientRect()

  return (
    Math.abs(line.x - seat.x) < 1 &&
    Math.abs(line.width - seat.width) < 1 &&
    Math.abs(seat.bottom - line.bottom - 8) < 1
  )
}

test.beforeEach(async ({ page }) => {
  await page.goto('/product/')
})

test.describe('вкладки карточки', () => {
  test('открыта первая, вторая панель скрыта', async ({ page }) => {
    await expect(tabOf(page, 'Описание')).toHaveAttribute(
      'aria-selected',
      'true',
    )
    await expect(panelOf(page, 'panel-about')).toBeVisible()
    await expect(panelOf(page, 'panel-specs')).toBeHidden()
  })

  test('клик переключает панель', async ({ page }) => {
    await tabOf(page, 'Технические характеристики').click()

    await expect(panelOf(page, 'panel-specs')).toBeVisible()
    await expect(panelOf(page, 'panel-about')).toBeHidden()
    await expect(tabOf(page, 'Описание')).toHaveAttribute(
      'aria-selected',
      'false',
    )
  })

  test('стрелки ходят по кругу и уводят фокус', async ({ page }) => {
    await tabOf(page, 'Описание').focus()
    await page.keyboard.press('ArrowRight')

    await expect(tabOf(page, 'Технические характеристики')).toBeFocused()
    await expect(panelOf(page, 'panel-specs')).toBeVisible()

    await page.keyboard.press('ArrowRight')

    await expect(tabOf(page, 'Описание')).toBeFocused()
    await expect(panelOf(page, 'panel-about')).toBeVisible()
  })

  test('вне вкладок клавиши не перехватываются', async ({ page }) => {
    await expect(page.locator('[data-tabs-panel]:not([hidden])')).toHaveCount(1)
  })

  test('линия стоит под активной вкладкой', async ({ page }) => {
    await expect.poll(async () => page.evaluate(under)).toBe(true)

    await tabOf(page, 'Технические характеристики').click()

    await expect.poll(async () => page.evaluate(under)).toBe(true)
  })

  test('линия перетекает, а панель меняет высоту не рывком', async ({
    page,
  }) => {
    await page.locator('.tablist').scrollIntoViewIfNeeded()
    await expect.poll(async () => page.evaluate(under)).toBe(true)

    const taken = await page.evaluate(async () => {
      const marker = document.querySelector('[data-tabs-marker]')
      const box = document.querySelector('[data-tabs-panels]')
      const tab = document.querySelector('#tab-specs')

      if (
        !(marker instanceof HTMLElement) ||
        !(box instanceof HTMLElement) ||
        !(tab instanceof HTMLElement)
      )
        return []

      const frames: [number, number][] = []
      const tick = () => {
        frames.push([
          marker.getBoundingClientRect().x,
          box.getBoundingClientRect().height,
        ])

        if (frames.length < 40) requestAnimationFrame(tick)
      }

      requestAnimationFrame(tick)
      tab.click()

      while (frames.length < 40)
        await new Promise((done) => {
          requestAnimationFrame(done)
        })

      return frames
    })

    const spots = new Set(taken.map(([x]) => Math.round(x)))
    const heights = new Set(taken.map(([, height]) => Math.round(height)))

    expect(spots.size).toBeGreaterThan(3)
    expect(heights.size).toBeGreaterThan(3)
  })

  test('прерванная смена доезжает до настоящей высоты', async ({ page }) => {
    await page.locator('.tablist').scrollIntoViewIfNeeded()
    await expect.poll(async () => page.evaluate(under)).toBe(true)

    const run = await page.evaluate(async () => {
      const box = document.querySelector('[data-tabs-panels]')
      const specs = document.querySelector('#tab-specs')
      const about = document.querySelector('#tab-about')
      const panel = document.querySelector('#panel-about')

      if (
        !(box instanceof HTMLElement) ||
        !(specs instanceof HTMLElement) ||
        !(about instanceof HTMLElement) ||
        !(panel instanceof HTMLElement)
      )
        return { after: [], natural: 0 }

      const frames: number[] = []
      const tick = () => {
        frames.push(box.getBoundingClientRect().height)

        if (frames.length < 60) requestAnimationFrame(tick)
      }

      requestAnimationFrame(tick)
      specs.click()

      await new Promise((done) => {
        setTimeout(done, 100)
      })

      const cut = frames.length

      about.click()

      while (frames.length < 60)
        await new Promise((done) => {
          requestAnimationFrame(done)
        })

      return {
        after: frames.slice(cut),
        natural: panel.getBoundingClientRect().height,
      }
    })

    const steps = new Set(run.after.map((height) => Math.round(height)))

    expect(steps.size).toBeGreaterThan(3)
    expect(Math.round(run.after.at(-1) ?? 0)).toBe(Math.round(run.natural))
  })

  test('нажатие по уже открытой вкладке ничего не проигрывает', async ({
    page,
  }) => {
    await page.locator('.tablist').scrollIntoViewIfNeeded()
    await expect.poll(async () => page.evaluate(under)).toBe(true)

    const seen = await page.evaluate(async () => {
      const panel = document.querySelector('#panel-about')
      const tab = document.querySelector('#tab-about')

      if (!(panel instanceof HTMLElement) || !(tab instanceof HTMLElement))
        return []

      const taken: number[] = []
      const tick = () => {
        taken.push(Number(getComputedStyle(panel).opacity))

        if (taken.length < 25) requestAnimationFrame(tick)
      }

      requestAnimationFrame(tick)
      tab.click()

      while (taken.length < 25)
        await new Promise((done) => {
          requestAnimationFrame(done)
        })

      return taken
    })

    expect(Math.min(...seen)).toBe(1)
  })

  test('на узкой раскладке линия переезжает на вторую строку', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 375, height: 800 })

    const rows = await page
      .locator('.tab')
      .evaluateAll(
        (tabs) =>
          new Set(tabs.map((tab) => tab.getBoundingClientRect().y)).size,
      )

    expect(rows).toBe(2)

    await tabOf(page, 'Технические характеристики').click()

    await expect.poll(async () => page.evaluate(under)).toBe(true)
  })
})

test('под reduce вкладки переключаются мгновенно', async ({
  browser,
  baseURL,
}) => {
  const context = await browser.newContext({ reducedMotion: 'reduce' })
  const page = await context.newPage()

  await page.goto(new URL('/product/', String(baseURL)).href)

  await expect.poll(async () => page.evaluate(under)).toBe(true)

  await tabOf(page, 'Технические характеристики').click()

  expect(await page.evaluate(under)).toBe(true)
  await expect(panelOf(page, 'panel-specs')).toBeVisible()

  await context.close()
})

test.describe('галерея карточки', () => {
  test('первый кадр показан, первая миниатюра активна', async ({ page }) => {
    await expect(currentSlide(page)).toHaveCount(1)
    await expect(thumbOf(page, 0)).toHaveAttribute('aria-current', 'true')
    await expect(thumbOf(page, 1)).not.toHaveAttribute('aria-current', 'true')
  })

  test('миниатюра меняет кадр', async ({ page }) => {
    const first = await currentSlide(page).getAttribute('alt')

    await thumbOf(page, 2).click()

    await expect(thumbOf(page, 2)).toHaveAttribute('aria-current', 'true')
    await expect(currentSlide(page)).not.toHaveAttribute('alt', String(first))
  })

  test('стрелки замкнуты в круг', async ({ page }) => {
    const first = await currentSlide(page).getAttribute('alt')

    await page.locator('[data-gallery-prev]').click()

    await expect(thumbOf(page, 3)).toHaveAttribute('aria-current', 'true')

    await page.locator('[data-gallery-next]').click()

    await expect(currentSlide(page)).toHaveAttribute('alt', String(first))
  })

  test('миниатюр столько же, сколько кадров', async ({ page }) => {
    const slides = await page.locator('[data-gallery-slide]').count()

    expect(slides).toBe(4)
    await expect(page.locator('[data-gallery-thumb]')).toHaveCount(slides)
  })
})

test.describe('карусель «Вы смотрели»', () => {
  test('три плитки видны целиком, стрелки выключены', async ({ page }) => {
    const track = page.locator('.viewed [data-carousel-track]')

    await expect(track.locator('> li')).toHaveCount(3)
    await expect(page.locator('.viewed [data-carousel-prev]')).toBeDisabled()
    await expect(page.locator('.viewed [data-carousel-next]')).toBeDisabled()
  })

  test('ниже порога стрелки скрыты, а трек прокручивается', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 700, height: 900 })

    const track = page.locator('.viewed [data-carousel-track]')

    await expect(page.locator('.viewed [data-carousel-next]')).toBeHidden()

    const scrolled = await track.evaluate((el) => {
      el.scrollTo({ left: 300, behavior: 'instant' })

      return el.scrollLeft
    })

    expect(scrolled).toBeGreaterThan(0)
  })
})
