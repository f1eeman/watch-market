import { BELOW_DESKTOP, DESKTOP, gsap, MOTION, mm } from '@/scripts/gsap'

export type Direction = 'up' | 'down' | 'left' | 'right' | 'fade'

export interface Base {
  shift: number
  duration: number
  ease: string
  start: string
}

const SHIFT = 128

export const BASE: Base = {
  shift: SHIFT,
  duration: 0.7,
  ease: 'power2.out',
  start: 'top bottom',
}

export const STILL_START = `top bottom-=${String(SHIFT)}px`

export const DEFAULT_STAGGER = 0.12

type Mode = 'block' | 'each' | 'stagger'

interface Scope {
  query: string
  mode: Mode
}

export const offsetsOf = (
  shift: number,
): Record<Direction, { x?: number; y?: number }> => ({
  up: { y: shift },
  down: { y: -shift },
  left: { x: -shift },
  right: { x: shift },
  fade: {},
})

export const isDirection = (value: string | undefined): value is Direction =>
  value === 'up' ||
  value === 'down' ||
  value === 'left' ||
  value === 'right' ||
  value === 'fade'

const scopesOf = (block: HTMLElement): Scope[] => {
  const below = block.dataset['revealBelow']
  const limit = below === undefined ? undefined : Number.parseFloat(below)

  if (limit !== undefined && !Number.isFinite(limit)) return []

  const gate =
    limit === undefined ? MOTION : `(width < ${String(limit)}px) and ${MOTION}`

  if (block.dataset['revealEach'] !== undefined)
    return [{ query: gate, mode: 'each' }]

  if (block.dataset['revealStagger'] !== undefined)
    return [
      { query: `${gate} and ${BELOW_DESKTOP}`, mode: 'each' },
      { query: `${gate} and ${DESKTOP}`, mode: 'stagger' },
    ]

  return [{ query: gate, mode: 'block' }]
}

const byQuery = (
  blocks: readonly HTMLElement[],
): Map<string, { block: HTMLElement; mode: Mode }[]> => {
  const scopes = new Map<string, { block: HTMLElement; mode: Mode }[]>()

  for (const block of blocks) {
    for (const { query, mode } of scopesOf(block)) {
      const scope = scopes.get(query)

      if (scope === undefined) scopes.set(query, [{ block, mode }])
      else scope.push({ block, mode })
    }
  }

  return scopes
}

const reveal = (block: HTMLElement, mode: Mode): void => {
  const direction = block.dataset['reveal']
  const from = offsetsOf(BASE.shift)[isDirection(direction) ? direction : 'up']
  const own = block.dataset['revealStart']
  const motion = {
    ...from,
    autoAlpha: 0,
    duration: BASE.duration,
    ease: BASE.ease,
  }

  if (mode === 'each') {
    const start = own ?? BASE.start

    for (const child of Array.from(block.children)) {
      gsap.from(child, {
        ...motion,
        scrollTrigger: { trigger: child, start, once: true },
      })
    }

    return
  }

  if (mode === 'stagger') {
    gsap.from(Array.from(block.children), {
      ...motion,
      stagger: Number(block.dataset['revealStagger']) || DEFAULT_STAGGER,
      scrollTrigger: {
        trigger: block,
        start: own ?? STILL_START,
        once: true,
      },
    })

    return
  }

  gsap.from(block, {
    ...motion,
    scrollTrigger: { trigger: block, start: own ?? BASE.start, once: true },
  })
}

export function initReveal(): void {
  const blocks = gsap.utils.toArray<HTMLElement>('[data-reveal]')

  if (blocks.length === 0) return

  for (const [query, scope] of byQuery(blocks)) {
    mm.add(query, () => {
      for (const { block, mode } of scope) reveal(block, mode)
    })
  }
}
