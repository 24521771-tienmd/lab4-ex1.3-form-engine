const vndFormatter = new Intl.NumberFormat('vi-VN', {
  style: 'currency',
  currency: 'VND',
  maximumFractionDigits: 0,
})

export function formatVND(amount) {
  if (typeof amount !== 'number') {
    throw new TypeError('VND amount must be a number.')
  }

  if (!Number.isFinite(amount)) {
    throw new RangeError('VND amount must be finite.')
  }

  return vndFormatter.format(amount)
}
