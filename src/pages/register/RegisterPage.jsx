import { useId, useState } from 'react'
import ShowData from '../../components/ShowData.jsx'
import { PERSON_ROLES } from '../../data/people.js'
import InputField from '../../forms/InputField.jsx'
import SimpleForm from '../../forms/SimpleForm.jsx'
import { validateRegistration } from '../../forms/validateRegistration.js'

const INITIAL_VALUES = Object.freeze({ fullName: '', email: '', age: '', role: '' })

/**
 * Route `/register` (docs/contracts/ex1.3-form-engine.md §5.4).
 * Holds only `submitted`; all form state lives in <SimpleForm>.
 * Nothing is persisted (out of scope until Ex1.7.1).
 */
export default function RegisterPage() {
  const [submitted, setSubmitted] = useState(null)
  const headingId = useId()

  return (
    <section className="register-page" aria-labelledby={headingId}>
      <h1 id={headingId}>Player registration</h1>
      <SimpleForm initialValues={INITIAL_VALUES} validate={validateRegistration} onValidSubmit={setSubmitted}>
        <InputField name="fullName" label="Full name" autoComplete="name" />
        <InputField name="email" label="Email" type="email" autoComplete="email" />
        <InputField name="age" label="Age" type="number" inputMode="numeric" hint="Whole number from 16 to 100." />
        <InputField name="role" label="Role" options={PERSON_ROLES} />
      </SimpleForm>
      {submitted ? <ShowData data={submitted} /> : null}
    </section>
  )
}
