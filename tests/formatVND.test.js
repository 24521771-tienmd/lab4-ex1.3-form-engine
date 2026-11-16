import assert from 'node:assert/strict'
import test from 'node:test'
import { formatVND } from '../src/utils/formatVND.js'

const expectedFormatter = new Intl.NumberFormat('vi-VN', {
  style: 'currency',
  currency: 'VND',
  maximumFractionDigits: 0,
})

test('formats a typical VND amount using Vietnamese currency formatting', () => {
  assert.equal(formatVND(1_234_567), expectedFormatter.format(1_234_567))
})

test('formats zero as VND', () => {
  assert.equal(formatVND(0), expectedFormatter.format(0))
})

test('formats a negative numeric amount as VND', () => {
  assert.equal(formatVND(-25_000), expectedFormatter.format(-25_000))
})

test('throws TypeError for non-number input', () => {
  for (const amount of ['1000', null, true, undefined, {}, []]) {
    assert.throws(() => formatVND(amount), TypeError)
  }
})

test('throws RangeError for NaN', () => {
  assert.throws(() => formatVND(Number.NaN), RangeError)
})

test('throws RangeError for positive and negative infinity', () => {
  assert.throws(() => formatVND(Number.POSITIVE_INFINITY), RangeError)
  assert.throws(() => formatVND(Number.NEGATIVE_INFINITY), RangeError)
})
