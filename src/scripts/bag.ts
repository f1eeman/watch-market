import { dismiss } from '@/scripts/drop'

export type Bag = 'favourites' | 'cart'

interface Entry {
  id: string
  brand: string
  price: string
}

const KEYS: Record<Bag, string> = {
  favourites: 'conquest:favourites',
  cart: 'conquest:cart',
}

const CHANGED = 'conquest:bag'

const isBag = (value: string | undefined): value is Bag =>
  value === 'favourites' || value === 'cart'

export const read = (bag: Bag): Set<string> => {
  try {
    const raw = localStorage.getItem(KEYS[bag])
    const list: unknown = raw === null ? [] : JSON.parse(raw)

    return new Set(
      Array.isArray(list) ? list.filter((id) => typeof id === 'string') : [],
    )
  } catch {
    return new Set()
  }
}

const write = (bag: Bag, ids: Set<string>): void => {
  try {
    localStorage.setItem(KEYS[bag], JSON.stringify([...ids]))
  } catch {
    return
  }

  document.dispatchEvent(new CustomEvent(CHANGED))
}

export const toggle = (bag: Bag, id: string): boolean => {
  const ids = read(bag)
  const added = !ids.has(id)

  if (added) ids.add(id)
  else ids.delete(id)

  write(bag, ids)

  return added
}

const catalogue = (): Entry[] => {
  const node = document.querySelector<HTMLScriptElement>('[data-shop-index]')

  if (node === null) return []

  try {
    const list: unknown = JSON.parse(node.textContent ?? '[]')

    return Array.isArray(list) ? (list as Entry[]) : []
  } catch {
    return []
  }
}

const paintButton = (button: HTMLElement): void => {
  const bag = button.dataset['bag']
  const id = button.dataset['bagId']

  if (!isBag(bag) || id === undefined) return

  const kept = read(bag).has(id)
  const label = button.querySelector<HTMLElement>('[data-bag-label]')
  const on = button.dataset['bagLabelOn']
  const off = button.dataset['bagLabelOff']

  button.setAttribute('aria-pressed', String(kept))

  if (label !== null && on !== undefined && off !== undefined)
    label.textContent = kept ? on : off
}

const paintCount = (badge: HTMLElement): void => {
  const bag = badge.dataset['bagCount']

  if (!isBag(bag)) return

  const size = read(bag).size

  badge.textContent = String(size)
  badge.toggleAttribute('hidden', size === 0)
}

const rowOf = (bag: Bag, entry: Entry): HTMLLIElement => {
  const row = document.createElement('li')
  const brand = document.createElement('span')
  const price = document.createElement('span')
  const drop = document.createElement('button')
  const label = document.createElement('span')

  row.className = 'shop-row'
  brand.className = 'shop-brand'
  brand.textContent = entry.brand
  price.className = 'shop-price'
  price.textContent = `${entry.price} ₽`

  drop.className = 'shop-drop'
  drop.type = 'button'
  drop.dataset['bag'] = bag
  drop.dataset['bagId'] = entry.id
  label.className = 'visually-hidden'
  label.textContent = `Убрать ${entry.brand}`
  drop.append(label)
  drop.setAttribute('aria-hidden', 'false')

  row.append(brand, price, drop)

  return row
}

const paintPanel = (list: HTMLElement, index: Entry[]): void => {
  const bag = list.dataset['bagList']

  if (!isBag(bag)) return

  const ids = read(bag)
  const kept = index.filter((entry) => ids.has(entry.id))

  list.replaceChildren(...kept.map((entry) => rowOf(bag, entry)))

  const note = document.querySelector<HTMLElement>(`[data-bag-empty='${bag}']`)

  if (note !== null) note.toggleAttribute('hidden', kept.length > 0)
}

const paint = (): void => {
  const index = catalogue()

  for (const button of document.querySelectorAll<HTMLElement>('[data-bag]'))
    paintButton(button)

  for (const badge of document.querySelectorAll<HTMLElement>(
    '[data-bag-count]',
  ))
    paintCount(badge)

  for (const list of document.querySelectorAll<HTMLElement>('[data-bag-list]'))
    paintPanel(list, index)
}

export function initBag(): void {
  if (document.querySelector('[data-bag], [data-bag-count]') === null) return

  document.addEventListener('click', (event) => {
    if (!(event.target instanceof Element)) return

    const button = event.target.closest<HTMLElement>('[data-bag]')

    if (button === null) return

    const bag = button.dataset['bag']
    const id = button.dataset['bagId']

    if (!isBag(bag) || id === undefined) return

    event.preventDefault()
    toggle(bag, id)
  })

  for (const panel of document.querySelectorAll<HTMLDetailsElement>(
    '[data-bag-panel]',
  ))
    dismiss(panel)

  document.addEventListener(CHANGED, paint)
  window.addEventListener('storage', paint)

  paint()
}
