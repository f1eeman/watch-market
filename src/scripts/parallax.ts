import { DESKTOP, gsap, MOTION, mm } from '@/scripts/gsap'

const DEFAULT_DEPTH = 0.3

const SELECTOR =
  '[data-parallax], [data-parallax-rotate], [data-parallax-scale]'

const numberOf = (raw: string | undefined, fallback: number): number => {
  if (raw === undefined || raw === '') return fallback

  const value = Number.parseFloat(raw)

  return Number.isFinite(value) ? value : fallback
}

const sceneOf = (layer: HTMLElement): HTMLElement =>
  layer.closest<HTMLElement>('[data-parallax-scene]') ??
  layer.parentElement ??
  layer

const drive = (layer: HTMLElement): void => {
  const from: Record<string, number> = {}
  const to: Record<string, number> = {}
  const { parallax, parallaxRotate, parallaxScale } = layer.dataset

  if (parallax !== undefined)
    to['yPercent'] = numberOf(parallax, DEFAULT_DEPTH) * 100

  if (parallaxRotate !== undefined) to['rotate'] = numberOf(parallaxRotate, 0)

  if (parallaxScale !== undefined) {
    from['scale'] = numberOf(parallaxScale, 1)
    to['scale'] = 1
  }

  if (Object.keys(to).length === 0) return

  const scene = sceneOf(layer)
  const vars = {
    ...to,
    ease: 'none',
    scrollTrigger: {
      trigger: scene,
      start: 'clamp(top bottom)',
      end: 'clamp(bottom top)',
      scrub: true,
    },
  }

  if (Object.keys(from).length === 0) gsap.to(layer, vars)
  else gsap.fromTo(layer, from, vars)
}

export function initParallax(): void {
  const layers = gsap.utils.toArray<HTMLElement>(SELECTOR)

  if (layers.length === 0) return

  mm.add(`${DESKTOP} and ${MOTION}`, () => {
    for (const layer of layers) drive(layer)
  })
}
