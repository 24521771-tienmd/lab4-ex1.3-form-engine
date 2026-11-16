import { useId } from 'react'
import { useFormContext } from './FormContext.js'

/**
 * Accessible field bound to the nearest <SimpleForm> (docs/contracts/ex1.3-form-engine.md §5.2).
 * No local value state, no effects: everything is read from context and derived during render.
 *
 * @param {Object} props
 * @param {string} props.name
 * @param {string} props.label
 * @param {'text' | 'email' | 'number'} [props.type]
 * @param {readonly string[]} [props.options]  When given, renders a <select>.
 * @param {string} [props.autoComplete]
 * @param {string} [props.inputMode]
 * @param {string} [props.hint]
 */
export default function InputField({ name, label, type = 'text', options, autoComplete, inputMode, hint }) {
  const { values, errors, touched, submitAttempted, setFieldValue, markTouched } = useFormContext()
  // One id per field (decision D4): binds label → control → error uniquely.
  const id = useId()
  const errorId = `${id}-error`

  const error = errors[name]
  const showError = Boolean(error) && (Boolean(touched[name]) || submitAttempted)

  function handleChange(event) {
    if (type === 'number' && !options) {
      const next = event.target.valueAsNumber
      setFieldValue(name, Number.isNaN(next) ? '' : next)
      return
    }
    setFieldValue(name, event.target.value)
  }

  const controlProps = {
    id,
    name,
    value: values[name] ?? '',
    autoComplete,
    'aria-invalid': showError,
    'aria-describedby': showError ? errorId : undefined,
    onChange: handleChange,
    onBlur: () => markTouched(name),
  }

  return (
    <div className="form-field">
      <label htmlFor={id}>{label}</label>
      {options ? (
        <select {...controlProps}>
          <option value="">Select {label.toLowerCase()}…</option>
          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      ) : (
        <input {...controlProps} type={type} inputMode={inputMode} />
      )}
      {hint ? <p className="field-hint">{hint}</p> : null}
      {showError ? (
        <p id={errorId} className="field-error">
          {error}
        </p>
      ) : null}
    </div>
  )
}
