import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { PERSON_ROLES } from '../data/people.js'
import { useFormContext } from './FormContext.js'
import InputField from './InputField.jsx'
import SimpleForm from './SimpleForm.jsx'
import { validateRegistration } from './validateRegistration.js'

const INITIAL = Object.freeze({ fullName: '', email: '', age: '', role: '' })

// Exposes the stored `age` so we can check its JS type (number vs '' — never NaN).
function AgeProbe() {
  const { values } = useFormContext()
  const { age } = values
  return (
    <p>
      age: {typeof age} {Number.isNaN(age) ? 'NaN' : JSON.stringify(age)}
    </p>
  )
}

function renderRegistrationFields() {
  render(
    <SimpleForm initialValues={INITIAL} validate={validateRegistration} onValidSubmit={() => {}}>
      <InputField name="fullName" label="Full name" autoComplete="name" />
      <InputField name="email" label="Email" type="email" autoComplete="email" />
      <InputField name="age" label="Age" type="number" inputMode="numeric" />
      <InputField name="role" label="Role" options={PERSON_ROLES} />
      <AgeProbe />
    </SimpleForm>,
  )
  return userEvent.setup()
}

describe('InputField', () => {
  it('binds each label to its control with a unique useId id', () => {
    renderRegistrationFields()

    const fullName = screen.getByLabelText('Full name')
    const email = screen.getByLabelText('Email')

    expect(fullName.tagName).toBe('INPUT')
    expect(fullName).toHaveAttribute('type', 'text')
    expect(fullName).toHaveAttribute('name', 'fullName')
    expect(fullName).toHaveAttribute('autocomplete', 'name')
    expect(email).toHaveAttribute('type', 'email')
    expect(fullName.id).not.toBe('')
    expect(email.id).not.toBe('')
    expect(fullName.id).not.toBe(email.id)
  })

  it('is not marked invalid and has no aria-describedby before the field is touched', () => {
    renderRegistrationFields()

    const fullName = screen.getByLabelText('Full name')
    expect(fullName).toHaveAttribute('aria-invalid', 'false')
    expect(fullName).not.toHaveAttribute('aria-describedby')
    expect(screen.queryByText('Full name must be 2–50 characters.')).not.toBeInTheDocument()
  })

  it('after blur with an invalid value, links the visible error through aria-describedby', async () => {
    const user = renderRegistrationFields()
    const fullName = screen.getByLabelText('Full name')

    await user.type(fullName, 'A')
    await user.tab()

    expect(fullName).toHaveAttribute('aria-invalid', 'true')
    const describedBy = fullName.getAttribute('aria-describedby')
    expect(describedBy).toBeTruthy()
    const errorElement = document.getElementById(describedBy)
    expect(errorElement).not.toBeNull()
    expect(errorElement).toHaveTextContent('Full name must be 2–50 characters.')
    expect(fullName).toHaveAccessibleDescription(/Full name must be 2–50 characters\./)
  })

  it('removes the error element and aria-describedby once the value is fixed', async () => {
    const user = renderRegistrationFields()
    const fullName = screen.getByLabelText('Full name')

    await user.type(fullName, 'A')
    await user.tab()
    const errorId = fullName.getAttribute('aria-describedby')

    await user.type(fullName, 'n')

    expect(fullName).toHaveAttribute('aria-invalid', 'false')
    expect(fullName).not.toHaveAttribute('aria-describedby')
    expect(document.getElementById(errorId)).toBeNull()
    expect(screen.queryByText('Full name must be 2–50 characters.')).not.toBeInTheDocument()
  })

  it('reveals errors on untouched fields after a submit attempt', async () => {
    const user = renderRegistrationFields()

    await user.click(screen.getByRole('button', { name: 'Submit' }))

    for (const label of ['Full name', 'Email', 'Age', 'Role']) {
      expect(screen.getByLabelText(label)).toHaveAttribute('aria-invalid', 'true')
    }
    expect(screen.getByLabelText('Age')).toHaveAccessibleDescription(/Age is required\./)
    expect(screen.getByLabelText('Role')).toHaveAccessibleDescription(/Choose a role\./)
  })

  it('stores a number from valueAsNumber and "" when cleared — never NaN', async () => {
    const user = renderRegistrationFields()
    const age = screen.getByLabelText('Age')

    expect(age).toHaveAttribute('type', 'number')
    expect(age).toHaveAttribute('inputmode', 'numeric')
    expect(screen.getByText('age: string ""')).toBeInTheDocument()

    await user.type(age, '21')
    expect(screen.getByText('age: number 21')).toBeInTheDocument()

    await user.clear(age)
    expect(screen.getByText('age: string ""')).toBeInTheDocument()
    expect(screen.queryByText(/NaN/)).not.toBeInTheDocument()
  })

  it('renders a <select> with a placeholder option followed by the given options', async () => {
    const user = renderRegistrationFields()
    const role = screen.getByLabelText('Role')

    expect(role.tagName).toBe('SELECT')
    const options = within(role).getAllByRole('option')
    expect(options).toHaveLength(PERSON_ROLES.length + 1)
    expect(options[0]).toHaveValue('')
    expect(options.slice(1).map((option) => option.textContent)).toEqual([...PERSON_ROLES])

    await user.selectOptions(role, 'Scout')
    expect(role).toHaveValue('Scout')

    await user.tab()
    expect(role).toHaveAttribute('aria-invalid', 'false')
  })
})
