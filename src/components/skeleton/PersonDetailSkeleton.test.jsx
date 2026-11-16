import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import PersonDetailSkeleton from './PersonDetailSkeleton.jsx'

// Unnamed <section> has no implicit `region` role: locate it from its label.
function getBusyRegion(label) {
  return screen.getByText(label).closest('[aria-busy]')
}

describe('PersonDetailSkeleton', () => {
  it('exposes a polite busy region labelled "Loading player dossier"', () => {
    render(<PersonDetailSkeleton />)

    const region = getBusyRegion('Loading player dossier')
    expect(region).not.toBeNull()
    expect(region).toHaveAttribute('aria-busy', 'true')
    expect(region).toHaveAttribute('aria-live', 'polite')
  })

  it('mirrors the PersonDetail <dl> with 2 placeholder dt/dd rows inside the busy region', () => {
    render(<PersonDetailSkeleton />)

    const region = getBusyRegion('Loading player dossier')
    const details = region.querySelector('.person-details')
    expect(details).not.toBeNull()
    expect(details.querySelectorAll('dt')).toHaveLength(2)
    expect(details.querySelectorAll('dd')).toHaveLength(2)
  })

  it('hides the placeholder dt/dd from the accessibility tree', () => {
    const { container } = render(<PersonDetailSkeleton />)

    expect(container.querySelector('.person-details')).toHaveAttribute(
      'aria-hidden',
      'true',
    )
    expect(screen.queryByRole('term')).toBeNull()
    expect(screen.queryByRole('definition')).toBeNull()
  })
})
