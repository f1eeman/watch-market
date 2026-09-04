import { BASE } from '@/scripts/reveal'
import { gsap, MOTION, mm, SplitText } from '@/scripts/gsap'

const OVERSHOOT = 110

const WORD_STAGGER = 0.06

const sweep = (block: HTMLElement): SplitText =>
  SplitText.create(block, {
    type: 'words',
    mask: 'words',
    wordsClass: 'sweep-word',
    aria: 'auto',
    autoSplit: true,
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    onSplit: (split) =>
      gsap.from(split.words, {
        yPercent: OVERSHOOT,
        duration: BASE.duration,
        ease: BASE.ease,
        stagger: WORD_STAGGER,
        clearProps: 'transform',
        scrollTrigger: { trigger: block, start: BASE.start, once: true },
      }),
  })

const draw = (line: HTMLElement): void => {
  gsap.from(line, {
    scaleX: 0,
    duration: BASE.duration,
    ease: BASE.ease,
    clearProps: 'transform',
    scrollTrigger: { trigger: line, start: BASE.start, once: true },
  })
}

export function initSweep(): void {
  const blocks = gsap.utils.toArray<HTMLElement>('[data-sweep]')
  const lines = gsap.utils.toArray<HTMLElement>('[data-sweep-line]')

  if (blocks.length === 0 && lines.length === 0) return

  mm.add(MOTION, () => {
    const splits = blocks.map(sweep)

    for (const line of lines) draw(line)

    return () => {
      for (const split of splits) split.revert()
    }
  })
}
