const PREFIX = '+7 '
const GROUPS = [3, 3, 2, 2]
const MAX = 10
const WHOLE = 10

export const LEAD = '7'

export const digitsOf = (text: string): string => text.replace(/\D/gu, '')

export const normalize = (digits: string): string =>
  digits.length > MAX ? digits.slice(-MAX) : digits

export const bufferFromValue = (value: string): string =>
  normalize(
    digitsOf(value.startsWith(PREFIX) ? value.slice(PREFIX.length) : value),
  )

export const formatPhone = (buffer: string): string => {
  if (buffer.length === 0) return ''

  const parts: string[] = []
  let at = 0

  for (const size of GROUPS) {
    if (at >= buffer.length) break

    parts.push(buffer.slice(at, at + size))
    at += size
  }

  return PREFIX + parts.join(' ')
}

const isDigit = (char: string): boolean => char >= '0' && char <= '9'

export const bufferIndexAt = (value: string, caret: number): number => {
  const edge = Math.min(caret, value.length)
  let index = 0

  for (let at = PREFIX.length; at < edge; at += 1) {
    if (isDigit(value.charAt(at))) index += 1
  }

  return index
}

export const caretFor = (value: string, index: number): number => {
  if (index <= 0) return Math.min(PREFIX.length, value.length)

  let seen = 0

  for (let at = PREFIX.length; at < value.length; at += 1) {
    if (!isDigit(value.charAt(at))) continue

    seen += 1

    if (seen === index) return at + 1
  }

  return value.length
}

export const insertedText = (event: InputEvent): string => {
  const transferred = event.dataTransfer?.getData('text') ?? ''

  return transferred.length > 0 ? transferred : (event.data ?? '')
}

export interface PhoneMask {
  digits: () => string
  clear: () => void
}

export function attachPhoneMask(input: HTMLInputElement): PhoneMask {
  let buffer = ''

  const render = (index: number): void => {
    const value = formatPhone(buffer)

    input.value = value

    const caret = caretFor(value, index)

    input.setSelectionRange(caret, caret)
  }

  const insert = (digits: string, from: number, to: number): void => {
    if (digits.length === 0) return

    const head = buffer.slice(0, from)
    const tail = buffer.slice(to)
    const added = digits.slice(0, Math.max(MAX - head.length - tail.length, 0))

    buffer = head + added + tail
    render(head.length + added.length)
  }

  const remove = (from: number, to: number): void => {
    const start = Math.max(from, 0)
    const end = Math.min(to, buffer.length)

    if (start >= end) return

    buffer = buffer.slice(0, start) + buffer.slice(end)
    render(start)
  }

  const edit = (event: InputEvent): void => {
    const type = event.inputType
    const start = input.selectionStart ?? 0
    const from = bufferIndexAt(input.value, start)
    const to = bufferIndexAt(input.value, input.selectionEnd ?? start)

    if (type === 'insertFromPaste') {
      event.preventDefault()

      const digits = digitsOf(insertedText(event))

      if (digits.length >= WHOLE) {
        buffer = normalize(digits)
        render(buffer.length)

        return
      }

      insert(digits, from, to)

      return
    }

    if (type === 'insertText') {
      event.preventDefault()
      insert(digitsOf(event.data ?? ''), from, to)

      return
    }

    if (type === 'deleteContentBackward') {
      event.preventDefault()

      if (from === to) remove(from - 1, from)
      else remove(from, to)

      return
    }

    if (type === 'deleteContentForward') {
      event.preventDefault()

      if (from === to) remove(from, from + 1)
      else remove(from, to)
    }
  }

  input.addEventListener('beforeinput', (event) => {
    const before = buffer

    edit(event)

    if (buffer === before) return

    input.dispatchEvent(new Event('input', { bubbles: true }))
  })

  input.addEventListener('input', () => {
    if (input.value === formatPhone(buffer)) return

    buffer = bufferFromValue(input.value)
    render(buffer.length)
  })

  input.addEventListener('focus', () => {
    if (buffer.length > 0) return

    buffer = LEAD
    render(buffer.length)
    requestAnimationFrame(() => {
      render(buffer.length)
    })
  })

  input.addEventListener('blur', () => {
    if (buffer !== LEAD) return

    buffer = ''
    input.value = ''
  })

  input.addEventListener('click', () => {
    const start = input.selectionStart ?? 0

    if (buffer.length === 0 || start >= PREFIX.length) return

    render(bufferIndexAt(input.value, start))
  })

  return {
    digits: () => buffer,
    clear: () => {
      buffer = ''
      input.value = ''
    },
  }
}
