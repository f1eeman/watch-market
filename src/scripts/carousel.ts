interface Carousel {
  root: HTMLElement
  track: HTMLElement
  prev: HTMLButtonElement | null
  next: HTMLButtonElement | null
  status: HTMLElement | null
}

const EDGE = 1

const carouselOf = (root: HTMLElement): Carousel | null => {
  const track = root.querySelector<HTMLElement>('[data-carousel-track]')

  if (track === null) return null

  return {
    root,
    track,
    prev: root.querySelector<HTMLButtonElement>('[data-carousel-prev]'),
    next: root.querySelector<HTMLButtonElement>('[data-carousel-next]'),
    status: root.querySelector<HTMLElement>('[data-carousel-status]'),
  }
}

const pitchOf = (track: HTMLElement): number => {
  const first = track.firstElementChild
  const second = first?.nextElementSibling

  if (first === null || first === undefined) return track.clientWidth

  const start = first.getBoundingClientRect()

  if (second === null || second === undefined) return start.width

  return (
    Math.abs(second.getBoundingClientRect().left - start.left) || start.width
  )
}

const labelOf = (index: number): string => String(index).padStart(2, '0')

const sync = (carousel: Carousel): void => {
  const { track, prev, next, status, root } = carousel
  const rest = track.scrollWidth - track.clientWidth
  const at = track.scrollLeft

  if (prev !== null) prev.disabled = at <= EDGE
  if (next !== null) next.disabled = at >= rest - EDGE

  root.toggleAttribute('data-carousel-still', rest <= EDGE)

  if (status !== null)
    status.textContent = labelOf(Math.round(at / pitchOf(track)) + 1)
}

const step = (carousel: Carousel, direction: 1 | -1): void => {
  carousel.track.scrollBy({ left: pitchOf(carousel.track) * direction })
}

const drive = (carousel: Carousel): void => {
  const { track, prev, next } = carousel

  prev?.addEventListener('click', () => {
    step(carousel, -1)
  })

  next?.addEventListener('click', () => {
    step(carousel, 1)
  })

  let scheduled = false

  const schedule = (): void => {
    if (scheduled) return

    scheduled = true

    requestAnimationFrame(() => {
      scheduled = false
      sync(carousel)
    })
  }

  track.addEventListener('scroll', schedule, { passive: true })
  new ResizeObserver(schedule).observe(track)

  sync(carousel)
}

export function initCarousel(): void {
  for (const root of document.querySelectorAll<HTMLElement>(
    '[data-carousel]',
  )) {
    const carousel = carouselOf(root)

    if (carousel !== null) drive(carousel)
  }
}
