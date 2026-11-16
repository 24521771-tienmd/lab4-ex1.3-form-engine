const CLAIM_STATUSES = Object.freeze({
  IDLE: 'idle',
  PENDING: 'pending',
  SUCCEEDED: 'succeeded',
  CONFLICT: 'conflict',
  ERROR: 'error',
})

function createItemState(stock) {
  return {
    authoritativeStock: stock,
    displayedStock: stock,
    status: CLAIM_STATUSES.IDLE,
    activeClaimId: null,
  }
}

function omitErrorDescription(state) {
  const stateWithoutError = { ...state }
  delete stateWithoutError.errorDescription
  return stateWithoutError
}

function isValidStock(stock) {
  return Number.isSafeInteger(stock) && stock >= 0
}

function getErrorDescription(error) {
  if (error instanceof Error && error.message) {
    return error.message
  }

  return 'The claim request failed.'
}

export function createAirdropClaimController({
  initialStockByItemKey,
  requestClaim,
  createClaimId,
  onStateChange = () => {},
}) {
  if (
    initialStockByItemKey === null ||
    typeof initialStockByItemKey !== 'object' ||
    Array.isArray(initialStockByItemKey)
  ) {
    throw new TypeError('Initial stock must be an item-keyed object.')
  }

  if (typeof requestClaim !== 'function') {
    throw new TypeError('requestClaim must be a function.')
  }

  if (typeof createClaimId !== 'function') {
    throw new TypeError('createClaimId must be a function.')
  }

  if (typeof onStateChange !== 'function') {
    throw new TypeError('onStateChange must be a function.')
  }

  const items = new Map()
  const issuedClaimIds = new Set()

  for (const [itemKey, stock] of Object.entries(initialStockByItemKey)) {
    if (!isValidStock(stock)) {
      throw new RangeError(
        `Initial stock for "${itemKey}" must be a non-negative safe integer.`,
      )
    }

    items.set(itemKey, createItemState(stock))
  }

  function getState() {
    const snapshot = Object.fromEntries(
      [...items].map(([itemKey, state]) => [
        itemKey,
        Object.freeze({ ...state }),
      ]),
    )

    return Object.freeze(snapshot)
  }

  function publishState() {
    try {
      onStateChange(getState())
    } catch (error) {
      // Observer failures are reported without interrupting claim transitions.
      console.error('Airdrop claim state observer failed.', error)
    }
  }

  function updateItem(itemKey, nextState) {
    items.set(itemKey, nextState)
    publishState()
  }

  function claim(itemKey) {
    const currentState = items.get(itemKey)

    if (!currentState) {
      return Promise.resolve({ accepted: false, reason: 'unknown-item' })
    }

    if (currentState.activeClaimId !== null) {
      return Promise.resolve({ accepted: false, reason: 'claim-in-progress' })
    }

    if (currentState.displayedStock <= 0) {
      return Promise.resolve({ accepted: false, reason: 'out-of-stock' })
    }

    const claimId = createClaimId()

    if (typeof claimId !== 'string' || claimId.length === 0) {
      throw new TypeError('createClaimId must return a non-empty string.')
    }

    if (issuedClaimIds.has(claimId)) {
      throw new Error('createClaimId returned a previously used claim ID.')
    }
    issuedClaimIds.add(claimId)

    updateItem(itemKey, {
      ...omitErrorDescription(currentState),
      displayedStock: Math.max(0, currentState.displayedStock - 1),
      status: CLAIM_STATUSES.PENDING,
      activeClaimId: claimId,
    })

    return settleClaim(itemKey, claimId)
  }

  async function settleClaim(itemKey, claimId) {
    try {
      const result = await requestClaim(itemKey)
      const currentState = items.get(itemKey)

      if (!currentState || currentState.activeClaimId !== claimId) {
        return { accepted: true, claimId, stale: true }
      }

      const hasAuthoritativeStock =
        result !== null &&
        typeof result === 'object' &&
        isValidStock(result.remainingStock)
      const authoritativeStock = hasAuthoritativeStock
        ? result.remainingStock
        : currentState.authoritativeStock
      const displayedStock = hasAuthoritativeStock
        ? authoritativeStock
        : currentState.displayedStock

      updateItem(itemKey, {
        authoritativeStock,
        displayedStock,
        status: CLAIM_STATUSES.SUCCEEDED,
        activeClaimId: null,
      })

      return { accepted: true, claimId, status: CLAIM_STATUSES.SUCCEEDED }
    } catch (error) {
      const currentState = items.get(itemKey)

      if (!currentState || currentState.activeClaimId !== claimId) {
        return { accepted: true, claimId, stale: true }
      }

      const isConflict = error?.status === 409
      const status = isConflict
        ? CLAIM_STATUSES.CONFLICT
        : CLAIM_STATUSES.ERROR

      updateItem(itemKey, {
        ...currentState,
        displayedStock: Math.max(0, currentState.displayedStock + 1),
        status,
        activeClaimId: null,
        errorDescription: getErrorDescription(error),
      })

      return {
        accepted: true,
        claimId,
        status,
        errorDescription: getErrorDescription(error),
      }
    }
  }

  return Object.freeze({ getState, claim })
}
