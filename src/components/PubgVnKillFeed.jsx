import { useId, useState } from 'react'
import {
  initialKillFeedEvents,
  KILL_FEED_DATA_SOURCE,
} from '../data/killFeedEvents.js'
import { filterKillFeedEvents } from '../utils/filterKillFeedEvents.js'

const squadOptions = [
  { value: 'te', label: 'The Expendables' },
  { value: 'ces', label: 'Cerberus Esports' },
  { value: 'ge', label: 'Roy Esports' },
  { value: 'agg', label: 'AGG' },
]

const squadNames = Object.fromEntries(
  squadOptions.map(({ value, label }) => [value, label]),
)

const eventTimeFormatter = new Intl.DateTimeFormat('vi-VN', {
  dateStyle: 'medium',
  timeStyle: 'short',
})

export default function PubgVnKillFeed() {
  const controlId = useId()
  const [selectedSquadId, setSelectedSquadId] = useState('all')
  const [playerQuery, setPlayerQuery] = useState('')
  const events = filterKillFeedEvents(initialKillFeedEvents, {
    squadId: selectedSquadId,
    playerQuery,
  })

  return (
    <section
      className="kill-feed-section"
      aria-labelledby={`${controlId}-title`}
    >
      <h2 className="kill-feed-title" id={`${controlId}-title`}>
        PUBG Vietnam Kill Feed
      </h2>
      <p className="kill-feed-source" role="note">
        {KILL_FEED_DATA_SOURCE}
      </p>

      <div className="kill-feed-controls">
        <label className="kill-feed-control" htmlFor={`${controlId}-squad`}>
          Filter by squad
          <select
            id={`${controlId}-squad`}
            value={selectedSquadId}
            onChange={(event) => setSelectedSquadId(event.target.value)}
          >
            <option value="all">All squads</option>
            {squadOptions.map(({ value, label }) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>

        <label className="kill-feed-control" htmlFor={`${controlId}-player`}>
          Search players
          <input
            id={`${controlId}-player`}
            type="search"
            value={playerQuery}
            onChange={(event) => setPlayerQuery(event.target.value)}
            placeholder="Enter a player name"
          />
        </label>
      </div>

      {events.length === 0 ? (
        <p className="kill-feed-empty">No events match these filters.</p>
      ) : (
        <ol className="kill-feed-list">
          {events.map((event) => (
            <li className="kill-feed-event" key={event.id}>
              <p className="kill-feed-description">
                <strong>{event.killerName}</strong>
                <span> ({squadNames[event.killerSquadId]}) eliminated </span>
                <strong>{event.victimName}</strong>
                <span> ({squadNames[event.victimSquadId]}) with </span>
                <span>{event.weaponLabel}</span>
              </p>
              <time
                className="kill-feed-time"
                dateTime={new Date(event.occurredAtEpochMs).toISOString()}
              >
                {eventTimeFormatter.format(
                  new Date(event.occurredAtEpochMs),
                )}
              </time>
            </li>
          ))}
        </ol>
      )}
    </section>
  )
}
