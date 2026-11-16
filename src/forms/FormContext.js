import { createContext, useContext } from 'react'

/**
 * Value provided by <SimpleForm> to every field (docs/contracts/ex1.3-form-engine.md §4).
 * Only `values`, `touched` and `submitAttempted` are state; `errors` and `isValid`
 * are derived during render from `validate(values)` and never stored.
 *
 * @typedef {Object} FormContextValue
 * @property {Record<string, unknown>} values           Current field values.
 * @property {Record<string, string>}  errors           validate(values) — failing fields only.
 * @property {Record<string, true>}    touched          Fields blurred at least once.
 * @property {boolean}                 submitAttempted  True after the first submit attempt.
 * @property {boolean}                 isValid          Object.keys(errors).length === 0.
 * @property {(name: string, value: unknown) => void} setFieldValue
 * @property {(name: string) => void}  markTouched
 */

/** @type {import('react').Context<FormContextValue | null>} */
export const FormContext = createContext(null)

/**
 * Reads the nearest <SimpleForm> context.
 *
 * @returns {FormContextValue}
 * @throws {Error} When called outside <SimpleForm>.
 */
export function useFormContext() {
  const context = useContext(FormContext)
  if (context === null) {
    throw new Error('useFormContext must be used inside <SimpleForm>')
  }
  return context
}
