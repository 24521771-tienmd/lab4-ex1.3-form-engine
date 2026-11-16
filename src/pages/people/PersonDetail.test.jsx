import { render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { describe, expect, it } from 'vitest'
import App from '../../App.jsx'
import { people } from '../../data/people.js'

function renderAt(path) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <App />
    </MemoryRouter>,
  )
}

// PersonDetail is lazy (Ex1.1 · T11): wait for the chunk with findBy before
// the synchronous assertions.
async function expectPersonNotFound() {
  expect(await screen.findByRole('alert')).toHaveTextContent(
    '404: Person Not Found',
  )
  expect(
    screen.getByRole('link', { name: 'Back to dossiers' }),
  ).toHaveAttribute('href', '/people')
  expect(
    screen.getByRole('navigation', { name: 'Player dossiers' }),
  ).toBeInTheDocument()
}

describe('PersonDetail param lookup', () => {
  it('renders the dossier of the person matching /people/p-003', async () => {
    const person = people.find((p) => p.id === 'p-003')
    renderAt('/people/p-003')

    expect(
      await screen.findByRole('heading', { level: 2, name: person.name }),
    ).toBeInTheDocument()

    const main = screen.getByRole('main')
    const terms = within(main).getAllByRole('term')
    const definitions = within(main).getAllByRole('definition')
    expect(terms.map((term) => term.textContent)).toEqual(['Name', 'Role'])
    expect(definitions.map((definition) => definition.textContent)).toEqual([
      person.name,
      person.role,
    ])
  })

  it('renders a 404 alert and keeps the sidebar for an unknown id', async () => {
    renderAt('/people/p-999')

    await expectPersonNotFound()
  })

  it('treats a numeric-looking id as unknown (string ids, no coercion)', async () => {
    renderAt('/people/3')

    await expectPersonNotFound()
  })
})
