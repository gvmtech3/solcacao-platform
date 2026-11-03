const SWATCHES_BY_TYPE = {
  bar: ['from-cacao-500 to-cacao-700', 'from-cacao-700 to-cacao-900', 'from-gold-400 to-cacao-500', 'from-gold-400 to-gold-600'],
  truffle: ['from-cacao-600 to-gold-500', 'from-cacao-800 to-cacao-600', 'from-gold-300 to-cacao-500'],
  seasonal: ['from-cacao-500 to-gold-500', 'from-cacao-400 to-cacao-600'],
}

function hashString(str) {
  let hash = 0
  for (let i = 0; i < str.length; i += 1) {
    hash = (hash * 31 + str.charCodeAt(i)) >>> 0
  }
  return hash
}

export function getSwatch(product) {
  const options = SWATCHES_BY_TYPE[product?.productType] || SWATCHES_BY_TYPE.bar
  const key = product?.sku || product?._id || product?.id || ''
  const index = hashString(String(key)) % options.length
  return options[index]
}
