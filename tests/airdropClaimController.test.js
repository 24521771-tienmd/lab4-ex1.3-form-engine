import assert from 'node:assert/strict'
import test from 'node:test'
import { createAirdropClaimController } from '../src/utils/airdropClaimController.js'

function createDeferred() {
  let resolve
  let reject
  const promise = new Promise((resolvePromise, rejectPromise) => {
    resolve = resolvePromise
    reject = rejectPromise
  })

  return { promise, resolve, reject }
}

function createClaimHarness({
  initialStockByItemKey = { crate: 3 },
  requestClaim = () => Promise.resolve(),
  onStateChange,
} = {}) {
  let nextClaimId = 0
  const claimCalls = []
  const controller = createAirdropClaimController({
    initialStockByItemKey,
    requestClaim: (itemKey) => {
      claimCalls.push(itemKey)
      return requestClaim(itemKey)
    },
    createClaimId: () => `claim-${++nextClaimId}`,
    onStateChange,
  })

  return { controller, claimCalls }
}

async function captureObserverErrors(run) {
  const originalConsoleError = console.error
  const reportedErrors = []
  console.error = (...args) => reportedErrors.push(args)

  try {
    const result = await run()
    return { result, reportedErrors }
  } finally {
    console.error = originalConsoleError
  }
}

test('initializes each item with matching authoritative and displayed stock', () => {
  const { controller } = createClaimHarness({
    initialStockByItemKey: { ticket: 2, crate: 4 },
  })

  assert.deepEqual(controller.getState(), {
    ticket: {
      authoritativeStock: 2,
      displayedStock: 2,
      status: 'idle',
      activeClaimId: null,
    },
    crate: {
      authoritativeStock: 4,
      displayedStock: 4,
      status: 'idle',
      activeClaimId: null,
    },
  })
})

test('decrements displayed stock optimistically and reports pending before resolution', async () => {
  const deferred = createDeferred()
  const { controller, claimCalls } = createClaimHarness({
    requestClaim: () => deferred.promise,
  })

  const resultPromise = controller.claim('crate')

  assert.deepEqual(controller.getState().crate, {
    authoritativeStock: 3,
    displayedStock: 2,
    status: 'pending',
    activeClaimId: 'claim-1',
  })
  assert.deepEqual(claimCalls, ['crate'])

  deferred.resolve()
  await resultPromise
})

test('marks a successful claim and retains the optimistic stock when no stock is returned', async () => {
  const { controller } = createClaimHarness({
    requestClaim: () => Promise.resolve({}),
  })

  const result = await controller.claim('crate')

  assert.equal(result.status, 'succeeded')
  assert.deepEqual(controller.getState().crate, {
    authoritativeStock: 3,
    displayedStock: 2,
    status: 'succeeded',
    activeClaimId: null,
  })
})

test('uses valid returned remainingStock as the authoritative and displayed value', async () => {
  const { controller } = createClaimHarness({
    requestClaim: () => Promise.resolve({ remainingStock: 8 }),
  })

  await controller.claim('crate')

  assert.deepEqual(controller.getState().crate, {
    authoritativeStock: 8,
    displayedStock: 8,
    status: 'succeeded',
    activeClaimId: null,
  })
})

test('rolls back only its optimistic decrement after HTTP 409', async () => {
  const { controller } = createClaimHarness({
    requestClaim: () => Promise.reject(Object.assign(new Error('Conflict'), {
      status: 409,
    })),
  })

  const result = await controller.claim('crate')

  assert.equal(result.status, 'conflict')
  assert.deepEqual(controller.getState().crate, {
    authoritativeStock: 3,
    displayedStock: 3,
    status: 'conflict',
    activeClaimId: null,
    errorDescription: 'Conflict',
  })
})

test('rolls back the optimistic decrement and reports unexpected failure', async () => {
  const { controller } = createClaimHarness({
    requestClaim: () => Promise.reject(new Error('Connection interrupted')),
  })

  const result = await controller.claim('crate')

  assert.equal(result.status, 'error')
  assert.equal(result.errorDescription, 'Connection interrupted')
  assert.deepEqual(controller.getState().crate, {
    authoritativeStock: 3,
    displayedStock: 3,
    status: 'error',
    activeClaimId: null,
    errorDescription: 'Connection interrupted',
  })
})

test('rejects duplicate claims for one item without a second request', async () => {
  const deferred = createDeferred()
  const { controller, claimCalls } = createClaimHarness({
    requestClaim: () => deferred.promise,
  })

  const firstClaim = controller.claim('crate')
  const duplicateResult = await controller.claim('crate')

  assert.deepEqual(duplicateResult, {
    accepted: false,
    reason: 'claim-in-progress',
  })
  assert.deepEqual(claimCalls, ['crate'])
  assert.equal(controller.getState().crate.displayedStock, 2)

  deferred.resolve()
  await firstClaim
})

test('allows independent claims for different items', async () => {
  const ticketRequest = createDeferred()
  const crateRequest = createDeferred()
  const { controller, claimCalls } = createClaimHarness({
    initialStockByItemKey: { ticket: 2, crate: 3 },
    requestClaim: (itemKey) =>
      itemKey === 'ticket' ? ticketRequest.promise : crateRequest.promise,
  })

  const ticketClaim = controller.claim('ticket')
  const crateClaim = controller.claim('crate')

  assert.deepEqual(claimCalls, ['ticket', 'crate'])
  assert.equal(controller.getState().ticket.status, 'pending')
  assert.equal(controller.getState().crate.status, 'pending')

  ticketRequest.resolve()
  crateRequest.resolve()
  await Promise.all([ticketClaim, crateClaim])
})

test('releases the item lock after a successful claim', async () => {
  const { controller, claimCalls } = createClaimHarness()

  await controller.claim('crate')
  const retryResult = await controller.claim('crate')

  assert.equal(retryResult.status, 'succeeded')
  assert.deepEqual(claimCalls, ['crate', 'crate'])
  assert.equal(controller.getState().crate.activeClaimId, null)
})

test('releases the item lock after conflict', async () => {
  let shouldConflict = true
  const { controller, claimCalls } = createClaimHarness({
    requestClaim: () => {
      if (shouldConflict) {
        shouldConflict = false
        return Promise.reject(Object.assign(new Error('Conflict'), {
          status: 409,
        }))
      }

      return Promise.resolve()
    },
  })

  await controller.claim('crate')
  const retryResult = await controller.claim('crate')

  assert.equal(retryResult.status, 'succeeded')
  assert.deepEqual(claimCalls, ['crate', 'crate'])
})

test('releases the item lock after unexpected request failure', async () => {
  let shouldFail = true
  const { controller, claimCalls } = createClaimHarness({
    requestClaim: () => {
      if (shouldFail) {
        shouldFail = false
        return Promise.reject(new Error('Temporary failure'))
      }

      return Promise.resolve()
    },
  })

  await controller.claim('crate')
  const retryResult = await controller.claim('crate')

  assert.equal(retryResult.status, 'succeeded')
  assert.deepEqual(claimCalls, ['crate', 'crate'])
})

test('does not make displayed stock negative or claim when stock is zero', async () => {
  const { controller, claimCalls } = createClaimHarness({
    initialStockByItemKey: { soldOut: 0 },
  })

  const result = await controller.claim('soldOut')

  assert.deepEqual(result, { accepted: false, reason: 'out-of-stock' })
  assert.equal(controller.getState().soldOut.displayedStock, 0)
  assert.deepEqual(claimCalls, [])
})

test('rejects unknown item keys without invoking the request', async () => {
  const { controller, claimCalls } = createClaimHarness()

  const result = await controller.claim('unknown')

  assert.deepEqual(result, { accepted: false, reason: 'unknown-item' })
  assert.deepEqual(claimCalls, [])
})

test('ignores invalid authoritative stock values in successful results', async () => {
  for (const remainingStock of [-1, 1.5, Number.NaN, Number.POSITIVE_INFINITY]) {
    const { controller } = createClaimHarness({
      requestClaim: () => Promise.resolve({ remainingStock }),
    })

    await controller.claim('crate')

    assert.deepEqual(controller.getState().crate, {
      authoritativeStock: 3,
      displayedStock: 2,
      status: 'succeeded',
      activeClaimId: null,
    })
  }
})

test('state snapshots and callback snapshots cannot mutate controller state', async () => {
  let callbackSnapshot
  const { controller } = createClaimHarness({
    onStateChange: (snapshot) => {
      callbackSnapshot = snapshot
    },
  })
  const snapshot = controller.getState()

  assert.equal(Object.isFrozen(snapshot), true)
  assert.equal(Object.isFrozen(snapshot.crate), true)
  assert.throws(() => {
    snapshot.crate.displayedStock = -100
  }, TypeError)

  await controller.claim('crate')

  assert.equal(Object.isFrozen(callbackSnapshot), true)
  assert.equal(Object.isFrozen(callbackSnapshot.crate), true)
  assert.equal(controller.getState().crate.displayedStock, 2)
})

test('a throwing pending observer does not prevent request execution or settlement', async () => {
  const deferred = createDeferred()
  let requestCount = 0
  const { controller } = createClaimHarness({
    requestClaim: () => {
      requestCount += 1
      return deferred.promise
    },
    onStateChange: (snapshot) => {
      if (snapshot.crate.status === 'pending') {
        throw new Error('Pending observer failed')
      }
    },
  })

  const { result, reportedErrors } = await captureObserverErrors(async () => {
    const claimPromise = controller.claim('crate')

    assert.equal(requestCount, 1)
    assert.equal(controller.getState().crate.status, 'pending')

    deferred.resolve()
    return claimPromise
  })

  assert.equal(result.status, 'succeeded')
  assert.equal(controller.getState().crate.activeClaimId, null)
  assert.equal(reportedErrors.length, 1)
  assert.equal(reportedErrors[0][0], 'Airdrop claim state observer failed.')
})

test('a throwing success observer does not change the result or retain the item lock', async () => {
  let requestCount = 0
  const { controller } = createClaimHarness({
    requestClaim: () => {
      requestCount += 1
      return Promise.resolve()
    },
    onStateChange: (snapshot) => {
      if (snapshot.crate.status === 'succeeded') {
        throw new Error('Success observer failed')
      }
    },
  })

  const { result, reportedErrors } = await captureObserverErrors(async () => {
    const firstResult = await controller.claim('crate')
    const retryResult = await controller.claim('crate')
    return { firstResult, retryResult }
  })

  assert.equal(result.firstResult.status, 'succeeded')
  assert.equal(result.retryResult.status, 'succeeded')
  assert.equal(requestCount, 2)
  assert.equal(controller.getState().crate.activeClaimId, null)
  assert.equal(reportedErrors.length, 2)
})

test('a throwing conflict observer does not prevent conflict state or lock release', async () => {
  let requestCount = 0
  const { controller } = createClaimHarness({
    requestClaim: () => {
      requestCount += 1
      if (requestCount === 1) {
        return Promise.reject(Object.assign(new Error('Conflict'), {
          status: 409,
        }))
      }
      return Promise.resolve()
    },
    onStateChange: (snapshot) => {
      if (snapshot.crate.status === 'conflict') {
        throw new Error('Conflict observer failed')
      }
    },
  })

  const { result, reportedErrors } = await captureObserverErrors(async () => {
    const firstResult = await controller.claim('crate')
    const retryResult = await controller.claim('crate')
    return { firstResult, retryResult }
  })

  assert.equal(result.firstResult.status, 'conflict')
  assert.equal(result.retryResult.status, 'succeeded')
  assert.deepEqual(controller.getState().crate, {
    authoritativeStock: 3,
    displayedStock: 2,
    status: 'succeeded',
    activeClaimId: null,
  })
  assert.equal(reportedErrors.length, 1)
  assert.equal(requestCount, 2)
})

test('a throwing error observer does not prevent error state or lock release', async () => {
  let requestCount = 0
  const { controller } = createClaimHarness({
    requestClaim: () => {
      requestCount += 1
      if (requestCount === 1) {
        return Promise.reject(new Error('Connection interrupted'))
      }
      return Promise.resolve()
    },
    onStateChange: (snapshot) => {
      if (snapshot.crate.status === 'error') {
        throw new Error('Error observer failed')
      }
    },
  })

  const { result, reportedErrors } = await captureObserverErrors(async () => {
    const firstResult = await controller.claim('crate')
    const retryResult = await controller.claim('crate')
    return { firstResult, retryResult }
  })

  assert.equal(result.firstResult.status, 'error')
  assert.equal(result.retryResult.status, 'succeeded')
  assert.deepEqual(controller.getState().crate, {
    authoritativeStock: 3,
    displayedStock: 2,
    status: 'succeeded',
    activeClaimId: null,
  })
  assert.equal(reportedErrors.length, 1)
  assert.equal(requestCount, 2)
})
