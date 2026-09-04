import { DESKTOP, gsap, HOVER, MOTION, mm } from '@/scripts/gsap'

const ANGLE = 6

const PERSPECTIVE = 900

const SETTLE = 0.5

const drive = (card: HTMLElement): (() => void) => {
  let queued = false
  let aimX = 0
  let aimY = 0

  const write = (): void => {
    queued = false

    gsap.to(card, {
      rotateX: -aimY * ANGLE,
      rotateY: aimX * ANGLE,
      transformPerspective: PERSPECTIVE,
      duration: SETTLE,
      ease: 'power2.out',
      overwrite: 'auto',
    })
  }

  const aim = (event: PointerEvent): void => {
    const box = card.getBoundingClientRect()

    aimX = ((event.clientX - box.left) / box.width - 0.5) * 2
    aimY = ((event.clientY - box.top) / box.height - 0.5) * 2

    if (queued) return

    queued = true
    requestAnimationFrame(write)
  }

  const rest = (): void => {
    aimX = 0
    aimY = 0
    write()
  }

  card.addEventListener('pointermove', aim)
  card.addEventListener('pointerleave', rest)

  return () => {
    card.removeEventListener('pointermove', aim)
    card.removeEventListener('pointerleave', rest)
    gsap.killTweensOf(card)
    gsap.set(card, { clearProps: 'transform,transformPerspective' })
  }
}

export function initTilt(): void {
  const cards = gsap.utils.toArray<HTMLElement>('[data-tilt]')

  if (cards.length === 0) return

  mm.add(`${DESKTOP} and ${HOVER} and ${MOTION}`, () => {
    const teardown = cards.map(drive)

    return () => {
      for (const stop of teardown) stop()
    }
  })
}
