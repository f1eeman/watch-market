import { gsap, MOTION, mm } from '@/scripts/gsap'

const DEFAULT_DEPTH = 0.3

export function initParallax(): void {
  const layers = gsap.utils.toArray<HTMLElement>('[data-parallax]')

  if (layers.length === 0) return

  mm.add(`(width >= 1024px) and ${MOTION}`, () => {
    for (const layer of layers) {
      const depth = Number(layer.dataset['parallax']) || DEFAULT_DEPTH
      const scene =
        layer.closest<HTMLElement>('[data-parallax-scene]') ??
        layer.parentElement ??
        layer

      gsap.to(layer, {
        yPercent: depth * 100,
        ease: 'none',
        scrollTrigger: {
          trigger: scene,
          start: 'clamp(top bottom)',
          end: 'clamp(bottom top)',
          scrub: true,
        },
      })
    }
  })
}
