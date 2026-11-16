import { useId, useState } from 'react'
import { initialSquadStandings, SQUAD_STANDINGS_DATA_SOURCE } from '../data/squadStandings.js'
import {
  filterSquadStandings,
  sortSquadStandings,
} from '../utils/pubgVnLeaderboard.js'

const squadOptions = [
  { value: 'te', label: 'The Expendables' },
  { value: 'ces', label: 'Cerberus Esports' },
  { value: 'ge', label: 'Roy Esports' },
  { value: 'agg', label: 'AGG' },
]

const sortOptions = [
  { value: 'wwcdCount', label: 'WWCD' },
  { value: 'placementPts', label: 'Placement Points' },
  { value: 'killPts', label: 'Kill Points' },
]

export default function PubgVnLeaderboard() {
  const controlId = useId()
  const [selectedSquadId, setSelectedSquadId] = useState('all')
  const [selectedSortKey, setSelectedSortKey] = useState('wwcdCount')
  const filteredStandings = filterSquadStandings(
    initialSquadStandings,
    selectedSquadId,
  )
  const displayedStandings = sortSquadStandings(
    filteredStandings,
    selectedSortKey,
  )

  return (
    <section
      className="leaderboard-section"
      aria-labelledby={`${controlId}-title`}
    >
      <h2 className="leaderboard-title" id={`${controlId}-title`}>
        PUBG Vietnam Squad Leaderboard
      </h2>
      <p className="leaderboard-source" role="note">
        {SQUAD_STANDINGS_DATA_SOURCE}
      </p>

      <div className="leaderboard-controls">
        <label className="leaderboard-control" htmlFor={`${controlId}-squad`}>
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

        <label className="leaderboard-control" htmlFor={`${controlId}-sort`}>
          Sort by
          <select
            id={`${controlId}-sort`}
            value={selectedSortKey}
            onChange={(event) => setSelectedSortKey(event.target.value)}
          >
            {sortOptions.map(({ value, label }) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
      </div>

      {displayedStandings.length === 0 ? (
        <p className="leaderboard-empty">No squads match this filter.</p>
      ) : (
        <table className="leaderboard-table">
          <caption className="leaderboard-caption">
            Squad WWCD, Placement Points, and Kill Points
          </caption>
          <thead>
            <tr>
              <th scope="col">Squad</th>
              <th scope="col">WWCD</th>
              <th scope="col">Placement Points</th>
              <th scope="col">Kill Points</th>
            </tr>
          </thead>
          <tbody>
            {displayedStandings.map(
              ({ squadId, squadName, wwcdCount, placementPts, killPts }) => (
                <tr key={squadId}>
                  <th scope="row">{squadName}</th>
                  <td>{wwcdCount}</td>
                  <td>{placementPts}</td>
                  <td>{killPts}</td>
                </tr>
              ),
            )}
          </tbody>
        </table>
      )}
    </section>
  )
}
