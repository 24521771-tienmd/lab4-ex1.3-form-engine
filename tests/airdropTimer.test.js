import assert from 'node:assert/strict'
import test from 'node:test'
import {
  calculateRemainingMs,
  createAirdropTimerController,
} from '../src/utils/airdropTimer.js'

function createTimerHarness({
  targetEpochMs = 10_000,
  serverOffsetMs = 0,
  initialTime = 0,
} = {}) {
  let currentTime = initialTime
  let nextFrameId = 0
  const pendingFrames = new Map()
  const frameCallbacks = new Map()
  const canceledFrames = []
  const visibilityListeners = new Set()
  const updates = []

  const timer = createAirdropTimerController({
    targetEpochMs,
    serverOffsetMs,
    onUpdate: (remainingMs) => updates.push(remainingMs),
    now: () => currentTime,
    requestFrame: (callback) => {
      const frameId = ++nextFrameId
      pendingFrames.set(frameId, callback)
      frameCallbacks.set(frameId, callback)
      return frameId
    },
    cancelFrame: (frameId) => {
      canceledFrames.push(frameId)
      pendingFrames.delete(frameId)
    },
    subscribeVisibility: (listener) => {
      visibilityListeners.add(listener)
      return () => visibilityListeners.delete(listener)
    },
  })

  return {
    timer,
    updates,
    pendingFrames,
    frameCallbacks,
    canceledFrames,
    visibilityListeners,
    setTime(value) {
      currentTime = value
    },
    runFrame(frameId = pendingFrames.keys().next().value) {
      const callback = pendingFrames.get(frameId)
      assert.ok(callback, `Expected pending animation frame ${frameId}`)
      pendingFrames.delete(frameId)
      callback()
    },
    invokeFrameEvenIfCanceled(frameId) {
      const callback = frameCallbacks.get(frameId)
      assert.ok(callback, `Expected animation frame ${frameId} to exist`)
      callback()
    },
    emitVisibility(visibilityState) {
      for (const listener of visibilityListeners) {
        listener(visibilityState)
      }
    },
  }
}

test('calculates remaining time before the deadline', () => {
  assert.equal(calculateRemainingMs(10_000, 0, 2_500), 7_500)
})

test('returns zero exactly at the deadline', () => {
  assert.equal(calculateRemainingMs(10_000, 0, 10_000), 0)
})

test('returns zero after the deadline rather than a negative value', () => {
  assert.equal(calculateRemainingMs(10_000, 0, 12_500), 0)
})

test('applies a positive server offset to the current time', () => {
  assert.equal(calculateRemainingMs(10_000, 1_000, 2_500), 6_500)
})

test('applies a negative server offset to the current time', () => {
  assert.equal(calculateRemainingMs(10_000, -1_000, 2_500), 8_500)
})

test('recalculates after the injected clock jumps', () => {
  const harness = createTimerHarness()
  harness.timer.start()
  harness.setTime(2_500)
  harness.runFrame()

  assert.deepEqual(harness.updates, [10_000, 7_500])
})

test('keeps at most one animation frame pending', () => {
  const harness = createTimerHarness()
  harness.timer.start()
  harness.timer.start()

  assert.equal(harness.pendingFrames.size, 1)

  harness.runFrame()
  assert.equal(harness.pendingFrames.size, 1)
  assert.equal(harness.updates.length, 2)
})

test('each frame recalculates from the current clock, not the previous value', () => {
  const harness = createTimerHarness()
  harness.timer.start()
  harness.runFrame()
  harness.setTime(3_250)
  harness.runFrame()

  assert.deepEqual(harness.updates, [10_000, 10_000, 6_750])
})

test('ignores hidden visibility notifications', () => {
  const harness = createTimerHarness()
  harness.timer.start()
  harness.setTime(2_000)
  harness.emitVisibility('hidden')

  assert.deepEqual(harness.updates, [10_000])
  assert.equal(harness.pendingFrames.size, 1)
})

test('immediately recalculates and resumes when the document becomes visible', () => {
  const harness = createTimerHarness()
  harness.timer.start()
  harness.setTime(2_000)
  const previousFrameId = harness.pendingFrames.keys().next().value
  harness.emitVisibility('visible')

  assert.deepEqual(harness.updates, [10_000, 8_000])
  assert.deepEqual(harness.canceledFrames, [previousFrameId])
  assert.equal(harness.pendingFrames.size, 1)
})

test('stops scheduling frames once the deadline expires', () => {
  const harness = createTimerHarness()
  harness.timer.start()
  harness.setTime(10_000)
  harness.runFrame()

  assert.deepEqual(harness.updates, [10_000, 0])
  assert.equal(harness.pendingFrames.size, 0)
})

test('stop cancels a pending animation frame', () => {
  const harness = createTimerHarness()
  harness.timer.start()
  const pendingFrameId = harness.pendingFrames.keys().next().value

  harness.timer.stop()

  assert.deepEqual(harness.canceledFrames, [pendingFrameId])
  assert.equal(harness.pendingFrames.size, 0)
})

test('stop removes the visibility listener', () => {
  const harness = createTimerHarness()
  harness.timer.start()
  assert.equal(harness.visibilityListeners.size, 1)

  harness.timer.stop()

  assert.equal(harness.visibilityListeners.size, 0)
})

test('calling stop more than once is safe', () => {
  const harness = createTimerHarness()
  harness.timer.start()

  assert.doesNotThrow(() => {
    harness.timer.stop()
    harness.timer.stop()
  })
  assert.equal(harness.visibilityListeners.size, 0)
  assert.equal(harness.pendingFrames.size, 0)
})

test('a late frame callback after stop cannot publish or schedule another frame', () => {
  const harness = createTimerHarness()
  harness.timer.start()
  const pendingFrameId = harness.pendingFrames.keys().next().value
  harness.timer.stop()

  harness.invokeFrameEvenIfCanceled(pendingFrameId)

  assert.deepEqual(harness.updates, [10_000])
  assert.equal(harness.pendingFrames.size, 0)
})

test('restarting the controller does not create duplicate frames or listeners', () => {
  const harness = createTimerHarness()
  harness.timer.start()
  harness.timer.start()
  assert.equal(harness.pendingFrames.size, 1)
  assert.equal(harness.visibilityListeners.size, 1)

  const firstFrameId = harness.pendingFrames.keys().next().value
  harness.timer.stop()
  harness.timer.start()
  harness.timer.start()

  assert.equal(harness.pendingFrames.size, 1)
  assert.equal(harness.visibilityListeners.size, 1)

  harness.invokeFrameEvenIfCanceled(firstFrameId)
  assert.equal(harness.pendingFrames.size, 1)
  assert.equal(harness.visibilityListeners.size, 1)
  assert.deepEqual(harness.updates, [10_000, 10_000])
})
