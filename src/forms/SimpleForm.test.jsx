import { Profiler } from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { useFormContext } from './FormContext.js'
import SimpleForm from './SimpleForm.jsx'

// Tiny pure validator so these tests exercise the engine, not the registration rules.
function validate(values) {
  const errors = {}
  if (values.name.trim().length < 3) errors.name = 'Name must be at least 3 characters.'
  if (values.nickname.trim() === '') errors.nickname = 'Nickname is required.'
  return errors
}

const INITIAL = Object.freeze({ name: '', nickname: '' })

// Raw inputs bound through the context API (no InputField yet).
function RawField({ name, label }) {
  const { values, setFieldValue, markTouched } = useFormContext()
  return (
    <label>
      {label}
      <input
        name={name}
        value={values[name]}
        onChange={(e) => setFieldValue(name, e.target.value)}
        onBlur={() => markTouched(name)}
      />
    </label>
  )
}

// Probe that exposes the derived context state as text.
function Probe() {
  const { errors, isValid, submitAttempted, touched } = useFormContext()
  return (
    <ul aria-label="form state">
      <li>errors: {Object.keys(errors).join(',') || 'none'}</li>
      <li>isValid: {String(isValid)}</li>
      <li>submitAttempted: {String(submitAttempted)}</li>
      <li>touched: {Object.keys(touched).join(',') || 'none'}</li>
    </ul>
  )
}

function renderForm(props = {}) {
  const onValidSubmit = vi.fn()
  const utils = render(
    <SimpleForm initialValues={INITIAL} validate={validate} onValidSubmit={onValidSubmit} {...props}>
      <RawField name="name" label="Name" />
      <RawField name="nickname" label="Nickname" />
      <Probe />
    </SimpleForm>,
  )
  return { ...utils, onValidSubmit, user: userEvent.setup() }
}

describe('SimpleForm', () => {
  it('derives errors and isValid from initialValues on the first render without showing error UI', () => {
    renderForm()

    expect(screen.getByText('errors: name,nickname')).toBeInTheDocument()
    expect(screen.getByText('isValid: false')).toBeInTheDocument()
    expect(screen.getByText('submitAttempted: false')).toBeInTheDocument()
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('renders a form with a submit button labelled "Submit" by default or by submitLabel', () => {
    const { unmount } = renderForm()
    expect(screen.getByRole('button', { name: 'Submit' })).toHaveAttribute('type', 'submit')
    unmount()

    renderForm({ submitLabel: 'Register' })
    expect(screen.getByRole('button', { name: 'Register' })).toBeEnabled()
  })

  it('marks a field as touched on blur', async () => {
    const { user } = renderForm()

    await user.click(screen.getByLabelText('Name'))
    await user.tab()

    expect(screen.getByText('touched: name')).toBeInTheDocument()
  })

  it('blocks an invalid submit, sets submitAttempted and shows the summary alert with the count', async () => {
    const { user, onValidSubmit } = renderForm()

    await user.click(screen.getByRole('button', { name: 'Submit' }))

    expect(onValidSubmit).not.toHaveBeenCalled()
    expect(screen.getByText('submitAttempted: true')).toBeInTheDocument()
    expect(screen.getByRole('alert')).toHaveTextContent('Fix 2 field(s) before submitting.')

    await user.type(screen.getByLabelText('Name'), 'Minh')
    expect(screen.getByRole('alert')).toHaveTextContent('Fix 1 field(s) before submitting.')
  })

  it('calls onValidSubmit once with the current values when the form is valid', async () => {
    const { user, onValidSubmit } = renderForm()

    await user.type(screen.getByLabelText('Name'), 'Minh')
    await user.type(screen.getByLabelText('Nickname'), 'Viper')
    expect(screen.getByText('isValid: true')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Submit' }))

    expect(onValidSubmit).toHaveBeenCalledTimes(1)
    expect(onValidSubmit).toHaveBeenCalledWith({ name: 'Minh', nickname: 'Viper' })
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('render budget: one keystroke produces exactly 1 commit, even when it flips invalid → valid', async () => {
    const user = userEvent.setup()
    let commits = 0
    const onRender = () => {
      commits += 1
    }

    render(
      <Profiler id="simple-form" onRender={onRender}>
        <SimpleForm initialValues={INITIAL} validate={validate} onValidSubmit={() => {}}>
          <RawField name="name" label="Name" />
          <RawField name="nickname" label="Nickname" />
          <Probe />
        </SimpleForm>
      </Profiler>,
    )
    const name = screen.getByLabelText('Name')

    // Prefix that is still invalid, then reset the counter.
    await user.type(name, 'ab')
    expect(screen.getByText('errors: name,nickname')).toBeInTheDocument()

    // The keystroke that flips the field from invalid to valid.
    commits = 0
    await user.type(name, 'c')
    expect(screen.getByText('errors: nickname')).toBeInTheDocument()
    expect(commits).toBe(1)

    // An ordinary keystroke on an already-valid field.
    commits = 0
    await user.type(name, 'd')
    expect(commits).toBe(1)
  })
})
