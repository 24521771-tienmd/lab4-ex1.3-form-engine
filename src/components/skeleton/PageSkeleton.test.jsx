import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import PageSkeleton from './PageSkeleton.jsx'

// Unnamed <section> has no implicit `region` role: locate it from its label.
function getBusyRegion(label) {
  return screen.getByText(label).closest('[aria-busy]')
}

describe('PageSkeleton', () => {
  it('exposes a polite busy region labelled "Loading page"', () => {
    render(<PageSkeleton />)

    const region = getBusyRegion('Loading page')
    expect(region).not.toBeNull()
    expect(region).toHaveAttribute('aria-busy', 'true')
    expect(region).toHaveAttribute('aria-live', 'polite')
  })

  it('carries the page-skeleton class for its min-height', () => {
    render(<PageSkeleton />)

    expect(getBusyRegion('Loading page')).toHaveClass('skeleton', 'page-skeleton')
  })
})
