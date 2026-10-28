import { dismiss } from '@/scripts/drop'

interface Sorter {
  root: HTMLDetailsElement
  grid: HTMLElement
  value: HTMLElement
  options: HTMLElement[]
  order: HTMLElement[]
}

type Rule = 'popular' | 'cheap' | 'costly' | 'brand'

const isRule = (value: string | undefined): value is Rule =>
  value === 'popular' ||
  value === 'cheap' ||
  value === 'costly' ||
  value === 'brand'

const amountOf = (item: HTMLElement): number =>
  Number.parseFloat(item.dataset['sortAmount'] ?? '0')

const brandOf = (item: HTMLElement): string => item.dataset['sortBrand'] ?? ''

const sorterOf = (root: HTMLDetailsElement): Sorter | null => {
  const target = root.dataset['sort']
  const grid =
    target === undefined
      ? null
      : document.querySelector<HTMLElement>(`#${target}`)
  const value = root.querySelector<HTMLElement>('[data-sort-value]')
  const options = Array.from(
    root.querySelectorAll<HTMLElement>('[data-sort-rule]'),
  )

  if (grid === null || value === null || options.length === 0) return null

  return {
    root,
    grid,
    value,
    options,
    order: Array.from(grid.children).filter(
      (item): item is HTMLElement => item instanceof HTMLElement,
    ),
  }
}

const arrange = (sorter: Sorter, rule: Rule): void => {
  const pinned = sorter.order.filter(
    (item) => item.dataset['sortPin'] !== undefined,
  )
  const goods = sorter.order.filter(
    (item) => item.dataset['sortPin'] === undefined,
  )

  const sorted = [...goods]

  if (rule === 'cheap') sorted.sort((a, b) => amountOf(a) - amountOf(b))
  if (rule === 'costly') sorted.sort((a, b) => amountOf(b) - amountOf(a))
  if (rule === 'brand')
    sorted.sort(
      (a, b) =>
        brandOf(a).localeCompare(brandOf(b)) || amountOf(a) - amountOf(b),
    )

  const next = rule === 'popular' ? [...sorter.order] : sorted

  if (rule !== 'popular')
    for (const item of pinned) next.splice(sorter.order.indexOf(item), 0, item)

  sorter.grid.append(...next)
}

const drive = (sorter: Sorter): void => {
  for (const option of sorter.options)
    option.addEventListener('click', () => {
      const rule = option.dataset['sortRule']

      if (!isRule(rule)) return

      for (const other of sorter.options)
        other.setAttribute('aria-pressed', String(other === option))

      sorter.value.textContent = option.dataset['sortLabel'] ?? ''
      sorter.root.open = false
      arrange(sorter, rule)
    })

  dismiss(sorter.root)
}

export function initSort(): void {
  const root = document.querySelector<HTMLDetailsElement>('[data-sort]')

  if (root === null) return

  const sorter = sorterOf(root)

  if (sorter !== null) drive(sorter)
}
