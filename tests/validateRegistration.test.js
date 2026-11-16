import assert from 'node:assert/strict'
import test from 'node:test'

const loadValidator = async () => (await import('../src/forms/validateRegistration.js')).validateRegistration

const MESSAGES = Object.freeze({
  fullName: 'Full name must be 2–50 characters.',
  email: 'Enter a valid email address.',
  ageRequired: 'Age is required.',
  ageRange: 'Age must be a whole number from 16 to 100.',
  role: 'Choose a role.',
})

const VALID = Object.freeze({
  fullName: 'Tran Minh',
  email: 'minh@example.com',
  age: 21,
  role: 'Scout',
})

const withField = (field, value) => ({ ...VALID, [field]: value })

test('a fully valid registration returns an empty errors object', async () => {
  const validateRegistration = await loadValidator()
  assert.deepEqual(validateRegistration({ ...VALID }), {})
})

test('every PERSON_ROLES entry is accepted as a role', async () => {
  const validateRegistration = await loadValidator()
  const { PERSON_ROLES } = await import('../src/data/people.js')
  for (const role of PERSON_ROLES) {
    assert.deepEqual(validateRegistration(withField('role', role)), {}, role)
  }
})

test('all-empty values report every field with its exact message', async () => {
  const validateRegistration = await loadValidator()
  assert.deepEqual(validateRegistration({ fullName: '', email: '', age: '', role: '' }), {
    fullName: MESSAGES.fullName,
    email: MESSAGES.email,
    age: MESSAGES.ageRequired,
    role: MESSAGES.role,
  })
})

test('fullName: 2 and 50 characters are valid boundaries', async () => {
  const validateRegistration = await loadValidator()
  assert.deepEqual(validateRegistration(withField('fullName', 'An')), {})
  assert.deepEqual(validateRegistration(withField('fullName', 'a'.repeat(50))), {})
})

test('fullName: 1 and 51 characters fail with the exact message', async () => {
  const validateRegistration = await loadValidator()
  assert.deepEqual(validateRegistration(withField('fullName', 'A')), { fullName: MESSAGES.fullName })
  assert.deepEqual(validateRegistration(withField('fullName', 'a'.repeat(51))), { fullName: MESSAGES.fullName })
})

test('fullName: length is measured after trim (whitespace-only and padded values)', async () => {
  const validateRegistration = await loadValidator()
  assert.deepEqual(validateRegistration(withField('fullName', '     ')), { fullName: MESSAGES.fullName })
  assert.deepEqual(validateRegistration(withField('fullName', '  A  ')), { fullName: MESSAGES.fullName })
  assert.deepEqual(validateRegistration(withField('fullName', `  ${'a'.repeat(50)}  `)), {})
})

test('email: missing @ or domain fails with the exact message', async () => {
  const validateRegistration = await loadValidator()
  for (const email of ['', 'minh.example.com', 'minh@', 'minh@example', '@example.com', 'mi nh@example.com']) {
    assert.deepEqual(validateRegistration(withField('email', email)), { email: MESSAGES.email }, email)
  }
})

test('age: empty string reports "Age is required."', async () => {
  const validateRegistration = await loadValidator()
  assert.deepEqual(validateRegistration(withField('age', '')), { age: MESSAGES.ageRequired })
})

test('age: 16 and 100 are valid boundaries', async () => {
  const validateRegistration = await loadValidator()
  assert.deepEqual(validateRegistration(withField('age', 16)), {})
  assert.deepEqual(validateRegistration(withField('age', 100)), {})
})

test('age: 15, 101 and 20.5 fail with the range message', async () => {
  const validateRegistration = await loadValidator()
  for (const age of [15, 101, 20.5]) {
    assert.deepEqual(validateRegistration(withField('age', age)), { age: MESSAGES.ageRange }, String(age))
  }
})

test('role: empty or outside PERSON_ROLES fails with the exact message', async () => {
  const validateRegistration = await loadValidator()
  assert.deepEqual(validateRegistration(withField('role', '')), { role: MESSAGES.role })
  assert.deepEqual(validateRegistration(withField('role', 'Coach')), { role: MESSAGES.role })
})

test('returns only failing fields', async () => {
  const validateRegistration = await loadValidator()
  assert.deepEqual(Object.keys(validateRegistration(withField('email', 'bad'))), ['email'])
})

test('is pure: does not mutate the input and returns equal results for equal input', async () => {
  const validateRegistration = await loadValidator()
  const input = { fullName: ' A ', email: 'bad', age: 15, role: 'Coach' }
  const snapshot = structuredClone(input)
  const first = validateRegistration(input)
  assert.deepEqual(input, snapshot)
  assert.deepEqual(validateRegistration(input), first)
  assert.doesNotThrow(() => validateRegistration(Object.freeze({ ...input })))
})
