import assert from 'node:assert/strict'
import test from 'node:test'
import {
  initialSquadStandings,
  SQUAD_STANDINGS_DATA_SOURCE,
} from '../src/data/squadStandings.js'

const expectedSquads = new Map([
  ['te', 'The Expendables'],
  ['ces', 'Cerberus Esports'],
  ['ge', 'Roy Esports'],
  ['agg', 'AGG'],
])
const expectedFields = [
  'squadId',
  'squadName',
  'wwcdCount',
  'placementPts',
  'killPts',
].sort()

test('labels the standings as illustrative demo data, not official results', () => {
  assert.match(SQUAD_STANDINGS_DATA_SOURCE, /illustrative/i)
  assert.match(SQUAD_STANDINGS_DATA_SOURCE, /demo/i)
  assert.match(SQUAD_STANDINGS_DATA_SOURCE, /not official/i)
})

test('contains exactly one record for each required squad with its exact name', () => {
  assert.equal(initialSquadStandings.length, 4)

  const squadIds = initialSquadStandings.map(({ squadId }) => squadId)
  assert.equal(new Set(squadIds).size, squadIds.length)
  assert.deepEqual(new Set(squadIds), new Set(expectedSquads.keys()))

  for (const { squadId, squadName } of initialSquadStandings) {
    assert.equal(squadName, expectedSquads.get(squadId))
  }
})

test('records contain exactly the five contract fields', () => {
  for (const standing of initialSquadStandings) {
    assert.deepEqual(Object.keys(standing).sort(), expectedFields)
  }
})

test('all leaderboard metrics are non-negative integers', () => {
  for (const standing of initialSquadStandings) {
    for (const metric of ['wwcdCount', 'placementPts', 'killPts']) {
      assert.ok(Number.isInteger(standing[metric]))
      assert.ok(standing[metric] >= 0)
    }
  }
})
