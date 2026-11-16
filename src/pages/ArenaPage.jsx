import { useState } from 'react'
import { airdropItems } from '../data/airdropItems.js'
import { DEMO_DROP_PHASE } from '../data/demoDropPhase.js'
import PubgVnLeaderboard from '../components/PubgVnLeaderboard.jsx'
import PubgVnKillFeed from '../components/PubgVnKillFeed.jsx'
import { useAirdropClaims } from '../hooks/useAirdropClaims.js'
import { usePubgAirdropTimer } from '../hooks/usePubgAirdropTimer.js'
import { demoAirdropClaimRequest } from '../services/demoAirdropClaimRequest.js'
import { formatVND } from '../utils/formatVND.js'

const DEMO_COUNTDOWN_DURATION_MS = 15 * 60 * 1000

function formatCountdown(remainingMs) {
  const totalSeconds = Math.ceil(remainingMs / 1000)
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60
  const pad = (value) => String(value).padStart(2, '0')

  if (hours > 0) {
    return `${hours}:${pad(minutes)}:${pad(seconds)}`
  }

  return `${pad(minutes)}:${pad(seconds)}`
}

export default function ArenaPage() {
  const [demoTargetEpochMs] = useState(
    () => Date.now() + DEMO_COUNTDOWN_DURATION_MS,
  )
  const remainingMs = usePubgAirdropTimer(demoTargetEpochMs, 0)
  const { items, claim } = useAirdropClaims({
    initialStockByItemKey: Object.fromEntries(
      airdropItems.map(({ key, initialStock }) => [key, initialStock]),
    ),
    requestClaim: demoAirdropClaimRequest,
  })

  return (
    <>
      <section className="arena-intro" aria-labelledby="arena-title">
        <p className="eyebrow">CHAMPIONSHIP &amp; AIRDROP ARENA</p>
        <h1 id="arena-title">KRAFTON x PUBG Vietnam</h1>
        <p className="intro-copy">
          Welcome to the PUBG Vietnam Championship and Airdrop Arena.
        </p>
      </section>

      <PubgVnLeaderboard />

      <PubgVnKillFeed />

      <section className="airdrop-section" aria-labelledby="airdrop-title">
        <div className="airdrop-heading">
          <div>
            <p className="eyebrow">LOCAL INTERACTION DEMO</p>
            <h2 id="airdrop-title">Airdrop items</h2>
          </div>
          <p className="demo-notice" role="note">
            Demonstration only. Prices and stock are illustrative; claims do
            not create real purchases, reservations, or transactions.
          </p>
        </div>

        <section
          className="airdrop-phase"
          aria-labelledby="airdrop-phase-title"
        >
          <h3 id="airdrop-phase-title">
            Demo drop phase: {DEMO_DROP_PHASE.label}
          </h3>
          <p>
            Illustrative demo state only; not an official or live Airdrop
            phase.
          </p>
        </section>

        <section
          className="airdrop-countdown"
          aria-labelledby="airdrop-countdown-title"
        >
          <h3 id="airdrop-countdown-title">Demo countdown</h3>
          <p className="airdrop-countdown-value">
            {remainingMs === 0
              ? 'Demo countdown complete'
              : `Time remaining: ${formatCountdown(remainingMs)}`}
          </p>
          <p className="airdrop-countdown-notice" role="note">
            Illustrative demo countdown: starts at 15:00 on each page load;
            not an official tournament schedule or live server time.
          </p>
        </section>

        <div className="airdrop-grid">
          {airdropItems.map((item) => {
            const claimState = items[item.key]
            const isPending = claimState.status === 'pending'
            const isOutOfStock = claimState.displayedStock <= 0

            let statusMessage = 'Ready for a local demo claim.'
            if (claimState.status === 'pending') {
              statusMessage = 'Demo claim in progress.'
            } else if (claimState.status === 'succeeded') {
              statusMessage =
                'Demo claim completed locally. No real transaction occurred.'
            } else if (claimState.status === 'conflict') {
              statusMessage =
                'The demo claim encountered a conflict. No real transaction occurred.'
            } else if (claimState.status === 'error') {
              statusMessage =
                'The demo claim failed. No real transaction occurred.'
            }

            return (
              <article className="airdrop-card" key={item.key}>
                <h3>{item.title}</h3>
                <p className="airdrop-description">{item.description}</p>
                <p className="airdrop-price">{formatVND(item.priceVnd)}</p>
                <p className="airdrop-stock">
                  Illustrative demo stock: {claimState.displayedStock}
                </p>
                <p className="claim-status" role="status" aria-live="polite">
                  {statusMessage}
                  {claimState.errorDescription
                    ? ` ${claimState.errorDescription}`
                    : ''}
                </p>
                <button
                  className="claim-button"
                  type="button"
                  onClick={() => claim(item.key)}
                  disabled={isPending || isOutOfStock}
                  aria-label={`Try demo claim for ${item.title}`}
                >
                  {isPending ? 'Claiming demo item…' : 'Try demo claim'}
                </button>
              </article>
            )
          })}
        </div>
      </section>
    </>
  )
}
