import { useCallback, useEffect, useRef, useState } from 'react'
import { createAirdropClaimController } from '../utils/airdropClaimController.js'

export function useAirdropClaims({ initialStockByItemKey, requestClaim }) {
  const requestClaimRef = useRef(requestClaim)
  const stateSetterRef = useRef(null)
  const controllerRef = useRef(null)

  if (controllerRef.current === null) {
    let nextClaimId = 0
    controllerRef.current = createAirdropClaimController({
      initialStockByItemKey,
      requestClaim: (itemKey) => requestClaimRef.current(itemKey),
      createClaimId: () => `claim-${++nextClaimId}`,
      onStateChange: (items) => stateSetterRef.current?.(items),
    })
  }

  const [items, setItems] = useState(() => controllerRef.current.getState())

  useEffect(() => {
    requestClaimRef.current = requestClaim
    stateSetterRef.current = setItems
  }, [requestClaim])

  const claim = useCallback((itemKey) => {
    return controllerRef.current.claim(itemKey)
  }, [])

  return { items, claim }
}
