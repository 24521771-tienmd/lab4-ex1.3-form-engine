import { Fragment } from 'react'
import { Link, useParams } from 'react-router'

const DETAIL_FIELDS = [
  { key: 'name', label: 'Name' },
  { key: 'role', label: 'Role' },
]

/**
 * Detail view for /people/:id. The person is derived during render from the
 * URL param (always a string) — no effects, no state.
 *
 * @param {{ people: ReadonlyArray<import('../../data/people.js').Person> }} props
 */
export default function PersonDetail({ people }) {
  const { id } = useParams()
  const person = people.find((p) => p.id === id)

  if (!person) {
    return (
      <>
        <p role="alert">404: Person Not Found</p>
        <Link to="/people">Back to dossiers</Link>
      </>
    )
  }

  return (
    <article>
      <h2>{person.name}</h2>
      <dl className="person-details">
        {DETAIL_FIELDS.map(({ key, label }) => (
          <Fragment key={key}>
            <dt>{label}</dt>
            <dd>{person[key]}</dd>
          </Fragment>
        ))}
      </dl>
    </article>
  )
}
