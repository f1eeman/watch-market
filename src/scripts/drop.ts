export function dismiss(root: HTMLDetailsElement): void {
  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') return
    if (!root.open) return

    root.open = false
    root.querySelector('summary')?.focus()
  })

  document.addEventListener(
    'click',
    (event) => {
      if (!root.open) return
      if (!(event.target instanceof Node)) return
      if (root.contains(event.target)) return

      root.open = false
    },
    true,
  )
}
