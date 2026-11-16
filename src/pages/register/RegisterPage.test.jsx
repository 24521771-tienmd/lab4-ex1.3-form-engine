import { act, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import { beforeEach, describe, expect, it, vi } from 'vitest'

/**
 * Same lazy-route strategy as the Ex1.1 tests (src/App.lazy.test.jsx):
 * a test may "arm" the register loader with a deferred promise it resolves by hand;
 * unarmed, the real import() runs and page content is awaited with findBy.
 */
function createDeferred() {
  let resolve
  const promise = new Promise((resolvePromise) => {
    resolve = resolvePromise
  })
  return { promise, resolve }
}

const control = vi.hoisted(() => ({ registerPage: null, original: null }))

vi.mock('../../routes/lazyRoutes.js', async (importOriginal) => {
  const original = await importOriginal()
  control.original = original
  return {
    ...original,
    loadRegisterPage: () =>
      control.registerPage ? control.registerPage.promise : original.loadRegisterPage(),
  }
})

async function renderAppAt(path) {
  // lazy() caches its resolved module, so every test needs a fresh App module graph.
  const { default: App } = await import('../../App.jsx')
  render(
    <MemoryRouter initialEntries={[path]}>
      <App />
    </MemoryRouter>,
  )
  return userEvent.setup()
}

const FIELD_LABELS = ['Full name', 'Email', 'Age', 'Role']

beforeEach(() => {
  vi.resetModules()
  control.registerPage = null
})

describe('/register route', () => {
  it('has an active Register link in the primary nav', async () => {
    await renderAppAt('/register')

    const primaryNav = screen.getByRole('navigation', { name: 'Primary' })
    const registerLink = within(primaryNav).getByRole('link', { name: 'Register' })
    expect(registerLink).toHaveAttribute('href', '/register')
    expect(registerLink).toHaveAttribute('aria-current', 'page')
    expect(registerLink).toHaveClass('active-link')
  })

  it('renders the Player registration heading and the four labelled fields inside the single main', async () => {
    await renderAppAt('/register')

    expect(await screen.findByRole('heading', { level: 1, name: 'Player registration' })).toBeInTheDocument()
    expect(screen.getAllByRole('main')).toHaveLength(1)
    for (const label of FIELD_LABELS) {
      expect(screen.getByLabelText(label)).toBeInTheDocument()
    }
    expect(screen.getByLabelText('Age')).toHaveAttribute('type', 'number')
    expect(screen.getByLabelText('Role').tagName).toBe('SELECT')
  })

  it('submitting empty shows the summary alert, flags every field and shows no inspector', async () => {
    const user = await renderAppAt('/register')
    await screen.findByRole('heading', { level: 1, name: 'Player registration' })

    await user.click(screen.getByRole('button', { name: 'Submit' }))

    expect(screen.getByRole('alert')).toHaveTextContent('Fix 4 field(s) before submitting.')
    for (const label of FIELD_LABELS) {
      expect(screen.getByLabelText(label)).toHaveAttribute('aria-invalid', 'true')
    }
    expect(screen.queryByRole('region', { name: 'Submitted data' })).not.toBeInTheDocument()
  })

  it('a valid submit shows ShowData with the entered values', async () => {
    const user = await renderAppAt('/register')
    await screen.findByRole('heading', { level: 1, name: 'Player registration' })

    await user.type(screen.getByLabelText('Full name'), 'Tran Minh')
    await user.type(screen.getByLabelText('Email'), 'minh@example.com')
    await user.type(screen.getByLabelText('Age'), '21')
    await user.selectOptions(screen.getByLabelText('Role'), 'Scout')
    await user.click(screen.getByRole('button', { name: 'Submit' }))

    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    const inspector = screen.getByRole('region', { name: 'Submitted data' })
    const terms = within(inspector).getAllByRole('term').map((node) => node.textContent)
    const definitions = within(inspector).getAllByRole('definition').map((node) => node.textContent)
    expect(terms).toEqual(['fullName', 'email', 'age', 'role'])
    expect(definitions).toEqual(['Tran Minh', 'minh@example.com', '21', 'Scout'])
  })

  it('shows the page skeleton while the register chunk loads, keeping the header and nav mounted', async () => {
    control.registerPage = createDeferred()
    await renderAppAt('/register')

    const main = screen.getByRole('main')
    const label = await within(main).findByText('Loading page')
    expect(label.closest('[aria-busy]')).toHaveAttribute('aria-busy', 'true')
    expect(screen.getByRole('banner')).toBeVisible()
    expect(screen.getByRole('navigation', { name: 'Primary' })).toBeVisible()
    expect(screen.queryByRole('heading', { level: 1, name: 'Player registration' })).not.toBeInTheDocument()

    const registerPageModule = await control.original.loadRegisterPage()
    await act(async () => {
      control.registerPage.resolve(registerPageModule)
    })

    expect(await screen.findByRole('heading', { level: 1, name: 'Player registration' })).toBeInTheDocument()
    expect(screen.queryByText('Loading page')).not.toBeInTheDocument()
  })
})
