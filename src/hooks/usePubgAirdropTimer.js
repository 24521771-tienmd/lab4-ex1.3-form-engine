import { useEffect, useState } from 'react'
import {
  calculateRemainingMs,
  createAirdropTimerController,
} from '../utils/airdropTimer.js'

export function usePubgAirdropTimer(targetEpochMs, serverOffsetMs = 0) {
  const [remainingMs, setRemainingMs] = useState(() =>
    calculateRemainingMs(targetEpochMs, serverOffsetMs, Date.now()),
  )

  useEffect(() => {
    if (typeof window === 'undefined' || typeof document === 'undefined') {
      return undefined
    }

    const timer = createAirdropTimerController({
      targetEpochMs,
      serverOffsetMs,
      onUpdate: setRemainingMs,
      now: Date.now,
      requestFrame: (callback) => window.requestAnimationFrame(callback),
      cancelFrame: (frameId) => window.cancelAnimationFrame(frameId),
      subscribeVisibility: (onVisibilityChange) => {
        const handleVisibilityChange = () => {
          onVisibilityChange(document.visibilityState)
        }

        document.addEventListener('visibilitychange', handleVisibilityChange)

        return () => {
          document.removeEventListener(
            'visibilitychange',
            handleVisibilityChange,
          )
        }
      },
    })

    timer.start()

    return () => timer.stop()
  }, [targetEpochMs, serverOffsetMs])

  return remainingMs
}
