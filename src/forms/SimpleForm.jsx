import { useState } from 'react'
import { FormContext } from './FormContext.js'

/**
 * Generic, Context-driven form engine (docs/contracts/ex1.3-form-engine.md §5.1).
 *
 * State: `values`, `touched`, `submitAttempted` — nothing else.
 * Derived during render: `errors = validate(values)` and `isValid`.
 * One keystroke → one `setValues` → exactly one commit. No effects.
 *
 * @param {Object} props
 * @param {Record<string, unknown>} props.initialValues
 * @param {(values: Record<string, unknown>) => Record<string, string>} props.validate  Pure validator.
 * @param {(values: Record<string, unknown>) => void} props.onValidSubmit
 * @param {string} [props.submitLabel]
 * @param {import('react').ReactNode} props.children
 */
export default function SimpleForm({ initialValues, validate, onValidSubmit, submitLabel = 'Submit', children }) {
  const [values, setValues] = useState(initialValues)
  const [touched, setTouched] = useState({})
  const [submitAttempted, setSubmitAttempted] = useState(false)

  // Derived during render — never stored, never synced by an effect.
  const errors = validate(values)
  const errorCount = Object.keys(errors).length
  const isValid = errorCount === 0

  function setFieldValue(name, value) {
    setValues((prev) => ({ ...prev, [name]: value }))
  }

  function markTouched(name) {
    setTouched((prev) => (prev[name] ? prev : { ...prev, [name]: true }))
  }

  function handleSubmit(event) {
    event.preventDefault()
    setSubmitAttempted(true)
    if (isValid) {
      onValidSubmit(values)
    }
  }

  const contextValue = { values, errors, touched, submitAttempted, isValid, setFieldValue, markTouched }

  return (
    <form noValidate onSubmit={handleSubmit}>
      <FormContext.Provider value={contextValue}>{children}</FormContext.Provider>
      {submitAttempted && !isValid ? <p role="alert">Fix {errorCount} field(s) before submitting.</p> : null}
      <button type="submit">{submitLabel}</button>
    </form>
  )
}
