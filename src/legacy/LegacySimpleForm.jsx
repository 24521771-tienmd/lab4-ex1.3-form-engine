/**
 * Anti-pattern reproduction for Exercise 1.3. Not routed. Do not import from app code.
 *
 * Faithful but BOUNDED reproduction of the Lab 4 slide-13 "useEffect validation
 * waterfall". Every effect below is the defect being demonstrated — derived data
 * (errors, validity) is copied into state through chained effects, so one keystroke
 * cascades into several React commits.
 *
 * Trace for one keystroke that flips the field from invalid to valid:
 *   keystroke → LegacyInputField setValue                     (commit 1)
 *   effect #1 syncToParent     → parent setValues             (commit 2)
 *   effect #2 validateField    → parent setErrors             (commit 3)
 *   effect #3 calcFormValidity → parent setIsValid       ┐
 *   effect #4 syncErrorsToChild → parent setChildError   ┘    (commit 4, batched)
 *   effect #5 autoScrollToError → scrollIntoView?.() when an error is shown
 *
 * Every setState is guarded by an equality check so the cascade terminates:
 * we measure the waterfall (T06), we do not ship an infinite loop.
 * The correct design lives in src/forms/ (errors derived during render).
 */
import { useCallback, useEffect, useRef, useState } from 'react'

const MIN_LENGTH = 3

function validateName(value) {
  return value.trim().length >= MIN_LENGTH ? '' : `Name must be at least ${MIN_LENGTH} characters.`
}

function LegacyInputField({ name, label, error, fieldRef, onValueChange }) {
  const [value, setValue] = useState('')

  // effect #1 — syncToParent: local state copied upward after every commit.
  useEffect(() => {
    onValueChange(name, value)
  }, [name, value, onValueChange])

  return (
    <div ref={fieldRef}>
      <label htmlFor={`legacy-${name}`}>{label}</label>
      <input
        id={`legacy-${name}`}
        name={name}
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
      {error ? <p>{error}</p> : null}
    </div>
  )
}

export default function LegacySimpleForm() {
  const [values, setValues] = useState({ name: '' })
  const [errors, setErrors] = useState({})
  const [isValid, setIsValid] = useState(false)
  const [childError, setChildError] = useState('')
  const fieldRef = useRef(null)

  const handleValueChange = useCallback((field, value) => {
    setValues((prev) => (prev[field] === value ? prev : { ...prev, [field]: value }))
  }, [])

  // effect #2 — validateField: errors stored in state instead of derived.
  useEffect(() => {
    const message = validateName(values.name)
    setErrors((prev) => {
      if ((prev.name ?? '') === message) return prev
      return message ? { name: message } : {}
    })
  }, [values])

  // effect #3 — calcFormValidity: validity stored in state instead of derived.
  useEffect(() => {
    const next = Object.keys(errors).length === 0
    setIsValid((prev) => (prev === next ? prev : next))
  }, [errors])

  // effect #4 — syncErrorsToChild: the error is copied again into the state fed to the child.
  useEffect(() => {
    const next = errors.name ?? ''
    setChildError((prev) => (prev === next ? prev : next))
  }, [errors])

  // effect #5 — autoScrollToError: imperative side effect chained on copied state.
  useEffect(() => {
    if (childError) {
      fieldRef.current?.scrollIntoView?.({ block: 'center' })
    }
  }, [childError])

  return (
    <form noValidate onSubmit={(e) => e.preventDefault()}>
      <LegacyInputField
        name="name"
        label="Name"
        error={childError}
        fieldRef={fieldRef}
        onValueChange={handleValueChange}
      />
      <button type="submit" disabled={!isValid}>
        Submit
      </button>
    </form>
  )
}
