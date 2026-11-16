const SUPPORTED_SQUAD_IDS = new Set(['te', 'ces', 'ge', 'agg'])
const REQUIRED_EVENT_FIELDS = [
  'id',
  'occurredAtEpochMs',
  'killerName',
  'killerSquadId',
  'victimName',
  'victimSquadId',
  'weaponLabel',
]

function validateEvents(events) {
  if (!Array.isArray(events)) {
    throw new TypeError('Kill-feed events must be an array.')
  }

  const eventIds = new Set()
  events.forEach((event, index) => {
    if (event === null || typeof event !== 'object' || Array.isArray(event)) {
      throw new TypeError(`Kill-feed event at index ${index} must be an object.`)
    }

    for (const field of ['id', 'killerName', 'victimName', 'weaponLabel']) {
      if (typeof event[field] !== 'string' || event[field].trim().length === 0) {
        throw new TypeError(
          `Kill-feed event at index ${index} must have a non-empty ${field}.`,
        )
      }
    }

    if (eventIds.has(event.id)) {
      throw new TypeError(`Kill-feed event ID "${event.id}" must be unique.`)
    }
    eventIds.add(event.id)

    if (
      !Number.isInteger(event.occurredAtEpochMs) ||
      event.occurredAtEpochMs < 0
    ) {
      throw new RangeError(
        `Kill-feed event at index ${index} must have a non-negative integer occurredAtEpochMs.`,
      )
    }

    if (!Number.isFinite(new Date(event.occurredAtEpochMs).getTime())) {
      throw new RangeError(
        `Kill-feed event at index ${index} has an out-of-range occurredAtEpochMs.`,
      )
    }

    for (const field of ['killerSquadId', 'victimSquadId']) {
      if (!SUPPORTED_SQUAD_IDS.has(event[field])) {
        throw new TypeError(
          `Kill-feed event at index ${index} has an unsupported ${field}.`,
        )
      }
    }

    for (const field of REQUIRED_EVENT_FIELDS) {
      if (!Object.hasOwn(event, field)) {
        throw new TypeError(
          `Kill-feed event at index ${index} is missing ${field}.`,
        )
      }
    }
  })
}

export function filterKillFeedEvents(
  events,
  { squadId = 'all', playerQuery = '' } = {},
) {
  validateEvents(events)

  if (squadId !== 'all' && !SUPPORTED_SQUAD_IDS.has(squadId)) {
    throw new TypeError(`Unsupported kill-feed squad filter "${squadId}".`)
  }

  if (typeof playerQuery !== 'string') {
    throw new TypeError('Player search query must be a string.')
  }

  const normalizedQuery = playerQuery.trim().toLowerCase()

  return events
    .map((event, sourceIndex) => ({ event, sourceIndex }))
    .filter(({ event }) => {
      const matchesSquad =
        squadId === 'all' ||
        event.killerSquadId === squadId ||
        event.victimSquadId === squadId
      const matchesPlayer =
        normalizedQuery.length === 0 ||
        event.killerName.toLowerCase().includes(normalizedQuery) ||
        event.victimName.toLowerCase().includes(normalizedQuery)

      return matchesSquad && matchesPlayer
    })
    .sort((left, right) => {
      const timestampDifference =
        right.event.occurredAtEpochMs - left.event.occurredAtEpochMs

      return timestampDifference || left.sourceIndex - right.sourceIndex
    })
    .map(({ event }) => event)
}
