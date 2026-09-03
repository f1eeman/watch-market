interface Menu {
  root: HTMLDetailsElement
  toggle: HTMLElement
  label: HTMLElement
  opened: string
  closed: string
}

const menuOf = (): Menu | null => {
  const root = document.querySelector<HTMLDetailsElement>('[data-menu]')

  if (root === null) return null

  const toggle = root.querySelector<HTMLElement>('[data-menu-toggle]')
  const label = root.querySelector<HTMLElement>('[data-menu-label]')

  if (toggle === null || label === null) return null

  const opened = toggle.dataset['menuLabelClose']
  const closed = toggle.dataset['menuLabelOpen']

  if (opened === undefined || closed === undefined) return null

  return { root, toggle, label, opened, closed }
}

export function initMenu(): void {
  const menu = menuOf()

  if (menu === null) return

  const sync = (): void => {
    menu.label.textContent = menu.root.open ? menu.opened : menu.closed
  }

  sync()

  menu.root.addEventListener('toggle', sync)

  menu.root.addEventListener('click', (event) => {
    if (!(event.target instanceof Element)) return
    if (event.target.closest('a') === null) return

    menu.root.open = false
  })

  document.addEventListener('click', (event) => {
    if (!menu.root.open) return
    if (!(event.target instanceof Node)) return
    if (menu.root.contains(event.target)) return

    menu.root.open = false
  })

  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') return
    if (!menu.root.open) return

    menu.root.open = false
    menu.toggle.focus()
  })
}
