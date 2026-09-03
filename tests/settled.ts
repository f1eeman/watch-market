import { expect, type Page } from '@playwright/test'

export async function settledBox(page: Page, selector: string) {
  const locator = page.locator(selector)

  const boxOf = async () => {
    const box = await locator.boundingBox()

    if (box === null) throw new Error(`не найдено: ${selector}`)

    return box
  }

  let last = Number.NaN

  await expect
    .poll(async () => {
      const { y } = await boxOf()
      const same = y === last

      last = y

      return same
    })
    .toBe(true)

  return boxOf()
}
