import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import App from '../../App.jsx'
import { people } from '../../data/people.js'
import { loadPersonDetail } from '../../routes/lazyRoutes.js'
import PeopleLayout from './PeopleLayout.jsx'

// Only the PersonDetail loader is replaced (Ex1.1 · T14); the other loaders
// stay real so <App /> can still load the lazy PeopleLayout chunk.
vi.mock('../../routes/lazyRoutes.js', async (importOriginal) => ({
  ...(await importOriginal()),
  loadPersonDetail: vi.fn(),
}))

describe('PeopleLayout master list', () => {
  it('lists one dossier link per person and the index prompt at /people', async () => {
    render(
      <MemoryRouter initialEntries={['/people']}>
        <App />
      </MemoryRouter>,
    )

    // PeopleLayout is a lazy route chunk inside App (Ex1.1 · T13): await it.
    const dossierNav = await screen.findByRole('navigation', {
      name: 'Player dossiers',
    })
    const dossierLinks = within(dossierNav).getAllByRole('link')
    expect(dossierLinks).toHaveLength(people.length)
    for (const person of people) {
      expect(
        within(dossierNav).getByRole('link', { name: person.name }),
      ).toHaveAttribute('href', `/people/${person.id}`)
    }

    expect(screen.getByText(/select a player dossier/i)).toBeInTheDocument()

    const primaryNav = screen.getByRole('navigation', { name: 'Primary' })
    const peopleLink = within(primaryNav).getByRole('link', { name: 'People' })
    expect(peopleLink).toHaveAttribute('aria-current', 'page')
    expect(peopleLink).toHaveClass('active-link')
  })

  it('marks only the selected person link active at /people/p-002', () => {
    // The :id detail route arrives in T16, so this test mounts PeopleLayout
    // in a minimal route tree with an empty :id child.
    render(
      <MemoryRouter initialEntries={['/people/p-002']}>
        <Routes>
          <Route path="/people" element={<PeopleLayout people={people} />}>
            <Route path=":id" element={null} />
          </Route>
        </Routes>
      </MemoryRouter>,
    )

    const dossierNav = screen.getByRole('navigation', {
      name: 'Player dossiers',
    })

    for (const person of people) {
      const link = within(dossierNav).getByRole('link', { name: person.name })
      if (person.id === 'p-002') {
        expect(link).toHaveAttribute('aria-current', 'page')
        expect(link).toHaveClass('active-link')
      } else {
        expect(link).not.toHaveAttribute('aria-current')
        expect(link).toHaveClass('link')
      }
    }
  })
})

describe('PeopleLayout PersonDetail chunk preloading', () => {
  beforeEach(() => {
    vi.mocked(loadPersonDetail).mockClear()
  })

  // Minimal tree at the index route: the detail route is never rendered, so
  // any loadPersonDetail call can only come from preloading.
  function renderPeopleIndex() {
    render(
      <MemoryRouter initialEntries={['/people']}>
        <Routes>
          <Route path="/people" element={<PeopleLayout people={people} />}>
            <Route index element={null} />
          </Route>
        </Routes>
      </MemoryRouter>,
    )
    return screen.getByRole('navigation', { name: 'Player dossiers' })
  }

  it('does not preload the detail chunk on initial render', () => {
    renderPeopleIndex()

    expect(loadPersonDetail).not.toHaveBeenCalled()
  })

  it('preloads the detail chunk once when a person link is hovered', async () => {
    const user = userEvent.setup()
    const dossierNav = renderPeopleIndex()
    const link = within(dossierNav).getByRole('link', { name: people[1].name })

    await user.hover(link)

    expect(loadPersonDetail).toHaveBeenCalledTimes(1)
  })

  it('preloads the detail chunk when keyboard focus reaches a person link', async () => {
    const user = userEvent.setup()
    const dossierNav = renderPeopleIndex()

    await user.tab()

    expect(within(dossierNav).getAllByRole('link')).toContain(
      document.activeElement,
    )
    expect(loadPersonDetail).toHaveBeenCalled()
  })
})
