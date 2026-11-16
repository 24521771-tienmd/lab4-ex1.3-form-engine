import assert from 'node:assert/strict'
import test from 'node:test'
import {
  filterSquadStandings,
  sortSquadStandings,
} from '../src/utils/pubgVnLeaderboard.js'

function createStandings() {
  return [
    {
      squadId: 'te',
      squadName: 'The Expendables',
      wwcdCount: 2,
      placementPts: 18,
      killPts: 24,
    },
    {
      squadId: 'ces',
      squadName: 'Cerberus Esports',
      wwcdCount: 4,
      placementPts: 12,
      killPts: 30,
    },
    {
      squadId: 'ge',
      squadName: 'Roy Esports',
      wwcdCount: 1,
      placementPts: 25,
      killPts: 16,
    },
    {
      squadId: 'agg',
      squadName: 'AGG',
      wwcdCount: 3,
      placementPts: 20,
      killPts: 28,
    },
  ]
}

test('sorts WWCD count descending', () => {
  const standings = createStandings()

  assert.deepEqual(
    sortSquadStandings(standings, 'wwcdCount').map(({ squadId }) => squadId),
    ['ces', 'agg', 'te', 'ge'],
  )
})

test('sorts placement points descending', () => {
  const standings = createStandings()

  assert.deepEqual(
    sortSquadStandings(standings, 'placementPts').map(
      ({ squadId }) => squadId,
    ),
    ['ge', 'agg', 'te', 'ces'],
  )
})

test('sorts kill points descending', () => {
  const standings = createStandings()

  assert.deepEqual(
    sortSquadStandings(standings, 'killPts').map(({ squadId }) => squadId),
    ['ces', 'agg', 'te', 'ge'],
  )
})

test('preserves input order when selected values tie', () => {
  const standings = createStandings()
  standings[0].wwcdCount = standings[1].wwcdCount
  standings[2].wwcdCount = standings[3].wwcdCount

  assert.deepEqual(
    sortSquadStandings(standings, 'wwcdCount').map(({ squadId }) => squadId),
    ['te', 'ces', 'ge', 'agg'],
  )
})

test('does not mutate the input array or standing records', () => {
  const standings = createStandings()
  const originalArray = [...standings]
  const originalRecords = standings.map((standing) => ({ ...standing }))
  const sorted = sortSquadStandings(standings, 'placementPts')

  assert.notStrictEqual(sorted, standings)
  assert.deepEqual(standings, originalArray)
  assert.deepEqual(standings, originalRecords)
  assert.ok(standings.every((standing, index) => standing === originalArray[index]))
  assert.ok(
    standings.every((standing, index) =>
      Object.keys(standing).every(
        (key) => standing[key] === originalRecords[index][key],
      ),
    ),
  )
})

for (const squadId of ['te', 'ces', 'ge', 'agg']) {
  test(`filters standings for squad "${squadId}" preserving source order`, () => {
    const standings = createStandings()
    const filtered = filterSquadStandings(standings, squadId)

    assert.deepEqual(
      filtered.map(({ squadId: id }) => id),
      [squadId],
    )
    assert.notStrictEqual(filtered, standings)
    assert.deepEqual(standings, createStandings())
  })
}

test('"all" returns all standings in a new array', () => {
  const standings = createStandings()
  const filtered = filterSquadStandings(standings, 'all')

  assert.deepEqual(filtered, standings)
  assert.notStrictEqual(filtered, standings)
  assert.ok(filtered.every((standing, index) => standing === standings[index]))
})

test('sorts and filters empty input', () => {
  const standings = []

  assert.deepEqual(sortSquadStandings(standings, 'killPts'), [])
  assert.deepEqual(filterSquadStandings(standings, 'all'), [])
  assert.deepEqual(filterSquadStandings(standings, 'te'), [])
})

test('returns an empty list when no standings match a supported squad', () => {
  const standings = createStandings().filter(
    (standing) => standing.squadId !== 'agg',
  )

  assert.deepEqual(filterSquadStandings(standings, 'agg'), [])
  assert.deepEqual(standings, createStandings().slice(0, 3))
})

test('rejects unsupported sort keys', () => {
  assert.throws(
    () => sortSquadStandings(createStandings(), 'ranking'),
    { name: 'TypeError', message: /Unsupported sort key/ },
  )
})

test('rejects unsupported squad filters', () => {
  for (const squadId of ['unknown', null, 1, undefined]) {
    assert.throws(
      () => filterSquadStandings(createStandings(), squadId),
      { name: 'TypeError', message: /Unsupported squad filter/ },
    )
  }
})

test('rejects non-array standings', () => {
  for (const standings of [null, undefined, {}, 'standings']) {
    assert.throws(
      () => sortSquadStandings(standings, 'wwcdCount'),
      { name: 'TypeError', message: /Standings must be an array/ },
    )
    assert.throws(
      () => filterSquadStandings(standings, 'all'),
      { name: 'TypeError', message: /Standings must be an array/ },
    )
  }
})

test('rejects malformed standing records and unsupported squad IDs', () => {
  const malformedRecords = [
    null,
    [],
    { squadId: 'unknown', squadName: 'Team', wwcdCount: 0, placementPts: 0, killPts: 0 },
    { squadId: 'te', wwcdCount: 0, placementPts: 0, killPts: 0 },
  ]

  for (const standing of malformedRecords) {
    const standings = [standing]
    assert.throws(
      () => sortSquadStandings(standings, 'wwcdCount'),
      { name: 'TypeError' },
    )
    assert.throws(
      () => filterSquadStandings(standings, 'all'),
      { name: 'TypeError' },
    )
  }
})

test('rejects metric values that are not numbers', () => {
  for (const invalidValue of ['5', null, true, undefined]) {
    const standings = createStandings()
    standings[0].placementPts = invalidValue

    assert.throws(
      () => sortSquadStandings(standings, 'wwcdCount'),
      { name: 'TypeError', message: /numeric placementPts/ },
    )
    assert.throws(
      () => filterSquadStandings(standings, 'all'),
      { name: 'TypeError', message: /numeric placementPts/ },
    )
  }
})

test('rejects non-finite metric values', () => {
  for (const invalidValue of [Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY]) {
    const standings = createStandings()
    standings[0].killPts = invalidValue

    assert.throws(
      () => sortSquadStandings(standings, 'wwcdCount'),
      { name: 'RangeError', message: /finite killPts/ },
    )
    assert.throws(
      () => filterSquadStandings(standings, 'all'),
      { name: 'RangeError', message: /finite killPts/ },
    )
  }
})
