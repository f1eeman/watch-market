import { gsap, MOTION, mm } from '@/scripts/gsap'

interface Tabs {
  root: HTMLElement
  list: HTMLElement | null
  marker: HTMLElement | null
  box: HTMLElement | null
  tabs: HTMLElement[]
  panels: HTMLElement[]
}

interface Seat {
  '--marker-x': string
  '--marker-y': string
  '--marker-size': string
}

const SWAP = 0.32

const EASE = 'power2.out'

const GAP = 8

let motion = false

mm.add(MOTION, () => {
  motion = true

  return () => {
    motion = false
  }
})

const tabsOf = (root: HTMLElement): Tabs | null => {
  const tabs = Array.from(root.querySelectorAll<HTMLElement>('[data-tabs-tab]'))
  const panels = Array.from(
    root.querySelectorAll<HTMLElement>('[data-tabs-panel]'),
  )

  if (tabs.length === 0 || tabs.length !== panels.length) return null

  const marker = root.querySelector<HTMLElement>('[data-tabs-marker]')

  return {
    root,
    list: marker?.parentElement ?? null,
    marker,
    box: root.querySelector<HTMLElement>('[data-tabs-panels]'),
    tabs,
    panels,
  }
}

const seatOf = (tabs: Tabs, index: number): Seat | null => {
  const { list } = tabs
  const tab = tabs.tabs[index]

  if (list === null || tabs.marker === null || tab === undefined) return null

  const seat = list.getBoundingClientRect()
  const box = tab.getBoundingClientRect()

  if (box.width === 0) return null

  return {
    '--marker-x': `${String(box.left - seat.left)}px`,
    '--marker-y': `${String(box.bottom - seat.top - GAP - 1)}px`,
    '--marker-size': `${String(box.width)}px`,
  }
}

const place = (tabs: Tabs, index: number, glide: boolean): void => {
  const seat = seatOf(tabs, index)

  if (seat === null || tabs.list === null) return

  gsap.killTweensOf(tabs.list)

  if (glide) gsap.to(tabs.list, { ...seat, duration: SWAP, ease: EASE })
  else gsap.set(tabs.list, seat)
}

const mark = (tabs: Tabs, index: number, focus: boolean): void => {
  tabs.tabs.forEach((tab, at) => {
    const current = at === index

    tab.setAttribute('aria-selected', String(current))
    tab.tabIndex = current ? 0 : -1

    if (current && focus) tab.focus()
  })

  tabs.panels.forEach((panel, at) => {
    panel.toggleAttribute('hidden', at !== index)
  })
}

const swap = (tabs: Tabs, index: number, focus: boolean): void => {
  const shown = tabs.panels[index]
  const tab = tabs.tabs[index]

  if (tab?.getAttribute('aria-selected') === 'true') {
    if (focus) tab.focus()

    return
  }

  if (!motion || tabs.box === null || shown === undefined) {
    mark(tabs, index, focus)
    place(tabs, index, false)

    return
  }

  const from = tabs.box.getBoundingClientRect().height

  gsap.killTweensOf([tabs.box, ...tabs.panels])
  gsap.set(tabs.box, { clearProps: 'height,overflow' })
  gsap.set(tabs.panels, { clearProps: 'all' })

  mark(tabs, index, focus)
  place(tabs, index, true)

  const to = tabs.box.getBoundingClientRect().height

  gsap.fromTo(
    tabs.box,
    { height: from, overflow: 'hidden' },
    { height: to, duration: SWAP, ease: EASE, clearProps: 'height,overflow' },
  )
  gsap.fromTo(
    shown,
    { autoAlpha: 0 },
    { autoAlpha: 1, duration: SWAP, ease: EASE, clearProps: 'all' },
  )
}

const shiftOf = (key: string, index: number, length: number): number | null => {
  if (key === 'ArrowRight') return (index + 1) % length
  if (key === 'ArrowLeft') return (index - 1 + length) % length
  if (key === 'Home') return 0
  if (key === 'End') return length - 1

  return null
}

const watch = (tabs: Tabs): void => {
  const again = () => {
    const index = tabs.tabs.findIndex(
      (tab) => tab.getAttribute('aria-selected') === 'true',
    )

    if (index >= 0) place(tabs, index, false)
  }

  if (tabs.list !== null) new ResizeObserver(again).observe(tabs.list)

  void document.fonts.ready.then(again)
}

const drive = (tabs: Tabs): void => {
  mark(tabs, 0, false)
  place(tabs, 0, false)
  watch(tabs)

  tabs.tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => {
      swap(tabs, index, false)
    })

    tab.addEventListener('keydown', (event) => {
      const next = shiftOf(event.key, index, tabs.tabs.length)

      if (next === null) return

      event.preventDefault()
      swap(tabs, next, true)
    })
  })
}

export function initTabs(): void {
  for (const root of document.querySelectorAll<HTMLElement>('[data-tabs]')) {
    const tabs = tabsOf(root)

    if (tabs !== null) drive(tabs)
  }
}
