import { gsap } from 'gsap'
import { DrawSVGPlugin } from 'gsap/DrawSVGPlugin'
import { Flip } from 'gsap/Flip'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText } from 'gsap/SplitText'

gsap.registerPlugin(DrawSVGPlugin, Flip, ScrollTrigger, SplitText)

ScrollTrigger.config({ ignoreMobileResize: true })

export const mm = gsap.matchMedia()

export const MOTION = '(prefers-reduced-motion: no-preference)'

export const REDUCE = '(prefers-reduced-motion: reduce)'

export const DESKTOP = '(width >= 1024px)'

export const BELOW_DESKTOP = '(width < 1024px)'

export const HOVER = '(hover: hover) and (pointer: fine)'

export { DrawSVGPlugin, Flip, gsap, ScrollTrigger, SplitText }
