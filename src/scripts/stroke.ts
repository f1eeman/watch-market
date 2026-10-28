import { BASE } from '@/scripts/reveal'
import { gsap, MOTION, mm } from '@/scripts/gsap'

const DURATION = 1.6

const sceneOf = (path: SVGElement): Element =>
  path.closest('[data-stroke-scene]') ?? path

const drive = (path: SVGElement): void => {
  gsap.from(path, {
    drawSVG: '0%',
    duration: DURATION,
    ease: 'power2.inOut',
    scrollTrigger: { trigger: sceneOf(path), start: BASE.start, once: true },
  })
}

export function initStroke(): void {
  const paths = gsap.utils.toArray<SVGElement>('[data-stroke]')

  if (paths.length === 0) return

  mm.add(MOTION, () => {
    for (const path of paths) drive(path)
  })
}
