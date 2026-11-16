export function calculateRemainingMs(
  targetEpochMs,
  serverOffsetMs,
  now,
) {
  return Math.max(0, targetEpochMs - (now + serverOffsetMs))
}

export function createAirdropTimerController({
  targetEpochMs,
  serverOffsetMs = 0,
  onUpdate,
  now = Date.now,
  requestFrame,
  cancelFrame,
  subscribeVisibility,
}) {
  let running = false
  let generation = 0
  let nextFrameToken = 0
  let pendingFrameId = null
  let pendingFrameToken = null
  let unsubscribeVisibility

  function isCurrentRun(runGeneration) {
    return running && generation === runGeneration
  }

  function cancelPendingFrame() {
    if (pendingFrameId === null) {
      return
    }

    cancelFrame(pendingFrameId)
    pendingFrameId = null
    pendingFrameToken = null
  }

  function updateAndSchedule(runGeneration) {
    if (!isCurrentRun(runGeneration)) {
      return
    }

    const remainingMs = calculateRemainingMs(
      targetEpochMs,
      serverOffsetMs,
      now(),
    )
    onUpdate(remainingMs)

    if (remainingMs > 0 && isCurrentRun(runGeneration)) {
      scheduleFrame(runGeneration)
    }
  }

  function scheduleFrame(runGeneration) {
    if (!isCurrentRun(runGeneration) || pendingFrameId !== null) {
      return
    }

    const frameToken = ++nextFrameToken
    pendingFrameToken = frameToken
    pendingFrameId = requestFrame(() => {
      if (
        pendingFrameToken !== frameToken ||
        !isCurrentRun(runGeneration)
      ) {
        return
      }

      pendingFrameId = null
      pendingFrameToken = null
      updateAndSchedule(runGeneration)
    })
  }

  function start() {
    if (running) {
      return
    }

    running = true
    const runGeneration = ++generation

    unsubscribeVisibility = subscribeVisibility((visibilityState) => {
      if (
        visibilityState !== 'visible' ||
        !isCurrentRun(runGeneration)
      ) {
        return
      }

      cancelPendingFrame()
      updateAndSchedule(runGeneration)
    })

    updateAndSchedule(runGeneration)
  }

  function stop() {
    if (!running) {
      return
    }

    running = false
    generation += 1
    cancelPendingFrame()

    if (unsubscribeVisibility) {
      unsubscribeVisibility()
      unsubscribeVisibility = undefined
    }
  }

  return { start, stop }
}
