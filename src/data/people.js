/**
 * @typedef {Object} Person
 * @property {string} id    Stable string id, e.g. 'p-001'.
 * @property {string} name  Fictional display name.
 * @property {string} role  One of PERSON_ROLES.
 */

export const PEOPLE_DATA_SOURCE =
  'Illustrative, fictional player dossiers for the Lab 4 Ex1.2 demo. Not real PUBG Vietnam players.'

export const PERSON_ROLES = Object.freeze([
  'In-Game Leader',
  'Fragger',
  'Support',
  'Scout',
  'Sniper',
  'Analyst',
])

/** @type {ReadonlyArray<Readonly<Person>>} */
export const people = Object.freeze(
  [
    { id: 'p-001', name: 'Tran "Viper" Minh', role: 'In-Game Leader' },
    { id: 'p-002', name: 'Nguyen "Ember" Lan', role: 'Fragger' },
    { id: 'p-003', name: 'Le "Granite" Quoc', role: 'Support' },
    { id: 'p-004', name: 'Pham "Lantern" Thu', role: 'Scout' },
    { id: 'p-005', name: 'Hoang "Drift" Bao', role: 'Sniper' },
    { id: 'p-006', name: 'Vo "Ledger" An', role: 'Analyst' },
  ].map((person) => Object.freeze(person)),
)
