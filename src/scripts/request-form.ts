import {
  attachPhoneMask,
  insertedText,
  LEAD,
  type PhoneMask,
} from '@/scripts/phone-mask'

const ALLOWED = /[^A-Za-zА-Яа-яЁёӘәҒғҚқҢңӨөҰұҮүҺһІі '-]/gu
const NAME_MIN = 2
const PHONE_LENGTH = 10

const STATE = 'data-bid-state'
const REDUCE = '(prefers-reduced-motion: reduce)'

interface Field {
  input: HTMLInputElement
  box: HTMLElement
  text: HTMLElement
}

const sanitizeName = (text: string): string => text.replace(ALLOWED, '')

const nameError = (value: string): string => {
  const trimmed = value.trim()

  if (trimmed.length === 0) return 'Укажите имя'
  if (trimmed.length < NAME_MIN)
    return 'Имя должно быть не короче двух символов'

  return ''
}

const phoneError = (digits: string): string => {
  if (digits.length === 0 || digits === LEAD) return 'Укажите номер телефона'
  if (digits.length < PHONE_LENGTH) return 'Введите номер полностью'

  return ''
}

const fieldOf = (form: HTMLFormElement, hook: string): Field | null => {
  const input = form.querySelector<HTMLInputElement>(`[data-bid-${hook}]`)
  const box = form.querySelector<HTMLElement>(`#bid-${hook}-error`)
  const text = box?.querySelector<HTMLElement>('span') ?? null

  if (input === null || box === null || text === null) return null

  box.addEventListener('transitionend', (event) => {
    if (event.propertyName !== 'height') return
    if (box.hasAttribute('data-shown')) return

    text.textContent = ''
  })

  return { input, box, text }
}

const mark = (field: Field, message: string): void => {
  if (message.length === 0) {
    field.box.removeAttribute('data-shown')
    field.input.removeAttribute('aria-invalid')

    if (window.matchMedia(REDUCE).matches) field.text.textContent = ''

    return
  }

  field.text.textContent = message
  field.box.setAttribute('data-shown', '')
  field.input.setAttribute('aria-invalid', 'true')
}

const forgetOnInput = (field: Field): void => {
  field.input.addEventListener('input', () => {
    if (field.input.hasAttribute('aria-invalid')) mark(field, '')
  })
}

const filterName = (input: HTMLInputElement): void => {
  input.addEventListener('beforeinput', (event) => {
    const type = event.inputType

    if (type !== 'insertText' && type !== 'insertFromPaste') return

    const raw = insertedText(event)
    const clean = sanitizeName(raw)

    if (clean === raw) return

    event.preventDefault()

    if (clean.length === 0) return

    const start = input.selectionStart ?? 0

    input.setRangeText(clean, start, input.selectionEnd ?? start, 'end')
    input.dispatchEvent(new Event('input', { bubbles: true }))
  })

  input.addEventListener('input', () => {
    const clean = sanitizeName(input.value)

    if (clean === input.value) return

    const caret = input.selectionStart ?? input.value.length
    const kept = sanitizeName(input.value.slice(0, caret)).length

    input.value = clean
    input.setSelectionRange(kept, kept)
  })
}

const send = (name: Field, mask: PhoneMask): void => {
  console.log({
    name: name.input.value.trim(),
    phone: `+7${mask.digits()}`,
  })
}

const wireDone = (card: HTMLElement, restore: () => void): (() => void) => {
  const title = card.querySelector<HTMLElement>('[data-bid-title]')
  const back = card.querySelector<HTMLElement>('[data-bid-reset]')

  back?.addEventListener('click', () => {
    card.removeAttribute(STATE)
    restore()
  })

  return () => {
    card.setAttribute(STATE, 'done')
    title?.focus()
  }
}

const setup = (form: HTMLFormElement): void => {
  const name = fieldOf(form, 'name')
  const phone = fieldOf(form, 'phone')

  if (name === null || phone === null) return

  const mask = attachPhoneMask(phone.input)
  const card = form.closest<HTMLElement>('[data-bid-card]')

  filterName(name.input)
  forgetOnInput(name)
  forgetOnInput(phone)

  const done =
    card === null
      ? null
      : wireDone(card, () => {
          form.reset()
          mask.clear()
          mark(name, '')
          mark(phone, '')
          name.input.focus()
        })

  form.addEventListener('submit', (event) => {
    event.preventDefault()

    const messages = [
      { field: name, message: nameError(name.input.value) },
      { field: phone, message: phoneError(mask.digits()) },
    ]

    for (const { field, message } of messages) mark(field, message)

    const broken = messages.find(({ message }) => message.length > 0)

    if (broken !== undefined) {
      broken.field.input.focus()

      return
    }

    send(name, mask)
    done?.()
  })
}

export function initRequestForm(): void {
  for (const form of document.querySelectorAll<HTMLFormElement>(
    '[data-bid-form]',
  )) {
    setup(form)
  }
}
