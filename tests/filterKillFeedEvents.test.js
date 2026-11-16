import assert from 'node:assert/strict'
import test from 'node:test'
import { initialKillFeedEvents } from '../src/data/killFeedEvents.js'
import { filterKillFeedEvents } from '../src/utils/filterKillFeedEvents.js'

test('illustrative fixture timestamps are earlier than November 12, 2026', () => {
  const november12ReferenceEpochMs = 1_794_441_600_000

  assert.ok(
    initialKillFeedEvents.every(
      ({ occurredAtEpochMs }) => occurredAtEpochMs < november12ReferenceEpochMs,
    ),
  )
})

function createEvents() {
  return [
    {
      id: 'event-1',
      occurredAtEpochMs: 1_000,
      killerName: 'Alpha',
      killerSquadId: 'te',
      victimName: 'Bravo',
      victimSquadId: 'ces',
      weaponLabel: 'Rifle',
    },
    {
      id: 'event-2',
      occurredAtEpochMs: 3_000,
      killerName: 'Charlie',
      killerSquadId: 'ge',
      victimName: 'Delta',
      victimSquadId: 'agg',
      weaponLabel: 'Sniper Rifle',
    },
    {
      id: 'event-3',
      occurredAtEpochMs: 2_000,
      killerName: 'Echo',
      killerSquadId: 'ces',
      victimName: 'Foxtrot',
      victimSquadId: 'te',
      weaponLabel: 'Shotgun',
    },
    {
      id: 'event-4',
      occurredAtEpochMs: 3_000,
      killerName: 'Golf',
      killerSquadId: 'agg',
      victimName: 'Hotel',
      victimSquadId: 'ge',
      weaponLabel: 'SMG',
    },
  ]
}

test('returns an empty result for empty input', () => {
  assert.deepEqual(filterKillFeedEvents([]), [])
})

test('the all-squads filter includes all events, newest first', () => {
  assert.deepEqual(
    filterKillFeedEvents(createEvents()).map(({ id }) => id),
    ['event-2', 'event-4', 'event-3', 'event-1'],
  )
})

for (const squadId of ['te', 'ces', 'ge', 'agg']) {
  test(`filters by either side of squad "${squadId}"`, () => {
    const filteredEvents = filterKillFeedEvents(createEvents(), { squadId })

    assert.ok(
      filteredEvents.every(
        (event) =>
          event.killerSquadId === squadId || event.victimSquadId === squadId,
      ),
    )
    assert.ok(filteredEvents.length > 0)
  })
}

test('matches a squad through the killer squad', () => {
  assert.deepEqual(
    filterKillFeedEvents(createEvents(), { squadId: 'ge' }).map(
      ({ id }) => id,
    ),
    ['event-2', 'event-4'],
  )
})

test('matches a squad through the victim squad', () => {
  assert.deepEqual(
    filterKillFeedEvents(createEvents(), { squadId: 'ces' }).map(
      ({ id }) => id,
    ),
    ['event-3', 'event-1'],
  )
})

test('matches player names case-insensitively and by substring', () => {
  assert.deepEqual(
    filterKillFeedEvents(createEvents(), { playerQuery: '  LpHa ' }).map(
      ({ id }) => id,
    ),
    ['event-1'],
  )
})

test('searches killer names', () => {
  assert.deepEqual(
    filterKillFeedEvents(createEvents(), { playerQuery: 'char' }).map(
      ({ id }) => id,
    ),
    ['event-2'],
  )
})

test('searches victim names', () => {
  assert.deepEqual(
    filterKillFeedEvents(createEvents(), { playerQuery: 'elta' }).map(
      ({ id }) => id,
    ),
    ['event-2'],
  )
})

test('ignores a whitespace-only player query', () => {
  assert.deepEqual(
    filterKillFeedEvents(createEvents(), { playerQuery: '   \t ' }).map(
      ({ id }) => id,
    ),
    ['event-2', 'event-4', 'event-3', 'event-1'],
  )
})

test('combines squad and player filters using AND semantics', () => {
  assert.deepEqual(
    filterKillFeedEvents(createEvents(), {
      squadId: 'te',
      playerQuery: 'echo',
    }).map(({ id }) => id),
    ['event-3'],
  )
  assert.deepEqual(
    filterKillFeedEvents(createEvents(), {
      squadId: 'te',
      playerQuery: 'charlie',
    }),
    [],
  )
})

test('orders events newest first', () => {
  assert.deepEqual(
    filterKillFeedEvents(createEvents()).map(
      ({ occurredAtEpochMs }) => occurredAtEpochMs,
    ),
    [3_000, 3_000, 2_000, 1_000],
  )
})

test('preserves source order for events with equal timestamps', () => {
  assert.deepEqual(
    filterKillFeedEvents(createEvents())
      .filter(({ occurredAtEpochMs }) => occurredAtEpochMs === 3_000)
      .map(({ id }) => id),
    ['event-2', 'event-4'],
  )
})

test('returns no matches for an absent player query', () => {
  assert.deepEqual(
    filterKillFeedEvents(createEvents(), { playerQuery: 'missing' }),
    [],
  )
})

test('does not mutate the source array or event objects', () => {
  const events = createEvents()
  const originalArray = [...events]
  const originalValues = events.map((event) => ({ ...event }))
  const filteredEvents = filterKillFeedEvents(events, { squadId: 'te' })

  assert.notStrictEqual(filteredEvents, events)
  assert.deepEqual(events, originalArray)
  assert.deepEqual(events, originalValues)
  assert.ok(events.every((event, index) => event === originalArray[index]))
  assert.ok(
    events.every((event, index) =>
      REQUIRED_FIELDS.every(
        (field) => event[field] === originalValues[index][field],
      ),
    ),
  )
})

const REQUIRED_FIELDS = [
  'id',
  'occurredAtEpochMs',
  'killerName',
  'killerSquadId',
  'victimName',
  'victimSquadId',
  'weaponLabel',
]

test('rejects invalid event arrays, fields, squad IDs, timestamps, and options', () => {
  assert.throws(() => filterKillFeedEvents(null), TypeError)
  assert.throws(
    () => filterKillFeedEvents(createEvents(), { squadId: 'unknown' }),
    TypeError,
  )
  assert.throws(
    () => filterKillFeedEvents(createEvents(), { playerQuery: 1 }),
    TypeError,
  )

  const invalidCases = [
    [{ ...createEvents()[0], id: '' }],
    [{ ...createEvents()[0], occurredAtEpochMs: -1 }],
    [{ ...createEvents()[0], occurredAtEpochMs: 1.5 }],
    [{ ...createEvents()[0], killerName: '  ' }],
    [{ ...createEvents()[0], killerSquadId: 'unknown' }],
    [{ ...createEvents()[0], victimSquadId: 'unknown' }],
    [{ ...createEvents()[0], weaponLabel: '' }],
    [createEvents()[0], { ...createEvents()[0] }],
  ]

  for (const events of invalidCases) {
    assert.throws(() => filterKillFeedEvents(events))
  }
})
