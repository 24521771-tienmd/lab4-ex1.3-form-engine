import { PERSON_ROLES } from '../data/people.js'

/**
 * @typedef {Object} RegistrationValues
 * @property {string} fullName
 * @property {string} email
 * @property {number | ''} age   From `valueAsNumber`; `''` when the input is empty.
 * @property {string} role       One of PERSON_ROLES.
 */

/** @typedef {Partial<Record<keyof RegistrationValues, string>>} RegistrationErrors */

export const REGISTRATION_MESSAGES = Object.freeze({
  fullName: 'Full name must be 2–50 characters.',
  email: 'Enter a valid email address.',
  ageRequired: 'Age is required.',
  ageRange: 'Age must be a whole number from 16 to 100.',
  role: 'Choose a role.',
})

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/**
 * Pure, synchronous registration rules (project-rules.md §2).
 * Never mutates `values`; returns only the failing fields.
 *
 * @param {RegistrationValues} values
 * @returns {RegistrationErrors}
 */
export function validateRegistration(values) {
  const { fullName, email, age, role } = values
  /** @type {RegistrationErrors} */
  const errors = {}

  const trimmedName = typeof fullName === 'string' ? fullName.trim() : ''
  if (trimmedName.length < 2 || trimmedName.length > 50) {
    errors.fullName = REGISTRATION_MESSAGES.fullName
  }

  if (typeof email !== 'string' || !EMAIL_PATTERN.test(email)) {
    errors.email = REGISTRATION_MESSAGES.email
  }

  if (age === '' || age === null || age === undefined) {
    errors.age = REGISTRATION_MESSAGES.ageRequired
  } else if (!Number.isInteger(age) || age < 16 || age > 100) {
    errors.age = REGISTRATION_MESSAGES.ageRange
  }

  if (!PERSON_ROLES.includes(role)) {
    errors.role = REGISTRATION_MESSAGES.role
  }

  return errors
}
