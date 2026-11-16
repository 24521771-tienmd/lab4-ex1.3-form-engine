const SUPPORTED_SQUAD_IDS = new Set(['te', 'ces', 'ge', 'agg'])
const SUPPORTED_SORT_KEYS = new Set([
  'wwcdCount',
  'placementPts',
  'killPts',
])

function validateStandings(standings) {
  if (!Array.isArray(standings)) {
    throw new TypeError('Standings must be an array.')
  }

  standings.forEach((standing, index) => {
    if (
      standing === null ||
      typeof standing !== 'object' ||
      Array.isArray(standing)
    ) {
      throw new TypeError(`Standing at index ${index} must be an object.`)
    }

    if (!SUPPORTED_SQUAD_IDS.has(standing.squadId)) {
      throw new TypeError(
        `Standing at index ${index} has an unsupported squadId.`,
      )
    }

    if (typeof standing.squadName !== 'string') {
      throw new TypeError(
        `Standing at index ${index} must have a string squadName.`,
      )
    }

    for (const metric of SUPPORTED_SORT_KEYS) {
      const value = standing[metric]

      if (typeof value !== 'number') {
        throw new TypeError(
          `Standing at index ${index} must have a numeric ${metric}.`,
        )
      }

      if (!Number.isFinite(value)) {
        throw new RangeError(
          `Standing at index ${index} must have a finite ${metric}.`,
        )
      }
    }
  })
}

export function sortSquadStandings(standings, sortBy) {
  validateStandings(standings)

  if (!SUPPORTED_SORT_KEYS.has(sortBy)) {
    throw new TypeError(
      `Unsupported sort key "${sortBy}". Expected one of: ${[
        ...SUPPORTED_SORT_KEYS,
      ].join(', ')}.`,
    )
  }

  return standings
    .map((standing, originalIndex) => ({ standing, originalIndex }))
    .sort((left, right) => {
      const leftValue = left.standing[sortBy]
      const rightValue = right.standing[sortBy]

      if (leftValue === rightValue) {
        return left.originalIndex - right.originalIndex
      }

      return leftValue > rightValue ? -1 : 1
    })
    .map(({ standing }) => standing)
}

export function filterSquadStandings(standings, squadId) {
  validateStandings(standings)

  if (squadId !== 'all' && !SUPPORTED_SQUAD_IDS.has(squadId)) {
    throw new TypeError(
      `Unsupported squad filter "${squadId}". Expected "all" or one of: ${[
        ...SUPPORTED_SQUAD_IDS,
      ].join(', ')}.`,
    )
  }

  if (squadId === 'all') {
    return [...standings]
  }

  return standings.filter((standing) => standing.squadId === squadId)
}
