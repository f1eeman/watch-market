import { Flip, gsap, MOTION, mm } from '@/scripts/gsap'

interface Gallery {
  root: HTMLElement
  slides: HTMLElement[]
  thumbs: HTMLElement[]
  prev: HTMLButtonElement | null
  next: HTMLButtonElement | null
}

const FLIGHT = 0.55

let morphs = false

const galleryOf = (root: HTMLElement): Gallery | null => {
  const slides = Array.from(
    root.querySelectorAll<HTMLElement>('[data-gallery-slide]'),
  )
  const thumbs = Array.from(
    root.querySelectorAll<HTMLElement>('[data-gallery-thumb]'),
  )

  if (slides.length < 2 || thumbs.length !== slides.length) return null

  return {
    root,
    slides,
    thumbs,
    prev: root.querySelector<HTMLButtonElement>('[data-gallery-prev]'),
    next: root.querySelector<HTMLButtonElement>('[data-gallery-next]'),
  }
}

const show = (gallery: Gallery, index: number): void => {
  gallery.slides.forEach((slide, at) => {
    slide.toggleAttribute('data-gallery-current', at === index)
  })

  gallery.thumbs.forEach((thumb, at) => {
    if (at === index) thumb.setAttribute('aria-current', 'true')
    else thumb.removeAttribute('aria-current')
  })
}

const fly = (
  gallery: Gallery,
  slide: HTMLElement,
  thumb: HTMLElement,
): void => {
  gallery.root.setAttribute('data-gallery-flip', '')

  const state = Flip.getState(slide)

  Flip.fit(slide, thumb, { scale: true })
  Flip.to(state, {
    duration: FLIGHT,
    ease: 'power2.out',
    scale: true,
    onComplete: () => {
      gallery.root.removeAttribute('data-gallery-flip')
      gsap.set(slide, { clearProps: 'transform' })
    },
  })
}

const drive = (gallery: Gallery): void => {
  const total = gallery.slides.length
  let index = 0

  const move = (to: number): void => {
    index = (to + total) % total
    show(gallery, index)
  }

  move(0)

  gallery.thumbs.forEach((thumb, at) => {
    thumb.addEventListener('click', () => {
      if (at === index) return

      const slide = gallery.slides[at]

      move(at)

      if (morphs && slide !== undefined) fly(gallery, slide, thumb)
    })
  })

  gallery.prev?.addEventListener('click', () => {
    move(index - 1)
  })

  gallery.next?.addEventListener('click', () => {
    move(index + 1)
  })
}

export function initGallery(): void {
  const roots = Array.from(
    document.querySelectorAll<HTMLElement>('[data-gallery]'),
  )

  if (roots.length === 0) return

  mm.add(MOTION, () => {
    morphs = true

    return () => {
      morphs = false
    }
  })

  for (const root of roots) {
    const gallery = galleryOf(root)

    if (gallery !== null) drive(gallery)
  }
}
