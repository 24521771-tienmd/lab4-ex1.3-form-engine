import assert from 'node:assert/strict'
import test from 'node:test'
import { DEMO_DROP_PHASE } from '../src/data/demoDropPhase.js'

test('uses the fixed WARMUP demo phase and its display label', () => {
  assert.deepEqual(DEMO_DROP_PHASE, {
    value: 'WARMUP',
    label: 'Warmup',
  })
  assert.equal(Object.isFrozen(DEMO_DROP_PHASE), true)
})
