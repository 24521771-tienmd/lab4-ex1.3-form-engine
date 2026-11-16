import assert from 'node:assert/strict'
import test from 'node:test'

const loadPeopleModule = () => import('../src/data/people.js')

test('people dataset contains at least six dossier entries', async () => {
  const { people } = await loadPeopleModule()

  assert.ok(Array.isArray(people))
  assert.ok(people.length >= 6, `expected >= 6 people, got ${people.length}`)
})

test('every person has exactly the id, name and role keys', async () => {
  const { people } = await loadPeopleModule()

  for (const person of people) {
    assert.deepEqual(Object.keys(person).sort(), ['id', 'name', 'role'])
  }
})

test('every person value is a non-empty trimmed string', async () => {
  const { people } = await loadPeopleModule()

  for (const person of people) {
    for (const [key, value] of Object.entries(person)) {
      assert.equal(typeof value, 'string', `${key} must be a string`)
      assert.notEqual(value, '', `${key} must not be empty`)
      assert.equal(value, value.trim(), `${key} must be trimmed`)
    }
  }
})

test('person ids are unique and follow the p-NNN format', async () => {
  const { people } = await loadPeopleModule()
  const ids = people.map((person) => person.id)

  assert.equal(new Set(ids).size, ids.length, 'ids must be unique')
  for (const id of ids) {
    assert.match(id, /^p-\d{3}$/)
  }
})

test('every person role is one of PERSON_ROLES', async () => {
  const { people, PERSON_ROLES } = await loadPeopleModule()

  for (const person of people) {
    assert.ok(
      PERSON_ROLES.includes(person.role),
      `unknown role "${person.role}" for ${person.id}`,
    )
  }
})

test('PEOPLE_DATA_SOURCE states that the data is illustrative', async () => {
  const { PEOPLE_DATA_SOURCE } = await loadPeopleModule()

  assert.equal(typeof PEOPLE_DATA_SOURCE, 'string')
  assert.match(PEOPLE_DATA_SOURCE, /illustrative/i)
})
