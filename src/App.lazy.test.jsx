import { act, render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { people } from './data/people.js'

/**
 * Suspense is made observable deterministically: a lazy loader returns a
 * promise the test resolves by hand. No timers.
 */
function createDeferred() {
  let resolve
  const promise = new Promise((resolvePromise) => {
    resolve = resolvePromise
  })
  return { promise, resolve }
}

// A test "arms" a loader by putting a deferred here; unarmed loaders use the real import().
const control = vi.hoisted(() => ({
  arenaPage: null,
  peopleLayout: null,
  notFoundPage: null,
  personDetail: null,
}))

vi.mock('./routes/lazyRoutes.js', async (importOriginal) => {
  const original = await importOriginal()
  const armed = (name, loader) => () =>
    control[name] ? control[name].promise : original[loader]()

  return {
    ...original,
    loadArenaPage: armed('arenaPage', 'loadArenaPage'),
    loadPeopleLayout: armed('peopleLayout', 'loadPeopleLayout'),
    loadNotFoundPage: armed('notFoundPage', 'loadNotFoundPage'),
    loadPersonDetail: armed('personDetail', 'loadPersonDetail'),
  }
})

async function renderAppAt(path) {
  // lazy() caches its resolved module, so every test needs a fresh App module graph.
  const { default: App } = await import('./App.jsx')
  return render(
    <MemoryRouter initialEntries={[path]}>
      <App />
    </MemoryRouter>,
  )
}

/** The page skeleton must render inside the single <main>, as a busy region. */
async function expectPageSkeletonInMain() {
  const main = screen.getByRole('main')
  const label = await within(main).findByText('Loading page')
  expect(label.closest('[aria-busy]')).toHaveAttribute('aria-busy', 'true')
}

/** Persistent chrome stays mounted while a route chunk loads (Decision D2). */
function expectChromeVisible() {
  expect(screen.getByRole('banner')).toBeVisible()
  expect(screen.getByRole('navigation', { name: 'Primary' })).toBeVisible()
}

beforeEach(() => {
  vi.resetModules()
  for (const name of Object.keys(control)) {
    control[name] = null
  }
})

describe('lazy PersonDetail route', () => {
  it('shows the dossier skeleton and keeps the sidebar while the chunk loads, then swaps in the dossier', async () => {
    control.personDetail = createDeferred()
    const person = people.find((p) => p.id === 'p-001')
    await renderAppAt('/people/p-001')

    // While the PersonDetail chunk is pending: skeleton inside the busy region…
    const label = await screen.findByText('Loading player dossier')
    expect(label.closest('[aria-busy]')).toHaveAttribute('aria-busy', 'true')
    // …and the master list stays mounted.
    expect(
      await screen.findByRole('navigation', { name: 'Player dossiers' }),
    ).toBeInTheDocument()
    expect(
      screen.queryByRole('heading', { level: 2, name: person.name }),
    ).not.toBeInTheDocument()

    // Resolve the chunk with the real module.
    const personDetailModule = await import('./pages/people/PersonDetail.jsx')
    await act(async () => {
      control.personDetail.resolve(personDetailModule)
    })

    expect(
      await screen.findByRole('heading', { level: 2, name: person.name }),
    ).toBeInTheDocument()
    expect(screen.queryByText('Loading player dossier')).not.toBeInTheDocument()
    expect(
      screen.getByRole('navigation', { name: 'Player dossiers' }),
    ).toBeInTheDocument()
  })
})

describe('route-level chunk boundaries', () => {
  it('shows the page skeleton inside main at / while header and Primary nav stay visible, then the arena', async () => {
    control.arenaPage = createDeferred()
    await renderAppAt('/')

    await expectPageSkeletonInMain()
    expectChromeVisible()
    expect(
      screen.queryByRole('heading', { level: 1, name: 'KRAFTON x PUBG Vietnam' }),
    ).not.toBeInTheDocument()

    const arenaPageModule = await import('./pages/ArenaPage.jsx')
    await act(async () => {
      control.arenaPage.resolve(arenaPageModule)
    })

    expect(
      await screen.findByRole('heading', { level: 1, name: 'KRAFTON x PUBG Vietnam' }),
    ).toBeInTheDocument()
    expect(screen.queryByText('Loading page')).not.toBeInTheDocument()
    expectChromeVisible()
  })

  it('shows the page skeleton at /nope, then the not-found page', async () => {
    control.notFoundPage = createDeferred()
    await renderAppAt('/nope')

    await expectPageSkeletonInMain()
    expectChromeVisible()
    expect(
      screen.queryByRole('heading', { name: 'Page not found' }),
    ).not.toBeInTheDocument()

    const notFoundPageModule = await import('./pages/NotFoundPage.jsx')
    await act(async () => {
      control.notFoundPage.resolve(notFoundPageModule)
    })

    expect(
      await screen.findByRole('heading', { name: 'Page not found' }),
    ).toBeInTheDocument()
    expect(screen.queryByText('Loading page')).not.toBeInTheDocument()
  })

  it('lazyRoutes.js exports all four route loaders', async () => {
    const actual = await vi.importActual('./routes/lazyRoutes.js')

    for (const loader of [
      'loadArenaPage',
      'loadPeopleLayout',
      'loadNotFoundPage',
      'loadPersonDetail',
    ]) {
      expect(typeof actual[loader], loader).toBe('function')
    }
  })
})
