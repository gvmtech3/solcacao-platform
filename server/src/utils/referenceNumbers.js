function randomDigits(length) {
  let out = ''
  for (let i = 0; i < length; i += 1) out += Math.floor(Math.random() * 10)
  return out
}

export function generateOrderNumber() {
  return `SC-${randomDigits(6)}`
}

export function generateQuoteNumber() {
  return `SC-B2B-${randomDigits(4)}`
}
