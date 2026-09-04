interface Range {
  root: HTMLElement
  track: HTMLElement
  from: HTMLInputElement
  to: HTMLInputElement
  fromOut: HTMLElement | null
  toOut: HTMLElement | null
}

const NBSP = ' '

const rangeOf = (root: HTMLElement): Range | null => {
  const track = root.querySelector<HTMLElement>('[data-range-track]')
  const from = root.querySelector<HTMLInputElement>('[data-range-from]')
  const to = root.querySelector<HTMLInputElement>('[data-range-to]')

  if (track === null || from === null || to === null) return null

  return {
    root,
    track,
    from,
    to,
    fromOut: root.querySelector<HTMLElement>('[data-range-from-out]'),
    toOut: root.querySelector<HTMLElement>('[data-range-to-out]'),
  }
}

const grouped = (value: number): string =>
  String(value).replace(/\B(?=(?:\d{3})+$)/gu, NBSP)

const shareOf = (input: HTMLInputElement): number => {
  const min = Number(input.min)
  const span = Number(input.max) - min

  return span === 0 ? 0 : ((Number(input.value) - min) / span) * 100
}

const paint = (range: Range): void => {
  const { root, from, to, fromOut, toOut } = range

  root.style.setProperty('--range-from', `${String(shareOf(from))}%`)
  root.style.setProperty('--range-to', `${String(shareOf(to))}%`)

  if (fromOut !== null) fromOut.textContent = grouped(Number(from.value))
  if (toOut !== null) toOut.textContent = grouped(Number(to.value))
}

const raise = (range: Range, on: HTMLInputElement): void => {
  const other = on === range.from ? range.to : range.from

  on.style.zIndex = '2'
  other.style.zIndex = '1'
}

const nearest = (range: Range, clientX: number): HTMLInputElement => {
  const { from, to, track } = range
  const box = track.getBoundingClientRect()
  const at = box.width === 0 ? 0 : ((clientX - box.left) / box.width) * 100
  const fromAt = shareOf(from)
  const toAt = shareOf(to)

  if (at < fromAt) return from
  if (at > toAt) return to

  return at - fromAt <= toAt - at ? from : to
}

const drive = (range: Range): void => {
  const { from, to, track } = range

  raise(range, to)

  track.addEventListener('pointerdown', (event) => {
    raise(range, nearest(range, event.clientX))
  })

  track.addEventListener('pointermove', (event) => {
    if (event.buttons !== 0) return

    raise(range, nearest(range, event.clientX))
  })

  for (const input of [from, to])
    input.addEventListener('focus', () => {
      raise(range, input)
    })

  from.addEventListener('input', () => {
    if (Number(from.value) > Number(to.value)) from.value = to.value

    paint(range)
  })

  to.addEventListener('input', () => {
    if (Number(to.value) < Number(from.value)) to.value = from.value

    paint(range)
  })

  paint(range)
}

export function initPriceRange(): void {
  for (const root of document.querySelectorAll<HTMLElement>('[data-range]')) {
    const range = rangeOf(root)

    if (range !== null) drive(range)
  }
}
