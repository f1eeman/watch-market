import { dismiss } from '@/scripts/drop'

interface Entry {
  id: string
  brand: string
  price: string
}

interface Search {
  root: HTMLDetailsElement
  field: HTMLInputElement
  list: HTMLElement
  empty: HTMLElement
  entries: Entry[]
}

const LIMIT = 6

const indexOf = (): Entry[] => {
  const node = document.querySelector<HTMLScriptElement>('[data-shop-index]')

  if (node === null) return []

  try {
    const list: unknown = JSON.parse(node.textContent ?? '[]')

    return Array.isArray(list) ? (list as Entry[]) : []
  } catch {
    return []
  }
}

const searchOf = (root: HTMLDetailsElement): Search | null => {
  const field = root.querySelector<HTMLInputElement>('[data-search-field]')
  const list = root.querySelector<HTMLElement>('[data-search-results]')
  const empty = root.querySelector<HTMLElement>('[data-search-empty]')

  if (field === null || list === null || empty === null) return null

  return { root, field, list, empty, entries: indexOf() }
}

const flat = (text: string): string =>
  text.toLowerCase().replace(/[\s\u00a0]+/gu, '')

const matches = (entries: Entry[], query: string): Entry[] => {
  const needle = flat(query)

  if (needle === '') return []

  const seen = new Set<string>()

  return entries
    .filter((entry) => {
      const hay = flat(`${entry.brand} ${entry.price}`)

      if (!hay.includes(needle) || seen.has(entry.brand + entry.price))
        return false

      seen.add(entry.brand + entry.price)

      return true
    })
    .slice(0, LIMIT)
}

const render = (search: Search): void => {
  const found = matches(search.entries, search.field.value)
  const asked = search.field.value.trim() !== ''

  search.list.replaceChildren(
    ...found.map((entry) => {
      const item = document.createElement('li')
      const link = document.createElement('a')
      const brand = document.createElement('span')
      const price = document.createElement('span')

      brand.className = 'search-brand'
      brand.textContent = entry.brand
      price.className = 'search-price'
      price.textContent = `${entry.price} ₽`

      link.className = 'search-hit'
      link.href = '/product/'
      link.append(brand, price)
      item.append(link)

      return item
    }),
  )

  search.empty.toggleAttribute('hidden', !asked || found.length > 0)
}

const drive = (search: Search): void => {
  search.field.addEventListener('input', () => {
    render(search)
  })

  search.root.addEventListener('toggle', () => {
    if (!search.root.open) return

    search.field.focus()
    render(search)
  })

  dismiss(search.root)
}

export function initSearch(): void {
  const root = document.querySelector<HTMLDetailsElement>('[data-search]')

  if (root === null) return

  const search = searchOf(root)

  if (search !== null) drive(search)
}
