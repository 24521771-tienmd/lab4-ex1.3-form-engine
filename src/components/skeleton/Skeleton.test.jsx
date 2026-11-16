import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import Skeleton from './Skeleton.jsx'

// An unnamed <section> has no implicit `region` role, so the busy region is
// located from its visually hidden label (which must live inside it).
function getBusyRegion(label) {
  return screen.getByText(label).closest('[aria-busy]')
}

describe('Skeleton', () => {
  it('exposes an accessible busy region with polite announcements', () => {
    render(<Skeleton />)

    const region = getBusyRegion('Loading content')
    expect(region).not.toBeNull()
    expect(region).toHaveAttribute('aria-busy', 'true')
    expect(region).toHaveAttribute('aria-live', 'polite')
  })

  it('renders the default label "Loading content"', () => {
    render(<Skeleton />)

    expect(screen.getByText('Loading content')).toBeInTheDocument()
  })

  it('replaces the default label with a custom label', () => {
    render(<Skeleton label="Loading squad standings" />)

    expect(screen.getByText('Loading squad standings')).toBeInTheDocument()
    expect(screen.queryByText('Loading content')).not.toBeInTheDocument()
    expect(getBusyRegion('Loading squad standings')).toHaveAttribute(
      'aria-busy',
      'true',
    )
  })

  it('renders `lines` decorative bars hidden from assistive technology', () => {
    const { container } = render(<Skeleton lines={4} />)

    const lines = container.querySelectorAll('.skeleton-line')
    expect(lines).toHaveLength(4)
    for (const line of lines) {
      expect(line).toHaveAttribute('aria-hidden', 'true')
    }
  })

  it('appends a custom className to the skeleton region', () => {
    render(<Skeleton className="page-skeleton" />)

    const region = getBusyRegion('Loading content')
    expect(region).toHaveClass('skeleton')
    expect(region).toHaveClass('page-skeleton')
  })
})
