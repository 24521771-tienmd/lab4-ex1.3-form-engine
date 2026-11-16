import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import ShowData from './ShowData.jsx'

const SAMPLE = Object.freeze({
  fullName: 'Tran Minh',
  email: 'minh@example.com',
  age: 21,
  role: 'Scout',
})

describe('ShowData', () => {
  it('renders a region labelled by the default "Submitted data" heading', () => {
    render(<ShowData data={SAMPLE} />)

    const heading = screen.getByRole('heading', { level: 2, name: 'Submitted data' })
    const region = screen.getByRole('region', { name: 'Submitted data' })
    expect(region).toContainElement(heading)
  })

  it('uses a custom title when given', () => {
    render(<ShowData data={SAMPLE} title="Registration received" />)

    expect(screen.getByRole('heading', { level: 2, name: 'Registration received' })).toBeInTheDocument()
    expect(screen.getByRole('region', { name: 'Registration received' })).toBeInTheDocument()
  })

  it('renders one dt/dd pair per key, in insertion order, inside dl.json-inspector', () => {
    const { container } = render(<ShowData data={SAMPLE} />)

    const list = container.querySelector('dl.json-inspector')
    expect(list).not.toBeNull()
    expect(list.children).toHaveLength(Object.keys(SAMPLE).length * 2)

    const terms = within(list).getAllByRole('term').map((node) => node.textContent)
    const definitions = within(list).getAllByRole('definition').map((node) => node.textContent)
    expect(terms).toEqual(['fullName', 'email', 'age', 'role'])
    expect(definitions).toEqual(['Tran Minh', 'minh@example.com', '21', 'Scout'])

    // Each <dt> is immediately followed by its own <dd>.
    for (const term of within(list).getAllByRole('term')) {
      expect(term.tagName).toBe('DT')
      expect(term.nextElementSibling.tagName).toBe('DD')
    }
  })

  it('renders numbers and booleans as text', () => {
    render(<ShowData data={{ count: 0, ratio: 2.5, active: true, archived: false }} />)

    const definitions = screen.getAllByRole('definition').map((node) => node.textContent)
    expect(definitions).toEqual(['0', '2.5', 'true', 'false'])
  })

  it('renders untrusted strings as literal text without creating elements', () => {
    const payload = '<img src=x onerror=alert(1)>'
    const { container } = render(<ShowData data={{ fullName: payload, note: '<script>alert(2)</script>' }} />)

    expect(screen.getByText(payload)).toBeInTheDocument()
    expect(screen.getByText('<script>alert(2)</script>')).toBeInTheDocument()
    expect(container.querySelector('img')).toBeNull()
    expect(container.querySelector('script')).toBeNull()
  })
})
