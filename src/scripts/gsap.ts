import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

ScrollTrigger.config({ ignoreMobileResize: true })

export const mm = gsap.matchMedia()

export const MOTION = '(prefers-reduced-motion: no-preference)'

export const REDUCE = '(prefers-reduced-motion: reduce)'

export const DESKTOP = '(width >= 1024px)'

export const BELOW_DESKTOP = '(width < 1024px)'

export const HOVER = '(hover: hover) and (pointer: fine)'

export { gsap, ScrollTrigger }
